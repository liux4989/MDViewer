/**
 * TOC Data Service - Task 2.3
 * High-level service for TOC data operations with transformation and caching
 */

import type { App, TFile } from 'obsidian';
import { ObsidianDataService } from './obsidianDataService';
import { obsidianToTocFile, validateTocFile, validateTocHeading } from './tocDataTransformation';
import type { TocData, TocFile, TocHeading } from '../schemas/toc';

export interface TocDataServiceError {
  message: string;
  code: 'NO_ACTIVE_FILE' | 'FILE_NOT_FOUND' | 'INVALID_DATA' | 'TRANSFORMATION_FAILED' | 'VALIDATION_FAILED';
  originalError?: Error;
}

export class TocDataService {
  private obsidianService: ObsidianDataService;

  constructor(private app: App) {
    this.obsidianService = new ObsidianDataService(app);
  }

  /**
   * Get headings for the currently active file
   * @returns Promise resolving to TocData for current file or error
   */
  async getCurrentFileHeadings(): Promise<{ data: TocData | null; error: TocDataServiceError | null }> {
    try {
      const activeFile = this.obsidianService.getActiveFile();

      if (!activeFile) {
        return {
          data: null,
          error: {
            message: 'No active file available',
            code: 'NO_ACTIVE_FILE'
          }
        };
      }

      const result = await this.getFileHeadings(activeFile.path);
      if (result.error) {
        return {
          data: null,
          error: result.error
        };
      }

      // Create TocData structure
      const tocData: TocData = {
        file: result.data!,
        headings: result.data!.headings,
        activeHeading: undefined // Will be set by UI component
      };

      return { data: tocData, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to get current file headings',
          code: 'TRANSFORMATION_FAILED',
          originalError: error instanceof Error ? error : new Error(String(error))
        }
      };
    }
  }

  /**
   * Get headings for a specific file by path
   * @param filePath - Path to the markdown file
   * @returns Promise resolving to TocFile or error
   */
  async getFileHeadings(filePath: string): Promise<{ data: TocFile | null; error: TocDataServiceError | null }> {
    try {
      // Find the file in the vault
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!(file instanceof this.app.vault.constructor.prototype.constructor) || !file) {
        // Try to find by basename if full path fails
        const markdownFiles = this.obsidianService.getMarkdownFiles();
        const foundFile = markdownFiles.find(f => f.path === filePath || f.basename === filePath);

        if (!foundFile) {
          return {
            data: null,
            error: {
              message: `File not found: ${filePath}`,
              code: 'FILE_NOT_FOUND'
            }
          };
        }

        return this.processFileHeadings(foundFile);
      }

      return this.processFileHeadings(file as TFile);
    } catch (error) {
      return {
        data: null,
        error: {
          message: `Failed to get file headings for ${filePath}`,
          code: 'TRANSFORMATION_FAILED',
          originalError: error instanceof Error ? error : new Error(String(error))
        }
      };
    }
  }



  /**
   * Process file headings by extracting from Obsidian and transforming to TOC format
   * @param file - TFile object from Obsidian
   * @returns Promise resolving to TocFile or error
   */
  private async processFileHeadings(file: TFile): Promise<{ data: TocFile | null; error: TocDataServiceError | null }> {
    try {
      // Extract raw data from Obsidian
      const obsidianFile = this.obsidianService.extractFileMetadata(file);
      if (!obsidianFile) {
        return {
          data: null,
          error: {
            message: 'Failed to extract file metadata',
            code: 'INVALID_DATA'
          }
        };
      }

      const obsidianHeadings = this.obsidianService.extractHeadings(file);
      if (!Array.isArray(obsidianHeadings)) {
        return {
          data: null,
          error: {
            message: 'Failed to extract headings',
            code: 'INVALID_DATA'
          }
        };
      }

      // Transform to TOC format
      const tocFile = obsidianToTocFile(obsidianFile, obsidianHeadings);
      if (!tocFile) {
        return {
          data: null,
          error: {
            message: 'Failed to transform data to TOC format',
            code: 'TRANSFORMATION_FAILED'
          }
        };
      }

      // Validate the transformed data
      if (!validateTocFile(tocFile)) {
        return {
          data: null,
          error: {
            message: 'Transformed data failed validation',
            code: 'VALIDATION_FAILED'
          }
        };
      }

      return { data: tocFile, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Failed to process file headings',
          code: 'TRANSFORMATION_FAILED',
          originalError: error instanceof Error ? error : new Error(String(error))
        }
      };
    }
  }


}

/**
 * TOC Repository - Phase 2 Refactor
 * Domain-facing repository for TOC data operations with caching and error handling
 */

import type { TFile } from 'obsidian';
import type { IObsidianDataSource } from '../datasources/obsidianDataSource';
import { obsidianToTocFile, validateTocFile } from './tocMappers';
import type { TocData, TocFile } from '../schemas/toc';
/**
 * Result type for repository operations
 */
export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

/**
 * Error types for TOC repository operations
 */
export interface TocDataServiceError {
  message: string;
  code: 'NO_ACTIVE_FILE' | 'FILE_NOT_FOUND' | 'INVALID_DATA' | 'TRANSFORMATION_FAILED' | 'VALIDATION_FAILED';
  originalError?: Error;
}

/**
 * Interface for TOC repository operations
 * Provides domain-facing data operations with caching and error handling
 */
export interface ITocRepository {
  getCurrentFileHeadings(): Promise<Result<TocData, TocDataServiceError>>;
  getFileHeadings(filePath: string): Promise<Result<TocFile, TocDataServiceError>>;
  clearCache(): void;
}

export class TocRepository implements ITocRepository {
  private cache = new Map<string, TocFile>();

  constructor(private dataSource: IObsidianDataSource) {}

  /**
   * Get headings for the currently active file
   * @returns Promise resolving to Result with TocData or error
   */
  async getCurrentFileHeadings(): Promise<Result<TocData, TocDataServiceError>> {
    try {
      const activeFile = this.dataSource.getActiveFile();

      if (!activeFile) {
        return {
          ok: false,
          error: {
            message: 'No active file available',
            code: 'NO_ACTIVE_FILE'
          }
        };
      }

      const result = await this.getFileHeadings(activeFile.path);
      if (!result.ok) {
        return result;
      }

      // Create TocData structure
      const tocData: TocData = {
        file: result.data,
        headings: result.data.headings,
        activeHeading: undefined // Will be set by UI component
      };

      return { ok: true, data: tocData };
    } catch (error) {
      return {
        ok: false,
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
   * @returns Promise resolving to Result with TocFile or error
   */
  async getFileHeadings(filePath: string): Promise<Result<TocFile, TocDataServiceError>> {
    try {
      // Check cache first
      const cached = this.cache.get(filePath);
      if (cached) {
        return { ok: true, data: cached };
      }

      // Find the file in the vault - we'll need to get the App instance somehow
      // For now, we'll use a simple approach and assume files are passed by path
      const markdownFiles = this.dataSource.getMarkdownFiles();
      const foundFile = markdownFiles.find(f => f.path === filePath || f.basename === filePath);

      if (!foundFile) {
        return {
          ok: false,
          error: {
            message: `File not found: ${filePath}`,
            code: 'FILE_NOT_FOUND'
          }
        };
      }

      const result = await this.processFileHeadings(foundFile);

      // Cache successful results
      if (result.ok) {
        this.cache.set(filePath, result.data);
      }

      return result;
    } catch (error) {
      return {
        ok: false,
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
   * @returns Promise resolving to Result with TocFile or error
   */
  private async processFileHeadings(file: TFile): Promise<Result<TocFile, TocDataServiceError>> {
    try {
      // Extract raw data from Obsidian
      const obsidianFile = this.dataSource.extractFileMetadata(file);
      if (!obsidianFile) {
        return {
          ok: false,
          error: {
            message: 'Failed to extract file metadata',
            code: 'INVALID_DATA'
          }
        };
      }

      const obsidianHeadings = this.dataSource.extractHeadings(file);
      if (!Array.isArray(obsidianHeadings)) {
        return {
          ok: false,
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
          ok: false,
          error: {
            message: 'Failed to transform data to TOC format',
            code: 'TRANSFORMATION_FAILED'
          }
        };
      }

      // Validate the transformed data
      if (!validateTocFile(tocFile)) {
        return {
          ok: false,
          error: {
            message: 'Transformed data failed validation',
            code: 'VALIDATION_FAILED'
          }
        };
      }

      return { ok: true, data: tocFile };
    } catch (error) {
      return {
        ok: false,
        error: {
          message: 'Failed to process file headings',
          code: 'TRANSFORMATION_FAILED',
          originalError: error instanceof Error ? error : new Error(String(error))
        }
      };
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

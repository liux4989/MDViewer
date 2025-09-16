/**
 * TOC Data Processor - Business Logic Layer
 * Handles data transformation and business decisions for TOC operations
 * Moved to stores/ to co-locate with TOC domain logic
 */

import type { TFile } from 'obsidian';
import type { ObsidianFile, ObsidianHeading, TocFile } from '../schemas/toc';
import { obsidianToTocFile, validateTocFile } from '../utils/tocTransformers';

export interface ITocDataProcessor {
  processFileData(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null;
  handleProcessingError(error: string, context: string): void;
}

/**
 * Handles TOC business logic and data processing decisions
 * This is where business rules live, not in utilities
 */
export class TocDataProcessor implements ITocDataProcessor {
  
  /**
   * Process raw Obsidian data into TOC format with business logic
   * @param file - Obsidian TFile object
   * @param obsidianFile - File metadata from Obsidian
   * @param obsidianHeadings - Raw headings from Obsidian
   * @returns Processed TocFile or null with appropriate error handling
   */
  processFileData(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null {
    // Business Logic: Input validation strategy
    if (!file || !obsidianFile) {
      this.handleProcessingError('Invalid file or metadata', file?.path || 'unknown');
      return null;
    }
    
    if (!Array.isArray(obsidianHeadings)) {
      this.handleProcessingError('Invalid headings data', file.path);
      return null;
    }

    // Business Logic: Empty headings handling
    if (obsidianHeadings.length === 0) {
      // Business decision: Empty headings is valid, return empty TOC
      return {
        path: obsidianFile.path,
        headings: []
      };
    }

    try {
      // Use pure utility for transformation
      const tocFile = obsidianToTocFile(obsidianFile, obsidianHeadings);
      if (!tocFile) {
        this.handleProcessingError('Transformation failed', file.path);
        return null;
      }

      // Business Logic: Validation strategy
      if (!validateTocFile(tocFile)) {
        this.handleProcessingError('Validation failed', file.path);
        return null;
      }

      // Business Logic: Success handling
      return tocFile;
      
    } catch (error) {
      this.handleProcessingError(`Processing exception: ${error}`, file.path);
      return null;
    }
  }

  /**
   * Handle processing errors with business-appropriate logging and recovery
   * @param error - Error message
   * @param context - File path or other context
   */
  handleProcessingError(error: string, context: string): void {
    // Business Logic: Error handling strategy
    console.error(`TOC Processing Error [${context}]: ${error}`);
    
    // Could add more business logic here:
    // - Error reporting to analytics
    // - Fallback strategies
    // - User notifications
  }
}


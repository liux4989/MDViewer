/**
 * Obsidian Data Integration Service - Task 2.2
 * Basic integration with Obsidian APIs for file metadata and heading extraction
 */

import type { App, TFile } from 'obsidian';
import type { ObsidianFile, ObsidianHeading } from '../schemas/toc';

/**
 * Service for basic Obsidian API integration
 * Provides access to file metadata and heading extraction
 */
export class ObsidianDataService {
  constructor(private app: App) {}

  /**
   * Extract file metadata using Obsidian APIs
   * @param file - The Obsidian file to extract metadata from
   * @returns ObsidianFile object or null if file is invalid
   */
  extractFileMetadata(file: TFile | null): ObsidianFile | null {
    if (!file) return null;

    return {
      path: file.path
    };
  }

  /**
   * Extract headings from a file using Obsidian metadata cache
   * @param file - The Obsidian file to extract headings from
   * @returns Array of ObsidianHeading objects
   */
  extractHeadings(file: TFile | null): ObsidianHeading[] {
    if (!file) return [];

    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache?.headings) return [];

    return cache.headings.map(h => ({
      heading: h.heading,
      level: h.level,
      position: {
        start: h.position.start.line,
        end: h.position.end.line
      }
    }));
  }

  /**
   * Get the currently active file in the workspace
   * @returns The active file or null
   */
  getActiveFile(): TFile | null {
    return this.app.workspace.getActiveFile();
  }

  /**
   * Get all markdown files in the vault
   * @returns Array of markdown files
   */
  getMarkdownFiles(): TFile[] {
    return this.app.vault.getMarkdownFiles();
  }

  /**
   * Check if the metadata cache is available for a file
   * @param file - The file to check
   * @returns Boolean indicating if cache is available
   */
  isCacheAvailable(file: TFile | null): boolean {
    if (!file) return false;
    return !!this.app.metadataCache.getFileCache(file);
  }

  /**
   * Get raw metadata cache for a file (for debugging/testing)
   * @param file - The file to get cache for
   * @returns Raw cache object or null
   */
  getRawCache(file: TFile | null): any {
    if (!file) return null;
    return this.app.metadataCache.getFileCache(file);
  }
}

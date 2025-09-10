/**
 * Obsidian Data Source - Phase 1 Refactor
 * Raw access to Obsidian APIs for file metadata and heading extraction
 */

import type { App, TFile } from 'obsidian';
import { MarkdownView } from 'obsidian';
import type { ObsidianFile, ObsidianHeading, TocData, TocFile } from '../schemas/toc';
import type { IObsidianNavigator } from './navigator';
import { obsidianToTocFile, validateTocFile } from '../utils/tocTransformers';

/**
 * Interface for Obsidian data source operations
 * Provides raw access to Obsidian APIs and TOC data transformation
 */
export interface IObsidianDataSource {
  getActiveFile(): TFile | null;
  getMarkdownFiles(): TFile[];
  extractFileMetadata(file: TFile | null): ObsidianFile | null;
  extractHeadings(file: TFile | null): ObsidianHeading[];
  isCacheAvailable(file: TFile | null): boolean;
  getRawCache(file: TFile | null): any;
  // New methods for TOC data operations
  getCurrentFileTocData(): TocData | null;
  getFileTocData(file: TFile | null): TocFile | null;
}

/**
 * Implementation of Obsidian data source
 * Provides direct access to Obsidian APIs
 */
export class ObsidianDataSource implements IObsidianDataSource, IObsidianNavigator {
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

  /**
   * Navigate to a specific line in the active editor
   * @param line - The line number to navigate to (0-indexed)
   * @param options - Optional navigation options
   * @param options.center - Whether to center the line in the viewport (default: true)
   */
  goToLine(line: number, options?: { center?: boolean }): void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    
    const editor = view.editor;
    const targetLine = Math.max(0, Math.floor(line));
    
    // Set cursor to the target line
    editor.setCursor({ line: targetLine, ch: 0 });
    
    // Scroll the line into view
    editor.scrollIntoView(
      { from: { line: targetLine, ch: 0 }, to: { line: targetLine, ch: 0 } },
      options?.center ?? true
    );
  }

  /**
   * Get TOC data for the currently active file
   * Combines file metadata and headings extraction with transformation
   * @returns TocData object or null if no active file or transformation fails
   */
  getCurrentFileTocData(): TocData | null {
    const activeFile = this.getActiveFile();
    if (!activeFile) return null;

    const tocFile = this.getFileTocData(activeFile);
    if (!tocFile) return null;

    return {
      file: tocFile,
      headings: tocFile.headings,
      activeHeading: undefined // Will be set by UI components
    };
  }

  /**
   * Get TOC data for a specific file
   * Transforms Obsidian file data into TOC format with validation
   * @param file - The Obsidian file to process
   * @returns TocFile object or null if transformation fails
   */
  getFileTocData(file: TFile | null): TocFile | null {
    if (!file) return null;

    // Extract raw data from Obsidian
    const obsidianFile = this.extractFileMetadata(file);
    if (!obsidianFile) return null;

    const obsidianHeadings = this.extractHeadings(file);
    if (!Array.isArray(obsidianHeadings)) return null;

    // Transform to TOC format
    const tocFile = obsidianToTocFile(obsidianFile, obsidianHeadings);
    if (!tocFile) return null;

    // Validate the transformed data
    if (!validateTocFile(tocFile)) return null;

    return tocFile;
  }
}

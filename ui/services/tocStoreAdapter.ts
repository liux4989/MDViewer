/**
 * TOC Store Adapter Interface
 * Simple interface for services to interact with the TOC store
 */

import type { TFile } from 'obsidian';
import type { TocHeading, ObsidianFile, ObsidianHeading } from '../schemas/toc';

/**
 * Simple interface for TOC store operations
 * Used by services to interact with the store
 */
export interface ITocStoreAdapter {
  // State access
  getState(): {
    activeFile: string | null;
    activeHeadingId: string | null;
    headings: TocHeading[];
  };
  
  // Business logic actions (atomic operations)
  loadFileData(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): void;
  refreshHeadings(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): void;
  setActiveHeading(id: string | null): void;
}


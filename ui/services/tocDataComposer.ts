/**
 * TOC Data Composer - UI Business Logic
 * Handles data transformation and composition for UI layer
 */

import type { TFile } from 'obsidian';
import type { ObsidianFile, ObsidianHeading, TocFile } from '../schemas/toc';
import { obsidianToTocFile, validateTocFile } from '../utils/tocTransformers';

export interface ITocDataComposer {
  transformFileToToc(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null;
}

/**
 * Composes UI-specific data structures from domain data
 */
export class TocDataComposer implements ITocDataComposer {

  /**
   * Transform raw Obsidian data to TOC format
   * @param file - Obsidian TFile object
   * @param obsidianFile - File metadata from Obsidian
   * @param obsidianHeadings - Raw headings from Obsidian
   * @returns Transformed TocFile or null if transformation fails
   */
  transformFileToToc(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null {
    if (!file || !obsidianFile || !Array.isArray(obsidianHeadings)) {
      return null;
    }

    // Transform to TOC format
    const tocFile = obsidianToTocFile(obsidianFile, obsidianHeadings);
    if (!tocFile) {
      return null;
    }

    // Validate the transformed data
    if (!validateTocFile(tocFile)) {
      return null;
    }

    return tocFile;
  }
}

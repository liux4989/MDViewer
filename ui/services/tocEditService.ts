/**
 * TOC Edit Service - Edit State Management
 * Handles editor change events and background data refresh
 */

import type { IObsidianEvents } from '../datasources/obsidianEvents';
import type { IObsidianDataSource } from '../datasources/obsidianDataSource';
import type { ITocDataComposer } from './tocDataComposer';
import type { TocHeading } from '../schemas/toc';

export interface ITocStoreAdapter {
  getState(): {
    activeFile: string | null;
    activeHeadingId: string | null;
    headings: TocHeading[];
  };
  setHeadings(headings: TocHeading[]): void;
}

/**
 * Manages editor change events and background data refresh
 */
export class TocEditService {
  constructor(
    private events: IObsidianEvents,
    private dataSource: IObsidianDataSource,
    private dataComposer: ITocDataComposer,
    private tocStore: ITocStoreAdapter
  ) {}

  /**
   * Initialize edit event listeners
   * @returns Cleanup function to dispose listeners
   */
  init(): () => void {
    const disposers: Array<() => void> = [];

    // Handle editor changes - refresh headings without disrupting interaction
    disposers.push(
      this.events.onEditorChangeIdle(async (path) => {
        await this.refreshHeadings(path);
      })
    );

    return () => {
      disposers.splice(0).forEach(dispose => dispose());
    };
  }

  /**
   * Refresh headings data for the specified file
   * @param filePath - Path of the file that was edited
   */
  async refreshHeadings(filePath: string): Promise<void> {
    try {
      const { activeFile } = this.tocStore.getState();

      // Only update if this is the currently active file
      if (activeFile !== filePath) {
        return;
      }

      const activeFileObj = this.dataSource.getActiveFile();
      if (!activeFileObj || activeFileObj.path !== filePath) {
        return;
      }

      // Extract fresh data from Obsidian (cache will be automatically updated)
      const obsidianFile = this.dataSource.extractFileMetadata(activeFileObj);
      if (!obsidianFile) {
        console.error('Failed to extract file metadata after edit');
        return;
      }

      const obsidianHeadings = this.dataSource.extractHeadings(activeFileObj);
      if (!Array.isArray(obsidianHeadings)) {
        console.error('Failed to extract headings after edit');
        return;
      }

      // Transform to TOC format
      const tocFile = this.dataComposer.transformFileToToc(activeFileObj, obsidianFile, obsidianHeadings);
      if (!tocFile) {
        console.error('Failed to transform file data after edit');
        return;
      }

      // Update headings but preserve current mode and active heading
      // This ensures editing doesn't disrupt user's current interaction
      this.tocStore.setHeadings(tocFile.headings);
    } catch (error) {
      console.error('Failed to refresh headings after edit:', filePath, error);
    }
  }
}

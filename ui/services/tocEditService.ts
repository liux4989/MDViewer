/**
 * TOC Edit Service - Edit State Management
 * Handles editor change events and background data refresh
 */

import type { IObsidianEvents } from '../datasources/obsidianEvents';
import type { IObsidianDataSource } from '../datasources/obsidianDataSource';
import type { ITocStoreAdapter } from './tocStoreAdapter';


/**
 * Manages editor change events and background data refresh
 */
export class TocEditService {
  constructor(
    private events: IObsidianEvents,
    private dataSource: IObsidianDataSource,
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

      // Extract fresh data from Obsidian (no business logic here)
      const obsidianFile = this.dataSource.extractFileMetadata(activeFileObj);
      const obsidianHeadings = this.dataSource.extractHeadings(activeFileObj);

      // Delegate business logic to store (only if data is valid)
      if (obsidianFile && obsidianHeadings) {
        this.tocStore.refreshHeadings(activeFileObj, obsidianFile, obsidianHeadings);
      }
    } catch (error) {
      console.error('Failed to refresh headings after edit:', filePath, error);
    }
  }
}

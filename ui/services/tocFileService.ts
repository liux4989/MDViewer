/**
 * TOC File Service - File Change Management
 * Handles file open/change events and data loading
 */

import type { IObsidianEvents } from '../datasources/obsidianEvents';
import type { IObsidianDataSource } from '../datasources/obsidianDataSource';
import type { ITocStoreAdapter } from './tocStoreAdapter';

/**
 * Manages file change events and TOC data loading
 */
export class TocFileService {
  constructor(
    private events: IObsidianEvents,
    private dataSource: IObsidianDataSource,
    private tocStore: ITocStoreAdapter
  ) {}

  /**
   * Initialize file change event listeners
   * @returns Cleanup function to dispose listeners
   */
  init(): () => void {
    const disposers: Array<() => void> = [];

    const handleFileRefresh = async (path: string) => {
      try {
        const { activeFile } = this.tocStore.getState();
        if (activeFile !== path) {
          await this.loadFileData(path);
        }
      } catch (error) {
        console.error('Failed to refresh TOC data for file:', path, error);
      }
    };

    disposers.push(
      this.events.onFileOpen(handleFileRefresh),
      this.events.onFileChanged(handleFileRefresh)
    );

    return () => {
      disposers.splice(0).forEach(dispose => dispose());
    };
  }

  /**
   * Load TOC data for a specific file
   * @param filePath - Path of the file to load
   */
  async loadFileData(filePath: string): Promise<void> {
    try {
      const activeFile = this.dataSource.getActiveFile();
      if (!activeFile || activeFile.path !== filePath) {
        return;
      }

      // Extract raw data from Obsidian
      const obsidianFile = this.dataSource.extractFileMetadata(activeFile);
      const obsidianHeadings = this.dataSource.extractHeadings(activeFile);

      if (obsidianFile && obsidianHeadings) {
        // Delegate to store for atomic business logic
        this.tocStore.loadFileData(activeFile, obsidianFile, obsidianHeadings);
      } else {
        console.error('Failed to extract raw data for file:', filePath);
      }
    } catch (error) {
      console.error('Failed to load file data:', filePath, error);
    }
  }
}

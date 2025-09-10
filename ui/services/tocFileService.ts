/**
 * TOC File Service - File Change Management
 * Handles file open/change events and data loading
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
  setActiveFile(path: string | null): void;
  setHeadings(headings: TocHeading[]): void;
  setActiveHeading(id: string | null): void;
}

/**
 * Manages file change events and TOC data loading
 */
export class TocFileService {
  constructor(
    private events: IObsidianEvents,
    private dataSource: IObsidianDataSource,
    private dataComposer: ITocDataComposer,
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
      if (!obsidianFile) {
        console.error('Failed to extract file metadata');
        return;
      }

      const obsidianHeadings = this.dataSource.extractHeadings(activeFile);
      if (!Array.isArray(obsidianHeadings)) {
        console.error('Failed to extract headings');
        return;
      }

      // Transform to TOC format
      const tocFile = this.dataComposer.transformFileToToc(activeFile, obsidianFile, obsidianHeadings);
      if (!tocFile) {
        console.error('Failed to transform file data to TOC format');
        return;
      }

      // Update store with new data
      this.tocStore.setHeadings(tocFile.headings);
      this.tocStore.setActiveFile(filePath);
      this.tocStore.setActiveHeading(null); // Reset active heading
    } catch (error) {
      console.error('Failed to load file data:', filePath, error);
    }
  }
}

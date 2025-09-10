/**
 * TOC Service Coordinator - Orchestrates all TOC services
 * Coordinates the focused services for complete TOC functionality
 */

import type { IObsidianEvents } from '../datasources/obsidianEvents';
import type { IObsidianDataSource } from '../datasources/obsidianDataSource';
import { TocDataComposer } from './tocDataComposer';
import { TocFileService, type ITocStoreAdapter } from './tocFileService';
import { TocScrollService, type ITocModeStoreAdapter } from './tocScrollService';
import { TocEditService } from './tocEditService';

/**
 * Coordinates all TOC services for complete functionality
 */
export class TocServiceCoordinator {
  private fileService: TocFileService;
  private scrollService: TocScrollService;
  private editService: TocEditService;
  private dataComposer: TocDataComposer;

  constructor(
    private events: IObsidianEvents,
    private dataSource: IObsidianDataSource,
    private tocStore: ITocStoreAdapter,
    private modeStore: ITocModeStoreAdapter
  ) {
    // Initialize data composer
    this.dataComposer = new TocDataComposer();

    // Initialize focused services
    this.fileService = new TocFileService(
      this.events,
      this.dataSource,
      this.dataComposer,
      this.tocStore
    );

    this.scrollService = new TocScrollService(
      this.events,
      this.dataSource,
      this.dataComposer,
      this.tocStore,
      this.modeStore
    );

    this.editService = new TocEditService(
      this.events,
      this.dataSource,
      this.dataComposer,
      this.tocStore
    );
  }

  /**
   * Initialize all TOC services
   * @returns Cleanup function to dispose all services
   */
  init(): () => void {
    const disposers: Array<() => void> = [];

    // Initialize all services
    disposers.push(
      this.fileService.init(),
      this.scrollService.init(),
      this.editService.init()
    );

    // Return cleanup function that disposes all services
    return () => {
      disposers.splice(0).forEach(dispose => dispose());
    };
  }

  /**
   * Load initial TOC data for the current file
   */
  async loadInitialData(): Promise<void> {
    const activeFile = this.dataSource.getActiveFile();
    if (activeFile) {
      await this.fileService.loadFileData(activeFile.path);
    }
  }
}

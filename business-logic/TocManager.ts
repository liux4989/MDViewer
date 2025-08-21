/**
 * TocManager - Orchestrates all TOC functionality
 * Implements the ITocManager interface as the main coordinator
 */

import { TocEntry, TocState } from '../types';
import { ITocManager, TocManagerConfig } from '../types/business-logic';
import { HeadingExtractor } from './HeadingExtractor';
import { NavigationHandler } from './NavigationHandler';
import { ScrollTracker } from './ScrollTracker';

export class TocManager implements ITocManager {
  private headingExtractor: HeadingExtractor;
  private navigationHandler: NavigationHandler;
  private scrollTracker: ScrollTracker;
  private currentState: TocState;
  private config: TocManagerConfig;
  private activeCallback: ((activeId: string | null) => void) | null = null;

  constructor(config?: Partial<TocManagerConfig>) {
    this.config = {
      includeLevels: [1, 2, 3, 4, 5, 6],
      minTextLength: 1,
      maxDepth: 6,
      autoGenerateIds: true,
      rootMargin: '-10% 0px -80% 0px',
      threshold: [0, 0.1, 0.5, 1.0],
      ...config
    };

    this.headingExtractor = new HeadingExtractor();
    this.navigationHandler = new NavigationHandler();
    this.scrollTracker = new ScrollTracker();

    this.currentState = {
      entries: [],
      activeEntry: null,
      isVisible: false,
      position: 'right',
      isLoading: false
    };

    // Configure scroll tracker with our settings
    this.scrollTracker.configure({
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });
  }

  /**
   * Initialize the TOC manager with a document container
   * @param container - The document container to analyze
   * @returns Initial TOC state
   */
  initialize(container: HTMLElement): TocState {
    try {
      // Extract headings from the container
      const entries = this.updateToc(container);

      // Update state
      this.currentState = {
        ...this.currentState,
        entries,
        activeEntry: null
      };

      return this.currentState;
    } catch (error) {
      console.error('TocManager: Error during initialization:', error);
      return this.getEmptyState();
    }
  }

  /**
   * Update TOC when document changes
   * @param container - Updated document container
   * @returns New TOC entries
   */
  updateToc(container: HTMLElement): TocEntry[] {
    try {
      // Extract all headings
      let entries = this.headingExtractor.extractHeadings(container);

      // Filter by configured levels
      entries = this.filterByLevels(entries);

      // Apply depth limit
      entries = this.limitDepth(entries);

      // Filter by minimum text length
      entries = this.filterByTextLength(entries);

      // Update current state
      this.currentState.entries = entries;

      // If we're currently tracking, update the tracker with new entries
      if (this.activeCallback) {
        this.scrollTracker.updateEntries(entries);
      }

      return entries;
    } catch (error) {
      console.error('TocManager: Error updating TOC:', error);
      return [];
    }
  }

  /**
   * Start active section tracking
   * @param callback - Function to call when active section changes
   */
  startTracking(callback: (activeId: string | null) => void): void {
    this.activeCallback = callback;

    if (this.currentState.entries.length > 0) {
      this.scrollTracker.startTracking(this.currentState.entries, (activeId) => {
        this.currentState.activeEntry = activeId;
        callback(activeId);
      });
    }
  }

  /**
   * Stop tracking and cleanup resources
   */
  cleanup(): void {
    this.scrollTracker.stopTracking();
    this.activeCallback = null;
    this.currentState.activeEntry = null;
  }

  /**
   * Navigate to a specific TOC entry
   * @param entryId - ID of the target entry
   * @param smoothScroll - Whether to use smooth scrolling
   * @returns Promise that resolves when navigation is complete
   */
  navigateToEntry(entryId: string, smoothScroll: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Validate that the entry exists in our current TOC
        const entry = this.findEntryById(entryId);
        if (!entry) {
          const error = new Error(`Entry with ID "${entryId}" not found in current TOC`);
          console.warn(`TocManager: ${error.message}`);
          reject(error);
          return;
        }

        // Use navigation handler to perform the scroll
        this.navigationHandler.navigateToSection(entryId, smoothScroll)
          .then(() => {
            // Update active entry after successful navigation
            this.currentState.activeEntry = entryId;

            // Notify callback if available
            if (this.activeCallback) {
              this.activeCallback(entryId);
            }

            resolve();
          })
          .catch((error) => {
            console.error('TocManager: Navigation failed:', error);
            reject(error);
          });
      } catch (error) {
        console.error('TocManager: Error during navigation setup:', error);
        reject(error);
      }
    });
  }

  /**
   * Get current TOC state
   * @returns Current state of the TOC
   */
  getState(): TocState {
    return { ...this.currentState };
  }

  /**
   * Update configuration
   * @param newConfig - New configuration options
   */
  updateConfig(newConfig: Partial<TocManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update scroll tracker configuration
    this.scrollTracker.configure({
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });
  }

  /**
   * Get current configuration
   * @returns Current configuration
   */
  getConfig(): TocManagerConfig {
    return { ...this.config };
  }

  /**
   * Filter entries by configured heading levels
   * @param entries - TOC entries to filter
   * @returns Filtered entries
   */
  private filterByLevels(entries: TocEntry[]): TocEntry[] {
    return entries.filter(entry => {
      if (!this.config.includeLevels.includes(entry.level)) {
        return false;
      }

      // Recursively filter children
      entry.children = this.filterByLevels(entry.children);
      return true;
    });
  }

  /**
   * Limit nesting depth of entries
   * @param entries - TOC entries to limit
   * @param currentDepth - Current nesting depth
   * @returns Entries with limited depth
   */
  private limitDepth(entries: TocEntry[], currentDepth: number = 0): TocEntry[] {
    if (currentDepth >= this.config.maxDepth) {
      return [];
    }

    return entries.map(entry => ({
      ...entry,
      children: this.limitDepth(entry.children, currentDepth + 1)
    }));
  }

  /**
   * Filter entries by minimum text length
   * @param entries - TOC entries to filter
   * @returns Filtered entries
   */
  private filterByTextLength(entries: TocEntry[]): TocEntry[] {
    return entries.filter(entry => {
      if (entry.text.trim().length < this.config.minTextLength) {
        return false;
      }

      // Recursively filter children
      entry.children = this.filterByTextLength(entry.children);
      return true;
    });
  }

  /**
   * Find a TOC entry by ID
   * @param id - Entry ID to find
   * @param entries - Entries to search (defaults to current entries)
   * @returns Found entry or null
   */
  private findEntryById(id: string, entries: TocEntry[] = this.currentState.entries): TocEntry | null {
    for (const entry of entries) {
      if (entry.id === id) {
        return entry;
      }

      if (entry.children.length > 0) {
        const found = this.findEntryById(id, entry.children);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Get empty state for error conditions
   * @returns Empty TOC state
   */
  private getEmptyState(): TocState {
    return {
      entries: [],
      activeEntry: null,
      isVisible: false,
      position: 'right',
      isLoading: false
    };
  }

  /**
   * Get statistics about current TOC
   * @returns TOC statistics
   */
  getStatistics(): {
    totalEntries: number;
    maxDepth: number;
    levelCounts: Record<number, number>;
  } {
    const stats = {
      totalEntries: 0,
      maxDepth: 0,
      levelCounts: {} as Record<number, number>
    };

    const analyzeEntries = (entries: TocEntry[], depth: number = 0) => {
      stats.maxDepth = Math.max(stats.maxDepth, depth);

      for (const entry of entries) {
        stats.totalEntries++;
        stats.levelCounts[entry.level] = (stats.levelCounts[entry.level] || 0) + 1;

        if (entry.children.length > 0) {
          analyzeEntries(entry.children, depth + 1);
        }
      }
    };

    analyzeEntries(this.currentState.entries);
    return stats;
  }

  /**
   * Check if TOC has any entries
   * @returns True if TOC has entries
   */
  hasEntries(): boolean {
    return this.currentState.entries.length > 0;
  }

  /**
   * Get flattened list of all entries
   * @returns Flattened array of all entries
   */
  getFlattenedEntries(): TocEntry[] {
    const flattened: TocEntry[] = [];

    const flatten = (entries: TocEntry[]) => {
      for (const entry of entries) {
        flattened.push(entry);
        if (entry.children.length > 0) {
          flatten(entry.children);
        }
      }
    };

    flatten(this.currentState.entries);
    return flattened;
  }
}
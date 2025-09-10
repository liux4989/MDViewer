/**
 * Effects service that coordinates Obsidian events with store and repository
 * Implements the side effects for real-time TOC synchronization
 */

import { IObsidianEvents } from '../datasources/obsidianEvents';
import { IObsidianDataSource } from '../datasources/obsidianDataSource';
import { TocHeading } from '../schemas/toc';

export type TocMode = 'compact' | 'detail';

/**
 * Find the current active heading based on scroll line position
 * Uses Line-Based Position Tracking as decided in @match_heading.md
 * @param scrollLine Current scroll line position in the editor
 * @param headings Array of TOC headings with line positions
 * @returns The active heading or undefined if none found
 */
function getCurrentHeading(scrollLine: number, headings: TocHeading[]): TocHeading | undefined {
  return headings.find((heading, index) => {
    const startLine = heading.line;
    const endLine = index < headings.length - 1
      ? headings[index + 1].line - 1
      : Number.MAX_SAFE_INTEGER;

    return scrollLine >= startLine && scrollLine <= endLine;
  });
}

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

export interface ITocModeStoreAdapter {
  setScrolling(isScrolling: boolean): void;
}

/**
 * Coordinates Obsidian events with store updates using data source directly
 * Implements the three main side effects:
 * 1. File changes → reset mode and update headings
 * 2. Editor scrolling → switch to preview mode and track active heading
 * 3. User editing → refresh headings without UI disruption
 */
export class TocSyncEffects {
  constructor(
    private events: IObsidianEvents,
    private dataSource: IObsidianDataSource,
    private tocStore: ITocStoreAdapter,
    private modeStore: ITocModeStoreAdapter
  ) { }

  /**
   * Initialize all event listeners and side effects
   * @returns Cleanup function to dispose all listeners
   */
  init(): () => void {
    const disposers: Array<() => void> = [];

    // Side Effect 1: File changes → reset mode and refresh headings
    const handleFileRefresh = async (path: string) => {
      try {
        const { activeFile } = this.tocStore.getState();
        if (activeFile != path) {
          const tocData = this.dataSource.getCurrentFileTocData();
          if (tocData) {
            const headings = tocData.headings;

            // Update store with new data
            this.tocStore.setHeadings(headings);
            this.tocStore.setActiveFile(path);
            this.tocStore.setActiveHeading(null); // Reset active heading
          } else {
            console.error('Failed to get current file TOC data');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to refresh TOC data for file:', path, error);
      }
    };

    disposers.push(
      this.events.onFileOpen(handleFileRefresh),
      this.events.onFileChanged(handleFileRefresh)
    );

    // Side Effect 2: Editor scrolling → track scrolling state and active heading
    disposers.push(
      this.events.onEditorScrollStart(() => {
        // Set scrolling state (mode will be computed as compact)
        this.modeStore.setScrolling(true);
      }),

      this.events.onEditorScrollStop(async () => {
        // Clear scrolling state
        this.modeStore.setScrolling(false);

        try {
          const { activeFile } = this.tocStore.getState();
          if (!activeFile) return;

          // Get current headings from data source
          const tocData = this.dataSource.getCurrentFileTocData();
          if (tocData) {
            const headings = tocData.headings;

            // Calculate which heading is active based on current scroll position
            // Uses Line-Based Position Tracking as decided in @match_heading.md
            const currentScrollLine = this.events.getCurrentScrollLine();
            const activeHeading = currentScrollLine !== null
              ? getCurrentHeading(currentScrollLine, headings)
              : (headings.length > 0 ? headings[0] : undefined);

            // Update active heading
            this.tocStore.setActiveHeading(activeHeading?.id ?? null);
          } else {
            console.error('Failed to get TOC data for active file');
            return;
          }
        } catch (error) {
          console.error('Failed to update active heading after scroll:', error);
        }
      })
    );

    // Side Effect 3: User editing → refresh headings without disrupting interaction
    disposers.push(
      this.events.onEditorChangeIdle(async (path) => {
        try {
          const { activeFile } = this.tocStore.getState();

          // Only update if this is the currently active file
          if (activeFile === path) {
            // Get fresh headings data (Obsidian cache will be automatically updated)
            const tocData = this.dataSource.getCurrentFileTocData();
            if (tocData) {
              const headings = tocData.headings;

              // Update headings but preserve current mode and active heading
              // This ensures editing doesn't disrupt user's current interaction
              this.tocStore.setHeadings(headings);
            } else {
              console.error('Failed to refresh TOC data after edit');
              return;
            }
          }
        } catch (error) {
          console.error('Failed to update TOC data after edit:', path, error);
        }
      })
    );

    // Return cleanup function that disposes all listeners
    return () => {
      disposers.splice(0).forEach(dispose => dispose());
    };
  }
}

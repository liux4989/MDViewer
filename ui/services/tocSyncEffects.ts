/**
 * Effects service that coordinates Obsidian events with store and repository
 * Implements the side effects for real-time TOC synchronization
 */

import { IObsidianEvents } from '../datasources/obsidianEvents';
import { ITocRepository, Result, TocDataServiceError } from '../repositories/tocRepository';
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

export interface ITocUIStore {
  getState(): {
    mode: TocMode;
    activeFile: string | null;
    activeHeadingId: string | null;
    headings: TocHeading[];
  };
  setMode(mode: TocMode): void;
  setActiveFile(path: string | null): void;
  setHeadings(headings: TocHeading[]): void;
  setActiveHeading(id: string | null): void;
}

/**
 * Coordinates Obsidian events with store updates and repository cache management
 * Implements the three main side effects:
 * 1. File changes → reset mode and update headings
 * 2. Editor scrolling → switch to compact mode and track active heading
 * 3. User editing → update heading cache without UI disruption
 */
export class TocSyncEffects {
  constructor(
    private events: IObsidianEvents,
    private repository: ITocRepository,
    private store: ITocUIStore
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
        const { activeFile } = this.store.getState();
        if (activeFile != path) {
          const result = await this.repository.getCurrentFileHeadings();
          if (result.ok) {
            const headings = result.data.headings;

            // Update store with new data and reset to compact mode
            this.store.setHeadings(headings);
            this.store.setMode('compact');
            this.store.setActiveFile(path);
            this.store.setActiveHeading(null); // Reset active heading
          } else {
            console.error('Failed to get current file headings:', result.error?.message || 'Unknown error');
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

    // Side Effect 2: Editor scrolling → switch to compact mode and track active heading
    disposers.push(
      this.events.onEditorScrollStart(() => {
        // Switch to compact mode while scrolling for better performance
        this.store.setMode('compact');
      }),

      this.events.onEditorScrollStop(async () => {
        try {
          const { activeFile } = this.store.getState();
          if (!activeFile) return;

          // Get current headings from cache (optimized method for active file)
          const result = await this.repository.getCurrentFileHeadings();
          if (result.ok) {
            const headings = result.data.headings;

            // Calculate which heading is active based on current scroll position
            // Uses Line-Based Position Tracking as decided in @match_heading.md
            const currentScrollLine = this.events.getCurrentScrollLine();
            const activeHeading = currentScrollLine !== null
              ? getCurrentHeading(currentScrollLine, headings)
              : (headings.length > 0 ? headings[0] : undefined);

            // Update active heading without changing mode
            this.store.setActiveHeading(activeHeading?.id ?? null);
          } else {
            console.error('Failed to get headings for active file:', result.error?.message || 'Unknown error');
            return;
          }
        } catch (error) {
          console.error('Failed to update active heading after scroll:', error);
        }
      })
    );

    // Side Effect 3: User editing → update cache without disrupting interaction
    disposers.push(
      this.events.onEditorChangeIdle(async (path) => {
        try {
          const { activeFile } = this.store.getState();

          // Only update if this is the currently active file
          if (activeFile === path) {
            // Refresh cache in background by clearing and re-fetching
            this.repository.clearCache();
            const result = await this.repository.getCurrentFileHeadings();
            if (result.ok) {
              const headings = result.data.headings;

              // Update headings but preserve current mode and active heading
              // This ensures editing doesn't disrupt user's current interaction
              this.store.setHeadings(headings);
            } else {
              console.error('Failed to refresh headings cache:', result.error?.message || 'Unknown error');
              return;
            }
          }
        } catch (error) {
          console.error('Failed to update TOC cache after edit:', path, error);
        }
      })
    );

    // Return cleanup function that disposes all listeners
    return () => {
      disposers.splice(0).forEach(dispose => dispose());
    };
  }
}

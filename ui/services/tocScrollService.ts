/**
 * TOC Scroll Service - Scroll and Active Heading Management
 * Handles scroll events and active heading detection
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
  setActiveHeading(id: string | null): void;
}

export interface ITocModeStoreAdapter {
  setScrolling(isScrolling: boolean): void;
}

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

/**
 * Manages scroll events and active heading detection
 */
export class TocScrollService {
  constructor(
    private events: IObsidianEvents,
    private dataSource: IObsidianDataSource,
    private dataComposer: ITocDataComposer,
    private tocStore: ITocStoreAdapter,
    private modeStore: ITocModeStoreAdapter
  ) {}

  /**
   * Initialize scroll event listeners
   * @returns Cleanup function to dispose listeners
   */
  init(): () => void {
    const disposers: Array<() => void> = [];

    // Handle scroll start - set scrolling state
    disposers.push(
      this.events.onEditorScrollStart(() => {
        this.modeStore.setScrolling(true);
      })
    );

    // Handle scroll stop - update active heading
    disposers.push(
      this.events.onEditorScrollStop(async () => {
        this.modeStore.setScrolling(false);
        await this.updateActiveHeading();
      })
    );

    return () => {
      disposers.splice(0).forEach(dispose => dispose());
    };
  }

  /**
   * Update the active heading based on current scroll position
   */
  async updateActiveHeading(): Promise<void> {
    try {
      const { activeFile, headings } = this.tocStore.getState();
      if (!activeFile || headings.length === 0) {
        return;
      }

      // Get current scroll line position
      const currentScrollLine = this.events.getCurrentScrollLine();
      if (currentScrollLine === null) {
        return;
      }

      // Calculate which heading is active based on current scroll position
      // Uses Line-Based Position Tracking as decided in @match_heading.md
      const activeHeading = getCurrentHeading(currentScrollLine, headings);

      // Update active heading
      this.tocStore.setActiveHeading(activeHeading?.id ?? null);
    } catch (error) {
      console.error('Failed to update active heading after scroll:', error);
    }
  }
}

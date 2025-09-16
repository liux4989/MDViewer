/**
 * Custom hooks for TOC Effects Integration
 * Separates concerns into focused, reusable hooks
 */

import { useMemo, useEffect, useCallback } from 'react';
import type { App } from 'obsidian';
import { ObsidianDataSource } from '../datasources/obsidianDataSource';
import { ObsidianEvents, ViewportRange } from '../datasources/obsidianEvents';
import { useToc, useTocActions } from '../stores/TocContext';
import { useTocModeActions, useTocMode } from '../stores/TocModeContext';
import { TocHeading } from '../schemas';

/**
 * Find the current active heading based on viewport range
 * Uses enhanced filtering with current page line range
 * @param viewportRange Current viewport range information
 * @param headings Array of TOC headings with line positions (should be sorted by line number)
 * @returns The active heading or undefined if none found
 */
export function getCurrentHeadingFromRange(viewportRange: ViewportRange, headings: TocHeading[]): TocHeading | undefined {
  const { startLine, endLine } = viewportRange;

  // Calculate the center line of the viewport
  const centerLine = Math.floor((startLine + endLine) / 2);

  // Find headings that are relevant to the current viewport
  const relevantHeadings = headings.filter(h =>
    h.line <= endLine // Heading is at or before the end of viewport
  );

  if (relevantHeadings.length === 0) {
    return undefined;
  }

  // Find the heading that's closest to the center of the viewport
  // Priority: headings at or before center, then closest after center
  const beforeOrAtCenter = relevantHeadings.filter(h => h.line <= centerLine);

  if (beforeOrAtCenter.length > 0) {
    // Return the last heading at or before viewport center
    return beforeOrAtCenter[beforeOrAtCenter.length - 1];
  }

  // If no headings before center, find the closest one after center
  const afterCenter = relevantHeadings.filter(h => h.line > centerLine);
  if (afterCenter.length > 0) {
    return afterCenter[0]; // First heading after viewport center
  }

  return undefined;
}

/**
 * Hook for managing Obsidian data sources
 * Provides stable dataSource and events instances
 */
export function useObsidianDataSources(app: App) {
  return useMemo(() => {
    const dataSource = new ObsidianDataSource(app);
    const events = new ObsidianEvents(app);
    return { dataSource, events };
  }, [app]);
}

/**
 * Hook for handling file-related events (open, change, edit idle)
 * Manages file event listeners and cleanup
 */
export function useFileEvents(dataSource: ObsidianDataSource, events: ObsidianEvents) {
  const toc = useToc();
  const tocActions = useTocActions();

  // Event handlers
  const handleFileOpen = useCallback(async (filePath: string) => {
    try {
      const activeFile = dataSource.getActiveFile();
      if (activeFile && activeFile.path === filePath) {
        const obsidianFile = dataSource.extractFileMetadata(activeFile);
        const obsidianHeadings = dataSource.extractHeadings(activeFile);
        if (obsidianFile && obsidianHeadings) {
          tocActions.loadFileData(activeFile, obsidianFile, obsidianHeadings);
        }
      }
    } catch (error) {
      console.error('Failed to load file data on open:', error);
    }
  }, [dataSource, tocActions.loadFileData]);

  const handleFileChanged = useCallback(async (filePath: string) => {
    if (toc.activeFile === filePath) {
      try {
        const activeFile = dataSource.getActiveFile();
        if (activeFile) {
          const obsidianFile = dataSource.extractFileMetadata(activeFile);
          const obsidianHeadings = dataSource.extractHeadings(activeFile);
          if (obsidianFile && obsidianHeadings) {
            tocActions.refreshHeadings(activeFile, obsidianFile, obsidianHeadings);
          }
        }
      } catch (error) {
        console.error('Failed to refresh headings on file change:', error);
      }
    }
  }, [toc.activeFile, dataSource, tocActions.refreshHeadings]);

  const handleEditorChangeIdle = useCallback(async (filePath: string) => {
    if (toc.activeFile === filePath) {
      try {
        const activeFile = dataSource.getActiveFile();
        if (activeFile) {
          const obsidianFile = dataSource.extractFileMetadata(activeFile);
          const obsidianHeadings = dataSource.extractHeadings(activeFile);
          if (obsidianFile && obsidianHeadings) {
            tocActions.refreshHeadings(activeFile, obsidianFile, obsidianHeadings);
          }
        }
      } catch (error) {
        console.error('Failed to refresh headings on edit idle:', error);
      }
    }
  }, [toc.activeFile, dataSource, tocActions.refreshHeadings]);

  // Register file event listeners
  useEffect(() => {
    const disposers: Array<() => void> = [];

    // File events
    disposers.push(events.onFileOpen(handleFileOpen));
    disposers.push(events.onFileChanged(handleFileChanged));
    disposers.push(events.onEditorChangeIdle(handleEditorChangeIdle));

    // Cleanup function
    return () => {
      disposers.forEach(dispose => dispose());
    };
  }, [events, handleFileOpen, handleFileChanged, handleEditorChangeIdle]);
}

/**
 * Hook for handling scroll events with navigation conflict resolution
 * Combines useEffect and useCallback inline for better performance
 */
export function useScrollEvents(events: ObsidianEvents) {
  const toc = useToc();
  const tocActions = useTocActions();
  const modeActions = useTocModeActions();
  const modeState = useTocMode();

  // Combined useEffect and useCallback - inline approach with timeout cleanup
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // Don't update active heading if user is navigating
      if (modeState.isNavigating) {
        return;
      }

      // Clear any existing timeout to prevent multiple debounced calls
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set scrolling state
      modeActions.setScrolling(true);
      
      // Debounce scroll updates
      timeoutId = setTimeout(() => {
        modeActions.setScrolling(false);
        // Update active heading based on current scroll position
        try {
          const headings = toc.headings;
          if (headings.length === 0) return;

          const viewportRange = events.getCurrentViewportRange();
          if (viewportRange === null) return;

          // Calculate which heading is active based on viewport range
          const activeHeading = getCurrentHeadingFromRange(viewportRange, headings);
          const newActiveHeadingId = activeHeading?.id ?? null;
          // Only update if different from current active heading
          if (newActiveHeadingId !== toc.activeHeadingId) {
            tocActions.setActiveHeading(newActiveHeadingId);
          }
        } catch (error) {
          console.error('Failed to update active heading after scroll:', error);
        }
        timeoutId = null; // Clear reference after execution
      }, 150); // 150ms debounce
    };

    // Register scroll listener for both source and preview containers
    const scrollDisposer = events.onScroll(handleScroll);

    return () => {
      // Clean up scroll listener
      scrollDisposer();
      // Clean up any pending timeout to prevent memory leaks
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [modeState.isNavigating, toc.headings, toc.activeHeadingId, modeActions, tocActions, events]);
}

/**
 * Hook for loading initial TOC data on mount
 */
export function useInitialData(dataSource: ObsidianDataSource) {
  const tocActions = useTocActions();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load TOC data
        const activeFile = dataSource.getActiveFile();
        if (activeFile) {
          const obsidianFile = dataSource.extractFileMetadata(activeFile);
          const obsidianHeadings = dataSource.extractHeadings(activeFile);
          if (obsidianFile && obsidianHeadings) {
            tocActions.loadFileData(activeFile, obsidianFile, obsidianHeadings);
          }
        }
      } catch (error) {
        console.error('Failed to load initial TOC data:', error);
      }
    };

    loadInitialData();
  }, [dataSource, tocActions.loadFileData]);
}

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
import { sanitizeHeadingText } from '../utils/tocTransformers';

// ===== BUSINESS LOGIC FUNCTIONS =====

/**
 * Processes Obsidian headings into TOC headings with business logic
 * @param obsidianHeadings - Raw headings from Obsidian metadata cache
 * @returns Array of processed TocHeading objects
 */
function processObsidianHeadings(obsidianHeadings: any[]): TocHeading[] {
  if (!Array.isArray(obsidianHeadings)) {
    return [];
  }

  return obsidianHeadings
    .filter(h => h && typeof h === 'object') // Filter out invalid headings
    .filter(h => h.level >= 1 && h.level <= 3) // Business rule: only levels 1-3
    .map((h, index) => ({
      id: `heading-${index}`,
      text: sanitizeHeadingText(h.heading),
      level: h.level,
      line: h.position.start
    }))
    .filter(h => h.text.length > 0); // Filter out headings with empty text after sanitization
}

/**
 * Abstracted function that combines extraction + processing
 * @param dataSource - Obsidian data source instance
 * @param activeFile - Active file from Obsidian
 * @returns Object with file metadata and processed headings, or null if extraction fails
 */
function extractAndProcessFileData(dataSource: ObsidianDataSource, activeFile: any) {
  if (!activeFile) {
    return null;
  }

  const obsidianFile = dataSource.extractFileMetadata(activeFile);
  const obsidianHeadings = dataSource.extractHeadings(activeFile);

  if (!obsidianFile || !obsidianHeadings) {
    return null;
  }

  return {
    file: activeFile,
    obsidianFile,
    processedHeadings: processObsidianHeadings(obsidianHeadings)
  };
}

/**
 * Find the current active heading based on viewport range
 * Uses enhanced filtering with current page line range
 * @param viewportRange Current viewport range information
 * @param headings Array of TOC headings with line positions (should be sorted by line number)
 * @returns The active heading or undefined if none found
 */
export function getCurrentHeadingFromRange(viewportRange: ViewportRange, headings: TocHeading[]): TocHeading | undefined {
  const { startLine, endLine } = viewportRange;

  // Find headings that are relevant to the current viewport
  const relevantHeadings = headings.filter(h =>
    h.line <= endLine // Heading is at or before the end of viewport
  );

  if (relevantHeadings.length === 0) {
    return undefined;
  }

  // Find the first heading that's closest to the viewport start
  // Priority: headings at or before viewport start, then closest after start
  const beforeOrAtStart = relevantHeadings.filter(h => h.line <= startLine);

  if (beforeOrAtStart.length > 0) {
    // Return the last heading at or before viewport start (closest to viewport)
    return beforeOrAtStart[beforeOrAtStart.length - 1];
  }

  // If no headings before viewport start, find the first one within viewport
  const withinViewport = relevantHeadings.filter(h => h.line > startLine && h.line <= endLine);
  if (withinViewport.length > 0) {
    return withinViewport[0]; // First heading within viewport
  }

  return undefined;
}

/**
 * Calculate and set the active heading based on current viewport
 * @param headings Array of TOC headings
 * @param events ObsidianEvents instance for viewport calculation
 * @param tocActions TOC actions for setting active heading
 * @param currentActiveHeadingId Current active heading ID (optional, for optimization)
 */
function calculateAndSetActiveHeading(
  headings: TocHeading[],
  events: ObsidianEvents,
  tocActions: ReturnType<typeof useTocActions>,
  currentActiveHeadingId?: string | null
): void {
  if (headings.length === 0) return;

  try {
    const viewportRange = events.getCurrentViewportRange();
    if (viewportRange) {
      const activeHeading = getCurrentHeadingFromRange(viewportRange, headings);
      const newActiveHeadingId = activeHeading?.id ?? null;

      // Only update if different from current active heading (optimization)
      if (currentActiveHeadingId === undefined || newActiveHeadingId !== currentActiveHeadingId) {
        tocActions.setActiveHeading(newActiveHeadingId);
      }
    }
  } catch (error) {
    console.error('Failed to calculate active heading:', error);
  }
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
        const processedData = extractAndProcessFileData(dataSource, activeFile);
        if (processedData) {
          tocActions.loadFileData(processedData.file.path, processedData.processedHeadings);

          // Calculate and set active heading after loading new file
          calculateAndSetActiveHeading(processedData.processedHeadings, events, tocActions);
        }
      }
    } catch (error) {
      console.error('Failed to load file data on open:', error);
    }
  }, [dataSource, events, tocActions]);

  const handleFileChanged = useCallback(async (filePath: string) => {
    if (toc.activeFile === filePath) {
      try {
        const activeFile = dataSource.getActiveFile();
        if (activeFile) {
          const processedData = extractAndProcessFileData(dataSource, activeFile);
          if (processedData) {
            tocActions.refreshHeadings(processedData.processedHeadings);

            // Recalculate active heading after refreshing headings
            calculateAndSetActiveHeading(processedData.processedHeadings, events, tocActions);
          }
        }
      } catch (error) {
        console.error('Failed to refresh headings on file change:', error);
      }
    }
  }, [toc.activeFile, dataSource, events, tocActions]);

  const handleEditorChangeIdle = useCallback(async (filePath: string) => {
    if (toc.activeFile === filePath) {
      try {
        const activeFile = dataSource.getActiveFile();
        if (activeFile) {
          const processedData = extractAndProcessFileData(dataSource, activeFile);
          if (processedData) {
            tocActions.refreshHeadings(processedData.processedHeadings);

            // Recalculate active heading after refreshing headings
            calculateAndSetActiveHeading(processedData.processedHeadings, events, tocActions);
          }
        }
      } catch (error) {
        console.error('Failed to refresh headings on edit idle:', error);
      }
    }
  }, [toc.activeFile, dataSource, events, tocActions]);

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
        calculateAndSetActiveHeading(toc.headings, events, tocActions, toc.activeHeadingId);
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
export function useInitialData(dataSource: ObsidianDataSource, events: ObsidianEvents) {
  const tocActions = useTocActions();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load TOC data
        const activeFile = dataSource.getActiveFile();
        if (activeFile) {
          const processedData = extractAndProcessFileData(dataSource, activeFile);
          if (processedData) {
            tocActions.loadFileData(processedData.file.path, processedData.processedHeadings);

            // Calculate and set initial active heading after loading data
            calculateAndSetActiveHeading(processedData.processedHeadings, events, tocActions);
          }
        }
      } catch (error) {
        console.error('Failed to load initial TOC data:', error);
      }
    };

    loadInitialData();
  }, [dataSource, events, tocActions]);
}

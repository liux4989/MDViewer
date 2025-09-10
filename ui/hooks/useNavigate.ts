/**
 * Navigation Hook
 * Provides navigation operations for TOC headings
 * Coordinates between TOC store and Mode store for navigation state
 */

import { useMemo, useCallback } from 'react';
import { useToc } from './useToc';
import { useTocMode } from './useTocMode';
import type { TocHeading } from '../schemas/toc';

/**
 * Navigation direction types
 */
export type NavigationDirection = 'next' | 'prev' | 'parent' | 'child';

/**
 * Hook to access TOC navigation operations
 * @returns Object containing navigation functions and related data
 */
export function useNavigate() {
  const toc = useToc();
  const mode = useTocMode();
  
  // Memoized navigation functions
  const navigateToHeading = useCallback((headingId: string) => {
    // Set navigation state in mode store
    mode.setNavigating(true);

    // Navigate in TOC store
    toc.navigate(headingId);

    // Clear navigation state after a delay to allow DOM to settle
    setTimeout(() => {
      mode.setNavigating(false);
    }, 300);
  }, [toc, mode]);
  
  const navigateToHeadingByIndex = useCallback((index: number) => {
    const heading = toc.headings[index];
    if (heading) {
      navigateToHeading(heading.id);
    }
  }, [toc.headings, navigateToHeading]);
  
  return useMemo(() => ({
    /** Navigate to a specific heading by ID */
    navigateToHeading,
    /** Navigate to a heading by array index */
    navigateToHeadingByIndex
  }), [
    navigateToHeading,
    navigateToHeadingByIndex
  ]);
}

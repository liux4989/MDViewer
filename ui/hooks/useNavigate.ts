/**
 * Navigation Hook
 * Provides navigation operations for TOC headings
 */

import { useMemo, useCallback } from 'react';
import { useTocState } from './useTocState';
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
  const store = useTocState();
  
  // Memoized navigation functions
  const navigateToHeading = useCallback((headingId: string) => {
    store.navigate(headingId);
  }, [store.navigate]);
  
  const navigateToHeadingByIndex = useCallback((index: number) => {
    const heading = store.headings[index];
    if (heading) {
      store.navigate(heading.id);
    }
  }, [store.headings, store.navigate]);
  
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

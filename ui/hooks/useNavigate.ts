/**
 * Navigation Hook
 * Provides navigation operations for TOC headings
 * Coordinates between TOC store and Mode store for navigation state
 */

import { useMemo, useCallback } from 'react';
import { useTocActions, useToc } from '../stores/TocContext';
import { useTocModeActions } from '../stores/TocModeContext';
import { useNavigation } from '../stores/NavigationContext';
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
  const tocActions = useTocActions();
  const modeActions = useTocModeActions();
  const { navigate } = useNavigation();

  // Memoized navigation functions
  const navigateToHeading = useCallback((headingId: string) => {
    // Set navigation state in mode store
    modeActions.setNavigating(true);

    // Update TOC state (set active heading)
    tocActions.setActiveHeading(headingId);

    // Perform navigation side effect
    navigate(headingId);

    // Clear navigation state after a delay to allow DOM to settle
    setTimeout(() => {
      modeActions.setNavigating(false);
    }, 300);
  }, [tocActions, modeActions, navigate]);

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

/**
 * Active Heading Hook
 * Provides access to active heading state and related operations
 */

import { useMemo } from 'react';
import { useTocState } from './useTocState';
import type { TocHeading } from '../schemas/toc';

/**
 * Hook to access active heading state and operations
 * @returns Object containing active heading data and operations
 */
export function useActiveHeading() {
  const store = useTocState();
  
  return useMemo(() => ({
    /** Currently active heading object, null if none */
    activeHeading: store.getActiveHeading(),
    /** ID of the currently active heading */
    activeHeadingId: store.activeHeadingId,
    /** Set the active heading by ID */
    setActiveHeading: store.setActiveHeading,
    /** Navigate to a specific heading */
    navigateToHeading: store.navigate,
    /** Check if a heading is currently active */
    isHeadingActive: (heading: TocHeading) => heading.id === store.activeHeadingId
  }), [
    store.activeHeadingId,
    store.getActiveHeading,
    store.setActiveHeading,
    store.navigate
  ]);
}

/**
 * Active Heading Hook
 * Provides access to active heading state and related operations
 */

import { useMemo } from 'react';
import { useToc } from './useToc';
import type { TocHeading } from '../schemas/toc';

/**
 * Hook to access active heading state and operations
 * @returns Object containing active heading data and operations
 */
export function useActiveHeading() {
  const toc = useToc();
  
  return useMemo(() => ({
    /** Currently active heading object, null if none */
    activeHeading: toc.getActiveHeading(),
    /** ID of the currently active heading */
    activeHeadingId: toc.activeHeadingId,
    /** Set the active heading by ID */
    setActiveHeading: toc.setActiveHeading,
    /** Navigate to a specific heading */
    navigateToHeading: toc.navigate,
    /** Check if a heading is currently active */
    isHeadingActive: (heading: TocHeading) => heading.id === toc.activeHeadingId
  }), [
    toc.activeHeadingId,
    toc.getActiveHeading,
    toc.setActiveHeading,
    toc.navigate
  ]);
}

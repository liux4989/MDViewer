/**
 * TOC Container Component
 * Pure presentation component that renders the appropriate TOC view
 * Data loading and effects are now handled by TocUIProvider
 */

import React from 'react';
import { useTocState } from '../hooks/useTocState';
import { useTocMode } from '../hooks/useTocMode';
import TocCompactView from './TocCompactView';
import TocDetailView from './TocDetailView';

/**
 * Props for TocContainer component
 */
export interface TocContainerProps {
  /** Whether the floating TOC is visible */
  visible?: boolean;
}

/**
 * TOC Container Component
 * Pure presentation component that renders the appropriate TOC view
 * All data loading and effects are handled by TocUIProvider
 */
export function TocContainer({ visible = true }: TocContainerProps) {
  const store = useTocState();
  const { isCompactMode } = useTocMode();

  if (!visible) {
    return null;
  }

  // Render floating TOC directly (plugin handles positioning)
  return (
    <div className="toc-floating-container">
      {isCompactMode ? (
        <TocCompactView
          headings={store.headings}
          activeHeadingId={store.activeHeadingId}
        />
      ) : (
          <TocDetailView
            headings={store.headings}
            activeHeadingId={store.activeHeadingId}
          />
      )}
    </div>
  );
}

export default TocContainer;


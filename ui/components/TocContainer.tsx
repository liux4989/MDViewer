/**
 * TOC Container Component
 * Pure presentation component that renders the appropriate TOC view
 * Uses split stores for mode and TOC data
 */

import React from 'react';
import { useToc } from '../hooks/useToc';
import { useTocMode } from '../hooks/useTocMode';
import TocPreviewView from './TocPreviewView';
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
 * Uses split stores for mode and TOC data
 */
export function TocContainer({ visible = true }: TocContainerProps) {
  const toc = useToc();
  const mode = useTocMode();
  const isPreviewMode = mode.isPreviewMode();

  if (!visible) {
    return null;
  }

  // Render floating TOC directly (plugin handles positioning)
  return (
    <div className="toc-floating-container">
      {isPreviewMode ? (
        <TocPreviewView
          headings={toc.headings}
          activeHeadingId={toc.activeHeadingId}
        />
      ) : (
          <TocDetailView
            headings={toc.headings}
            activeHeadingId={toc.activeHeadingId}
          />
      )}
    </div>
  );
}

export default TocContainer;


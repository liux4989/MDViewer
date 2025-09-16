/**
 * TOC Container Component
 * Pure presentation component that renders the appropriate TOC view
 * Uses split stores for mode and TOC data
 */

import React from 'react';
import { useToc } from '../stores/TocContext';
import { useTocModeSelectors } from '../stores/TocModeContext';
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
  const modeSelectors = useTocModeSelectors();
  const isPreviewMode = modeSelectors.isPreviewMode();

  if (!visible) {
    return null;
  }

  // Render floating TOC directly (plugin handles positioning)
  // For preview mode, render without container to look more like built-in editor component
  // For detail mode, use container styling for proper floating appearance
  if (isPreviewMode) {
    return (
      <TocPreviewView
        headings={toc.headings}
        activeHeadingId={toc.activeHeadingId}
        className="toc-preview-floating"
      />
    );
  } else {
    return (
      <div className="toc-floating-container">
        <TocDetailView
          headings={toc.headings}
          activeHeadingId={toc.activeHeadingId}
        />
      </div>
    );
  }
}

export default TocContainer;


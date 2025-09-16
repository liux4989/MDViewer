/**
 * Preview Mode TOC View Component
 * Displays document structure as lines of different lengths - like a minimap preview
 * Designed for quick visual overview of document structure
 */

import React from 'react';
import type { TocHeading } from '../schemas/toc';
import { useTocModeActions } from '../stores/TocModeContext';

/**
 * Props for TocPreviewView component
 */
export interface TocPreviewViewProps {
  /** Array of headings to display */
  headings: TocHeading[];
  /** ID of the currently active heading */
  activeHeadingId: string | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Calculate line width based on heading level
 * Each level has uniform length within that level, but different levels have different lengths
 */
function calculateLineWidth(heading: TocHeading): number {
  // Fixed widths for each level to ensure uniformity within levels
  // while maintaining visual hierarchy between levels
  // Widths reduced by half for more compact appearance
  const levelWidths = {
    1: 45,  // H1: Longest lines for main sections (90/2)
    2: 37,  // H2: Medium lines for subsections (75/2)
    3: 30,  // H3: Shorter lines for sub-subsections (60/2)
    4: 22,  // H4: Even shorter for deeper levels (45/2)
    5: 17,  // H5: Very short for deep nesting (35/2)
    6: 12   // H6: Shortest for deepest levels (25/2)
  };
  
  return levelWidths[heading.level as keyof typeof levelWidths] || 12;
}

/**
 * Preview TOC View Component
 * Pure display component showing document structure as line previews
 */
export function TocPreviewView({ headings, activeHeadingId, className }: TocPreviewViewProps) {
  const modeActions = useTocModeActions();

  if (headings.length === 0) {
    return (
      <div
        className={`toc-preview-view toc-preview-empty ${className || ''}`}
        onPointerEnter={() => modeActions.setHovering(true)}
        onPointerLeave={() => modeActions.setHovering(false)}
      >
        <div className="toc-preview-empty-message">
          No structure
        </div>
      </div>
    );
  }

  return (
    <div
      className={`toc-preview-view ${className || ''}`}
      onPointerEnter={() => modeActions.setHovering(true)}
      onPointerLeave={() => modeActions.setHovering(false)}
    >
      <div className="toc-preview-lines">
        {headings.map((heading) => {
          const lineWidth = calculateLineWidth(heading);
          const isActive = heading.id === activeHeadingId;
          
          return (
            <div
              key={heading.id}
              className={`toc-preview-line toc-level-${heading.level} ${
                isActive ? 'toc-preview-active' : ''
              }`}
              style={{ width: `${lineWidth}%` }}
              title={heading.text} // Tooltip shows actual heading text
              data-heading-id={heading.id}
              data-heading-level={heading.level}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TocPreviewView;

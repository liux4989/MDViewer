/**
 * Compact Mode TOC View Component
 * Displays document structure as lines of different lengths - like a minimap preview
 * Designed for quick visual overview of document structure
 */

import React from 'react';
import type { TocHeading } from '../schemas/toc';
import { useTocMode } from '../hooks/useTocMode';

/**
 * Props for TocCompactView component
 */
export interface TocCompactViewProps {
  /** Array of headings to display */
  headings: TocHeading[];
  /** ID of the currently active heading */
  activeHeadingId: string | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Calculate line width based on heading level and text length
 */
function calculateLineWidth(heading: TocHeading): number {
  const baseWidth = 100; // Base width percentage
  
  // Adjust width based on heading level (H1 = longest, H3+ = shortest)
  const levelMultiplier = heading.level === 1 ? 1.0 : 
                         heading.level === 2 ? 0.8 : 
                         0.6; // H3 and below
  
  // Adjust based on text length (longer text = slightly longer line)
  const textLength = heading.text.length;
  const textMultiplier = Math.min(1.0, 0.4 + (textLength / 50)); // Scale 0.4-1.0
  
  return Math.round(baseWidth * levelMultiplier * textMultiplier);
}

/**
 * Compact TOC View Component
 * Pure display component showing document structure as line previews
 */
export function TocCompactView({ headings, activeHeadingId, className }: TocCompactViewProps) {
  const { setDetailMode } = useTocMode();
  if (headings.length === 0) {
    return (
      <div className={`toc-compact-view toc-compact-empty ${className || ''}`} onPointerEnter={setDetailMode}>
        <div className="toc-compact-empty-message">
          No structure
        </div>
      </div>
    );
  }

  return (
    <div className={`toc-compact-view ${className || ''}`} onPointerEnter={setDetailMode}>
      <div className="toc-compact-lines">
        {headings.map((heading) => {
          const lineWidth = calculateLineWidth(heading);
          const isActive = heading.id === activeHeadingId;
          
          return (
            <div
              key={heading.id}
              className={`toc-compact-line toc-level-${heading.level} ${
                isActive ? 'toc-compact-active' : ''
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

export default TocCompactView;

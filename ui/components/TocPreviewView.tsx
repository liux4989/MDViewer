/**
 * Preview Mode TOC View Component
 * Displays document structure as lines of different lengths - like a minimap preview
 * Designed for quick visual overview of document structure
 */

import React from 'react';
import type { TocHeading } from '../schemas/toc';
import { useTocMode } from '../hooks/useTocMode';

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
 * Preview TOC View Component
 * Pure display component showing document structure as line previews
 */
export function TocPreviewView({ headings, activeHeadingId, className }: TocPreviewViewProps) {
  const mode = useTocMode();

  if (headings.length === 0) {
    return (
      <div
        className={`toc-preview-view toc-preview-empty ${className || ''}`}
        onPointerEnter={() => mode.setHovering(true)}
        onPointerLeave={() => mode.setHovering(false)}
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
      onPointerEnter={() => mode.setHovering(true)}
      onPointerLeave={() => mode.setHovering(false)}
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

/**
 * Detail Mode TOC View Component
 * Renders a readable, indented list of headings with navigation on click
 * Follows the compact view component pattern
 */

import React, { useCallback } from 'react';
import type { TocHeading } from '../schemas/toc';
import { useNavigate } from '../hooks/useNavigate';
import { useTocMode } from '../hooks/useTocMode';

/**
 * Props for TocDetailView component
 */
export interface TocDetailViewProps {
  /** Array of headings to display */
  headings: TocHeading[];
  /** ID of the currently active heading */
  activeHeadingId: string | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Detail TOC View Component
 * Pure display component showing headings as an indented list
 */
export function TocDetailView({ headings, activeHeadingId, className }: TocDetailViewProps) {
  const { navigateToHeading } = useNavigate();
  const mode = useTocMode();

  const handlePointerOut = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only clear hovering when pointer actually leaves the container
    const related = e.relatedTarget as Node | null;
    if (!related || !(e.currentTarget as Node).contains(related)) {
      mode.setHovering(false);
    }
  }, [mode]);

  if (headings.length === 0) {
    return (
      <div
        className={`toc-detail-view toc-detail-empty ${className || ''}`}
        onPointerEnter={() => mode.setHovering(true)}
        onPointerOut={handlePointerOut}
      >
        <div className="toc-detail-empty-message">No headings</div>
      </div>
    );
  }

  return (
    <div
      className={`toc-detail-view ${className || ''}`}
      onPointerEnter={() => mode.setHovering(true)}
      onPointerOut={handlePointerOut}
    >
      <div className="toc-detail-listF">
        {headings.map((heading) => {
          const isActive = heading.id === activeHeadingId;
          return (
            <div
              key={heading.id}
              className={`toc-detail-item toc-level-${heading.level} ${isActive ? 'toc-detail-active' : ''}`}
              title={heading.text}
              data-heading-id={heading.id}
              data-heading-level={heading.level}
              role="button"
              tabIndex={0}
              onClick={() => navigateToHeading(heading.id)}
            >
              <span className="toc-detail-bullet" aria-hidden>•</span>
              <span className="toc-detail-text">{heading.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TocDetailView;



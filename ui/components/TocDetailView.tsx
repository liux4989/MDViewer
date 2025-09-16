/**
 * Detail Mode TOC View Component
 * Renders a readable, indented list of headings with navigation on click
 * Follows the compact view component pattern
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { TocHeading } from '../schemas/toc';
import { useNavigate } from '../hooks/useNavigate';
import { useTocModeActions } from '../stores/TocModeContext';

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
  const modeActions = useTocModeActions();
  const listRef = useRef<HTMLDivElement>(null);
  const lastScrolledHeadingRef = useRef<string | null>(null);


  const handlePointerOut = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only clear hovering when pointer actually leaves the container
    const related = e.relatedTarget as Node | null;
    if (!related || !(e.currentTarget as Node).contains(related)) {
      modeActions.setHovering(false);
    }
  }, [modeActions]);

  // Instant scroll to active heading when detail view opens (only once per heading)
  useEffect(() => {
    if (activeHeadingId && listRef.current && activeHeadingId !== lastScrolledHeadingRef.current) {
      const activeElement = listRef.current.querySelector(`[data-heading-id="${activeHeadingId}"]`);
      if (activeElement) {
        // Instant scroll without animation
        activeElement.scrollIntoView({
          behavior: 'auto',
          block: 'center'
        });
        // Mark this heading as scrolled to prevent repeated scrolling
        lastScrolledHeadingRef.current = activeHeadingId;
      }
    }
  }, [activeHeadingId]);

  if (headings.length === 0) {
    return (
      <div
        className={`toc-detail-view toc-detail-empty ${className || ''}`}
        onPointerEnter={() => modeActions.setHovering(true)}
        onPointerOut={handlePointerOut}
      >
        <div className="toc-detail-empty-message">No headings</div>
      </div>
    );
  }

  return (
    <div
      className={`toc-detail-view ${className || ''}`}
      onPointerEnter={() => modeActions.setHovering(true)}
      onPointerOut={handlePointerOut}
    >
      <div className="toc-detail-list" ref={listRef}>
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



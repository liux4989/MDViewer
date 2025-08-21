import React from 'react';
import { CSS_CLASSES } from '../constants';

interface TocHeaderProps {
  position: 'left' | 'right';
  onToggleVisibility: () => void;
  onPositionChange: (position: 'left' | 'right') => void;
}

export const TocHeader: React.FC<TocHeaderProps> = ({
  position,
  onToggleVisibility,
  onPositionChange
}) => {
  const handlePositionToggle = () => {
    const newPosition = position === 'left' ? 'right' : 'left';
    onPositionChange(newPosition);
  };

  return (
    <div className={CSS_CLASSES.HEADER}>
      <div className="toc-header-content">
        <h3 className="toc-title">Table of Contents</h3>
        <div className={CSS_CLASSES.CONTROLS}>
          <button
            className={CSS_CLASSES.CONTROL_BTN}
            onClick={handlePositionToggle}
            title={`Move to ${position === 'left' ? 'right' : 'left'}`}
            aria-label={`Move TOC to ${position === 'left' ? 'right' : 'left'} side`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {position === 'left' ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
          <button
            className={CSS_CLASSES.CONTROL_BTN}
            onClick={onToggleVisibility}
            title="Hide TOC"
            aria-label="Hide table of contents"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
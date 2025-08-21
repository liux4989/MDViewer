import React from 'react';
import { TocEntry } from '../types';
import { CSS_CLASSES } from '../constants';
import { getIndentStyle } from '../utils/navigation';

interface TocItemProps {
  entry: TocEntry;
  isActive: boolean;
  onItemClick: (id: string) => void;
  showLevelNumbers?: boolean;
  activeEntry?: string | null;
}

export const TocItem: React.FC<TocItemProps> = ({
  entry,
  isActive,
  onItemClick,
  showLevelNumbers = false,
  activeEntry = null
}) => {
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [wasActive, setWasActive] = React.useState(isActive);

  // Track active state changes for smooth transitions
  React.useEffect(() => {
    if (isActive !== wasActive) {
      setWasActive(isActive);
    }
  }, [isActive, wasActive]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Prevent multiple clicks while navigating
    if (isNavigating) {
      return;
    }
    
    setIsNavigating(true);
    
    try {
      onItemClick(entry.id);
    } catch (error) {
      console.error('Error during TOC item click:', error);
    } finally {
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  const indentStyle = getIndentStyle(entry.level);

  // Helper function to check if any child is active
  const isChildActive = (children: TocEntry[], activeId: string | null): boolean => {
    if (!activeId) return false;
    
    for (const child of children) {
      if (child.id === activeId) return true;
      if (child.children.length > 0 && isChildActive(child.children, activeId)) {
        return true;
      }
    }
    return false;
  };

  // Build CSS classes for the item
  const itemClasses = [
    CSS_CLASSES.ITEM,
    `toc-level-${entry.level}`,
    isActive ? CSS_CLASSES.ITEM_ACTIVE : '',
    isNavigating ? 'toc-item-navigating' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={CSS_CLASSES.ITEM_WRAPPER}>
      <div
        className={itemClasses}
        style={indentStyle}
        onClick={handleClick}
        title={isNavigating ? 'Navigating...' : `Navigate to ${entry.text}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
      >
        {showLevelNumbers && (
          <span className={CSS_CLASSES.ITEM_LEVEL}>{entry.level}</span>
        )}
        <span className={CSS_CLASSES.ITEM_TEXT}>
          {isNavigating && <span className="toc-navigation-indicator">⟳ </span>}
          {entry.text}
        </span>
      </div>
      
      {entry.children && entry.children.length > 0 && (
        <div className={CSS_CLASSES.ITEM_CHILDREN}>
          {entry.children.map((child) => (
            <TocItem
              key={child.id}
              entry={child}
              isActive={activeEntry === child.id}
              onItemClick={onItemClick}
              showLevelNumbers={showLevelNumbers}
              activeEntry={activeEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
};
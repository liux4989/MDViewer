import React from 'react';
import { TocItem } from './TocItem';
import { TocEntry } from '../types';
import { CSS_CLASSES } from '../constants';

interface TocListProps {
  entries: TocEntry[];
  activeEntry: string | null;
  onItemClick: (id: string) => void;
  showLevelNumbers?: boolean;
  smoothScroll?: boolean;
  isLoading?: boolean;
}

export const TocList: React.FC<TocListProps> = ({
  entries,
  activeEntry,
  onItemClick,
  showLevelNumbers = false,
  smoothScroll = true,
  isLoading = false
}) => {
  const handleItemClick = (id: string) => {
    onItemClick(id);
  };

  if (isLoading) {
    return (
      <div className="toc-list-loading">
        <div className="toc-loading-spinner"></div>
        <span>Loading headings...</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={CSS_CLASSES.EMPTY}>
        <p className={CSS_CLASSES.EMPTY_MESSAGE}>No headings found in this document.</p>
      </div>
    );
  }

  return (
    <div className={CSS_CLASSES.LIST}>
      <div className="toc-list-content">
        {entries.map((entry) => (
          <TocItem
            key={entry.id}
            entry={entry}
            isActive={activeEntry === entry.id}
            onItemClick={handleItemClick}
            showLevelNumbers={showLevelNumbers}
            activeEntry={activeEntry}
          />
        ))}
      </div>
    </div>
  );
};
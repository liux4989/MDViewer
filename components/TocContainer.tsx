import React from 'react';
import { TocHeader } from './TocHeader';
import { TocList } from './TocList';
import { TocEntry, PluginSettings } from '../types';
import { CSS_CLASSES, Z_INDEX } from '../constants';

interface TocContainerProps {
  entries: TocEntry[];
  activeEntry: string | null;
  isVisible: boolean;
  position: 'left' | 'right';
  settings: PluginSettings;
  onItemClick: (id: string) => void;
  onToggleVisibility: () => void;
  onPositionChange: (position: 'left' | 'right') => void;
  isLoading?: boolean;
}

export const TocContainer: React.FC<TocContainerProps> = ({
  entries,
  activeEntry,
  isVisible,
  position,
  settings,
  onItemClick,
  onToggleVisibility,
  onPositionChange,
  isLoading = false
}) => {
  if (!isVisible) {
    return null;
  }

  // Use fixed positioning for floating overlay
  const containerStyle = {
    position: 'fixed' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    [position]: '20px',
    width: `${settings.appearance.width}px`,
    maxHeight: `${settings.appearance.maxHeight}px`,
    zIndex: Z_INDEX.CONTAINER,
    pointerEvents: 'auto' as const,
    fontSize: settings.appearance.fontSize === 'small' ? '0.875rem' : 
               settings.appearance.fontSize === 'large' ? '1.125rem' : '1rem'
  };

  return (
    <div className={CSS_CLASSES.CONTAINER} style={containerStyle}>
      <TocHeader
        position={position}
        onToggleVisibility={onToggleVisibility}
        onPositionChange={onPositionChange}
      />
      <TocList
        entries={entries}
        activeEntry={activeEntry}
        onItemClick={onItemClick}
        showLevelNumbers={settings.behavior.showLevelNumbers}
        smoothScroll={settings.behavior.smoothScroll}
        isLoading={isLoading}
      />
    </div>
  );
};
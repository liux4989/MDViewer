/**
 * Central export file for all Floating TOC Plugin types
 * Provides a single import point for all type definitions
 */

// Core interfaces and types
export {
  TocEntry,
  TocState,
  PluginSettings,
  MockDataGenerator,
  DEFAULT_SETTINGS,
  INITIAL_TOC_STATE
} from './index';

// Import types for internal use in type guards
import type {
  TocEntry,
  TocState,
  PluginSettings
} from './index';

// Mock data implementation
export {
  MockTocData,
  mockTocData
} from './mock-data';

// React component interfaces
export {
  TocContainerProps,
  TocItemProps,
  TocHeaderProps,
  TocControlsProps,
  TocSettingsProps,
  TocListProps,
  TocFooterProps,
  TocNavigationHandler,
  TocToggleHandler,
  TocSettingsHandler,
  TocVisibilityHandler,
  UseTocStateReturn,
  UseTocSettingsReturn
} from './components';

// Business logic interfaces
export {
  IHeadingExtractor,
  IScrollTracker,
  INavigationHandler,
  ITocManager,
  ISettingsManager,
  IObsidianIntegration,
  TocManagerConfig,
  TocManagerEvents
} from './business-logic';

// Type guards and utility types
export type TocEntryLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TocPosition = 'left' | 'right';
export type FontSize = 'small' | 'medium' | 'large';

/**
 * Type guard to check if an object is a valid TocEntry
 */
export function isTocEntry(obj: any): obj is TocEntry {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.level === 'number' &&
    obj.level >= 1 &&
    obj.level <= 6 &&
    (obj.element === null || obj.element instanceof HTMLElement) &&
    Array.isArray(obj.children)
  );
}

/**
 * Type guard to check if an object is a valid TocState
 */
export function isTocState(obj: any): obj is TocState {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.entries) &&
    (obj.activeEntry === null || typeof obj.activeEntry === 'string') &&
    typeof obj.isVisible === 'boolean' &&
    (obj.position === 'left' || obj.position === 'right') &&
    typeof obj.isLoading === 'boolean'
  );
}

/**
 * Type guard to check if an object is a valid PluginSettings
 */
export function isPluginSettings(obj: any): obj is PluginSettings {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.isVisible === 'boolean' &&
    (obj.position === 'left' || obj.position === 'right') &&
    typeof obj.appearance === 'object' &&
    typeof obj.appearance.width === 'number' &&
    typeof obj.appearance.maxHeight === 'number' &&
    ['small', 'medium', 'large'].includes(obj.appearance.fontSize) &&
    typeof obj.behavior === 'object' &&
    typeof obj.behavior.autoHide === 'boolean' &&
    typeof obj.behavior.smoothScroll === 'boolean' &&
    typeof obj.behavior.collapseNested === 'boolean' &&
    typeof obj.behavior.showLevelNumbers === 'boolean'
  );
}

/**
 * Utility type for partial updates to plugin settings
 */
export type PartialPluginSettings = {
  [K in keyof PluginSettings]?: K extends 'appearance' | 'behavior'
    ? Partial<PluginSettings[K]>
    : PluginSettings[K];
};

/**
 * Utility type for TOC entry without children (flat structure)
 */
export type FlatTocEntry = Omit<TocEntry, 'children'>;

/**
 * Utility type for TOC entry with required element (for active entries)
 */
export type ActiveTocEntry = TocEntry & {
  element: HTMLElement;
};

/**
 * Event payload types for TOC events
 */
export interface TocEventPayloads {
  navigate: { entryId: string; entry: TocEntry };
  activeChange: { previousId: string | null; currentId: string | null };
  visibilityToggle: { isVisible: boolean };
  settingsUpdate: { settings: PluginSettings };
  entriesUpdate: { entries: TocEntry[]; count: number };
  error: { error: Error; context: string };
}
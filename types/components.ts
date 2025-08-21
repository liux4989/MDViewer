/**
 * React component interfaces and props for the Floating TOC Plugin
 * Defines the contract between components and their expected properties
 */

import { TocEntry, PluginSettings } from './index';

/**
 * Props for the main TOC container component
 * Root component that manages the entire TOC display
 */
export interface TocContainerProps {
  /** Array of TOC entries to display */
  entries: TocEntry[];
  /** Currently active/highlighted entry ID */
  activeEntry: string | null;
  /** Whether the TOC is visible */
  isVisible: boolean;
  /** Position of the TOC (left or right side) */
  position: 'left' | 'right';
  /** Plugin settings for appearance and behavior */
  settings: PluginSettings;
  /** Callback when user navigates to an entry */
  onNavigate: (entryId: string) => void;
  /** Callback to toggle TOC visibility */
  onToggleVisibility: () => void;
  /** Callback to update plugin settings */
  onUpdateSettings: (settings: Partial<PluginSettings>) => void;
}

/**
 * Props for individual TOC item component
 * Represents a single heading entry in the TOC
 */
export interface TocItemProps {
  /** The TOC entry data */
  entry: TocEntry;
  /** Whether this item is currently active */
  isActive: boolean;
  /** Whether this item's children are expanded */
  isExpanded: boolean;
  /** Current nesting depth for styling */
  depth?: number;
  /** Appearance settings */
  settings: PluginSettings['appearance'];
  /** Callback when user clicks to navigate */
  onNavigate: (entryId: string) => void;
  /** Callback to toggle expansion of children */
  onToggleExpand: (entryId: string) => void;
}

/**
 * Props for TOC header component
 * Contains title and control buttons
 */
export interface TocHeaderProps {
  /** Whether the TOC is currently visible */
  isVisible: boolean;
  /** Current position setting */
  position: 'left' | 'right';
  /** Callback to toggle visibility */
  onToggleVisibility: () => void;
  /** Callback to toggle position */
  onTogglePosition: () => void;
  /** Callback to open settings */
  onOpenSettings: () => void;
}

/**
 * Props for TOC controls component
 * Action buttons for TOC management
 */
export interface TocControlsProps {
  /** Current position setting */
  position: 'left' | 'right';
  /** Whether settings panel is open */
  isSettingsOpen: boolean;
  /** Callback to toggle position */
  onTogglePosition: () => void;
  /** Callback to toggle settings panel */
  onToggleSettings: () => void;
  /** Callback to collapse all entries */
  onCollapseAll: () => void;
  /** Callback to expand all entries */
  onExpandAll: () => void;
}

/**
 * Props for settings panel component
 * Configuration interface for user preferences
 */
export interface TocSettingsProps {
  /** Current plugin settings */
  settings: PluginSettings;
  /** Whether the settings panel is visible */
  isOpen: boolean;
  /** Callback to update settings */
  onUpdate: (settings: Partial<PluginSettings>) => void;
  /** Callback to close settings panel */
  onClose: () => void;
  /** Callback to reset to default settings */
  onReset: () => void;
}

/**
 * Props for TOC list component
 * Scrollable container for TOC items
 */
export interface TocListProps {
  /** Array of TOC entries to display */
  entries: TocEntry[];
  /** Currently active entry ID */
  activeEntry: string | null;
  /** Map of expanded entry IDs */
  expandedEntries: Set<string>;
  /** Plugin settings */
  settings: PluginSettings;
  /** Callback when user navigates to an entry */
  onNavigate: (entryId: string) => void;
  /** Callback to toggle entry expansion */
  onToggleExpand: (entryId: string) => void;
}

/**
 * Props for TOC footer component
 * Optional status information display
 */
export interface TocFooterProps {
  /** Total number of headings */
  totalEntries: number;
  /** Number of currently visible entries */
  visibleEntries: number;
  /** Whether the TOC is currently loading */
  isLoading: boolean;
}

/**
 * Event handler types for TOC interactions
 */
export type TocNavigationHandler = (entryId: string) => void;
export type TocToggleHandler = (entryId: string) => void;
export type TocSettingsHandler = (settings: Partial<PluginSettings>) => void;
export type TocVisibilityHandler = () => void;

/**
 * Hook return type for TOC state management
 */
export interface UseTocStateReturn {
  /** Current TOC state */
  state: {
    entries: TocEntry[];
    activeEntry: string | null;
    isVisible: boolean;
    position: 'left' | 'right';
    isLoading: boolean;
  };
  /** Update TOC entries */
  updateEntries: (entries: TocEntry[]) => void;
  /** Set active entry */
  setActiveEntry: (entryId: string | null) => void;
  /** Toggle TOC visibility */
  toggleVisibility: () => void;
  /** Update position */
  updatePosition: (position: 'left' | 'right') => void;
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
}

/**
 * Hook return type for TOC settings management
 */
export interface UseTocSettingsReturn {
  /** Current settings */
  settings: PluginSettings;
  /** Update settings */
  updateSettings: (settings: Partial<PluginSettings>) => void;
  /** Reset to defaults */
  resetSettings: () => void;
  /** Save settings to storage */
  saveSettings: () => Promise<void>;
  /** Load settings from storage */
  loadSettings: () => Promise<void>;
}
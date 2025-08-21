/**
 * Core data models and interfaces for the Floating TOC Plugin
 * Based on the technical architecture specifications
 */

/**
 * Primary data structure for TOC entries
 * Represents a single heading in the table of contents with hierarchical structure
 */
export interface TocEntry {
  /** Unique identifier for navigation */
  id: string;
  /** Heading text content */
  text: string;
  /** Heading level (1-6 for H1-H6) */
  level: number;
  /** DOM reference (null in mock data) */
  element: HTMLElement | null;
  /** Nested headings */
  children: TocEntry[];
  /** For collapsible sections */
  isExpanded?: boolean;
}

/**
 * Plugin state management interface
 * Manages the current state of the TOC plugin
 */
export interface TocState {
  /** Current document TOC structure */
  entries: TocEntry[];
  /** Currently highlighted section */
  activeEntry: string | null;
  /** TOC visibility toggle */
  isVisible: boolean;
  /** Fixed position preference */
  position: 'left' | 'right';
  /** Loading state for async operations */
  isLoading: boolean;
}

/**
 * User preferences and plugin settings
 * Configurable options for TOC appearance and behavior
 */
export interface PluginSettings {
  /** Global visibility setting */
  isVisible: boolean;
  /** TOC position on screen */
  position: 'left' | 'right';
  /** Appearance configuration */
  appearance: {
    /** TOC width in pixels */
    width: number;
    /** Maximum height before scrolling */
    maxHeight: number;
    /** Font size preference */
    fontSize: 'small' | 'medium' | 'large';
  };
  /** Behavior configuration */
  behavior: {
    /** Hide when not hovering */
    autoHide: boolean;
    /** Smooth scroll animation */
    smoothScroll: boolean;
    /** Collapse nested sections by default */
    collapseNested: boolean;
    /** Show heading level indicators */
    showLevelNumbers: boolean;
  };
}

/**
 * Mock data generator interface for development and testing
 * Provides various TOC structures for testing different scenarios
 */
export interface MockDataGenerator {
  /** Generate simple flat TOC structure */
  generateSimpleToc(): TocEntry[];
  /** Generate complex nested TOC structure */
  generateNestedToc(): TocEntry[];
  /** Generate large TOC for performance testing */
  generateLargeToc(): TocEntry[];
  /** Generate empty TOC for edge case testing */
  generateEmptyToc(): TocEntry[];
}

/**
 * Default plugin settings
 * Provides sensible defaults for new installations
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  isVisible: true,
  position: 'right',
  appearance: {
    width: 300,
    maxHeight: 600,
    fontSize: 'medium'
  },
  behavior: {
    autoHide: false,
    smoothScroll: true,
    collapseNested: false,
    showLevelNumbers: false
  }
};

/**
 * Initial TOC state
 * Default state when plugin is first loaded
 */
export const INITIAL_TOC_STATE: TocState = {
  entries: [],
  activeEntry: null,
  isVisible: true,
  position: 'right',
  isLoading: false
};
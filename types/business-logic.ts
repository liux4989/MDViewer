/**
 * Business logic interfaces for the Floating TOC Plugin
 * Defines contracts for core functionality classes
 */

import { TocEntry, TocState } from './index';

/**
 * Interface for heading extraction from document
 * Responsible for scanning and parsing document headings
 */
export interface IHeadingExtractor {
  /**
   * Extract headings from a container element
   * @param container - The HTML element to scan for headings
   * @returns Array of TocEntry objects representing the document structure
   */
  extractHeadings(container: HTMLElement): TocEntry[];

  /**
   * Build hierarchical structure from flat heading list
   * @param headings - Array of heading elements
   * @returns Nested TocEntry structure
   */
  buildHierarchy(headings: HTMLElement[]): TocEntry[];

  /**
   * Generate unique IDs for headings that don't have them
   * @param entries - Array of TocEntry objects to process
   */
  generateUniqueIds(entries: TocEntry[]): void;

  /**
   * Validate heading structure and fix common issues
   * @param entries - Array of TocEntry objects to validate
   * @returns Validated and corrected TocEntry array
   */
  validateStructure(entries: TocEntry[]): TocEntry[];
}

/**
 * Interface for scroll position tracking
 * Manages active section detection using Intersection Observer
 */
export interface IScrollTracker {
  /**
   * Start tracking scroll position for given entries
   * @param entries - TOC entries to track
   * @param callback - Function to call when active section changes
   */
  startTracking(entries: TocEntry[], callback: (activeId: string | null) => void): void;

  /**
   * Stop tracking and cleanup observers
   */
  stopTracking(): void;

  /**
   * Get the currently active section ID
   * @returns ID of the currently active section or null
   */
  getCurrentSection(): string | null;

  /**
   * Update tracking for new set of entries
   * @param entries - New TOC entries to track
   */
  updateEntries(entries: TocEntry[]): void;

  /**
   * Configure intersection observer options
   * @param options - IntersectionObserver configuration
   */
  configure(options: IntersectionObserverInit): void;
}

/**
 * Interface for navigation handling
 * Manages smooth scrolling and section navigation
 */
export interface INavigationHandler {
  /**
   * Navigate to a specific section
   * @param entryId - ID of the target section
   * @param smoothScroll - Whether to use smooth scrolling animation
   */
  navigateToSection(entryId: string, smoothScroll?: boolean): void;

  /**
   * Validate that a target element exists
   * @param entryId - ID of the target section
   * @returns True if target exists and is navigable
   */
  validateTarget(entryId: string): boolean;

  /**
   * Get the scroll position for a given entry
   * @param entryId - ID of the target section
   * @returns Scroll position in pixels or null if not found
   */
  getScrollPosition(entryId: string): number | null;

  /**
   * Configure scroll behavior
   * @param options - Scroll configuration options
   */
  configure(options: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    offset?: number;
  }): void;
}

/**
 * Interface for main TOC coordination
 * Orchestrates all TOC functionality
 */
export interface ITocManager {
  /**
   * Initialize the TOC manager with a document container
   * @param container - The document container to analyze
   * @returns Initial TOC state
   */
  initialize(container: HTMLElement): TocState;

  /**
   * Update TOC when document changes
   * @param container - Updated document container
   * @returns New TOC entries
   */
  updateToc(container: HTMLElement): TocEntry[];

  /**
   * Start active section tracking
   * @param callback - Function to call when active section changes
   */
  startTracking(callback: (activeId: string | null) => void): void;

  /**
   * Stop tracking and cleanup resources
   */
  cleanup(): void;

  /**
   * Navigate to a specific TOC entry
   * @param entryId - ID of the target entry
   * @param smoothScroll - Whether to use smooth scrolling
   */
  navigateToEntry(entryId: string, smoothScroll?: boolean): void;

  /**
   * Get current TOC state
   * @returns Current state of the TOC
   */
  getState(): TocState;
}

/**
 * Interface for settings persistence
 * Manages plugin settings storage and retrieval
 */
export interface ISettingsManager {
  /**
   * Load settings from storage
   * @returns Promise resolving to loaded settings
   */
  loadSettings(): Promise<any>;

  /**
   * Save settings to storage
   * @param settings - Settings object to save
   */
  saveSettings(settings: any): Promise<void>;

  /**
   * Reset settings to defaults
   */
  resetSettings(): Promise<void>;

  /**
   * Get default settings
   * @returns Default settings object
   */
  getDefaults(): any;

  /**
   * Validate settings object
   * @param settings - Settings to validate
   * @returns True if settings are valid
   */
  validateSettings(settings: any): boolean;
}

/**
 * Interface for Obsidian API integration
 * Handles plugin lifecycle and Obsidian-specific functionality
 */
export interface IObsidianIntegration {
  /**
   * Initialize Obsidian-specific features
   * @param plugin - Reference to the main plugin instance
   */
  initialize(plugin: any): void;

  /**
   * Register event listeners for document changes
   */
  registerEventListeners(): void;

  /**
   * Unregister event listeners
   */
  unregisterEventListeners(): void;

  /**
   * Get the current active document
   * @returns Current document element or null
   */
  getCurrentDocument(): HTMLElement | null;

  /**
   * Register settings tab in Obsidian
   */
  registerSettingsTab(): void;

  /**
   * Add ribbon icon for TOC toggle
   */
  addRibbonIcon(): void;

  /**
   * Register command palette commands
   */
  registerCommands(): void;
}

/**
 * Configuration options for business logic classes
 */
export interface TocManagerConfig {
  /** Heading levels to include (default: [1,2,3,4,5,6]) */
  includeLevels: number[];
  /** Minimum heading text length */
  minTextLength: number;
  /** Maximum nesting depth */
  maxDepth: number;
  /** Whether to auto-generate IDs for headings without them */
  autoGenerateIds: boolean;
  /** Intersection observer root margin */
  rootMargin: string;
  /** Intersection observer threshold */
  threshold: number | number[];
}

/**
 * Event types for TOC manager
 */
export interface TocManagerEvents {
  /** Fired when TOC structure changes */
  'toc-updated': (entries: TocEntry[]) => void;
  /** Fired when active section changes */
  'active-changed': (entryId: string | null) => void;
  /** Fired when navigation occurs */
  'navigation': (entryId: string) => void;
  /** Fired when an error occurs */
  'error': (error: Error) => void;
}
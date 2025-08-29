/**
 * Core interfaces for Floating Table of Contents functionality
 * These interfaces define the data structures used throughout the TOC system
 */

// TOC Data Structures

/**
 * Represents a single heading in the table of contents
 */
export interface TocHeading {
  /** Unique identifier for the heading */
  id: string;
  /** The text content of the heading */
  text: string;
  /** Heading level (1-6, corresponding to H1-H6) */
  level: number;
  /** Line number in the source file for scrolling/navigation */
  line: number;
}

/**
 * Represents a file with its table of contents data
 */
export interface TocFile {
  /** File path relative to vault root */
  path: string;
  /** Array of headings in this file */
  headings: TocHeading[];
}

/**
 * Complete TOC data for the current view state
 */
export interface TocData {
  /** The file being displayed */
  file: TocFile;
  /** All headings from the file (for easy access) */
  headings: TocHeading[];
  /** Currently active/visible heading ID */
  activeHeading?: string;
}

// Obsidian Integration Interfaces

/**
 * Obsidian file metadata as provided by metadataCache
 */
export interface ObsidianFile {
  /** File path relative to vault root */
  path: string;
}

/**
 * Raw heading data from Obsidian's metadata cache
 */
export interface ObsidianHeading {
  /** Heading text */
  heading: string;
  /** Heading level (1-6) */
  level: number;
  /** Position in the file */
  position: {
    /** Starting line number */
    start: number;
    /** Ending line number */
    end: number;
  };
}

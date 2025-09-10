/**
 * Core interfaces and services for the Floating Table of Contents plugin
 */

// TOC Data Structures
export type { TocHeading, TocFile } from './toc';

// Obsidian Integration Interfaces
export type { ObsidianFile, ObsidianHeading } from './toc';

// Mode and Interaction State
export type { 
  TocUIMode, 
  TocInteractionState,
  TocModeActions,
  TocModeSelectors,
  ITocModeStore
} from './mode';
export { 
  TocInteractionStateSchema,
  computeDisplayMode,
  validateTocInteractionState,
  createInitialInteractionState
} from './mode';

export { ObsidianDataSource, type IObsidianDataSource } from '../datasources/obsidianDataSource';

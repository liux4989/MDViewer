/**
 * Core interfaces and services for the Floating Table of Contents plugin
 */

// TOC Data Structures
export type { TocHeading, TocFile, TocData } from './toc';

// Obsidian Integration Interfaces
export type { ObsidianFile, ObsidianHeading } from './toc';

// UI State and Store Contract
export type { 
  TocUIState, 
  TocUIMode, 
  TocUIActions, 
  TocUISelectors, 
  ITocUIStore 
} from './uiState';
export { 
  TocUIModeSchema, 
  TocHeadingSchema, 
  TocUIStateSchema, 
  validateTocUIState, 
  createInitialTocUIState 
} from './uiState';

export { ObsidianDataSource, type IObsidianDataSource } from '../datasources/obsidianDataSource';
export { TocRepository, type ITocRepository, type TocDataServiceError, type Result } from '../repositories/tocRepository';

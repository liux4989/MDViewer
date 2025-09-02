/**
 * Core interfaces and services for the Floating Table of Contents plugin
 */

// TOC Data Structures
export type { TocHeading, TocFile, TocData } from './toc';

// Obsidian Integration Interfaces
export type { ObsidianFile, ObsidianHeading } from './toc';

// Data Source and Repository (Phase 1 Refactor)
export { ObsidianDataSource, type IObsidianDataSource } from '../datasources/obsidianDataSource';
export { TocRepository, type ITocRepository, type TocDataServiceError, type Result } from '../repositories/tocRepository';

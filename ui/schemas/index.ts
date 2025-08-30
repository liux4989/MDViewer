/**
 * Core interfaces and services for the Floating Table of Contents plugin
 */

// TOC Data Structures
export type { TocHeading, TocFile, TocData } from './toc';

// Obsidian Integration Interfaces
export type { ObsidianFile, ObsidianHeading } from './toc';

// Obsidian Data Service (Task 2.2)
export { ObsidianDataService } from '../services/obsidianDataService';

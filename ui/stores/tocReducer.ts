/**
 * TOC Reducer - Pure state management for TOC data
 * Handles all state transitions for the TOC store
 */

import type { TFile } from 'obsidian';
import type { TocHeading, ObsidianFile, ObsidianHeading } from '../schemas/toc';
import { TocDataProcessor } from '../services/tocDataProcessor';

/**
 * TOC State shape for data management
 */
export interface TocState {
  /** Path of the currently active file */
  activeFile: string | null;
  /** ID of the currently active heading */
  activeHeadingId: string | null;
  /** Array of headings for the current file */
  headings: TocHeading[];
}

/**
 * Action types for TOC reducer
 * Includes both granular actions (for internal use) and domain-level atomic actions
 */
export type TocAction =
  // Granular actions (for internal store operations)
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'SET_ACTIVE_HEADING'; payload: string | null }
  | { type: 'SET_HEADINGS'; payload: TocHeading[] }
  // Domain-level atomic actions (for business operations)
  | { type: 'LOAD_FILE_DATA'; payload: { file: TFile; obsidianFile: ObsidianFile; obsidianHeadings: ObsidianHeading[] } }
  | { type: 'REFRESH_HEADINGS'; payload: { file: TFile; obsidianFile: ObsidianFile; obsidianHeadings: ObsidianHeading[] } }
  | { type: 'NAVIGATE_TO_HEADING'; payload: { headingId: string } };

// Create a single shared data processor instance for the reducer
const dataProcessor = new TocDataProcessor();

/**
 * TOC Reducer - Pure function that handles TOC data state transitions
 * @param state - Current TOC state
 * @param action - Action to apply
 * @returns New TOC state (immutable)
 */
export function tocReducer(state: TocState, action: TocAction): TocState {
  switch (action.type) {
    // Granular actions (for internal store operations)
    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFile: action.payload,
        // Reset active heading when file changes
        activeHeadingId: null
      };

    case 'SET_ACTIVE_HEADING':
      return {
        ...state,
        activeHeadingId: action.payload
      };

    case 'SET_HEADINGS':
      return {
        ...state,
        headings: action.payload,
        // Reset active heading if it's no longer in the new headings
        activeHeadingId: state.activeHeadingId &&
          action.payload.some(h => h.id === state.activeHeadingId)
          ? state.activeHeadingId
          : null
      };

    // Domain-level atomic actions (for business operations)
    case 'LOAD_FILE_DATA': {
      const { file, obsidianFile, obsidianHeadings } = action.payload;
      const tocFile = dataProcessor.processFileData(file, obsidianFile, obsidianHeadings);

      if (!tocFile) {
        return state; // No change if processing failed
      }

      // Atomic update: all related state changes in one dispatch
      return {
        ...state,
        activeFile: file.path,
        headings: tocFile.headings,
        activeHeadingId: null // Reset active heading on file change
      };
    }

    case 'REFRESH_HEADINGS': {
      const { file, obsidianFile, obsidianHeadings } = action.payload;
      const tocFile = dataProcessor.processFileData(file, obsidianFile, obsidianHeadings);

      if (!tocFile) {
        return state; // No change if processing failed
      }

      // Atomic update: refresh headings while preserving active heading if still valid
      const newActiveHeadingId = state.activeHeadingId &&
        tocFile.headings.some(h => h.id === state.activeHeadingId)
        ? state.activeHeadingId
        : null;

      return {
        ...state,
        headings: tocFile.headings,
        activeHeadingId: newActiveHeadingId
      };
    }

    case 'NAVIGATE_TO_HEADING': {
      const { headingId } = action.payload;

      // Atomic update: set active heading for navigation
      return {
        ...state,
        activeHeadingId: headingId
      };
    }

    default:
      return state;
  }
}

/**
 * Create initial state for TOC
 * @returns Initial TOC state
 */
export function createInitialTocState(): TocState {
  return {
    activeFile: null,
    activeHeadingId: null,
    headings: []
  };
}

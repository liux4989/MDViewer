/**
 * TOC Reducer - Pure state management for TOC data
 * Handles all state transitions for the TOC store
 */

import type { TocHeading } from '../schemas/toc';

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
 */
export type TocAction =
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'SET_ACTIVE_HEADING'; payload: string | null }
  | { type: 'SET_HEADINGS'; payload: TocHeading[] };

/**
 * TOC Reducer - Pure function that handles TOC data state transitions
 * @param state - Current TOC state
 * @param action - Action to apply
 * @returns New TOC state (immutable)
 */
export function tocReducer(state: TocState, action: TocAction): TocState {
  switch (action.type) {
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

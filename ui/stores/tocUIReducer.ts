/**
 * TOC UI Reducer - Pure state management
 * Handles all state transitions for the TOC UI store
 */

import type { TocUIState, TocUIMode } from '../schemas/uiState';
import type { TocHeading } from '../schemas/toc';
import { createInitialTocUIState } from '../schemas/uiState';

/**
 * Action types for TOC UI reducer
 */
export type TocUIAction =
  | { type: 'TOGGLE_MODE' }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'SET_ACTIVE_HEADING'; payload: string | null }
  | { type: 'SET_HEADINGS'; payload: TocHeading[] }
  | { type: 'NAVIGATE_TO_HEADING'; payload: string };



/**
 * TOC UI Reducer - Pure function that handles state transitions
 * @param state - Current state
 * @param action - Action to apply
 * @returns New state (immutable)
 */
export function tocUIReducer(state: TocUIState, action: TocUIAction): TocUIState {
  switch (action.type) {
    case 'TOGGLE_MODE':
      return {
        ...state,
        mode: state.mode === 'compact' ? 'detail' : 'compact'
      };
    
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
    
    case 'NAVIGATE_TO_HEADING':
      // Simple navigation - just set the active heading
      // The store will handle calling navigator.goToLine()
      return {
        ...state,
        activeHeadingId: action.payload
      };
    

    
    default:
      return state;
  }
}

/**
 * Create initial state for TOC UI
 * @returns Initial TOC UI state
 */
export function createInitialState(): TocUIState {
  return createInitialTocUIState();
}

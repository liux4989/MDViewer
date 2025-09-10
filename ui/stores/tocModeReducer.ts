/**
 * TOC Mode Reducer - Pure state management for interaction state
 * Handles all state transitions for the TOC mode store
 */

import type { TocInteractionState } from '../schemas/mode';
import { createInitialInteractionState } from '../schemas/mode';

/**
 * Action types for TOC Mode reducer
 */
export type TocModeAction =
  | { type: 'SET_HOVERING'; payload: boolean }
  | { type: 'SET_SCROLLING'; payload: boolean }
  | { type: 'SET_NAVIGATING'; payload: boolean };

/**
 * TOC Mode Reducer - Pure function that handles interaction state transitions
 * @param state - Current interaction state
 * @param action - Action to apply
 * @returns New interaction state (immutable)
 */
export function tocModeReducer(state: TocInteractionState, action: TocModeAction): TocInteractionState {
  switch (action.type) {
    case 'SET_HOVERING':
      return {
        ...state,
        isHovering: action.payload
      };
    
    case 'SET_SCROLLING':
      return {
        ...state,
        isScrolling: action.payload
      };

    case 'SET_NAVIGATING':
      return {
        ...state,
        isNavigating: action.payload
      };
    
    default:
      return state;
  }
}

/**
 * Create initial state for TOC Mode
 * @returns Initial TOC Mode interaction state
 */
export function createInitialModeState(): TocInteractionState {
  return createInitialInteractionState();
}

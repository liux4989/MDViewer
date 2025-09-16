/**
 * TOC Mode Context - Following React's Reducer + Context Pattern
 * Consolidates context, reducer, provider, and hooks for TOC mode domain
 * Based on: https://react.dev/learn/scaling-up-with-reducer-and-context
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import type { TocInteractionState, ITocModeStore, TocUIMode } from '../schemas/mode';
import { computeDisplayMode, validateTocInteractionState, createInitialInteractionState } from '../schemas/mode';

// ===== TYPES =====

/**
 * Action types for TOC Mode reducer
 */
export type TocModeAction =
  | { type: 'SET_HOVERING'; payload: boolean }
  | { type: 'SET_SCROLLING'; payload: boolean }
  | { type: 'SET_NAVIGATING'; payload: boolean };

/**
 * Props for TocModeProvider
 */
export interface TocModeProviderProps {
  children: ReactNode;
}

// ===== CONTEXTS (Following React Pattern) =====

/**
 * Context for TOC Mode state (read-only)
 */
export const TocModeContext = createContext<TocInteractionState | null>(null);

/**
 * Context for TOC Mode dispatch function
 */
export const TocModeDispatchContext = createContext<React.Dispatch<TocModeAction> | null>(null);

// ===== REDUCER =====

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

// ===== PROVIDER =====

/**
 * TOC Mode Provider Component
 * Provides both state and dispatch contexts following React pattern
 */
export function TocModeProvider({ children }: TocModeProviderProps) {
  const [state, dispatch] = useReducer(tocModeReducer, createInitialModeState());
  
  // Validate state in development
  if (process.env.NODE_ENV === 'development') {
    if (!validateTocInteractionState(state)) {
      console.warn('TOC Mode State validation failed:', state);
    }
  }
  
  // Memoize dispatch to prevent unnecessary re-renders
  const memoizedDispatch = useMemo(() => dispatch, []);

  return (
    <TocModeContext.Provider value={state}>
      <TocModeDispatchContext.Provider value={memoizedDispatch}>
        {children}
      </TocModeDispatchContext.Provider>
    </TocModeContext.Provider>
  );
}

// ===== CUSTOM HOOKS (Following React Pattern) =====

/**
 * Hook to access TOC Mode state (read-only)
 * @returns Current TOC Mode interaction state
 */
export function useTocMode(): TocInteractionState {
  const context = useContext(TocModeContext);
  if (!context) {
    throw new Error('useTocMode must be used within a TocModeProvider');
  }
  return context;
}

/**
 * Hook to access TOC Mode dispatch function
 * @returns Dispatch function for TOC Mode actions
 */
export function useTocModeDispatch(): React.Dispatch<TocModeAction> {
  const context = useContext(TocModeDispatchContext);
  if (!context) {
    throw new Error('useTocModeDispatch must be used within a TocModeProvider');
  }
  return context;
}

// ===== BUSINESS LOGIC HOOKS =====

/**
 * Hook for TOC Mode actions
 * Provides high-level actions for interaction state
 */
export function useTocModeActions() {
  const dispatch = useTocModeDispatch();
  
  // Action creators (memoized for performance)
  const setHovering = useCallback((isHovering: boolean) => {
    dispatch({ type: 'SET_HOVERING', payload: isHovering });
  }, [dispatch]);

  const setScrolling = useCallback((isScrolling: boolean) => {
    dispatch({ type: 'SET_SCROLLING', payload: isScrolling });
  }, [dispatch]);

  const setNavigating = useCallback((isNavigating: boolean) => {
    dispatch({ type: 'SET_NAVIGATING', payload: isNavigating });
  }, [dispatch]);

  return useMemo(() => ({
    setHovering,
    setScrolling,
    setNavigating
  }), [setHovering, setScrolling, setNavigating]);
}

/**
 * Hook for TOC Mode selectors (computed values)
 */
export function useTocModeSelectors() {
  const state = useTocMode();
  
  // Selector functions (memoized for performance)
  const getDisplayMode = useCallback((): TocUIMode => {
    return computeDisplayMode(state);
  }, [state]);

  const isPreviewMode = useCallback((): boolean => {
    return getDisplayMode() === 'preview';
  }, [getDisplayMode]);
  
  const isDetailMode = useCallback((): boolean => {
    return getDisplayMode() === 'detail';
  }, [getDisplayMode]);

  return useMemo(() => ({
    getDisplayMode,
    isPreviewMode,
    isDetailMode
  }), [getDisplayMode, isPreviewMode, isDetailMode]);
}

// Legacy hooks have been removed - use the new React-aligned hooks directly:
// - useTocMode() for state
// - useTocModeActions() for actions  
// - useTocModeSelectors() for computed values

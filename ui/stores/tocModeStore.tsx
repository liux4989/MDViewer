/**
 * TOC Mode Store Provider - React Context + Reducer implementation
 * Implements ITocModeStore contract for interaction state and display mode
 */

import React, { createContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import type { ITocModeStore, TocUIMode } from '../schemas/mode';
import { computeDisplayMode } from '../schemas/mode';
import { validateTocInteractionState } from '../schemas/mode';
import { tocModeReducer, createInitialModeState, type TocModeAction } from './tocModeReducer';

/**
 * Create the TOC Mode Context
 */
export const TocModeContext = createContext<ITocModeStore | null>(null);

/**
 * TOC Mode Store Provider Component
 * Provides ITocModeStore implementation via React Context + Reducer
 * Handles interaction state and display mode computation
 */
export function TocModeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tocModeReducer, createInitialModeState());
  
  // Validate state in development
  if (process.env.NODE_ENV === 'development') {
    if (!validateTocInteractionState(state)) {
      console.warn('TOC Mode State validation failed:', state);
    }
  }
  
  // Action creators (memoized for performance)
  const setHovering = useCallback((isHovering: boolean) => {
    dispatch({ type: 'SET_HOVERING', payload: isHovering });
  }, []);

  const setScrolling = useCallback((isScrolling: boolean) => {
    dispatch({ type: 'SET_SCROLLING', payload: isScrolling });
  }, []);

  const setNavigating = useCallback((isNavigating: boolean) => {
    dispatch({ type: 'SET_NAVIGATING', payload: isNavigating });
  }, []);
  
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
  
  // Create the store value (memoized to prevent unnecessary re-renders)
  const storeValue = useMemo((): ITocModeStore => ({
    // State
    isHovering: state.isHovering,
    isScrolling: state.isScrolling,
    isNavigating: state.isNavigating,
    
    // Actions
    setHovering,
    setScrolling,
    setNavigating,
    
    // Selectors
    getDisplayMode,
    isPreviewMode,
    isDetailMode
  }), [
    state.isHovering,
    state.isScrolling,
    state.isNavigating,
    setHovering,
    setScrolling,
    setNavigating,
    getDisplayMode,
    isPreviewMode,
    isDetailMode
  ]);
  
  return (
    <TocModeContext.Provider value={storeValue}>
      {children}
    </TocModeContext.Provider>
  );
}

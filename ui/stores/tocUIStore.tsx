/**
 * TOC UI Store Provider - React Context + Reducer implementation
 * Implements ITocUIStore contract and provides context to facade hooks
 */

import React, { createContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import type { ITocUIStore, TocUIMode } from '../schemas/uiState';
import type { TocHeading } from '../schemas/toc';
import { validateTocUIState } from '../schemas/uiState';
import { tocUIReducer, createInitialState, type TocUIAction } from './tocUIReducer';
import { _setTocUIContext } from '../hooks/useTocState';
import type { IObsidianNavigator } from '../datasources/navigator';

/**
 * Props for TocUIProvider
 */
export interface TocUIProviderProps {
  children: ReactNode;
  /** Optional navigator for heading navigation */
  navigator?: IObsidianNavigator;
}

/**
 * Create the TOC UI Context
 */
const TocUIContext = createContext<ITocUIStore | null>(null);

/**
 * Set the context for facade hooks to use
 */
_setTocUIContext(TocUIContext);

/**
 * TOC UI Store Provider Component
 * Provides ITocUIStore implementation via React Context + Reducer
 */
export function TocUIProvider({ children, navigator }: TocUIProviderProps) {
  const [state, dispatch] = useReducer(tocUIReducer, createInitialState());
  
  // Validate state in development
  if (process.env.NODE_ENV === 'development') {
    if (!validateTocUIState(state)) {
      console.warn('TOC UI State validation failed:', state);
    }
  }
  
  // Action creators (memoized for performance)
  const toggleMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_MODE' });
  }, []);
  
  const setActiveFile = useCallback((filePath: string | null) => {
    dispatch({ type: 'SET_ACTIVE_FILE', payload: filePath });
  }, []);
  
  const setActiveHeading = useCallback((headingId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_HEADING', payload: headingId });
  }, []);
  
  const setHeadings = useCallback((headings: TocHeading[]) => {
    dispatch({ type: 'SET_HEADINGS', payload: headings });
  }, []);
  
  const navigate = useCallback((headingId: string) => {
    // Update state first
    dispatch({ type: 'NAVIGATE_TO_HEADING', payload: headingId });
    
    // Then navigate in Obsidian if navigator is available
    if (navigator) {
      const heading = state.headings.find(h => h.id === headingId);
      if (heading) {
        navigator.goToLine(heading.line);
      }
    }
  }, [navigator, state.headings]);
  

  
  // Selector functions (memoized for performance)
  const getActiveHeading = useCallback((): TocHeading | null => {
    if (!state.activeHeadingId) return null;
    return state.headings.find(h => h.id === state.activeHeadingId) || null;
  }, [state.activeHeadingId, state.headings]);
  
  const isCompactMode = useCallback((): boolean => {
    return state.mode === 'compact';
  }, [state.mode]);
  
  const isDetailMode = useCallback((): boolean => {
    return state.mode === 'detail';
  }, [state.mode]);
  
  const getHeadingsByLevel = useCallback((level: number): TocHeading[] => {
    return state.headings.filter(h => h.level === level);
  }, [state.headings]);
  
  // Create the store value (memoized to prevent unnecessary re-renders)
  const storeValue = useMemo((): ITocUIStore => ({
    // State
    mode: state.mode,
    activeFile: state.activeFile,
    activeHeadingId: state.activeHeadingId,
    headings: state.headings,
    
    // Actions
    toggleMode,
    setActiveFile,
    setActiveHeading,
    setHeadings,
    navigate,
    
    // Selectors
    getActiveHeading,
    isCompactMode,
    isDetailMode,
    getHeadingsByLevel
  }), [
    state.mode,
    state.activeFile,
    state.activeHeadingId,
    state.headings,
    toggleMode,
    setActiveFile,
    setActiveHeading,
    setHeadings,
    navigate,
    getActiveHeading,
    isCompactMode,
    isDetailMode,
    getHeadingsByLevel
  ]);
  
  return (
    <TocUIContext.Provider value={storeValue}>
      {children}
    </TocUIContext.Provider>
  );
}

// Export the context for testing purposes
export { TocUIContext };

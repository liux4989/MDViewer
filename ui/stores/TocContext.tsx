/**
 * TOC Context - Following React's Reducer + Context Pattern
 * Consolidates context, reducer, provider, and hooks for TOC domain
 * Based on: https://react.dev/learn/scaling-up-with-reducer-and-context
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import type { TFile } from 'obsidian';
import type { TocHeading, ObsidianFile, ObsidianHeading } from '../schemas/toc';
import type { IObsidianNavigator } from '../datasources/navigator';

// ===== TYPES =====

/**
 * TOC State - Core state for TOC functionality
 */
export interface TocState {
  /** Currently active file path */
  activeFile: string | null;
  /** Currently active heading ID */
  activeHeadingId: string | null;
  /** Array of TOC headings */
  headings: TocHeading[];
}

/**
 * TOC Action types for reducer
 */
export type TocAction =
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'SET_ACTIVE_HEADING'; payload: string | null }
  | { type: 'SET_HEADINGS'; payload: TocHeading[] }
  | { type: 'LOAD_FILE_DATA'; payload: { filePath: string; headings: TocHeading[] } }
  | { type: 'REFRESH_HEADINGS'; payload: { headings: TocHeading[] } }
  | { type: 'NAVIGATE_TO_HEADING'; payload: { headingId: string } };

/**
 * Props for TocProvider
 */
export interface TocProviderProps {
  children: ReactNode;
  /** Optional navigator for heading navigation */
  navigator?: IObsidianNavigator;
}

// ===== CONTEXTS =====

/**
 * Context for TOC state (read-only)
 */
export const TocContext = createContext<TocState | null>(null);

/**
 * Context for TOC dispatch function
 */
export const TocDispatchContext = createContext<React.Dispatch<TocAction> | null>(null);

/**
 * Context for TOC navigator (for side effects)
 */
export const TocNavigatorContext = createContext<IObsidianNavigator | null>(null);

// ===== REDUCER =====

/**
 * TOC Reducer - Pure function that handles state transitions
 * @param state - Current TOC state
 * @param action - Action to apply
 * @returns New TOC state (immutable)
 */
export function tocReducer(state: TocState, action: TocAction): TocState {
  switch (action.type) {
    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFile: action.payload
      };

    case 'SET_ACTIVE_HEADING':
      return {
        ...state,
        activeHeadingId: action.payload
      };

    case 'SET_HEADINGS':
      return {
        ...state,
        headings: action.payload
      };

    case 'LOAD_FILE_DATA':
      return {
        ...state,
        activeFile: action.payload.filePath,
        headings: action.payload.headings,
        activeHeadingId: null // Reset active heading when loading new file
      };

    case 'REFRESH_HEADINGS':
      return {
        ...state,
        headings: action.payload.headings
      };

    case 'NAVIGATE_TO_HEADING':
      return {
        ...state,
        activeHeadingId: action.payload.headingId
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

// ===== PROVIDER =====

/**
 * TOC Provider Component
 * Provides both state and dispatch contexts following React pattern
 */
export function TocProvider({ children, navigator }: TocProviderProps) {
  const [state, dispatch] = useReducer(tocReducer, createInitialTocState());

  // Memoize dispatch to prevent unnecessary re-renders
  const memoizedDispatch = useMemo(() => dispatch, []);

  return (
    <TocContext.Provider value={state}>
      <TocDispatchContext.Provider value={memoizedDispatch}>
        <TocNavigatorContext.Provider value={navigator || null}>
          {children}
        </TocNavigatorContext.Provider>
      </TocDispatchContext.Provider>
    </TocContext.Provider>
  );
}

// ===== CUSTOM HOOKS =====

/**
 * Hook to access TOC state (read-only)
 * @returns Current TOC state
 */
export function useToc(): TocState {
  const context = useContext(TocContext);
  if (!context) {
    throw new Error('useToc must be used within a TocProvider');
  }
  return context;
}

/**
 * Hook to access TOC dispatch function
 * @returns Dispatch function for TOC actions
 */
export function useTocDispatch(): React.Dispatch<TocAction> {
  const context = useContext(TocDispatchContext);
  if (!context) {
    throw new Error('useTocDispatch must be used within a TocProvider');
  }
  return context;
}

/**
 * Hook to access TOC navigator
 * @returns TOC navigator instance
 */
export function useTocNavigator(): IObsidianNavigator | null {
  const context = useContext(TocNavigatorContext);
  return context;
}

// ===== BUSINESS LOGIC HOOKS =====

/**
 * Hook for TOC actions
 * Provides high-level actions that combine state updates with side effects
 */
export function useTocActions() {
  const dispatch = useTocDispatch();

  // Action creators (memoized for performance)
  const setActiveFile = useCallback((filePath: string | null) => {
    dispatch({ type: 'SET_ACTIVE_FILE', payload: filePath });
  }, [dispatch]);
  
  const setActiveHeading = useCallback((headingId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_HEADING', payload: headingId });
  }, [dispatch]);
  
  const setHeadings = useCallback((headings: TocHeading[]) => {
    dispatch({ type: 'SET_HEADINGS', payload: headings });
  }, [dispatch]);

  // Business logic actions - now using atomic domain-level actions
  const loadFileData = useCallback((filePath: string, headings: TocHeading[]) => {
    // Single atomic dispatch - all state changes happen together
    dispatch({
      type: 'LOAD_FILE_DATA',
      payload: { filePath, headings }
    });
  }, [dispatch]);

  const refreshHeadings = useCallback((headings: TocHeading[]) => {
    // Single atomic dispatch - all state changes happen together
    dispatch({
      type: 'REFRESH_HEADINGS',
      payload: { headings }
    });
  }, [dispatch]);

  return useMemo(() => ({
    setActiveFile,
    setActiveHeading,
    setHeadings,
    loadFileData,
    refreshHeadings
  }), [setActiveFile, setActiveHeading, setHeadings, loadFileData, refreshHeadings]);
}

/**
 * Hook for TOC selectors (computed values)
 */
export function useTocSelectors() {
  const state = useToc();
  
  // Selector functions (memoized for performance)
  const getActiveHeading = useCallback((): TocHeading | null => {
    if (!state.activeHeadingId) return null;
    return state.headings.find(h => h.id === state.activeHeadingId) || null;
  }, [state.activeHeadingId, state.headings]);
  
  const getHeadingsByLevel = useCallback((level: number): TocHeading[] => {
    return state.headings.filter(h => h.level === level);
  }, [state.headings]);

  return useMemo(() => ({
    getActiveHeading,
    getHeadingsByLevel
  }), [getActiveHeading, getHeadingsByLevel]);
}

// Legacy hooks have been removed - use the new React-aligned hooks directly:
// - useToc() for state
// - useTocActions() for actions  
// - useTocSelectors() for computed values
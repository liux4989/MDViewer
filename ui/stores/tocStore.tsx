/**
 * TOC Store Provider - React Context + Reducer implementation
 * Implements ITocStore contract for TOC data management
 */

import React, { createContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import type { TocHeading } from '../schemas/toc';
import type { IObsidianNavigator } from '../datasources/navigator';
import { tocReducer, createInitialTocState, type TocState, type TocAction } from './tocReducer';

/**
 * TOC Actions that can be dispatched to modify TOC state
 */
export interface TocActions {
  /** Set the active file */
  setActiveFile(filePath: string | null): void;
  /** Set the active heading by ID */
  setActiveHeading(headingId: string | null): void;
  /** Update the headings array */
  setHeadings(headings: TocHeading[]): void;
  /** Navigate to a specific heading */
  navigate(headingId: string): void;
}

/**
 * TOC Selectors for computed values
 */
export interface TocSelectors {
  /** Get the current active heading object */
  getActiveHeading(): TocHeading | null;
  /** Get headings filtered by level */
  getHeadingsByLevel(level: number): TocHeading[];
}

/**
 * Complete TOC Store contract
 * Combines state, actions, and selectors
 */
export interface ITocStore extends TocState, TocActions, TocSelectors {}

/**
 * Props for TocProvider
 */
export interface TocProviderProps {
  children: ReactNode;
  /** Optional navigator for heading navigation */
  navigator?: IObsidianNavigator;
}

/**
 * Create the TOC Context
 */
export const TocContext = createContext<ITocStore | null>(null);

/**
 * TOC Store Provider Component
 * Provides ITocStore implementation via React Context + Reducer
 * Handles TOC data state and navigation
 */
export function TocProvider({ children, navigator }: TocProviderProps) {
  const [state, dispatch] = useReducer(tocReducer, createInitialTocState());
  
  // Action creators (memoized for performance)
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
    dispatch({ type: 'SET_ACTIVE_HEADING', payload: headingId });

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
  
  const getHeadingsByLevel = useCallback((level: number): TocHeading[] => {
    return state.headings.filter(h => h.level === level);
  }, [state.headings]);
  
  // Create the store value (memoized to prevent unnecessary re-renders)
  const storeValue = useMemo((): ITocStore => ({
    // State
    activeFile: state.activeFile,
    activeHeadingId: state.activeHeadingId,
    headings: state.headings,
    
    // Actions
    setActiveFile,
    setActiveHeading,
    setHeadings,
    navigate,
    
    // Selectors
    getActiveHeading,
    getHeadingsByLevel
  }), [
    state.activeFile,
    state.activeHeadingId,
    state.headings,
    setActiveFile,
    setActiveHeading,
    setHeadings,
    navigate,
    getActiveHeading,
    getHeadingsByLevel
  ]);
  
  return (
    <TocContext.Provider value={storeValue}>
      {children}
    </TocContext.Provider>
  );
}

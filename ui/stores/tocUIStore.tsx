/**
 * TOC UI Store Provider - React Context + Reducer implementation
 * Implements ITocUIStore contract and provides context to facade hooks
 */

import React, { createContext, useReducer, useMemo, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { ITocUIStore, TocUIMode } from '../schemas/uiState';
import type { TocHeading } from '../schemas/toc';
import { validateTocUIState } from '../schemas/uiState';
import { tocUIReducer, createInitialState, type TocUIAction } from './tocUIReducer';
import { _setTocUIContext } from '../hooks/useTocState';
import type { IObsidianNavigator } from '../datasources/navigator';
import type { App } from 'obsidian';
import { ObsidianDataSource } from '../datasources/obsidianDataSource';
import { ObsidianEvents } from '../datasources/obsidianEvents';
import { TocRepository } from '../repositories/tocRepository';
import { TocSyncEffects } from '../services/tocSyncEffects';

/**
 * Props for TocUIProvider
 */
export interface TocUIProviderProps {
  children: ReactNode;
  /** Obsidian app instance for data loading and effects */
  app: App;
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
 * Handles initial data loading and side effects management
 */
export function TocUIProvider({ children, app, navigator }: TocUIProviderProps) {
  const [state, dispatch] = useReducer(tocUIReducer, createInitialState());
  const syncEffectsRef = useRef<TocSyncEffects | null>(null);
  const disposerRef = useRef<(() => void) | null>(null);
  
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

  // Initialize data sources and effects once
  const { dataSource, repository, events } = useMemo(() => {
    const dataSource = new ObsidianDataSource(app);
    const repository = new TocRepository(dataSource);
    const events = new ObsidianEvents(app);
    return { dataSource, repository, events };
  }, [app]);

  // Create stable store adapter for effects
  const storeAdapter = useMemo(() => {
    const adapter = {
      getState: () => ({
        mode: state.mode,
        activeFile: state.activeFile,
        activeHeadingId: state.activeHeadingId,
        headings: state.headings
      }),
      setMode: (mode: 'compact' | 'detail') => {
        if (mode === 'compact' && state.mode !== 'compact') {
          dispatch({ type: 'TOGGLE_MODE' });
        } else if (mode === 'detail' && state.mode !== 'detail') {
          dispatch({ type: 'TOGGLE_MODE' });
        }
      },
      setActiveFile: (filePath: string | null) => {
        dispatch({ type: 'SET_ACTIVE_FILE', payload: filePath });
      },
      setHeadings: (headings: TocHeading[]) => {
        dispatch({ type: 'SET_HEADINGS', payload: headings });
      },
      setActiveHeading: (headingId: string | null) => {
        dispatch({ type: 'SET_ACTIVE_HEADING', payload: headingId });
      }
    };
    return adapter;
  }, [state.mode, state.activeFile, state.activeHeadingId, state.headings]);

  // Initialize sync effects and load initial data
  useEffect(() => {
    // Initialize sync effects
    syncEffectsRef.current = new TocSyncEffects(events, repository, storeAdapter);
    disposerRef.current = syncEffectsRef.current.init();

    // Load initial data for current file
    const loadInitialData = async () => {
      const activeFile = dataSource.getActiveFile();
      if (activeFile) {
        const result = await repository.getCurrentFileHeadings();
        if (result.ok) {
          dispatch({ type: 'SET_HEADINGS', payload: result.data.headings });
          dispatch({ type: 'SET_ACTIVE_FILE', payload: activeFile.path });
        }
      }
    };

    loadInitialData();

    // Cleanup on unmount
    return () => {
      if (disposerRef.current) {
        disposerRef.current();
        disposerRef.current = null;
      }
      syncEffectsRef.current = null;
    };
  }, [dataSource, repository, events, storeAdapter]);
  
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

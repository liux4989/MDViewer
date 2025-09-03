/**
 * TOC Mode Hook
 * Provides access to display mode state and mode switching operations
 */

import { useMemo } from 'react';
import { useTocState } from './useTocState';
import type { TocUIMode } from '../schemas/uiState';

/**
 * Hook to access TOC display mode state and operations
 * @returns Object containing mode state and mode operations
 */
export function useTocMode() {
  const store = useTocState();
  
  return useMemo(() => ({
    /** Current display mode */
    mode: store.mode,
    /** Whether currently in compact mode */
    isCompactMode: store.isCompactMode(),
    /** Whether currently in detail mode */
    isDetailMode: store.isDetailMode(),
    /** Toggle between compact and detail modes */
    toggleMode: store.toggleMode,
    /** Set mode to compact */
    setCompactMode: () => {
      if (store.mode !== 'compact') {
        store.toggleMode();
      }
    },
    /** Set mode to detail */
    setDetailMode: () => {
      if (store.mode !== 'detail') {
        store.toggleMode();
      }
    },
    /** Set specific mode */
    setMode: (mode: TocUIMode) => {
      if (store.mode !== mode) {
        store.toggleMode();
      }
    }
  }), [
    store.mode,
    store.isCompactMode,
    store.isDetailMode,
    store.toggleMode
  ]);
}

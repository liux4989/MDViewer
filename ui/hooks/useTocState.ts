/**
 * Core TOC State Hook
 * Provides access to the complete TOC UI store
 */

import { useContext } from 'react';
import type { ITocUIStore } from '../schemas/uiState';

// Context will be defined in the store implementation
// This is a placeholder that will be replaced by the actual context
let TocUIContext: React.Context<ITocUIStore | null> = null as any;

/**
 * Hook to access the complete TOC UI store
 * @returns The complete TOC UI store with state, actions, and selectors
 * @throws Error if used outside of TocUIProvider
 */
export function useTocState(): ITocUIStore {
  const store = useContext(TocUIContext);
  
  if (!store) {
    throw new Error('useTocState must be used within a TocUIProvider');
  }
  
  return store;
}

/**
 * Set the TOC UI Context (used by the store implementation)
 * @param context - The React context for TOC UI store
 */
export function _setTocUIContext(context: React.Context<ITocUIStore | null>) {
  TocUIContext = context;
}

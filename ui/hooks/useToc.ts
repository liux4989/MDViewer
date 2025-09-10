/**
 * Hook to access TOC store
 * Provides access to TOC data and actions
 */

import { useContext } from 'react';
import { TocContext } from '../stores/tocStore';
import type { ITocStore } from '../stores/tocStore';

/**
 * Hook to access TOC store
 * @returns TOC store instance
 * @throws Error if used outside of TocProvider
 */
export function useToc(): ITocStore {
  const context = useContext(TocContext);
  
  if (!context) {
    throw new Error('useToc must be used within a TocProvider');
  }
  
  return context;
}

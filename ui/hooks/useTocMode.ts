/**
 * Hook to access TOC Mode store
 * Provides access to interaction state and display mode
 */

import { useContext } from 'react';
import { TocModeContext } from '../stores/tocModeStore';
import type { ITocModeStore } from '../schemas/mode';

/**
 * Hook to access TOC Mode store
 * @returns TOC Mode store instance
 * @throws Error if used outside of TocModeProvider
 */
export function useTocMode(): ITocModeStore {
    const context = useContext(TocModeContext);
  
    if (!context) {
        throw new Error('useTocMode must be used within a TocModeProvider');
    }

    return context;
}

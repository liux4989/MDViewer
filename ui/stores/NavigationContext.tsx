/**
 * Navigation Context - Handles navigation side effects
 * Separates navigation logic from pure state management
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import type { IObsidianNavigator } from '../datasources/navigator';
import { useToc } from './TocContext';

// ===== TYPES =====

export interface NavigationContextValue {
  navigate: (headingId: string) => void;
}

export interface NavigationProviderProps {
  children: ReactNode;
  navigator?: IObsidianNavigator;
}

// ===== CONTEXT =====

export const NavigationContext = createContext<NavigationContextValue | null>(null);

// ===== PROVIDER =====

export function NavigationProvider({ children, navigator }: NavigationProviderProps) {
  const toc = useToc();

  const navigate = useCallback((headingId: string) => {
    // Find the heading in current state
    const heading = toc.headings.find(h => h.id === headingId);
    
    if (heading && navigator) {
      // Perform the side effect - navigate in Obsidian
      navigator.goToLine(heading.line);
    }
  }, [toc.headings, navigator]);

  const value = useCallback(() => ({
    navigate
  }), [navigate]);

  return (
    <NavigationContext.Provider value={value()}>
      {children}
    </NavigationContext.Provider>
  );
}

// ===== HOOKS =====

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

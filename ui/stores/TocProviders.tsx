/**
 * Combined TOC Providers
 * Provides both Mode and TOC stores to the component tree
 * Following React's recommended pattern for multiple contexts
 */

import React, { ReactNode } from 'react';
import { TocProvider } from './TocContext';
import { TocModeProvider } from './TocModeContext';
import { NavigationProvider } from './NavigationContext';
import type { IObsidianNavigator } from '../datasources/navigator';

/**
 * Props for TocProviders
 */
export interface TocProvidersProps {
  children: ReactNode;
  /** Optional navigator for heading navigation */
  navigator?: IObsidianNavigator;
}

/**
 * Combined TOC Providers Component
 * Wraps children with TOC Mode, TOC store, and Navigation providers
 * Navigation provider is innermost as it depends on TOC state
 */
export function TocProviders({ children, navigator }: TocProvidersProps) {
  return (
    <TocModeProvider>
      <TocProvider navigator={navigator}>
        <NavigationProvider navigator={navigator}>
          {children}
        </NavigationProvider>
      </TocProvider>
    </TocModeProvider>
  );
}

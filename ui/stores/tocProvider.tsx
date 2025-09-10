/**
 * Combined TOC Providers
 * Provides both Mode and TOC stores to the component tree
 */

import React, { ReactNode } from 'react';
import { TocProvider } from './tocStore';
import { TocModeProvider } from './tocModeStore';
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
 * Wraps children with both Mode and TOC store providers
 * Mode provider is outer to ensure it's available to TOC provider if needed
 */
export function TocProviders({ children, navigator }: TocProvidersProps) {
  return (
    <TocModeProvider>
      <TocProvider navigator={navigator}>
        {children}
      </TocProvider>
    </TocModeProvider>
  );
}

/**
 * TOC Providers with Effects Integration
 * Handles Obsidian events and coordinates with TOC stores
 * Simplified architecture without complex adapters
 */

import React, { ReactNode } from 'react';
import type { App } from 'obsidian';
import { TocProviders } from './TocProviders';
import type { IObsidianNavigator } from '../datasources/navigator';
import { useObsidianDataSources, useFileEvents, useScrollEvents, useInitialData } from '../hooks';
export interface TocProvidersWithEffectsProps {
  children: ReactNode;
  app: App;
  navigator?: IObsidianNavigator;
}



function TocEffectsIntegration({ app }: { app: App }) {
  // Initialize data sources
  const { dataSource, events } = useObsidianDataSources(app);

  // Set up file event handling
  useFileEvents(dataSource, events);

  // Set up scroll event handling (combines useEffect and useCallback)
  useScrollEvents(events);

  // Load initial data on mount
  useInitialData(dataSource);

  return null; // This component only handles effects, doesn't render anything
}

/**
 * TOC Providers with Effects Integration
 * Combines both store providers with service coordination
 */
export function TocProvidersWithEffects({ children, app, navigator }: TocProvidersWithEffectsProps) {
  return (
    <TocProviders navigator={navigator}>
      <TocEffectsIntegration app={app} />
      {children}
    </TocProviders>
  );
}
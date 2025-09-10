/**
 * TOC Providers with Effects Integration
 * Combines both stores with sync effects for complete TOC functionality
 */

import React, { ReactNode, useMemo, useEffect, useRef } from 'react';
import type { App } from 'obsidian';
import { TocProviders } from './tocProvider';
import { TocProvider } from './tocStore';
import { TocModeProvider } from './tocModeStore';
import { TocSyncEffects, type ITocStoreAdapter, type ITocModeStoreAdapter } from '../services/tocSyncEffects';
import { ObsidianDataSource } from '../datasources/obsidianDataSource';
import { ObsidianEvents } from '../datasources/obsidianEvents';
import { TocRepository } from '../repositories/tocRepository';
import type { IObsidianNavigator } from '../datasources/navigator';
import { useToc } from '../hooks/useToc';
import { useTocMode } from '../hooks/useTocMode';

/**
 * Props for TocProvidersWithEffects
 */
export interface TocProvidersWithEffectsProps {
  children: ReactNode;
  /** Obsidian app instance for data loading and effects */
  app: App;
  /** Optional navigator for heading navigation */
  navigator?: IObsidianNavigator;
}

/**
 * Internal component that handles effects integration
 * Must be inside both store providers to access their contexts
 */
function TocEffectsIntegration({ app }: { app: App }) {
  const toc = useToc();
  const mode = useTocMode();
  const syncEffectsRef = useRef<TocSyncEffects | null>(null);
  const disposerRef = useRef<(() => void) | null>(null);

  // Create stable store adapters for effects
  const tocStoreAdapter = useMemo((): ITocStoreAdapter => ({
    getState: () => ({
      activeFile: toc.activeFile,
      activeHeadingId: toc.activeHeadingId,
      headings: toc.headings
    }),
    setActiveFile: toc.setActiveFile,
    setHeadings: toc.setHeadings,
    setActiveHeading: toc.setActiveHeading
  }), [toc.activeFile, toc.activeHeadingId, toc.headings, toc.setActiveFile, toc.setHeadings, toc.setActiveHeading]);

  const modeStoreAdapter = useMemo((): ITocModeStoreAdapter => ({
    setScrolling: mode.setScrolling
  }), [mode.setScrolling]);

  // Initialize data sources and effects once
  const { dataSource, repository, events } = useMemo(() => {
    const dataSource = new ObsidianDataSource(app);
    const repository = new TocRepository(dataSource);
    const events = new ObsidianEvents(app);
    return { dataSource, repository, events };
  }, [app]);

  // Initialize sync effects and load initial data
  useEffect(() => {
    // Initialize sync effects
    syncEffectsRef.current = new TocSyncEffects(events, repository, tocStoreAdapter, modeStoreAdapter);
    disposerRef.current = syncEffectsRef.current.init();

    // Load initial data for current file
    const loadInitialData = async () => {
      const activeFile = dataSource.getActiveFile();
      if (activeFile) {
        const result = await repository.getCurrentFileHeadings();
        if (result.ok) {
          toc.setHeadings(result.data.headings);
          toc.setActiveFile(activeFile.path);
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
  }, [dataSource, repository, events, tocStoreAdapter, modeStoreAdapter, toc]);

  return null; // This component only handles effects, doesn't render anything
}

/**
 * TOC Providers with Effects Integration
 * Provides both stores and initializes sync effects
 */
export function TocProvidersWithEffects({ children, app, navigator }: TocProvidersWithEffectsProps) {
  return (
    <TocProviders navigator={navigator}>
      <TocEffectsIntegration app={app} />
      {children}
    </TocProviders>
  );
}

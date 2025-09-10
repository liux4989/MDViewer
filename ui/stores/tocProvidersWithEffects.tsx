/**
 * TOC Providers with Effects Integration
 * Combines both stores with sync effects for complete TOC functionality
 */

import React, { ReactNode, useMemo, useEffect, useRef } from 'react';
import type { App } from 'obsidian';
import { TocProviders } from './tocProvider';
import { TocProvider } from './tocStore';
import { TocModeProvider } from './tocModeStore';
import { TocServiceCoordinator } from '../services/tocServiceCoordinator';
import type { ITocStoreAdapter } from '../services/tocFileService';
import type { ITocModeStoreAdapter } from '../services/tocScrollService';
import { ObsidianDataSource } from '../datasources/obsidianDataSource';
import { ObsidianEvents } from '../datasources/obsidianEvents';
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
  const serviceCoordinatorRef = useRef<TocServiceCoordinator | null>(null);
  const disposerRef = useRef<(() => void) | null>(null);

  // Create stable store adapters for effects
  // Note: Don't include state values in dependencies to avoid infinite re-renders
  const tocStoreAdapter = useMemo((): ITocStoreAdapter => ({
    getState: () => ({
      activeFile: toc.activeFile,
      activeHeadingId: toc.activeHeadingId,
      headings: toc.headings
    }),
    setActiveFile: toc.setActiveFile,
    setHeadings: toc.setHeadings,
    setActiveHeading: toc.setActiveHeading
  }), [toc.setActiveFile, toc.setHeadings, toc.setActiveHeading]);

  const modeStoreAdapter = useMemo((): ITocModeStoreAdapter => ({
    setScrolling: mode.setScrolling
  }), [mode.setScrolling]);

  // Initialize data sources and service coordinator once
  const { dataSource, events, serviceCoordinator } = useMemo(() => {
    const dataSource = new ObsidianDataSource(app);
    const events = new ObsidianEvents(app);
    const serviceCoordinator = new TocServiceCoordinator(
      events,
      dataSource,
      tocStoreAdapter,
      modeStoreAdapter
    );
    return { dataSource, events, serviceCoordinator };
  }, [app, tocStoreAdapter, modeStoreAdapter]);

  // Initialize service coordinator once
  useEffect(() => {
    // Initialize service coordinator
    serviceCoordinatorRef.current = serviceCoordinator;
    disposerRef.current = serviceCoordinator.init();

    // Cleanup on unmount
    return () => {
      if (disposerRef.current) {
        disposerRef.current();
        disposerRef.current = null;
      }
      serviceCoordinatorRef.current = null;
    };
  }, [serviceCoordinator]);

  // Load initial data once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (serviceCoordinatorRef.current) {
        await serviceCoordinatorRef.current.loadInitialData();
      }
    };

    loadInitialData();
  }, []);

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

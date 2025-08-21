/**
 * Business Logic Module Exports
 * Provides all business logic classes for the Floating TOC Plugin
 */

export { HeadingExtractor } from './HeadingExtractor';
export { NavigationHandler } from './NavigationHandler';
export { ScrollTracker } from './ScrollTracker';
export { TocManager } from './TocManager';
export { SettingsManager } from './SettingsManager';
export { FloatingTocSettingsTab } from './SettingsTab';

// Re-export interfaces for convenience
export type {
  IHeadingExtractor,
  INavigationHandler,
  IScrollTracker,
  ITocManager,
  ISettingsManager,
  IObsidianIntegration,
  TocManagerConfig,
  TocManagerEvents
} from '../types/business-logic';
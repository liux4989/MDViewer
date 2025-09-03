/**
 * UI State Schema for Floating Table of Contents
 * Defines the shape of UI state and validation schemas
 */

import { z } from 'zod';
import type { TocHeading } from './toc';

/**
 * UI Mode for TOC display
 */
export type TocUIMode = 'compact' | 'detail';

/**
 * Core UI state shape for the TOC component
 */
export interface TocUIState {
  /** Display mode for the TOC */
  mode: TocUIMode;
  /** Path of the currently active file */
  activeFile: string | null;
  /** ID of the currently active heading */
  activeHeadingId: string | null;
  /** Array of headings for the current file */
  headings: TocHeading[];
}

/**
 * UI Actions that can be dispatched to modify state
 */
export interface TocUIActions {
  /** Toggle between compact and detail modes */
  toggleMode(): void;
  /** Set the active file */
  setActiveFile(filePath: string | null): void;
  /** Set the active heading by ID */
  setActiveHeading(headingId: string | null): void;
  /** Update the headings array */
  setHeadings(headings: TocHeading[]): void;
  /** Navigate to a specific heading */
  navigate(headingId: string): void;

}

/**
 * UI Selectors for computed values
 */
export interface TocUISelectors {
  /** Get the current active heading object */
  getActiveHeading(): TocHeading | null;
  /** Check if we're in compact mode */
  isCompactMode(): boolean;
  /** Check if we're in detail mode */
  isDetailMode(): boolean;
  /** Get headings filtered by level */
  getHeadingsByLevel(level: number): TocHeading[];
}

/**
 * Complete TOC UI Store contract
 * Combines state, actions, and selectors
 */
export interface ITocUIStore extends TocUIState, TocUIActions, TocUISelectors {}

// Zod Schemas for validation

/**
 * Schema for TOC UI Mode
 */
export const TocUIModeSchema = z.enum(['compact', 'detail']);

/**
 * Schema for TocHeading (imported from toc schema)
 */
export const TocHeadingSchema = z.object({
  id: z.string(),
  text: z.string(),
  level: z.number().min(1).max(6),
  line: z.number().min(0)
});

/**
 * Schema for TOC UI State
 */
export const TocUIStateSchema = z.object({
  mode: TocUIModeSchema,
  activeFile: z.string().nullable(),
  activeHeadingId: z.string().nullable(),
  headings: z.array(TocHeadingSchema)
});

/**
 * Validate TOC UI state shape
 * @param state - The state object to validate
 * @returns boolean indicating if the state is valid
 */
export function validateTocUIState(state: unknown): state is TocUIState {
  try {
    TocUIStateSchema.parse(state);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create initial TOC UI state
 * @returns Initial state object
 */
export function createInitialTocUIState(): TocUIState {
  return {
    mode: 'compact',
    activeFile: null,
    activeHeadingId: null,
    headings: []
  };
}

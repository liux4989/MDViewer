/**
 * UI State Schema for Floating Table of Contents
 * Defines the shape of UI state and validation schemas
 */

import { z } from 'zod';
import type { TocHeading } from './toc';

/**
 * UI Mode for TOC display
 */
export type TocUIMode = 'preview' | 'detail';

/**
 * Interaction state that influences computed mode
 */
export interface TocInteractionState {
  /** Whether the user is hovering over the TOC */
  isHovering: boolean;
  /** Whether the editor is currently scrolling */
  isScrolling: boolean;
  /** Whether a programmatic navipgation is in progress */
  isNavigating: boolean;
}

/**
 * Core UI state shape for the TOC component
 */
export interface TocUIState {
  /** Path of the currently active file */
  activeFile: string | null;
  /** ID of the currently active heading */
  activeHeadingId: string | null;
  /** Array of headings for the current file */
  headings: TocHeading[];
  /** Interaction state for computing display mode */
  interaction: TocInteractionState;
}

/**
 * Computed mode based on interaction state
 * @param interaction - Current interaction state
 * @returns The computed display mode
 */
export function computeDisplayMode(interaction: TocInteractionState): TocUIMode {
  // When hovering, show detail mode
  if (interaction.isHovering) {
    return 'detail';
  }

  // During navigation, keep current mode stable
  if (interaction.isNavigating) {
    return 'preview';
  }

  // During scrolling, use preview mode for performance
  if (interaction.isScrolling) {
    return 'preview';
  }


  // Default to preview mode
  return 'preview';
}

/**
 * UI Actions that can be dispatched to modify state
 */
export interface TocUIActions {
  /** Set the active file */
  setActiveFile(filePath: string | null): void;
  /** Set the active heading by ID */
  setActiveHeading(headingId: string | null): void;
  /** Update the headings array */
  setHeadings(headings: TocHeading[]): void;
  /** Navigate to a specific heading */
  navigate(headingId: string): void;
  /** Set hovering state */
  setHovering(isHovering: boolean): void;
  /** Set scrolling state */
  setScrolling(isScrolling: boolean): void;
  /** Set navigation state */
  setNavigating(isNavigating: boolean): void;
}

/**
 * UI Selectors for computed values
 */
export interface TocUISelectors {
  /** Get the current active heading object */
  getActiveHeading(): TocHeading | null;
  /** Get the computed display mode */
  getDisplayMode(): TocUIMode;
  /** Check if we're in preview mode */
  isPreviewMode(): boolean;
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
export const TocUIModeSchema = z.enum(['preview', 'detail']);

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
 * Schema for interaction state
 */
export const TocInteractionStateSchema = z.object({
  isHovering: z.boolean(),
  isScrolling: z.boolean(),
  isNavigating: z.boolean()
});

/**
 * Schema for TOC UI State
 */
export const TocUIStateSchema = z.object({
  activeFile: z.string().nullable(),
  activeHeadingId: z.string().nullable(),
  headings: z.array(TocHeadingSchema),
  interaction: TocInteractionStateSchema
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
 * Create initial interaction state
 * @returns Initial interaction state
 */
export function createInitialInteractionState(): TocInteractionState {
  return {
    isHovering: false,
    isScrolling: false,
    isNavigating: false
  };
}

/**
 * Create initial TOC UI state
 * @returns Initial state object
 */
export function createInitialTocUIState(): TocUIState {
  return {
    activeFile: null,
    activeHeadingId: null,
    headings: [],
    interaction: createInitialInteractionState()
  };
}

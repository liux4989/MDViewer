/**
 * Mode Schema for TOC Display Logic
 * Handles interaction state and display mode computation
 */

import { z } from 'zod';

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
  /** Whether a programmatic navigation is in progress */
  isNavigating: boolean;
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
 * Mode Actions that can be dispatched to modify interaction state
 */
export interface TocModeActions {
  /** Set hovering state */
  setHovering(isHovering: boolean): void;
  /** Set scrolling state */
  setScrolling(isScrolling: boolean): void;
  /** Set navigation state */
  setNavigating(isNavigating: boolean): void;
}

/**
 * Mode Selectors for computed values
 */
export interface TocModeSelectors {
  /** Get the computed display mode */
  getDisplayMode(): TocUIMode;
  /** Check if we're in preview mode */
  isPreviewMode(): boolean;
  /** Check if we're in detail mode */
  isDetailMode(): boolean;
}

/**
 * Complete TOC Mode Store contract
 * Combines interaction state, actions, and selectors
 */
export interface ITocModeStore extends TocInteractionState, TocModeActions, TocModeSelectors {}

// Zod Schemas for validation

/**
 * Schema for TOC UI Mode
 */
export const TocUIModeSchema = z.enum(['preview', 'detail']);

/**
 * Schema for interaction state
 */
export const TocInteractionStateSchema = z.object({
  isHovering: z.boolean(),
  isScrolling: z.boolean(),
  isNavigating: z.boolean()
});

/**
 * Validate TOC interaction state shape
 * @param state - The state object to validate
 * @returns boolean indicating if the state is valid
 */
export function validateTocInteractionState(state: unknown): state is TocInteractionState {
  try {
    TocInteractionStateSchema.parse(state);
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

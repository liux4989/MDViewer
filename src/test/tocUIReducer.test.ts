/**
 * Unit tests for TOC UI Reducer
 * Tests pure reducer functions and navigation logic
 */

import { describe, it, expect } from 'vitest';
import { tocUIReducer, createInitialState, type TocUIAction } from '../../ui/stores/tocUIReducer';
import type { TocHeading } from '../../ui/schemas/toc';
import type { TocUIState } from '../../ui/schemas/uiState';

// Test data
const mockHeadings: TocHeading[] = [
  { id: 'h1', text: 'Introduction', level: 1, line: 1 },
  { id: 'h2', text: 'Getting Started', level: 2, line: 10 },
  { id: 'h3', text: 'Installation', level: 3, line: 15 },
  { id: 'h4', text: 'Configuration', level: 2, line: 25 },
  { id: 'h5', text: 'Advanced Topics', level: 1, line: 40 },
  { id: 'h6', text: 'Performance', level: 2, line: 45 }
];

describe('tocUIReducer', () => {
  describe('initial state', () => {
    it('should create valid initial state', () => {
      const state = createInitialState();
      
      expect(state).toEqual({
        mode: 'compact',
        activeFile: null,
        activeHeadingId: null,
        headings: []
      });
    });
  });
  
  describe('TOGGLE_MODE', () => {
    it('should toggle from compact to detail', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: null,
        activeHeadingId: null,
        headings: []
      };
      
      const action: TocUIAction = { type: 'TOGGLE_MODE' };
      const newState = tocUIReducer(state, action);
      
      expect(newState.mode).toBe('detail');
      expect(newState).not.toBe(state); // Immutability check
    });
    
    it('should toggle from detail to compact', () => {
      const state: TocUIState = {
        mode: 'detail',
        activeFile: null,
        activeHeadingId: null,
        headings: []
      };
      
      const action: TocUIAction = { type: 'TOGGLE_MODE' };
      const newState = tocUIReducer(state, action);
      
      expect(newState.mode).toBe('compact');
    });
  });
  
  describe('SET_ACTIVE_FILE', () => {
    it('should set active file and reset active heading', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: 'old-file.md',
        activeHeadingId: 'some-heading',
        headings: mockHeadings
      };
      
      const action: TocUIAction = { 
        type: 'SET_ACTIVE_FILE', 
        payload: 'new-file.md' 
      };
      const newState = tocUIReducer(state, action);
      
      expect(newState.activeFile).toBe('new-file.md');
      expect(newState.activeHeadingId).toBeNull();
      expect(newState.headings).toBe(mockHeadings); // Unchanged
    });
    
    it('should handle null file path', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: 'some-file.md',
        activeHeadingId: 'heading-1',
        headings: []
      };
      
      const action: TocUIAction = { 
        type: 'SET_ACTIVE_FILE', 
        payload: null 
      };
      const newState = tocUIReducer(state, action);
      
      expect(newState.activeFile).toBeNull();
      expect(newState.activeHeadingId).toBeNull();
    });
  });
  
  describe('SET_ACTIVE_HEADING', () => {
    it('should set active heading', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: 'file.md',
        activeHeadingId: null,
        headings: mockHeadings
      };
      
      const action: TocUIAction = { 
        type: 'SET_ACTIVE_HEADING', 
        payload: 'h2' 
      };
      const newState = tocUIReducer(state, action);
      
      expect(newState.activeHeadingId).toBe('h2');
      expect(newState.headings).toBe(mockHeadings); // Unchanged
    });
    
    it('should handle null heading', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: 'file.md',
        activeHeadingId: 'h1',
        headings: mockHeadings
      };
      
      const action: TocUIAction = { 
        type: 'SET_ACTIVE_HEADING', 
        payload: null 
      };
      const newState = tocUIReducer(state, action);
      
      expect(newState.activeHeadingId).toBeNull();
    });
  });
  
  describe('SET_HEADINGS', () => {
    it('should set new headings and preserve valid active heading', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: 'file.md',
        activeHeadingId: 'h2',
        headings: []
      };
      
      const action: TocUIAction = { 
        type: 'SET_HEADINGS', 
        payload: mockHeadings 
      };
      const newState = tocUIReducer(state, action);
      
      expect(newState.headings).toBe(mockHeadings);
      expect(newState.activeHeadingId).toBe('h2'); // Preserved because h2 exists
    });
    
    it('should reset active heading if not in new headings', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: 'file.md',
        activeHeadingId: 'non-existent',
        headings: []
      };
      
      const action: TocUIAction = { 
        type: 'SET_HEADINGS', 
        payload: mockHeadings 
      };
      const newState = tocUIReducer(state, action);
      
      expect(newState.headings).toBe(mockHeadings);
      expect(newState.activeHeadingId).toBeNull(); // Reset because 'non-existent' not found
    });
  });
  
  describe('NAVIGATE_TO_HEADING', () => {
    it('should set active heading for navigation', () => {
      const state: TocUIState = {
        mode: 'compact',
        activeFile: 'file.md',
        activeHeadingId: 'h1',
        headings: mockHeadings
      };
      
      const action: TocUIAction = { 
        type: 'NAVIGATE_TO_HEADING', 
        payload: 'h3' 
      };
      const newState = tocUIReducer(state, action);
      
      expect(newState.activeHeadingId).toBe('h3');
    });
  });
  
  // NAVIGATE_DIRECTION tests removed - logic moved to store level
  
  describe('immutability', () => {
    it('should not mutate original state', () => {
      const originalState: TocUIState = {
        mode: 'compact',
        activeFile: 'file.md',
        activeHeadingId: 'h1',
        headings: mockHeadings
      };
      
      const action: TocUIAction = { type: 'TOGGLE_MODE' };
      const newState = tocUIReducer(originalState, action);
      
      // Original state should be unchanged
      expect(originalState.mode).toBe('compact');
      expect(newState.mode).toBe('detail');
      expect(newState).not.toBe(originalState);
    });
  });
});
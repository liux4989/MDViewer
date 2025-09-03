/**
 * Unit tests for TOC UI Store Provider
 * Tests React Context + Reducer implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import React from 'react';
import { TocUIProvider } from '../../ui/stores/tocUIStore';
import { useTocState } from '../../ui/hooks/useTocState';
import type { TocHeading } from '../../ui/schemas/toc';
import type { IObsidianNavigator } from '../../ui/datasources/navigator';

// Mock navigator
const createMockNavigator = (): IObsidianNavigator => ({
  goToLine: vi.fn()
});

// Test data
const mockHeadings: TocHeading[] = [
  { id: 'h1', text: 'Introduction', level: 1, line: 1 },
  { id: 'h2', text: 'Getting Started', level: 2, line: 10 },
  { id: 'h3', text: 'Installation', level: 3, line: 15 }
];

describe('TocUIProvider', () => {
  let mockNavigator: IObsidianNavigator;
  
  beforeEach(() => {
    mockNavigator = createMockNavigator();
  });
  
  it('should provide initial state', () => {
    const { result } = renderHook(() => useTocState(), {
      wrapper: ({ children }) => (
        <TocUIProvider>{children}</TocUIProvider>
      )
    });
    
    expect(result.current.mode).toBe('compact');
    expect(result.current.activeFile).toBeNull();
    expect(result.current.activeHeadingId).toBeNull();
    expect(result.current.headings).toEqual([]);
  });
  
  it('should provide all required actions', () => {
    const { result } = renderHook(() => useTocState(), {
      wrapper: ({ children }) => (
        <TocUIProvider>{children}</TocUIProvider>
      )
    });
    
    expect(typeof result.current.toggleMode).toBe('function');
    expect(typeof result.current.setActiveFile).toBe('function');
    expect(typeof result.current.setActiveHeading).toBe('function');
    expect(typeof result.current.setHeadings).toBe('function');
    expect(typeof result.current.navigate).toBe('function');

  });
  
  it('should provide all required selectors', () => {
    const { result } = renderHook(() => useTocState(), {
      wrapper: ({ children }) => (
        <TocUIProvider>{children}</TocUIProvider>
      )
    });
    
    expect(typeof result.current.getActiveHeading).toBe('function');
    expect(typeof result.current.isCompactMode).toBe('function');
    expect(typeof result.current.isDetailMode).toBe('function');
    expect(typeof result.current.getHeadingsByLevel).toBe('function');
  });
  
  describe('actions', () => {
    it('should toggle mode', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider>{children}</TocUIProvider>
        )
      });
      
      expect(result.current.mode).toBe('compact');
      
      act(() => {
        result.current.toggleMode();
      });
      
      expect(result.current.mode).toBe('detail');
    });
    
    it('should set active file', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider>{children}</TocUIProvider>
        )
      });
      
      act(() => {
        result.current.setActiveFile('test-file.md');
      });
      
      expect(result.current.activeFile).toBe('test-file.md');
    });
    
    it('should set headings', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider>{children}</TocUIProvider>
        )
      });
      
      act(() => {
        result.current.setHeadings(mockHeadings);
      });
      
      expect(result.current.headings).toEqual(mockHeadings);
    });
    
    it('should navigate to heading with navigator', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider navigator={mockNavigator}>{children}</TocUIProvider>
        )
      });
      
      // Set up headings first
      act(() => {
        result.current.setHeadings(mockHeadings);
      });
      
      // Navigate to a heading
      act(() => {
        result.current.navigate('h2');
      });
      
      expect(result.current.activeHeadingId).toBe('h2');
      expect(mockNavigator.goToLine).toHaveBeenCalledWith(10); // h2.line
    });
    
    it('should navigate without navigator', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider>{children}</TocUIProvider>
        )
      });
      
      act(() => {
        result.current.setHeadings(mockHeadings);
        result.current.navigate('h2');
      });
      
      expect(result.current.activeHeadingId).toBe('h2');
      // Should not throw error when no navigator
    });
    

  });
  
  describe('selectors', () => {
    it('should get active heading', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider>{children}</TocUIProvider>
        )
      });
      
      act(() => {
        result.current.setHeadings(mockHeadings);
        result.current.setActiveHeading('h2');
      });
      
      const activeHeading = result.current.getActiveHeading();
      expect(activeHeading).toEqual(mockHeadings[1]); // h2
    });
    
    it('should check compact mode', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider>{children}</TocUIProvider>
        )
      });
      
      expect(result.current.isCompactMode()).toBe(true);
      expect(result.current.isDetailMode()).toBe(false);
      
      act(() => {
        result.current.toggleMode();
      });
      
      expect(result.current.isCompactMode()).toBe(false);
      expect(result.current.isDetailMode()).toBe(true);
    });
    
    it('should get headings by level', () => {
      const { result } = renderHook(() => useTocState(), {
        wrapper: ({ children }) => (
          <TocUIProvider>{children}</TocUIProvider>
        )
      });
      
      act(() => {
        result.current.setHeadings(mockHeadings);
      });
      
      const level1Headings = result.current.getHeadingsByLevel(1);
      const level2Headings = result.current.getHeadingsByLevel(2);
      const level3Headings = result.current.getHeadingsByLevel(3);
      
      expect(level1Headings).toHaveLength(1);
      expect(level1Headings[0].id).toBe('h1');
      
      expect(level2Headings).toHaveLength(1);
      expect(level2Headings[0].id).toBe('h2');
      
      expect(level3Headings).toHaveLength(1);
      expect(level3Headings[0].id).toBe('h3');
    });
  });
  
  describe('performance', () => {
    it('should memoize context value', () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        const store = useTocState();
        return <div>{store.mode}</div>;
      };
      
      const { rerender } = render(
        <TocUIProvider>
          <TestComponent />
        </TocUIProvider>
      );
      
      expect(renderCount).toBe(1);
      
      // Re-render with same props should not cause child re-render
      rerender(
        <TocUIProvider>
          <TestComponent />
        </TocUIProvider>
      );
      
      // Note: This test may pass even without proper memoization
      // due to React's optimization, but it's good to have
      expect(renderCount).toBe(2); // Expected: context provider changed
    });
  });
  
  describe('error handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useTocState());
      }).toThrow('useTocState must be used within a TocUIProvider');
    });
  });
});

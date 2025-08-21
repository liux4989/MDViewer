/**
 * ScrollTracker - Uses Intersection Observer API for active section detection
 * Implements the IScrollTracker interface for scroll position monitoring
 */

import { TocEntry } from '../types';
import { IScrollTracker } from '../types/business-logic';

export class ScrollTracker implements IScrollTracker {
  private observer: IntersectionObserver | null = null;
  private entries: TocEntry[] = [];
  private activeCallback: ((activeId: string | null) => void) | null = null;
  private currentActiveId: string | null = null;
  private observerOptions: IntersectionObserverInit = {
    root: null, // Use viewport as root
    rootMargin: '-10% 0px -80% 0px', // Trigger when element is in top 20% of viewport
    threshold: [0, 0.1, 0.5, 1.0] // Multiple thresholds for better detection
  };

  /**
   * Start tracking scroll position for given entries
   * @param entries - TOC entries to track
   * @param callback - Function to call when active section changes
   */
  startTracking(entries: TocEntry[], callback: (activeId: string | null) => void): void {
    this.stopTracking(); // Clean up any existing tracking
    
    this.entries = entries;
    this.activeCallback = callback;
    
    if (entries.length === 0) {
      return;
    }

    this.createObserver();
    this.observeEntries(entries);
  }

  /**
   * Stop tracking and cleanup observers
   */
  stopTracking(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.entries = [];
    this.activeCallback = null;
    this.currentActiveId = null;
  }

  /**
   * Get the currently active section ID
   * @returns ID of the currently active section or null
   */
  getCurrentSection(): string | null {
    return this.currentActiveId;
  }

  /**
   * Update tracking for new set of entries
   * @param entries - New TOC entries to track
   */
  updateEntries(entries: TocEntry[]): void {
    if (this.activeCallback) {
      this.startTracking(entries, this.activeCallback);
    }
  }

  /**
   * Configure intersection observer options
   * @param options - IntersectionObserver configuration
   */
  configure(options: IntersectionObserverInit): void {
    this.observerOptions = { ...this.observerOptions, ...options };
    
    // If we're currently tracking, restart with new options
    if (this.observer && this.activeCallback) {
      const callback = this.activeCallback;
      const entries = this.entries;
      this.startTracking(entries, callback);
    }
  }

  /**
   * Create the intersection observer
   */
  private createObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.observerOptions
    );
  }

  /**
   * Start observing all entries recursively
   * @param entries - TOC entries to observe
   */
  private observeEntries(entries: TocEntry[]): void {
    if (!this.observer) return;

    for (const entry of entries) {
      if (entry.element && document.contains(entry.element)) {
        this.observer.observe(entry.element);
      }
      
      // Recursively observe children
      if (entry.children.length > 0) {
        this.observeEntries(entry.children);
      }
    }
  }

  /**
   * Handle intersection observer callback
   * @param entries - Array of intersection observer entries
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    if (!this.activeCallback) return;

    // Filter for intersecting entries
    const intersectingEntries = entries.filter(entry => entry.isIntersecting);
    
    if (intersectingEntries.length === 0) {
      // No sections are intersecting, keep current active section
      return;
    }

    // Find the most relevant intersecting entry
    const activeEntry = this.findMostRelevantEntry(intersectingEntries);
    
    if (activeEntry) {
      const newActiveId = activeEntry.target.id;
      
      if (newActiveId !== this.currentActiveId) {
        this.currentActiveId = newActiveId;
        this.activeCallback(newActiveId);
      }
    }
  }

  /**
   * Find the most relevant entry from intersecting entries
   * @param intersectingEntries - Array of intersecting entries
   * @returns The most relevant entry
   */
  private findMostRelevantEntry(intersectingEntries: IntersectionObserverEntry[]): IntersectionObserverEntry | null {
    if (intersectingEntries.length === 0) {
      return null;
    }

    if (intersectingEntries.length === 1) {
      return intersectingEntries[0];
    }

    // Sort by intersection ratio (how much of the element is visible)
    // and by position (topmost element wins in case of ties)
    return intersectingEntries.sort((a, b) => {
      // First, prefer entries with higher intersection ratio
      const ratioA = a.intersectionRatio;
      const ratioB = b.intersectionRatio;
      
      if (Math.abs(ratioA - ratioB) > 0.1) {
        return ratioB - ratioA; // Higher ratio first
      }
      
      // If intersection ratios are similar, prefer the topmost element
      const rectA = a.boundingClientRect;
      const rectB = b.boundingClientRect;
      
      return rectA.top - rectB.top; // Topmost first
    })[0];
  }

  /**
   * Get all TOC entries flattened (including children)
   * @param entries - TOC entries to flatten
   * @returns Flattened array of entries
   */
  private flattenEntries(entries: TocEntry[]): TocEntry[] {
    const flattened: TocEntry[] = [];
    
    for (const entry of entries) {
      flattened.push(entry);
      if (entry.children.length > 0) {
        flattened.push(...this.flattenEntries(entry.children));
      }
    }
    
    return flattened;
  }

  /**
   * Find TOC entry by element ID
   * @param id - Element ID to find
   * @param entries - TOC entries to search
   * @returns Found entry or null
   */
  private findEntryById(id: string, entries: TocEntry[] = this.entries): TocEntry | null {
    for (const entry of entries) {
      if (entry.id === id) {
        return entry;
      }
      
      if (entry.children.length > 0) {
        const found = this.findEntryById(id, entry.children);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }

  /**
   * Check if intersection observer is supported
   * @returns True if IntersectionObserver is supported
   */
  static isSupported(): boolean {
    return 'IntersectionObserver' in window;
  }

  /**
   * Get fallback active section using scroll position
   * This is used when IntersectionObserver is not supported
   * @returns ID of the active section or null
   */
  getFallbackActiveSection(): string | null {
    if (this.entries.length === 0) {
      return null;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const threshold = viewportHeight * 0.3; // 30% from top

    const flatEntries = this.flattenEntries(this.entries);
    
    // Find the last heading that is above the threshold
    let activeEntry: TocEntry | null = null;
    
    for (const entry of flatEntries) {
      if (!entry.element || !document.contains(entry.element)) {
        continue;
      }
      
      const rect = entry.element.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      
      if (elementTop <= scrollTop + threshold) {
        activeEntry = entry;
      } else {
        break;
      }
    }
    
    return activeEntry ? activeEntry.id : null;
  }
}
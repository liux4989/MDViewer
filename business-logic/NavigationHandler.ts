/**
 * NavigationHandler - Manages smooth scrolling to target sections
 * Implements the INavigationHandler interface for section navigation
 */

import { INavigationHandler } from '../types/business-logic';

export class NavigationHandler implements INavigationHandler {
  private scrollConfig: {
    behavior: ScrollBehavior;
    block: ScrollLogicalPosition;
    inline: ScrollLogicalPosition;
    offset: number;
  } = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    offset: 0
  };

  /**
   * Navigate to a specific section
   * @param entryId - ID of the target section
   * @param smoothScroll - Whether to use smooth scrolling animation
   * @returns Promise that resolves when navigation is complete or rejects on error
   */
  navigateToSection(entryId: string, smoothScroll: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      // Enhanced validation with detailed error messages
      const validationResult = this.validateTargetDetailed(entryId);
      if (!validationResult.isValid) {
        const error = new Error(`Navigation failed: ${validationResult.reason}`);
        console.warn(`NavigationHandler: ${error.message}`);
        reject(error);
        return;
      }

      const targetElement = document.getElementById(entryId);
      if (!targetElement) {
        const error = new Error(`Target element with ID "${entryId}" not found`);
        reject(error);
        return;
      }

      try {
        // Use the configured scroll behavior, but override if smoothScroll is explicitly false
        const behavior = smoothScroll ? this.scrollConfig.behavior : 'auto';
        
        // Calculate scroll position with offset
        const scrollPosition = this.getScrollPosition(entryId);
        if (scrollPosition !== null) {
          const finalPosition = Math.max(0, scrollPosition - this.scrollConfig.offset);
          
          // Use scrollTo for more control over the scroll behavior
          window.scrollTo({
            top: finalPosition,
            behavior: behavior
          });
          
          // Wait for scroll to complete if smooth scrolling
          if (behavior === 'smooth') {
            this.waitForScrollComplete(finalPosition).then(() => {
              this.focusTarget(targetElement);
              resolve();
            }).catch(reject);
          } else {
            this.focusTarget(targetElement);
            resolve();
          }
        } else {
          // Fallback to scrollIntoView
          targetElement.scrollIntoView({
            behavior: behavior,
            block: this.scrollConfig.block,
            inline: this.scrollConfig.inline
          });
          
          // Focus the target element for accessibility
          this.focusTarget(targetElement);
          
          if (behavior === 'smooth') {
            // Wait a bit for smooth scroll to complete
            setTimeout(() => resolve(), 500);
          } else {
            resolve();
          }
        }
        
      } catch (error) {
        console.error('NavigationHandler: Error during navigation:', error);
        // Fallback to basic scroll
        this.fallbackNavigation(entryId).then(resolve).catch(reject);
      }
    });
  }

  /**
   * Validate that a target element exists
   * @param entryId - ID of the target section
   * @returns True if target exists and is navigable
   */
  validateTarget(entryId: string): boolean {
    return this.validateTargetDetailed(entryId).isValid;
  }

  /**
   * Validate target with detailed error information
   * @param entryId - ID of the target section
   * @returns Validation result with detailed reason
   */
  validateTargetDetailed(entryId: string): { isValid: boolean; reason: string } {
    if (!entryId) {
      return { isValid: false, reason: 'Entry ID is empty or null' };
    }

    if (typeof entryId !== 'string') {
      return { isValid: false, reason: `Entry ID must be a string, got ${typeof entryId}` };
    }

    if (entryId.trim().length === 0) {
      return { isValid: false, reason: 'Entry ID is empty after trimming whitespace' };
    }

    const element = document.getElementById(entryId);
    if (!element) {
      return { isValid: false, reason: `No element found with ID "${entryId}"` };
    }

    // Check if element is in the document
    if (!document.contains(element)) {
      return { isValid: false, reason: `Element with ID "${entryId}" is not in the document` };
    }

    // Check if element is visible and not hidden
    const style = window.getComputedStyle(element);
    if (style.display === 'none') {
      return { isValid: false, reason: `Element with ID "${entryId}" has display: none` };
    }

    if (style.visibility === 'hidden') {
      return { isValid: false, reason: `Element with ID "${entryId}" has visibility: hidden` };
    }

    // Check if element has zero dimensions (might be hidden)
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return { isValid: false, reason: `Element with ID "${entryId}" has zero dimensions` };
    }

    return { isValid: true, reason: 'Target is valid and navigable' };
  }

  /**
   * Get the scroll position for a given entry
   * @param entryId - ID of the target section
   * @returns Scroll position in pixels or null if not found
   */
  getScrollPosition(entryId: string): number | null {
    const element = document.getElementById(entryId);
    if (!element) {
      return null;
    }

    try {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return rect.top + scrollTop;
    } catch (error) {
      console.error('NavigationHandler: Error calculating scroll position:', error);
      return null;
    }
  }

  /**
   * Configure scroll behavior
   * @param options - Scroll configuration options
   */
  configure(options: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    offset?: number;
  }): void {
    this.scrollConfig = {
      ...this.scrollConfig,
      ...options
    };
  }

  /**
   * Focus the target element for accessibility
   * @param element - Element to focus
   */
  private focusTarget(element: HTMLElement): void {
    try {
      // Only focus if the element can receive focus
      if (this.canReceiveFocus(element)) {
        element.focus({ preventScroll: true });
      } else {
        // Make the element focusable temporarily
        const originalTabIndex = element.getAttribute('tabindex');
        element.setAttribute('tabindex', '-1');
        element.focus({ preventScroll: true });
        
        // Restore original tabindex after a short delay
        setTimeout(() => {
          if (originalTabIndex !== null) {
            element.setAttribute('tabindex', originalTabIndex);
          } else {
            element.removeAttribute('tabindex');
          }
        }, 100);
      }
    } catch (error) {
      // Focus failed, but that's okay - navigation still worked
      console.debug('NavigationHandler: Could not focus target element:', error);
    }
  }

  /**
   * Check if an element can receive focus
   * @param element - Element to check
   * @returns True if element can be focused
   */
  private canReceiveFocus(element: HTMLElement): boolean {
    const focusableElements = [
      'a[href]',
      'button',
      'input',
      'textarea',
      'select',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return focusableElements.some(selector => element.matches(selector));
  }

  /**
   * Wait for smooth scroll to complete
   * @param targetPosition - Target scroll position
   * @returns Promise that resolves when scroll is complete
   */
  private waitForScrollComplete(targetPosition: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      const tolerance = 5; // 5px tolerance
      
      const checkScroll = () => {
        const currentPosition = this.getCurrentScrollPosition();
        const distance = Math.abs(currentPosition - targetPosition);
        
        if (distance <= tolerance || attempts >= maxAttempts) {
          resolve();
          return;
        }
        
        attempts++;
        setTimeout(checkScroll, 100);
      };
      
      // Start checking after a small delay
      setTimeout(checkScroll, 100);
    });
  }

  /**
   * Fallback navigation method for when smooth scrolling fails
   * @param entryId - ID of the target section
   * @returns Promise that resolves when fallback navigation is complete
   */
  private fallbackNavigation(entryId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const element = document.getElementById(entryId);
        if (element) {
          // Simple scroll to element
          element.scrollIntoView({ behavior: 'auto' });
          
          // Focus the element
          this.focusTarget(element);
          
          // Resolve immediately for instant scroll
          resolve();
        } else {
          reject(new Error(`Fallback navigation failed: element with ID "${entryId}" not found`));
        }
      } catch (error) {
        console.error('NavigationHandler: Fallback navigation also failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Get the current scroll position
   * @returns Current scroll position in pixels
   */
  getCurrentScrollPosition(): number {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  /**
   * Check if smooth scrolling is supported
   * @returns True if smooth scrolling is supported
   */
  isSmoothScrollSupported(): boolean {
    try {
      return 'scrollBehavior' in document.documentElement.style;
    } catch {
      return false;
    }
  }
}
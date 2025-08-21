/**
 * HeadingExtractor - Scans documents for H1-H6 elements and builds hierarchy
 * Implements the IHeadingExtractor interface for document structure analysis
 */

import { TocEntry } from '../types';
import { IHeadingExtractor } from '../types/business-logic';

export class HeadingExtractor implements IHeadingExtractor {
  private idCounter = 0;
  private usedIds = new Set<string>();

  /**
   * Extract headings from a container element
   * @param container - The HTML element to scan for headings
   * @returns Array of TocEntry objects representing the document structure
   */
  extractHeadings(container: HTMLElement): TocEntry[] {
    console.log('HeadingExtractor: Starting extraction from container:', container.tagName, container.className);
    
    // Reset counters for each extraction
    this.idCounter = 0;
    this.usedIds.clear();

    // Find all heading elements (H1-H6)
    const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headings = Array.from(headingElements) as HTMLElement[];

    console.log(`HeadingExtractor: Found ${headings.length} heading elements`);

    if (headings.length === 0) {
      console.log('HeadingExtractor: No headings found, returning empty array');
      return [];
    }

    // Log the first few headings for debugging
    headings.slice(0, 5).forEach((heading, index) => {
      console.log(`HeadingExtractor: Heading ${index + 1}: ${heading.tagName} - "${heading.textContent?.trim()}" (id: ${heading.id || 'none'})`);
    });

    // Build hierarchy from flat list
    const hierarchicalEntries = this.buildHierarchy(headings);
    console.log(`HeadingExtractor: Built hierarchy with ${hierarchicalEntries.length} top-level entries`);
    
    // Generate unique IDs for headings without them
    this.generateUniqueIds(hierarchicalEntries);
    console.log('HeadingExtractor: Generated unique IDs');
    
    // Validate and fix structure issues
    const validatedEntries = this.validateStructure(hierarchicalEntries);
    console.log(`HeadingExtractor: Validation complete, returning ${validatedEntries.length} entries`);
    
    return validatedEntries;
  }

  /**
   * Build hierarchical structure from flat heading list
   * @param headings - Array of heading elements
   * @returns Nested TocEntry structure
   */
  buildHierarchy(headings: HTMLElement[]): TocEntry[] {
    const entries: TocEntry[] = [];
    const stack: TocEntry[] = [];

    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1)); // Extract number from H1, H2, etc.
      const text = this.extractHeadingText(heading);
      const id = heading.id || this.generateTempId(text);

      const entry: TocEntry = {
        id,
        text,
        level,
        element: heading,
        children: []
      };

      // Find the correct parent in the stack
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // This is a top-level entry
        entries.push(entry);
      } else {
        // This is a child of the last item in the stack
        stack[stack.length - 1].children.push(entry);
      }

      stack.push(entry);
    }

    return entries;
  }

  /**
   * Generate unique IDs for headings that don't have them
   * @param entries - Array of TocEntry objects to process
   */
  generateUniqueIds(entries: TocEntry[]): void {
    for (const entry of entries) {
      if (!entry.element?.id || entry.id.startsWith('temp-')) {
        const baseId = this.slugify(entry.text);
        entry.id = this.ensureUniqueId(baseId);
        if (entry.element) {
          entry.element.id = entry.id;
        }
      } else {
        this.usedIds.add(entry.id);
      }

      // Recursively process children
      if (entry.children.length > 0) {
        this.generateUniqueIds(entry.children);
      }
    }
  }

  /**
   * Validate heading structure and fix common issues
   * @param entries - Array of TocEntry objects to validate
   * @returns Validated and corrected TocEntry array
   */
  validateStructure(entries: TocEntry[]): TocEntry[] {
    return entries.filter(entry => {
      // Filter out entries with empty text
      if (!entry.text.trim()) {
        return false;
      }

      // Recursively validate children
      entry.children = this.validateStructure(entry.children);
      
      return true;
    });
  }

  /**
   * Extract clean text content from heading element
   * @param heading - The heading element
   * @returns Clean text content
   */
  private extractHeadingText(heading: HTMLElement): string {
    // Clone the element to avoid modifying the original
    const clone = heading.cloneNode(true) as HTMLElement;
    
    // Remove any unwanted elements (like links, buttons, etc.)
    const unwantedElements = clone.querySelectorAll('a, button, .heading-collapse-indicator');
    unwantedElements.forEach(el => el.remove());
    
    return clone.textContent?.trim() || '';
  }

  /**
   * Generate a temporary ID for headings without IDs
   * @param text - The heading text
   * @returns Temporary ID
   */
  private generateTempId(text: string): string {
    return `temp-${this.idCounter++}-${this.slugify(text).substring(0, 20)}`;
  }

  /**
   * Convert text to URL-friendly slug
   * @param text - Text to slugify
   * @returns URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Ensure ID is unique by appending numbers if necessary
   * @param baseId - Base ID to make unique
   * @returns Unique ID
   */
  private ensureUniqueId(baseId: string): string {
    let id = baseId;
    let counter = 1;

    while (this.usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }

    this.usedIds.add(id);
    return id;
  }
}
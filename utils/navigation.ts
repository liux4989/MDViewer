/**
 * Navigation utilities for TOC functionality
 */

/**
 * Smoothly scrolls to a target element by ID
 */
export function scrollToElement(id: string, smooth: boolean = true): boolean {
  const targetElement = document.getElementById(id);
  
  if (!targetElement) {
    console.warn(`Element with ID "${id}" not found`);
    return false;
  }

  targetElement.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'start'
  });

  return true;
}

/**
 * Generates a unique ID for a heading element
 */
export function generateHeadingId(text: string, level: number): string {
  // Remove special characters and convert to lowercase
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  return `${cleanText}-h${level}`;
}

/**
 * Calculates indentation level for TOC items
 */
export function calculateIndentLevel(level: number): number {
  return Math.max(0, level - 1);
}

/**
 * Gets indentation style for TOC items
 */
export function getIndentStyle(level: number, indentSize: number = 16): React.CSSProperties {
  const indentLevel = calculateIndentLevel(level);
  return {
    paddingLeft: `${indentLevel * indentSize}px`
  };
}
/**
 * TOC Data Transformers - Pure utility functions for text sanitization
 * No business logic dependencies - only pure transformation functions
 */

/**
 * Sanitizes heading text by removing markdown formatting and trimming whitespace
 * @param text - Raw heading text that may contain markdown formatting
 * @returns Sanitized heading text
 */
export function sanitizeHeadingText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // Remove markdown heading markers (#)
    .replace(/^#+\s*/, '')
    // Remove bold markers (**text** or __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic markers (*text* or _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove any remaining standalone emphasis markers
    .replace(/(\*\*|\*|__|_)/g, '')
    // Remove inline code markers (`)
    .replace(/`+/g, '')
    // Remove links but keep text [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove reference-style links [text][ref] -> text
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    // Trim whitespace
    .trim();
}


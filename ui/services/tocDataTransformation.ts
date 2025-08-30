/**
 * Data Transformation Utilities for TOC System - Task 2.3
 * Provides functions to convert between Obsidian data formats and TOC data formats
 */

import type { ObsidianHeading, ObsidianFile, TocHeading, TocFile } from '../schemas/toc';

/**
 * Sanitizes heading text by removing markdown formatting and trimming whitespace
 * @param text - Raw heading text that may contain markdown formatting
 * @returns Sanitized heading text
 */
function sanitizeHeadingText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // Remove markdown heading markers (#)
    .replace(/^#+\s*/, '')
    // Remove emphasis markers (*, **, _, __)
    .replace(/(\*\*|__|\*|_)/g, '')
    // Remove inline code markers (`)
    .replace(/`+/g, '')
    // Remove links but keep text [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove reference-style links [text][ref] -> text
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    // Trim whitespace
    .trim();
}

/**
 * Validates heading level to ensure it's within acceptable range (1-3)
 * @param level - Heading level from Obsidian
 * @returns Validated level or null if invalid
 */
function validateHeadingLevel(level: number): number | null {
  if (!Number.isInteger(level) || level < 1 || level > 3) {
    return null;
  }
  return level;
}

/**
 * Converts an ObsidianHeading to a TocHeading
 * @param obsidianHeading - Raw heading data from Obsidian metadata cache
 * @returns TocHeading object or null if conversion fails
 */
export function obsidianToTocHeading(obsidianHeading: ObsidianHeading): TocHeading | null {
  if (!obsidianHeading || typeof obsidianHeading !== 'object') {
    return null;
  }

  // Validate required fields
  if (!obsidianHeading.heading || typeof obsidianHeading.heading !== 'string') {
    return null;
  }

  if (!obsidianHeading.position || typeof obsidianHeading.position !== 'object') {
    return null;
  }

  // Validate and sanitize level
  const validLevel = validateHeadingLevel(obsidianHeading.level);
  if (validLevel === null) {
    return null; // Skip headings that are not levels 1-3
  }

  // Sanitize heading text
  const sanitizedText = sanitizeHeadingText(obsidianHeading.heading);
  if (!sanitizedText) {
    return null; // Skip headings with empty text after sanitization
  }

  // Generate unique ID based on text and position
  const id = `${obsidianHeading.position.start}-${obsidianHeading.position.end}-${sanitizedText.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id,
    text: sanitizedText,
    level: validLevel,
    line: obsidianHeading.position.start
  };
}

/**
 * Converts an ObsidianFile and its headings to a TocFile
 * @param obsidianFile - File metadata from Obsidian
 * @param obsidianHeadings - Array of heading data from the file
 * @returns TocFile object or null if conversion fails
 */
export function obsidianToTocFile(obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null {
  if (!obsidianFile || !obsidianFile.path || typeof obsidianFile.path !== 'string') {
    return null;
  }

  if (!Array.isArray(obsidianHeadings)) {
    return null;
  }

  // Convert headings, filtering out invalid ones
  const tocHeadings: TocHeading[] = obsidianHeadings
    .map(obsidianToTocHeading)
    .filter((heading): heading is TocHeading => heading !== null)
    // Sort by line number to ensure proper order
    .sort((a, b) => a.line - b.line);

  return {
    path: obsidianFile.path,
    headings: tocHeadings
  };
}

/**
 * Validates that a TocHeading has all required fields with correct types
 * @param heading - TocHeading to validate
 * @returns True if valid, false otherwise
 */
export function validateTocHeading(heading: TocHeading): boolean {
  if (!heading || typeof heading !== 'object') {
    return false;
  }

  return (
    typeof heading.id === 'string' &&
    heading.id.length > 0 &&
    typeof heading.text === 'string' &&
    heading.text.length > 0 &&
    typeof heading.level === 'number' &&
    heading.level >= 1 &&
    heading.level <= 3 &&
    typeof heading.line === 'number' &&
    heading.line >= 0
  );
}

/**
 * Validates that a TocFile has all required fields with correct types
 * @param file - TocFile to validate
 * @returns True if valid, false otherwise
 */
export function validateTocFile(file: TocFile): boolean {
  if (!file || typeof file !== 'object') {
    return false;
  }

  if (!file.path || typeof file.path !== 'string') {
    return false;
  }

  if (!Array.isArray(file.headings)) {
    return false;
  }

  // Validate all headings
  return file.headings.every(validateTocHeading);
}

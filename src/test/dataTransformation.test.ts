/**
 * Data Transformation Tests - Task 2.3
 * Tests for conversion functions and data validation
 */

import { describe, it, expect } from 'vitest';
import { obsidianToTocHeading, obsidianToTocFile, validateTocHeading, validateTocFile } from '../../ui/utils/tocTransformers';
import type { ObsidianHeading, ObsidianFile } from '../../ui/schemas/toc';

describe('Data Transformation Functions', () => {
  describe('obsidianToTocHeading', () => {
    it('should convert valid ObsidianHeading to TocHeading', () => {
      const obsidianHeading: ObsidianHeading = {
        heading: '# Main Title',
        level: 1,
        position: {
          start: 0,
          end: 0
        }
      };

      const result = obsidianToTocHeading(obsidianHeading);

      expect(result).toBeTruthy();
      expect(result?.id).toContain('0-0-main-title');
      expect(result?.text).toBe('Main Title');
      expect(result?.level).toBe(1);
      expect(result?.line).toBe(0);
    });

    it('should handle headings with markdown formatting', () => {
      const obsidianHeading: ObsidianHeading = {
        heading: '## **Bold** _Italic_ `Code` Title',
        level: 2,
        position: {
          start: 5,
          end: 5
        }
      };

      const result = obsidianToTocHeading(obsidianHeading);

      expect(result).toBeTruthy();
      expect(result?.text).toBe('Bold Italic Code Title');
      expect(result?.level).toBe(2);
      expect(result?.line).toBe(5);
    });

    it('should handle headings with links', () => {
      const obsidianHeading: ObsidianHeading = {
        heading: '### [Link Text](url) and [Ref][1]',
        level: 3,
        position: {
          start: 10,
          end: 10
        }
      };

      const result = obsidianToTocHeading(obsidianHeading);

      expect(result).toBeTruthy();
      expect(result?.text).toBe('Link Text and Ref');
      expect(result?.level).toBe(3);
    });

    it('should reject headings with invalid level (outside 1-3)', () => {
      const obsidianHeading: ObsidianHeading = {
        heading: '# Valid Title',
        level: 4, // Invalid level
        position: {
          start: 0,
          end: 0
        }
      };

      const result = obsidianToTocHeading(obsidianHeading);
      expect(result).toBeNull();
    });

    it('should reject headings with empty text after sanitization', () => {
      const obsidianHeading: ObsidianHeading = {
        heading: '### ***___', // Only formatting, no actual text
        level: 3,
        position: {
          start: 0,
          end: 0
        }
      };

      const result = obsidianToTocHeading(obsidianHeading);
      expect(result).toBeNull();
    });

    it('should handle malformed input gracefully', () => {
      expect(obsidianToTocHeading(null as any)).toBeNull();
      expect(obsidianToTocHeading({} as any)).toBeNull();
      expect(obsidianToTocHeading({ heading: '', level: 1 } as any)).toBeNull();
    });
  });

  describe('obsidianToTocFile', () => {
    it('should convert valid Obsidian data to TocFile', () => {
      const obsidianFile: ObsidianFile = {
        path: 'test/file.md'
      };

      const obsidianHeadings: ObsidianHeading[] = [
        {
          heading: '# Main Title',
          level: 1,
          position: {
            start: 0,
            end: 0
          }
        },
        {
          heading: '## Subsection',
          level: 2,
          position: {
            start: 5,
            end: 5
          }
        }
      ];

      const result = obsidianToTocFile(obsidianFile, obsidianHeadings);

      expect(result).toBeTruthy();
      expect(result?.path).toBe('test/file.md');
      expect(result?.headings).toHaveLength(2);
      expect(result?.headings[0].text).toBe('Main Title');
      expect(result?.headings[1].text).toBe('Subsection');
    });

    it('should filter out invalid headings', () => {
      const obsidianFile: ObsidianFile = {
        path: 'test/file.md'
      };

      const obsidianHeadings: ObsidianHeading[] = [
        {
          heading: '# Valid Title',
          level: 1,
          position: {
            start: 0,
            end: 0
          }
        },
        {
          heading: '# Invalid Level',
          level: 4, // Invalid level
          position: {
            start: 5,
            end: 5
          }
        },
        {
          heading: '### ***___', // Empty after sanitization
          level: 3,
          position: {
            start: 10,
            end: 10
          }
        }
      ];

      const result = obsidianToTocFile(obsidianFile, obsidianHeadings);

      expect(result).toBeTruthy();
      expect(result?.headings).toHaveLength(1);
      expect(result?.headings[0].text).toBe('Valid Title');
    });

    it('should sort headings by line number', () => {
      const obsidianFile: ObsidianFile = {
        path: 'test/file.md'
      };

      const obsidianHeadings: ObsidianHeading[] = [
        {
          heading: '## Third',
          level: 2,
          position: {
            start: 10,
            end: 10
          }
        },
        {
          heading: '# First',
          level: 1,
          position: {
            start: 0,
            end: 0
          }
        },
        {
          heading: '### Second',
          level: 3,
          position: {
            start: 5,
            end: 5
          }
        }
      ];

      const result = obsidianToTocFile(obsidianFile, obsidianHeadings);

      expect(result).toBeTruthy();
      expect(result?.headings).toHaveLength(3);
      expect(result?.headings[0].text).toBe('First');
      expect(result?.headings[1].text).toBe('Second');
      expect(result?.headings[2].text).toBe('Third');
    });

    it('should handle malformed input gracefully', () => {
      expect(obsidianToTocFile(null as any, [])).toBeNull();
      expect(obsidianToTocFile({ path: '' }, [])).toBeNull();
      expect(obsidianToTocFile({ path: 'test.md' }, null as any)).toBeNull();
    });
  });

  describe('validateTocHeading', () => {
    it('should validate correct TocHeading', () => {
      const validHeading = {
        id: 'test-id',
        text: 'Test Heading',
        level: 2,
        line: 5
      };

      expect(validateTocHeading(validHeading)).toBe(true);
    });

    it('should reject invalid TocHeading', () => {
      expect(validateTocHeading(null as any)).toBe(false);
      expect(validateTocHeading(undefined as any)).toBe(false);
      expect(validateTocHeading({} as any)).toBe(false);
      expect(validateTocHeading({ id: '', text: 'Test', level: 2, line: 5 } as any)).toBe(false);
      expect(validateTocHeading({ id: 'test', text: '', level: 2, line: 5 } as any)).toBe(false);
      expect(validateTocHeading({ id: 'test', text: 'Test', level: 0, line: 5 } as any)).toBe(false);
      expect(validateTocHeading({ id: 'test', text: 'Test', level: 4, line: 5 } as any)).toBe(false);
      expect(validateTocHeading({ id: 'test', text: 'Test', level: 2, line: -1 } as any)).toBe(false);
    });
  });

  describe('validateTocFile', () => {
    it('should validate correct TocFile', () => {
      const validFile = {
        path: 'test/file.md',
        headings: [
          {
            id: 'test-id-1',
            text: 'Heading 1',
            level: 1,
            line: 0
          },
          {
            id: 'test-id-2',
            text: 'Heading 2',
            level: 2,
            line: 5
          }
        ]
      };

      expect(validateTocFile(validFile)).toBe(true);
    });

    it('should reject invalid TocFile', () => {
      expect(validateTocFile(null as any)).toBe(false);
      expect(validateTocFile({} as any)).toBe(false);
      expect(validateTocFile({ path: '', headings: [] } as any)).toBe(false);
      expect(validateTocFile({ path: 'test.md', headings: null as any })).toBe(false);
      expect(validateTocFile({
        path: 'test.md',
        headings: [{ id: '', text: 'Test', level: 1, line: 0 }] // Invalid heading
      } as any)).toBe(false);
    });
  });
});

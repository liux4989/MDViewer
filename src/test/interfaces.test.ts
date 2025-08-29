import { describe, it, expect } from 'vitest';
import type { TocHeading, TocFile, TocData, ObsidianFile, ObsidianHeading } from '../../ui/schemas/toc';

describe('TOC Interfaces', () => {
  it('should allow creating TocHeading with required properties', () => {
    const heading: TocHeading = {
      id: 'heading-1',
      text: 'Introduction',
      level: 1,
      line: 1
    };

    expect(heading.id).toBe('heading-1');
    expect(heading.text).toBe('Introduction');
    expect(heading.level).toBe(1);
    expect(heading.line).toBe(1);
  });

  it('should allow creating TocFile with required properties', () => {
    const file: TocFile = {
      path: 'docs/README.md',
      headings: []
    };

    expect(file.path).toBe('docs/README.md');
    expect(file.headings).toEqual([]);
  });

  it('should allow creating TocData with required properties', () => {
    const tocData: TocData = {
      file: {
        path: 'docs/README.md',
        headings: []
      },
      headings: [],
      activeHeading: 'heading-1'
    };

    expect(tocData.file.path).toBe('docs/README.md');
    expect(tocData.headings).toEqual([]);
    expect(tocData.activeHeading).toBe('heading-1');
  });

  it('should allow creating ObsidianFile with required properties', () => {
    const obsidianFile: ObsidianFile = {
      path: 'docs/README.md'
    };

    expect(obsidianFile.path).toBe('docs/README.md');
  });

  it('should allow creating ObsidianHeading with required properties', () => {
    const obsidianHeading: ObsidianHeading = {
      heading: 'Introduction',
      level: 1,
      position: {
        start: 1,
        end: 1
      }
    };

    expect(obsidianHeading.heading).toBe('Introduction');
    expect(obsidianHeading.level).toBe(1);
    expect(obsidianHeading.position.start).toBe(1);
    expect(obsidianHeading.position.end).toBe(1);
  });
});

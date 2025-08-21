/**
 * Mock data implementation for the Floating TOC Plugin
 * Provides various TOC structures for development and testing
 */

import { TocEntry, MockDataGenerator } from './index';

/**
 * Implementation of MockDataGenerator interface
 * Creates sample TOC data for different testing scenarios
 */
export class MockTocData implements MockDataGenerator {
  /**
   * Generate simple flat TOC structure
   * Useful for basic functionality testing
   */
  generateSimpleToc(): TocEntry[] {
    return [
      {
        id: 'intro',
        text: 'Introduction',
        level: 1,
        element: null,
        children: []
      },
      {
        id: 'features',
        text: 'Features',
        level: 1,
        element: null,
        children: [
          {
            id: 'core-features',
            text: 'Core Features',
            level: 2,
            element: null,
            children: []
          },
          {
            id: 'advanced-features',
            text: 'Advanced Features',
            level: 2,
            element: null,
            children: []
          }
        ]
      },
      {
        id: 'installation',
        text: 'Installation',
        level: 1,
        element: null,
        children: []
      },
      {
        id: 'usage',
        text: 'Usage',
        level: 1,
        element: null,
        children: []
      }
    ];
  }

  /**
   * Generate complex nested TOC structure
   * Tests deep hierarchical navigation
   */
  generateNestedToc(): TocEntry[] {
    return [
      {
        id: 'chapter-1',
        text: 'Chapter 1: Getting Started',
        level: 1,
        element: null,
        children: [
          {
            id: 'section-1-1',
            text: '1.1 Installation',
            level: 2,
            element: null,
            children: [
              {
                id: 'subsection-1-1-1',
                text: '1.1.1 Prerequisites',
                level: 3,
                element: null,
                children: [
                  {
                    id: 'subsubsection-1-1-1-1',
                    text: '1.1.1.1 System Requirements',
                    level: 4,
                    element: null,
                    children: []
                  },
                  {
                    id: 'subsubsection-1-1-1-2',
                    text: '1.1.1.2 Dependencies',
                    level: 4,
                    element: null,
                    children: []
                  }
                ]
              },
              {
                id: 'subsection-1-1-2',
                text: '1.1.2 Download and Setup',
                level: 3,
                element: null,
                children: []
              }
            ]
          },
          {
            id: 'section-1-2',
            text: '1.2 Configuration',
            level: 2,
            element: null,
            children: [
              {
                id: 'subsection-1-2-1',
                text: '1.2.1 Basic Settings',
                level: 3,
                element: null,
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'chapter-2',
        text: 'Chapter 2: Advanced Usage',
        level: 1,
        element: null,
        children: [
          {
            id: 'section-2-1',
            text: '2.1 Customization',
            level: 2,
            element: null,
            children: []
          }
        ]
      }
    ];
  }

  /**
   * Generate large TOC for performance testing
   * Tests plugin performance with many entries
   */
  generateLargeToc(): TocEntry[] {
    const entries: TocEntry[] = [];
    
    for (let i = 1; i <= 20; i++) {
      const chapter: TocEntry = {
        id: `chapter-${i}`,
        text: `Chapter ${i}: Topic ${i}`,
        level: 1,
        element: null,
        children: []
      };
      
      // Add 5 sections per chapter
      for (let j = 1; j <= 5; j++) {
        const section: TocEntry = {
          id: `section-${i}-${j}`,
          text: `${i}.${j} Section ${j}`,
          level: 2,
          element: null,
          children: []
        };
        
        // Add 3 subsections per section
        for (let k = 1; k <= 3; k++) {
          const subsection: TocEntry = {
            id: `subsection-${i}-${j}-${k}`,
            text: `${i}.${j}.${k} Subsection ${k}`,
            level: 3,
            element: null,
            children: []
          };
          section.children.push(subsection);
        }
        
        chapter.children.push(section);
      }
      
      entries.push(chapter);
    }
    
    return entries;
  }

  /**
   * Generate empty TOC for edge case testing
   * Tests plugin behavior with no content
   */
  generateEmptyToc(): TocEntry[] {
    return [];
  }

  /**
   * Generate TOC with mixed heading levels
   * Tests handling of non-sequential heading levels
   */
  generateMixedLevelsToc(): TocEntry[] {
    return [
      {
        id: 'h1-1',
        text: 'Main Title',
        level: 1,
        element: null,
        children: [
          {
            id: 'h3-1',
            text: 'Skipped H2, Direct H3',
            level: 3,
            element: null,
            children: [
              {
                id: 'h6-1',
                text: 'Deep H6 Heading',
                level: 6,
                element: null,
                children: []
              }
            ]
          },
          {
            id: 'h2-1',
            text: 'Regular H2',
            level: 2,
            element: null,
            children: [
              {
                id: 'h4-1',
                text: 'Skipped H3, Direct H4',
                level: 4,
                element: null,
                children: []
              }
            ]
          }
        ]
      }
    ];
  }
}

/**
 * Singleton instance of MockTocData for easy access
 */
export const mockTocData = new MockTocData();
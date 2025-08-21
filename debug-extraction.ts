/**
 * Debug script to test TOC extraction without Obsidian
 * This helps identify issues with the extraction logic
 */

import { TocManager } from './business-logic/TocManager';

// Simulate different document structures
const testDocuments = {
  // Simulate rendered HTML (preview mode)
  renderedHtml: `
    <div class="markdown-preview-view">
      <h1 id="introduction">Introduction</h1>
      <p>This is the introduction section.</p>
      
      <h2 id="getting-started">Getting Started</h2>
      <p>Getting started content.</p>
      
      <h3 id="installation">Installation</h3>
      <p>Installation instructions.</p>
      
      <h3 id="configuration">Configuration</h3>
      <p>Configuration details.</p>
      
      <h2 id="advanced">Advanced Topics</h2>
      <p>Advanced content.</p>
      
      <h4 id="performance">Performance Tips</h4>
      <p>Performance optimization.</p>
      
      <h1 id="conclusion">Conclusion</h1>
      <p>Final thoughts.</p>
    </div>
  `,

  // Simulate markdown source
  markdownSource: `# Introduction

This is the introduction section.

## Getting Started

Getting started content.

### Installation

Installation instructions.

### Configuration

Configuration details.

## Advanced Topics

Advanced content.

#### Performance Tips

Performance optimization.

# Conclusion

Final thoughts.`
};

function createTempContainerFromMarkdown(markdownContent: string): HTMLElement | null {
  try {
    const container = document.createElement('div');
    
    // Simple regex to extract headings from markdown
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    let headingIndex = 0;
    
    while ((match = headingRegex.exec(markdownContent)) !== null) {
      const level = match[1].length; // Number of # characters
      const text = match[2].trim();
      
      if (text) {
        const headingElement = document.createElement(`h${level}`);
        headingElement.textContent = text;
        
        // Generate a simple ID from the text
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '') || `heading-${headingIndex}`;
        
        headingElement.id = id;
        container.appendChild(headingElement);
        headingIndex++;
      }
    }
    
    console.log(`Created temp container with ${container.children.length} headings`);
    return container.children.length > 0 ? container : null;
  } catch (error) {
    console.error('Error creating temp container from markdown:', error);
    return null;
  }
}

export function debugExtraction(): void {
  console.log('🔍 Starting TOC extraction debug...');

  // Test 1: Rendered HTML extraction
  console.log('\n📄 Test 1: Rendered HTML extraction');
  const htmlContainer = document.createElement('div');
  htmlContainer.innerHTML = testDocuments.renderedHtml;
  const previewElement = htmlContainer.querySelector('.markdown-preview-view') as HTMLElement;

  if (previewElement) {
    const tocManager1 = new TocManager();
    const state1 = tocManager1.initialize(previewElement);
    
    console.log(`✅ HTML extraction: ${state1.entries.length} entries found`);
    state1.entries.forEach((entry, index) => {
      console.log(`   ${index + 1}. H${entry.level}: "${entry.text}" [${entry.id}]`);
      if (entry.children.length > 0) {
        entry.children.forEach((child, childIndex) => {
          console.log(`      ${index + 1}.${childIndex + 1}. H${child.level}: "${child.text}" [${child.id}]`);
        });
      }
    });
  } else {
    console.log('❌ Could not find preview element');
  }

  // Test 2: Markdown source extraction
  console.log('\n📝 Test 2: Markdown source extraction');
  const markdownContainer = createTempContainerFromMarkdown(testDocuments.markdownSource);

  if (markdownContainer) {
    const tocManager2 = new TocManager();
    const state2 = tocManager2.initialize(markdownContainer);
    
    console.log(`✅ Markdown extraction: ${state2.entries.length} entries found`);
    state2.entries.forEach((entry, index) => {
      console.log(`   ${index + 1}. H${entry.level}: "${entry.text}" [${entry.id}]`);
      if (entry.children.length > 0) {
        entry.children.forEach((child, childIndex) => {
          console.log(`      ${index + 1}.${childIndex + 1}. H${child.level}: "${child.text}" [${child.id}]`);
        });
      }
    });
  } else {
    console.log('❌ Could not create container from markdown');
  }

  console.log('\n🎯 Debug extraction completed!');
}

// Auto-run in browser environment
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugExtraction);
  } else {
    setTimeout(debugExtraction, 100);
  }
}

// Functions are already exported above
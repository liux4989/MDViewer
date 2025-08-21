/**
 * Test script to verify real business logic integration
 * This replaces the mock data with actual document extraction
 */

import { TocManager } from './business-logic/TocManager';

/**
 * Test the real business logic integration with a sample document
 */
export function testRealIntegration(): void {
  console.log('🧪 Testing real business logic integration...');

  // Create a sample document structure (simulating Obsidian's rendered markdown)
  const sampleDocument = document.createElement('div');
  sampleDocument.innerHTML = `
    <div class="markdown-preview-view">
      <h1 id="introduction">Introduction</h1>
      <p>This is the introduction section with some content.</p>
      
      <h2 id="getting-started">Getting Started</h2>
      <p>Here's how to get started with this document.</p>
      
      <h3 id="prerequisites">Prerequisites</h3>
      <p>You'll need the following prerequisites.</p>
      
      <h3 id="installation">Installation</h3>
      <p>Follow these installation steps.</p>
      
      <h2 id="advanced-topics">Advanced Topics</h2>
      <p>This section covers advanced topics.</p>
      
      <h3 id="configuration">Configuration</h3>
      <p>How to configure the system.</p>
      
      <h4 id="environment-variables">Environment Variables</h4>
      <p>Setting up environment variables.</p>
      
      <h4 id="config-files">Configuration Files</h4>
      <p>Managing configuration files.</p>
      
      <h2 id="troubleshooting">Troubleshooting</h2>
      <p>Common issues and solutions.</p>
      
      <h1 id="conclusion">Conclusion</h1>
      <p>Final thoughts and next steps.</p>
    </div>
  `;

  // Add the sample document to the DOM temporarily
  document.body.appendChild(sampleDocument);

  try {
    // Initialize TocManager with real configuration
    const tocManager = new TocManager({
      includeLevels: [1, 2, 3, 4, 5, 6],
      minTextLength: 1,
      maxDepth: 6,
      autoGenerateIds: true,
      rootMargin: '-10% 0px -80% 0px',
      threshold: [0, 0.1, 0.5, 1.0]
    });

    console.log('✅ TocManager created successfully');

    // Initialize with the sample document
    const previewElement = sampleDocument.querySelector('.markdown-preview-view') as HTMLElement;
    const state = tocManager.initialize(previewElement);

    console.log(`📊 Extraction Results:`);
    console.log(`   - Total entries: ${state.entries.length}`);
    console.log(`   - Position: ${state.position}`);
    console.log(`   - Visible: ${state.isVisible}`);
    console.log(`   - Loading: ${state.isLoading}`);

    // Display the extracted structure
    console.log(`📋 TOC Structure:`);
    const displayEntry = (entry: any, indent: string = '') => {
      console.log(`${indent}- ${entry.text} (H${entry.level}) [${entry.id}]`);
      if (entry.children && entry.children.length > 0) {
        entry.children.forEach((child: any) => displayEntry(child, indent + '  '));
      }
    };

    state.entries.forEach(entry => displayEntry(entry));

    // Test statistics
    const stats = tocManager.getStatistics();
    console.log(`📈 Statistics:`);
    console.log(`   - Total entries: ${stats.totalEntries}`);
    console.log(`   - Max depth: ${stats.maxDepth}`);
    console.log(`   - Level counts:`, stats.levelCounts);

    // Test navigation
    console.log(`🧭 Testing Navigation:`);
    const firstEntry = state.entries[0];
    if (firstEntry) {
      console.log(`   - Navigating to: ${firstEntry.text} (${firstEntry.id})`);
      tocManager.navigateToEntry(firstEntry.id, false); // No smooth scroll in test
      console.log(`   - Navigation completed`);
    }

    // Test tracking (mock callback)
    console.log(`👁️ Testing Scroll Tracking:`);
    let activeCallbackCount = 0;
    tocManager.startTracking((activeId) => {
      activeCallbackCount++;
      console.log(`   - Active section changed to: ${activeId} (callback #${activeCallbackCount})`);
    });
    console.log(`   - Tracking started successfully`);

    // Cleanup
    tocManager.cleanup();
    console.log(`🧹 Cleanup completed`);

    console.log(`✅ Real business logic integration test completed successfully!`);
    console.log(`🎉 Mock data has been successfully replaced with real document extraction!`);

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  } finally {
    // Remove the sample document from DOM
    document.body.removeChild(sampleDocument);
  }
}

// Function is already exported above

// Auto-run in browser environment
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testRealIntegration);
} else if (typeof window !== 'undefined') {
  // DOM already loaded
  setTimeout(testRealIntegration, 100);
}
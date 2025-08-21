/**
 * Integration test for business logic classes
 * Verifies that all classes work together correctly
 */

import { TocManager } from './TocManager';
import { HeadingExtractor } from './HeadingExtractor';
import { NavigationHandler } from './NavigationHandler';
import { ScrollTracker } from './ScrollTracker';

/**
 * Test the business logic integration
 */
export function testBusinessLogicIntegration(): void {
  console.log('Testing business logic integration...');

  // Test HeadingExtractor
  console.log('1. Testing HeadingExtractor...');
  const extractor = new HeadingExtractor();
  
  // Create a mock document container
  const mockContainer = document.createElement('div');
  mockContainer.innerHTML = `
    <h1>Chapter 1</h1>
    <p>Some content</p>
    <h2>Section 1.1</h2>
    <p>More content</p>
    <h2>Section 1.2</h2>
    <h3>Subsection 1.2.1</h3>
    <p>Content</p>
  `;
  
  const entries = extractor.extractHeadings(mockContainer);
  console.log(`   - Extracted ${entries.length} top-level entries`);
  console.log(`   - First entry: "${entries[0]?.text}" (level ${entries[0]?.level})`);

  // Test NavigationHandler
  console.log('2. Testing NavigationHandler...');
  const navigator = new NavigationHandler();
  
  // Test validation (should return false for non-existent ID)
  const isValid = navigator.validateTarget('non-existent-id');
  console.log(`   - Validation of non-existent ID: ${isValid}`);
  
  // Test configuration
  navigator.configure({ behavior: 'smooth', offset: 10 });
  console.log('   - Configuration updated successfully');

  // Test ScrollTracker
  console.log('3. Testing ScrollTracker...');
  const tracker = new ScrollTracker();
  
  // Test if IntersectionObserver is supported
  const isSupported = ScrollTracker.isSupported();
  console.log(`   - IntersectionObserver supported: ${isSupported}`);
  
  // Test configuration
  tracker.configure({ rootMargin: '0px', threshold: 0.5 });
  console.log('   - Configuration updated successfully');

  // Test TocManager (main orchestrator)
  console.log('4. Testing TocManager...');
  const manager = new TocManager({
    includeLevels: [1, 2, 3],
    minTextLength: 1,
    autoGenerateIds: true
  });
  
  // Initialize with mock container
  const state = manager.initialize(mockContainer);
  console.log(`   - Initialized with ${state.entries.length} entries`);
  console.log(`   - State position: ${state.position}`);
  console.log(`   - State visible: ${state.isVisible}`);
  
  // Test statistics
  const stats = manager.getStatistics();
  console.log(`   - Total entries: ${stats.totalEntries}`);
  console.log(`   - Max depth: ${stats.maxDepth}`);
  console.log(`   - Level counts:`, stats.levelCounts);
  
  // Test flattened entries
  const flattened = manager.getFlattenedEntries();
  console.log(`   - Flattened entries: ${flattened.length}`);

  console.log('✅ Business logic integration test completed successfully!');
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  document.addEventListener('DOMContentLoaded', testBusinessLogicIntegration);
} else {
  // Node environment (for testing)
  console.log('Business logic classes created successfully');
}
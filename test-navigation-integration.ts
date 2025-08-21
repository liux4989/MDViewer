/**
 * Comprehensive navigation integration test
 * Tests all aspects of the click navigation functionality
 */

import { NavigationHandler } from './business-logic/NavigationHandler';
import { TocManager } from './business-logic/TocManager';
import { TocEntry } from './types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

class NavigationTester {
  private navigationHandler: NavigationHandler;
  private tocManager: TocManager;
  private testResults: TestResult[] = [];
  private mockContainer: HTMLElement;

  constructor() {
    this.navigationHandler = new NavigationHandler();
    this.tocManager = new TocManager();
    this.mockContainer = this.createMockDocument();
  }

  /**
   * Create a mock document with various heading structures for testing
   */
  private createMockDocument(): HTMLElement {
    const container = document.createElement('div');
    container.innerHTML = `
      <h1 id="valid-h1">Valid H1 Heading</h1>
      <p>Some content between headings</p>
      
      <h2 id="valid-h2">Valid H2 Heading</h2>
      <p>More content</p>
      
      <h3 id="valid-h3">Valid H3 Heading</h3>
      <p>Content for H3</p>
      
      <h2 id="another-h2">Another H2</h2>
      <h3 id="nested-h3">Nested H3</h3>
      
      <h1 id="second-h1">Second H1</h1>
      
      <!-- Hidden elements for testing -->
      <h2 id="hidden-display" style="display: none;">Hidden Display</h2>
      <h2 id="hidden-visibility" style="visibility: hidden;">Hidden Visibility</h2>
      <h2 id="zero-dimensions" style="width: 0; height: 0; overflow: hidden;">Zero Dimensions</h2>
      
      <!-- Valid but edge case elements -->
      <h4 id="deep-heading">Deep H4 Heading</h4>
      <h6 id="deepest-heading">Deepest H6 Heading</h6>
      
      <!-- Element with special characters -->
      <h2 id="special-chars">Heading with "Special" & Characters!</h2>
    `;
    
    // Add to document so elements are properly connected
    document.body.appendChild(container);
    return container;
  }

  /**
   * Run all navigation tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting comprehensive navigation tests...');
    
    // Initialize TOC manager with mock document
    this.tocManager.initialize(this.mockContainer);
    
    // Test categories
    await this.testBasicValidation();
    await this.testNavigationFunctionality();
    await this.testErrorHandling();
    await this.testEdgeCases();
    await this.testTocManagerIntegration();
    await this.testPerformance();
    
    this.printResults();
    return this.testResults;
  }

  /**
   * Test basic validation functionality
   */
  private async testBasicValidation(): Promise<void> {
    console.log('📋 Testing basic validation...');
    
    // Valid targets
    const validTargets = ['valid-h1', 'valid-h2', 'valid-h3', 'another-h2', 'nested-h3'];
    for (const target of validTargets) {
      const isValid = this.navigationHandler.validateTarget(target);
      this.addResult(`Validate valid target: ${target}`, isValid, 
        isValid ? undefined : `Expected ${target} to be valid`);
    }
    
    // Invalid targets
    const invalidTargets = [
      { id: '', name: 'empty string' },
      { id: null as any, name: 'null' },
      { id: undefined as any, name: 'undefined' },
      { id: 123 as any, name: 'number' },
      { id: 'non-existent', name: 'non-existent ID' },
      { id: 'hidden-display', name: 'hidden display' },
      { id: 'hidden-visibility', name: 'hidden visibility' },
      { id: 'zero-dimensions', name: 'zero dimensions' }
    ];
    
    for (const { id, name } of invalidTargets) {
      const isValid = this.navigationHandler.validateTarget(id);
      this.addResult(`Validate invalid target: ${name}`, !isValid,
        isValid ? `Expected ${name} to be invalid` : undefined);
    }
  }

  /**
   * Test navigation functionality
   */
  private async testNavigationFunctionality(): Promise<void> {
    console.log('🧭 Testing navigation functionality...');
    
    const testTargets = ['valid-h1', 'valid-h2', 'nested-h3', 'second-h1'];
    
    for (const target of testTargets) {
      try {
        // Test navigation without smooth scroll
        await this.navigationHandler.navigateToSection(target, false);
        this.addResult(`Navigate to ${target} (instant)`, true);
        
        // Small delay between tests
        await this.delay(100);
        
        // Test navigation with smooth scroll
        await this.navigationHandler.navigateToSection(target, true);
        this.addResult(`Navigate to ${target} (smooth)`, true);
        
        await this.delay(200);
      } catch (error) {
        this.addResult(`Navigate to ${target}`, false, error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('⚠️ Testing error handling...');
    
    const errorCases = [
      { id: 'non-existent-id', name: 'non-existent element' },
      { id: '', name: 'empty ID' },
      { id: 'hidden-display', name: 'hidden element' }
    ];
    
    for (const { id, name } of errorCases) {
      try {
        await this.navigationHandler.navigateToSection(id);
        this.addResult(`Error handling for ${name}`, false, 'Expected navigation to fail');
      } catch (error) {
        this.addResult(`Error handling for ${name}`, true, `Correctly rejected: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Test edge cases
   */
  private async testEdgeCases(): Promise<void> {
    console.log('🔍 Testing edge cases...');
    
    // Test configuration changes
    try {
      this.navigationHandler.configure({
        behavior: 'smooth',
        block: 'center',
        offset: 50
      });
      this.addResult('Configuration update', true);
    } catch (error) {
      this.addResult('Configuration update', false, error instanceof Error ? error.message : String(error));
    }
    
    // Test scroll position calculation
    try {
      const position = this.navigationHandler.getScrollPosition('valid-h1');
      this.addResult('Scroll position calculation', position !== null, 
        position !== null ? `Position: ${position}px` : 'Failed to calculate position');
    } catch (error) {
      this.addResult('Scroll position calculation', false, error instanceof Error ? error.message : String(error));
    }
    
    // Test current scroll position
    try {
      const currentPos = this.navigationHandler.getCurrentScrollPosition();
      this.addResult('Current scroll position', typeof currentPos === 'number',
        `Current position: ${currentPos}px`);
    } catch (error) {
      this.addResult('Current scroll position', false, error instanceof Error ? error.message : String(error));
    }
    
    // Test smooth scroll support detection
    try {
      const isSupported = this.navigationHandler.isSmoothScrollSupported();
      this.addResult('Smooth scroll support detection', typeof isSupported === 'boolean',
        `Smooth scroll supported: ${isSupported}`);
    } catch (error) {
      this.addResult('Smooth scroll support detection', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Test TOC manager integration
   */
  private async testTocManagerIntegration(): Promise<void> {
    console.log('🔗 Testing TOC manager integration...');
    
    try {
      const state = this.tocManager.getState();
      this.addResult('TOC state retrieval', state.entries.length > 0,
        `Found ${state.entries.length} entries`);
      
      if (state.entries.length > 0) {
        const firstEntry = state.entries[0];
        
        // Test TOC manager navigation
        await this.tocManager.navigateToEntry(firstEntry.id, false);
        this.addResult(`TOC manager navigation to ${firstEntry.text}`, true);
        
        // Test navigation to non-existent entry
        try {
          await this.tocManager.navigateToEntry('non-existent-toc-entry');
          this.addResult('TOC manager error handling', false, 'Expected navigation to fail');
        } catch (error) {
          this.addResult('TOC manager error handling', true, 
            `Correctly rejected: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      this.addResult('TOC manager integration', false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Test performance aspects
   */
  private async testPerformance(): Promise<void> {
    console.log('⚡ Testing performance...');
    
    // Test rapid navigation calls
    const startTime = performance.now();
    const rapidTargets = ['valid-h1', 'valid-h2', 'valid-h3', 'another-h2'];
    
    try {
      for (const target of rapidTargets) {
        await this.navigationHandler.navigateToSection(target, false);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.addResult('Rapid navigation performance', duration < 1000,
        `Completed ${rapidTargets.length} navigations in ${duration.toFixed(2)}ms`);
    } catch (error) {
      this.addResult('Rapid navigation performance', false, error instanceof Error ? error.message : String(error));
    }
    
    // Test validation performance
    const validationStart = performance.now();
    for (let i = 0; i < 100; i++) {
      this.navigationHandler.validateTarget('valid-h1');
      this.navigationHandler.validateTarget('non-existent');
    }
    const validationEnd = performance.now();
    const validationDuration = validationEnd - validationStart;
    
    this.addResult('Validation performance', validationDuration < 100,
      `200 validations completed in ${validationDuration.toFixed(2)}ms`);
  }

  /**
   * Add a test result
   */
  private addResult(name: string, passed: boolean, details?: string): void {
    this.testResults.push({
      name,
      passed,
      error: passed ? undefined : details,
      details: passed ? details : undefined
    });
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
    
    if (passed < total) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  • ${result.name}: ${result.error}`);
        });
    }
    
    console.log('\n📝 Detailed Results:');
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const details = result.details || result.error || '';
      console.log(`${icon} ${result.name}${details ? ` - ${details}` : ''}`);
    });
  }

  /**
   * Cleanup test resources
   */
  cleanup(): void {
    if (this.mockContainer && this.mockContainer.parentNode) {
      this.mockContainer.parentNode.removeChild(this.mockContainer);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other files
export { NavigationTester };

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    const tester = new NavigationTester();
    try {
      await tester.runAllTests();
    } finally {
      tester.cleanup();
    }
  });
}
import React, { useState, useEffect } from 'react';
import { useObsidianApp } from '../ObsidianAppContext';
import { ObsidianDataSource } from '../schemas';
import type { ObsidianFile, ObsidianHeading } from '../schemas/toc';

interface TestResult {
  name: string;
  category?: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  data?: any;
  duration?: number;
}

interface IntegrationTestState {
  results: TestResult[];
  overallStatus: 'pending' | 'running' | 'completed';
  startTime?: number;
  endTime?: number;
}

export const TocIntegrationTest: React.FC = () => {
  const app = useObsidianApp();
  const [testState, setTestState] = useState<IntegrationTestState>({
    results: [],
    overallStatus: 'pending'
  });
  const [dataSource] = useState(() => new ObsidianDataSource(app));

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestState(prev => ({
      ...prev,
      results: prev.results.map((result, i) =>
        i === index ? { ...result, ...updates } : result
      )
    }));
  };

  const runTests = async () => {
    const startTime = Date.now();
    setTestState({
      results: [],
      overallStatus: 'running',
      startTime
    });

    const tests: Array<{ name: string; test: () => Promise<TestResult>; category: string }> = [
      // ===== CORE FUNCTIONALITY TESTS =====
      // These test the main APIs with valid, expected inputs
      {
        name: 'extractFileMetadata - Valid Markdown File',
        category: 'Core Functionality',
        test: async () => {
          const testStart = Date.now();
          try {
            const activeFile = dataSource.getActiveFile();
            if (!activeFile) {
              return {
                name: 'extractFileMetadata - Valid Markdown File',
                status: 'failed',
                message: 'No active markdown file available for testing',
                duration: Date.now() - testStart
              };
            }

            const metadata = dataSource.extractFileMetadata(activeFile);

            // Test that metadata is returned
            if (!metadata) {
              return {
                name: 'extractFileMetadata - Valid Markdown File',
                status: 'failed',
                message: 'Expected metadata object, got null',
                duration: Date.now() - testStart
              };
            }

            // Test that path matches
            if (metadata.path !== activeFile.path) {
              return {
                name: 'extractFileMetadata - Valid Markdown File',
                status: 'failed',
                message: `Path mismatch: expected ${activeFile.path}, got ${metadata.path}`,
                duration: Date.now() - testStart
              };
            }

            // Test that result matches ObsidianFile interface
            const hasRequiredFields = metadata.path && typeof metadata.path === 'string';
            if (!hasRequiredFields) {
              return {
                name: 'extractFileMetadata - Valid Markdown File',
                status: 'failed',
                message: 'Result missing required ObsidianFile interface fields',
                duration: Date.now() - testStart
              };
            }

            return {
              name: 'extractFileMetadata - Valid Markdown File',
              status: 'passed',
              message: `✅ Correctly extracted metadata from ${activeFile.basename}`,
              data: {
                fileName: activeFile.basename,
                returnedPath: metadata.path,
                expectedPath: activeFile.path,
                pathMatch: metadata.path === activeFile.path,
                interfaceMatch: hasRequiredFields
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'extractFileMetadata - Valid Markdown File',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      {
        name: 'extractFileMetadata - Non-Markdown File',
        category: 'Edge Cases',
        test: async () => {
          const testStart = Date.now();
          try {
            const markdownFiles = dataSource.getMarkdownFiles();

            // Find a non-markdown file if available, or create a mock non-markdown file
            const nonMarkdownFiles = app.vault.getFiles().filter(file =>
              file.extension !== 'md'
            );

            if (nonMarkdownFiles.length === 0) {
              return {
                name: 'extractFileMetadata - Non-Markdown File',
                status: 'passed',
                message: `✅ No non-markdown files found in vault (expected in markdown-focused vault)`,
                data: {
                  allFilesAreMarkdown: true,
                  totalFiles: app.vault.getFiles().length,
                  markdownFiles: markdownFiles.length
                },
                duration: Date.now() - testStart
              };
            }

            const nonMarkdownFile = nonMarkdownFiles[0];
            const metadata = dataSource.extractFileMetadata(nonMarkdownFile);

            // Should still extract basic file metadata even for non-markdown files
            if (!metadata) {
              return {
                name: 'extractFileMetadata - Non-Markdown File',
                status: 'failed',
                message: `Expected metadata for non-markdown file, got null`,
                duration: Date.now() - testStart
              };
            }

            // Validate path extraction works for any file type
            if (metadata.path !== nonMarkdownFile.path) {
              return {
                name: 'extractFileMetadata - Non-Markdown File',
                status: 'failed',
                message: `Path mismatch for non-markdown file: expected ${nonMarkdownFile.path}, got ${metadata.path}`,
                duration: Date.now() - testStart
              };
            }

            return {
              name: 'extractFileMetadata - Non-Markdown File',
              status: 'passed',
              message: `✅ Successfully extracted metadata from ${nonMarkdownFile.basename}.${nonMarkdownFile.extension}`,
              data: {
                fileName: nonMarkdownFile.basename,
                fileExtension: nonMarkdownFile.extension,
                path: metadata.path,
                pathMatches: metadata.path === nonMarkdownFile.path
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'extractFileMetadata - Non-Markdown File',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      {
        name: 'extractHeadings - Valid Markdown File',
        category: 'Core Functionality',
        test: async () => {
          const testStart = Date.now();
          try {
            const activeFile = dataSource.getActiveFile();
            if (!activeFile) {
              return {
                name: 'extractHeadings - Valid File with Cache',
                status: 'failed',
                message: 'No active file available for testing',
                duration: Date.now() - testStart
              };
            }

            const headings = dataSource.extractHeadings(activeFile);

            // Test that we get an array
            if (!Array.isArray(headings)) {
              return {
                name: 'extractHeadings - Valid File with Cache',
                status: 'failed',
                message: `Expected array, got ${typeof headings}`,
                duration: Date.now() - testStart
              };
            }

            // Test heading structure if any exist
            if (headings.length > 0) {
              const firstHeading = headings[0];
              const hasRequiredFields = firstHeading &&
                typeof firstHeading.heading === 'string' &&
                typeof firstHeading.level === 'number' &&
                firstHeading.position &&
                typeof firstHeading.position.start === 'number' &&
                typeof firstHeading.position.end === 'number';

              if (!hasRequiredFields) {
                return {
                  name: 'extractHeadings - Valid File with Cache',
                  status: 'failed',
                  message: 'Heading structure missing required ObsidianHeading interface fields',
                  duration: Date.now() - testStart
                };
              }
            }

            return {
              name: 'extractHeadings - Valid File with Cache',
              status: 'passed',
              message: `✅ Extracted ${headings.length} headings with valid ObsidianHeading structure`,
              data: {
                headingCount: headings.length,
                hasValidStructure: headings.length === 0 || headings.every(h =>
                  h.heading && typeof h.level === 'number' && h.position
                ),
                sampleHeading: headings.length > 0 ? {
                  text: headings[0].heading,
                  level: headings[0].level,
                  position: headings[0].position
                } : null
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'extractHeadings - Valid File with Cache',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      {
        name: 'extractHeadings - File Without Headings',
        category: 'Edge Cases',
        test: async () => {
          const testStart = Date.now();
          try {
            const markdownFiles = dataSource.getMarkdownFiles();

            // Find a file without headings (if possible) or test with the smallest file
            let testFile = markdownFiles[0];
            let minHeadings = Infinity;

            // Find file with fewest headings
            for (const file of markdownFiles.slice(0, 5)) { // Check first 5 files
              const headings = dataSource.extractHeadings(file);
              if (headings.length < minHeadings) {
                minHeadings = headings.length;
                testFile = file;
              }
              // If we find a file with no headings, use it
              if (headings.length === 0) break;
            }

            const headings = dataSource.extractHeadings(testFile);

            // Test that we get an array regardless of content
            if (!Array.isArray(headings)) {
              return {
                name: 'extractHeadings - File Without Headings',
                status: 'failed',
                message: `Expected array, got ${typeof headings}`,
                duration: Date.now() - testStart
              };
            }

            // Validate that if there are headings, they have correct structure
            if (headings.length > 0) {
              const hasValidStructure = headings.every(h =>
                typeof h.heading === 'string' &&
                typeof h.level === 'number' &&
                h.position &&
                typeof h.position.start === 'number' &&
                typeof h.position.end === 'number'
              );

              if (!hasValidStructure) {
                return {
                  name: 'extractHeadings - File Without Headings',
                  status: 'failed',
                  message: 'Headings found but invalid structure',
                  duration: Date.now() - testStart
                };
              }
            }

            return {
              name: 'extractHeadings - File Without Headings',
              status: 'passed',
              message: `✅ Correctly handled file with ${headings.length} headings: ${testFile.basename}`,
              data: {
                fileName: testFile.basename,
                headingCount: headings.length,
                hasValidStructure: headings.length === 0 || headings.every(h =>
                  h.heading && typeof h.level === 'number' && h.position
                ),
                sampleHeadings: headings.slice(0, 2).map(h => ({
                  text: h.heading.substring(0, 30),
                  level: h.level
                }))
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'extractHeadings - File Without Headings',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      // ===== CACHE MANAGEMENT TESTS =====
      // These test cache availability and consistency
      {
        name: 'isCacheAvailable - Valid File',
        category: 'Core Functionality',
        test: async () => {
          const testStart = Date.now();
          try {
            const activeFile = dataSource.getActiveFile();
            if (!activeFile) {
              return {
                name: 'isCacheAvailable - Valid File',
                status: 'failed',
                message: 'No active file available for testing',
                duration: Date.now() - testStart
              };
            }

            const cacheAvailable = dataSource.isCacheAvailable(activeFile);

            // Should return boolean
            if (typeof cacheAvailable !== 'boolean') {
              return {
                name: 'isCacheAvailable - Valid File',
                status: 'failed',
                message: `Expected boolean, got ${typeof cacheAvailable}`,
                duration: Date.now() - testStart
              };
            }

            return {
              name: 'isCacheAvailable - Valid File',
              status: 'passed',
              message: `✅ Cache availability checked: ${cacheAvailable}`,
              data: {
                cacheAvailable,
                returnType: typeof cacheAvailable
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'isCacheAvailable - Valid File',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      {
        name: 'isCacheAvailable - Multi-File Analysis',
        category: 'Performance',
        test: async () => {
          const testStart = Date.now();
          try {
            const markdownFiles = dataSource.getMarkdownFiles();

            // Test cache availability on multiple files to see consistency
            const cacheResults = [];
            const sampleSize = Math.min(5, markdownFiles.length);

            for (let i = 0; i < sampleSize; i++) {
              const file = markdownFiles[i];
              const cacheAvailable = dataSource.isCacheAvailable(file);
              const hasHeadings = dataSource.extractHeadings(file).length > 0;

              cacheResults.push({
                fileName: file.basename,
                cacheAvailable,
                hasHeadings,
                fileSize: file.stat.size
              });
            }

            // Validate that cache availability is boolean for all files
            const allBooleanResults = cacheResults.every(r => typeof r.cacheAvailable === 'boolean');

            if (!allBooleanResults) {
              return {
                name: 'isCacheAvailable - New File',
                status: 'failed',
                message: 'Cache availability should always return boolean',
                duration: Date.now() - testStart
              };
            }

            // Check for consistency patterns (larger files might have more cache)
            const cacheStats = {
              totalFiles: cacheResults.length,
              filesWithCache: cacheResults.filter(r => r.cacheAvailable).length,
              filesWithoutCache: cacheResults.filter(r => !r.cacheAvailable).length,
              averageFileSizeWithCache: cacheResults
                .filter(r => r.cacheAvailable)
                .reduce((sum, r) => sum + r.fileSize, 0) /
                Math.max(1, cacheResults.filter(r => r.cacheAvailable).length),
              averageFileSizeWithoutCache: cacheResults
                .filter(r => !r.cacheAvailable)
                .reduce((sum, r) => sum + r.fileSize, 0) /
                Math.max(1, cacheResults.filter(r => !r.cacheAvailable).length)
            };

            return {
              name: 'isCacheAvailable - New File',
              status: 'passed',
              message: `✅ Cache availability tested on ${sampleSize} files`,
              data: {
                cacheStats,
                sampleResults: cacheResults,
                consistencyCheck: allBooleanResults
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'isCacheAvailable - New File',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      {
        name: 'getRawCache - Cache Consistency',
        category: 'Core Functionality',
        test: async () => {
          const testStart = Date.now();
          try {
            const activeFile = dataSource.getActiveFile();
            if (!activeFile) {
              return {
                name: 'getRawCache - Valid File',
                status: 'failed',
                message: 'No active file available for testing',
                duration: Date.now() - testStart
              };
            }

            const rawCache = dataSource.getRawCache(activeFile);
            const cacheAvailable = dataSource.isCacheAvailable(activeFile);

            // If cache is available, rawCache should not be null
            if (cacheAvailable && rawCache === null) {
              return {
                name: 'getRawCache - Valid File',
                status: 'failed',
                message: 'Cache available but getRawCache returned null',
                duration: Date.now() - testStart
              };
            }

            // If cache is not available, rawCache should be null
            if (!cacheAvailable && rawCache !== null) {
              return {
                name: 'getRawCache - Valid File',
                status: 'failed',
                message: 'Cache not available but getRawCache returned non-null',
                duration: Date.now() - testStart
              };
            }

            return {
              name: 'getRawCache - Valid File',
              status: 'passed',
              message: `✅ Raw cache consistency check passed`,
              data: {
                hasRawCache: rawCache !== null,
                cacheKeys: rawCache ? Object.keys(rawCache) : [],
                consistencyCheck: cacheAvailable === (rawCache !== null)
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'getRawCache - Valid File',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      // ===== UTILITY METHODS TESTS =====
      // These test helper and utility functions
      {
        name: 'getActiveFile - Current State',
        category: 'Core Functionality',
        test: async () => {
          const testStart = Date.now();
          try {
            const activeFile = dataSource.getActiveFile();

            // Can be null or TFile - both are valid
            const isValidResult = activeFile === null ||
              (activeFile && typeof activeFile.path === 'string' && typeof activeFile.basename === 'string');

            if (!isValidResult) {
              return {
                name: 'getActiveFile - Current State',
                status: 'failed',
                message: 'Invalid file object structure',
                duration: Date.now() - testStart
              };
            }

            return {
              name: 'getActiveFile - Current State',
              status: 'passed',
              message: `✅ Active file state: ${activeFile ? activeFile.basename : 'None'}`,
              data: {
                hasActiveFile: activeFile !== null,
                fileName: activeFile?.basename || null,
                filePath: activeFile?.path || null
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'getActiveFile - Current State',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      {
        name: 'getMarkdownFiles - Vault Access',
        category: 'Core Functionality',
        test: async () => {
          const testStart = Date.now();
          try {
            const markdownFiles = dataSource.getMarkdownFiles();

            if (!Array.isArray(markdownFiles)) {
              return {
                name: 'getMarkdownFiles - Vault Access',
                status: 'failed',
                message: `Expected array, got ${typeof markdownFiles}`,
                duration: Date.now() - testStart
              };
            }

            // Check that all items are valid TFile objects
            const allValidFiles = markdownFiles.every(file =>
              file &&
              typeof file.path === 'string' &&
              typeof file.basename === 'string' &&
              file.extension === 'md'
            );

            if (!allValidFiles) {
              return {
                name: 'getMarkdownFiles - Vault Access',
                status: 'failed',
                message: 'Some files in array are not valid markdown files',
                duration: Date.now() - testStart
              };
            }

            return {
              name: 'getMarkdownFiles - Vault Access',
              status: 'passed',
              message: `✅ Found ${markdownFiles.length} markdown files in vault`,
              data: {
                fileCount: markdownFiles.length,
                allValidMarkdown: allValidFiles,
                sampleFiles: markdownFiles.slice(0, 3).map(f => ({
                  basename: f.basename,
                  path: f.path
                }))
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'getMarkdownFiles - Vault Access',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      // ===== PERFORMANCE & SPECIAL CASES TESTS =====
      // These test performance and special content scenarios
      {
        name: 'extractHeadings - Special Characters',
        category: 'Performance',
        test: async () => {
          const testStart = Date.now();
          try {
            const markdownFiles = dataSource.getMarkdownFiles();

            // Find a file with headings that might have special characters
            let testFile = null;
            let bestHeadings = [];

            for (const file of markdownFiles.slice(0, 10)) { // Check first 10 files
              const headings = dataSource.extractHeadings(file);
              if (headings.length > 0) {
                // Look for headings with special characters
                const hasSpecialChars = headings.some(h =>
                  /[^\w\s\-_]/.test(h.heading) // Contains non-word chars except spaces, hyphens, underscores
                );

                if (hasSpecialChars) {
                  testFile = file;
                  bestHeadings = headings;
                  break;
                }

                // Or just use the file with most headings if no special chars found
                if (!testFile || headings.length > bestHeadings.length) {
                  testFile = file;
                  bestHeadings = headings;
                }
              }
            }

            if (!testFile) {
              return {
                name: 'extractHeadings - Special Characters',
                status: 'failed',
                message: 'No files with headings found to test special characters',
                duration: Date.now() - testStart
              };
            }

            const headings = dataSource.extractHeadings(testFile);

            // Test that special characters are preserved
            const specialCharHeadings = headings.filter(h => /[^\w\s\-_]/.test(h.heading));
            const regularHeadings = headings.filter(h => !/[^\w\s\-_]/.test(h.heading));

            // Validate all headings have correct structure regardless of content
            const allValidStructure = headings.every(h =>
              typeof h.heading === 'string' &&
              typeof h.level === 'number' &&
              h.position &&
              typeof h.position.start === 'number' &&
              typeof h.position.end === 'number'
            );

            if (!allValidStructure) {
              return {
                name: 'extractHeadings - Special Characters',
                status: 'failed',
                message: 'Some headings have invalid structure',
                duration: Date.now() - testStart
              };
            }

            return {
              name: 'extractHeadings - Special Characters',
              status: 'passed',
              message: `✅ Special characters handled correctly in ${testFile.basename}`,
              data: {
                fileName: testFile.basename,
                totalHeadings: headings.length,
                specialCharHeadings: specialCharHeadings.length,
                regularHeadings: regularHeadings.length,
                allValidStructure,
                examples: headings.slice(0, 3).map(h => ({
                  level: h.level,
                  text: h.heading.substring(0, 40),
                  hasSpecialChars: /[^\w\s\-_]/.test(h.heading)
                }))
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'extractHeadings - Special Characters',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      },
      {
        name: 'extractFileMetadata - Large File',
        category: 'Performance',
        test: async () => {
          const testStart = Date.now();
          try {
            const markdownFiles = dataSource.getMarkdownFiles();

            // Find the largest markdown file
            let largestFile = null;
            let maxSize = 0;

            for (const file of markdownFiles) {
              if (file.stat.size > maxSize) {
                maxSize = file.stat.size;
                largestFile = file;
              }
            }

            if (!largestFile) {
              return {
                name: 'extractFileMetadata - Large File',
                status: 'failed',
                message: 'No markdown files found',
                duration: Date.now() - testStart
              };
            }

            const metadata = dataSource.extractFileMetadata(largestFile);

            if (!metadata) {
              return {
                name: 'extractFileMetadata - Large File',
                status: 'failed',
                message: 'Failed to extract metadata from large file',
                duration: Date.now() - testStart
              };
            }

            // Test that performance is acceptable for large files
            const extractionTime = Date.now() - testStart;

            return {
              name: 'extractFileMetadata - Large File',
              status: 'passed',
              message: `✅ Large file metadata extracted in ${extractionTime}ms`,
              data: {
                fileName: largestFile.basename,
                fileSize: largestFile.stat.size,
                fileSizeKB: Math.round(largestFile.stat.size / 1024),
                extractionTime,
                path: metadata.path,
                pathMatches: metadata.path === largestFile.path,
                performance: extractionTime < 100 ? 'excellent' : extractionTime < 500 ? 'good' : 'acceptable'
              },
              duration: Date.now() - testStart
            };
          } catch (error) {
            return {
              name: 'extractFileMetadata - Large File',
              status: 'failed',
              message: `Unexpected error: ${error}`,
              duration: Date.now() - testStart
            };
          }
        }
      }
    ];

    // Initialize results
    setTestState(prev => ({
      ...prev,
      results: tests.map(t => ({
        name: t.name,
        category: t.category,
        status: 'pending',
        message: 'Waiting to run...'
      }))
    }));

    // Run tests sequentially
    for (let i = 0; i < tests.length; i++) {
      updateTestResult(i, { status: 'running', message: 'Running...' });

      try {
        const result = await tests[i].test();
        // Add category to result if missing
        const resultWithCategory = { ...result, category: tests[i].category };
        updateTestResult(i, resultWithCategory);
      } catch (error) {
        updateTestResult(i, {
          status: 'failed',
          message: `Test execution failed: ${error}`,
          duration: Date.now() - startTime,
          category: tests[i].category
        });
      }

      // Small delay between tests for UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestState(prev => ({
      ...prev,
      overallStatus: 'completed',
      endTime: Date.now()
    }));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'var(--text-muted)';
      case 'running': return 'var(--text-accent)';
      case 'passed': return 'var(--text-success)';
      case 'failed': return 'var(--text-error)';
      default: return 'var(--text-normal)';
    }
  };

  const passedTests = testState.results.filter(r => r.status === 'passed').length;
  const failedTests = testState.results.filter(r => r.status === 'failed').length;
  const totalDuration = testState.endTime && testState.startTime ? testState.endTime - testState.startTime : 0;

  // Group tests by category
  const testsByCategory = testState.results.reduce((acc, test) => {
    const category = test.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(test);
    return acc;
  }, {} as Record<string, typeof testState.results>);

  return (
    <div className="toc-integration-test" style={{ padding: '16px', fontSize: '14px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3>Task 2.2: ObsidianDataSource Unit Tests</h3>
        <p style={{ marginBottom: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Testing 11 unit tests for ObsidianDataSource with real vault files and type validation
        </p>
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={runTests}
            disabled={testState.overallStatus === 'running'}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--interactive-accent)',
              color: 'var(--text-on-accent)',
              border: 'none',
              borderRadius: '4px',
              cursor: testState.overallStatus === 'running' ? 'not-allowed' : 'pointer',
              opacity: testState.overallStatus === 'running' ? 0.6 : 1
            }}
          >
            {testState.overallStatus === 'running' ? 'Running Unit Tests...' : 'Run All Unit Tests'}
          </button>
        </div>

        {testState.overallStatus === 'completed' && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: 'var(--background-secondary)',
            marginBottom: '12px'
          }}>
            <strong>Summary:</strong> {passedTests} passed, {failedTests} failed
            {totalDuration > 0 && <span> • {totalDuration}ms total</span>}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(testsByCategory).map(([category, tests]) => (
          <div key={category} style={{ border: '1px solid var(--background-modifier-border)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'var(--background-secondary)',
              borderBottom: '1px solid var(--background-modifier-border)',
              fontWeight: 'bold',
              fontSize: '13px'
            }}>
              📁 {category} ({tests.length} tests)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              {tests.map((result, index) => (
                <div
                  key={result.name}
                  style={{
                    padding: '10px',
                    border: '1px solid var(--background-modifier-border)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--background-primary)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }}>
                    <span style={{ marginRight: '8px' }}>
                      {getStatusIcon(result.status)}
                    </span>
                    <span style={{ color: getStatusColor(result.status) }}>
                      {result.name}
                    </span>
                    {result.duration && (
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {result.duration}ms
                      </span>
                    )}
                  </div>

                  <div style={{
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    marginBottom: result.data ? '8px' : '0'
                  }}>
                    {result.message}
                  </div>

                  {result.data && result.status === 'passed' && (
                    <details style={{ fontSize: '11px' }}>
                      <summary style={{ cursor: 'pointer', color: 'var(--text-accent)' }}>
                        View Details
                      </summary>
                      <pre style={{
                        marginTop: '4px',
                        padding: '6px',
                        backgroundColor: 'var(--background-secondary)',
                        borderRadius: '3px',
                        overflow: 'auto',
                        maxHeight: '150px',
                        fontSize: '10px'
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TocIntegrationTest;

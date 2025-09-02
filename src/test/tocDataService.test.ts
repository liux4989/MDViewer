/**
 * TocRepository Error Handling Tests - Phase 2 Refactor
 * Tests for error handling in TocRepository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TocRepository, ObsidianDataSource } from '../../ui/schemas';
import type { IObsidianDataSource, TFile } from 'obsidian';

// Mock Data Source
const mockDataSource = {
  getActiveFile: vi.fn(),
  getMarkdownFiles: vi.fn(),
  extractFileMetadata: vi.fn(),
  extractHeadings: vi.fn(),
  isCacheAvailable: vi.fn(),
  getRawCache: vi.fn()
} as unknown as IObsidianDataSource;

// Type the mock functions properly
const mockGetActiveFile = mockDataSource.getActiveFile as any;
const mockGetMarkdownFiles = mockDataSource.getMarkdownFiles as any;
const mockExtractFileMetadata = mockDataSource.extractFileMetadata as any;
const mockExtractHeadings = mockDataSource.extractHeadings as any;

describe('TocRepository Error Handling', () => {
  let repository: TocRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new TocRepository(mockDataSource);
  });

  describe('getCurrentFileHeadings', () => {
    it('should handle no active file', async () => {
      mockGetActiveFile.mockReturnValue(null);

      const result = await repository.getCurrentFileHeadings();

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('NO_ACTIVE_FILE');
      expect(result.error.message).toContain('No active file available');
    });

    it('should handle Obsidian API errors gracefully', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetActiveFile.mockReturnValue(mockFile);

      // Mock data source to throw error
      mockExtractFileMetadata.mockImplementation(() => {
        throw new Error('Data source error');
      });

      const result = await repository.getCurrentFileHeadings();

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('TRANSFORMATION_FAILED');
      expect(result.error.originalError).toBeInstanceOf(Error);
    });
  });

  describe('getFileHeadings', () => {
    it('should handle file not found', async () => {
      mockGetMarkdownFiles.mockReturnValue([]);

      const result = await repository.getFileHeadings('nonexistent.md');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('FILE_NOT_FOUND');
    });

    it('should handle invalid file metadata', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetMarkdownFiles.mockReturnValue([mockFile]);

      // Mock invalid metadata extraction
      mockExtractFileMetadata.mockReturnValue(null);

      const result = await repository.getFileHeadings('test.md');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('INVALID_DATA');
    });

    it('should handle transformation failures', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetMarkdownFiles.mockReturnValue([mockFile]);

      // Mock successful metadata but failed headings extraction
      mockExtractFileMetadata.mockReturnValue({ path: 'test.md' });
      mockExtractHeadings.mockReturnValue(null);

      const result = await repository.getFileHeadings('test.md');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('INVALID_DATA');
    });

    it('should handle validation failures', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetMarkdownFiles.mockReturnValue([mockFile]);

      mockExtractFileMetadata.mockReturnValue({ path: 'test.md' });
      mockExtractHeadings.mockReturnValue([]);

      // Mock the transformation to return a TocFile but validation to fail
      vi.mock('../../ui/repositories/tocMappers', () => ({
        obsidianToTocFile: vi.fn().mockReturnValue({
          path: 'test.md',
          headings: [] // Valid structure but we'll make validation fail
        }),
        validateTocFile: vi.fn().mockReturnValue(false)
      }));

      const result = await repository.getFileHeadings('test.md');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('VALIDATION_FAILED');
    });
  });



  describe('Error Recovery', () => {
    it('should handle API errors gracefully', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetMarkdownFiles.mockReturnValue([mockFile]);

      // Mock extractFileMetadata to throw an error
      mockExtractFileMetadata.mockImplementation(() => {
        throw new Error('API Error');
      });

      const result = await repository.getFileHeadings('test.md');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('TRANSFORMATION_FAILED');
      expect(result.error.originalError).toBeInstanceOf(Error);
    });

    it('should handle null file input gracefully', async () => {
      mockGetMarkdownFiles.mockReturnValue([]);

      const result = await repository.getFileHeadings('nonexistent.md');

      expect(result.ok).toBe(false);
      expect(result.error.code).toBe('FILE_NOT_FOUND');
    });
  });
});

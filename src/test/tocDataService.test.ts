/**
 * TocDataService Error Handling Tests - Task 2.3
 * Tests for error handling in TocDataService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TocDataService } from '../../ui/services/tocDataService';
import type { App, TFile } from 'obsidian';

// Mock Obsidian App
const mockApp = {
  workspace: {
    getActiveFile: vi.fn()
  },
  vault: {
    getAbstractFileByPath: vi.fn(),
    getMarkdownFiles: vi.fn()
  },
  metadataCache: {
    getFileCache: vi.fn()
  }
} as unknown as App;

// Type the mock functions properly
const mockGetActiveFile = mockApp.workspace.getActiveFile as any;
const mockGetAbstractFileByPath = mockApp.vault.getAbstractFileByPath as any;
const mockGetMarkdownFiles = mockApp.vault.getMarkdownFiles as any;
const mockGetFileCache = mockApp.metadataCache.getFileCache as any;

describe('TocDataService Error Handling', () => {
  let service: TocDataService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TocDataService(mockApp);
  });

  describe('getCurrentFileHeadings', () => {
    it('should handle no active file', async () => {
      mockGetActiveFile.mockReturnValue(null);

      const result = await service.getCurrentFileHeadings();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('NO_ACTIVE_FILE');
      expect(result.error?.message).toContain('No active file available');
    });

    it('should handle Obsidian API errors gracefully', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetActiveFile.mockReturnValue(mockFile);

      // Mock metadataCache to throw error
      mockGetFileCache.mockImplementation(() => {
        throw new Error('Metadata cache error');
      });

      const result = await service.getCurrentFileHeadings();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('TRANSFORMATION_FAILED');
      expect(result.error?.originalError).toBeInstanceOf(Error);
    });
  });

  describe('getFileHeadings', () => {
    it('should handle file not found', async () => {
      mockGetAbstractFileByPath.mockReturnValue(null);
      mockGetMarkdownFiles.mockReturnValue([]);

      const result = await service.getFileHeadings('nonexistent.md');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('FILE_NOT_FOUND');
    });

    it('should handle invalid file metadata', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetAbstractFileByPath.mockReturnValue(mockFile);

      // Mock invalid metadata extraction
      const originalService = service as any;
      originalService.obsidianService.extractFileMetadata = vi.fn().mockReturnValue(null);

      const result = await service.getFileHeadings('test.md');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('INVALID_DATA');
    });

    it('should handle transformation failures', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetAbstractFileByPath.mockReturnValue(mockFile);
      mockGetFileCache.mockReturnValue({});

      // Mock successful metadata but failed headings extraction
      const originalService = service as any;
      originalService.obsidianService.extractFileMetadata = vi.fn().mockReturnValue({ path: 'test.md' });
      originalService.obsidianService.extractHeadings = vi.fn().mockReturnValue(null);

      const result = await service.getFileHeadings('test.md');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('INVALID_DATA');
    });

    it('should handle validation failures', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetAbstractFileByPath.mockReturnValue(mockFile);
      mockGetFileCache.mockReturnValue({});

      const originalService = service as any;
      originalService.obsidianService.extractFileMetadata = vi.fn().mockReturnValue({ path: 'test.md' });
      originalService.obsidianService.extractHeadings = vi.fn().mockReturnValue([]);

      // Mock the transformation to return a TocFile but validation to fail
      vi.mock('../../ui/services/tocDataTransformation', () => ({
        obsidianToTocFile: vi.fn().mockReturnValue({
          path: 'test.md',
          headings: [] // Valid structure but we'll make validation fail
        }),
        validateTocFile: vi.fn().mockReturnValue(false)
      }));

      const result = await service.getFileHeadings('test.md');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('VALIDATION_FAILED');
    });
  });



  describe('Error Recovery', () => {
    it('should handle API errors gracefully', async () => {
      const mockFile = { path: 'test.md' } as TFile;
      mockGetAbstractFileByPath.mockReturnValue(mockFile);
      mockGetFileCache.mockReturnValue({});

      const originalService = service as any;

      // Mock extractFileMetadata to throw an error
      originalService.obsidianService.extractFileMetadata = vi.fn().mockImplementation(() => {
        throw new Error('API Error');
      });

      const result = await service.getFileHeadings('test.md');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('TRANSFORMATION_FAILED');
      expect(result.error?.originalError).toBeInstanceOf(Error);
    });

    it('should handle null file input gracefully', async () => {
      mockGetAbstractFileByPath.mockReturnValue(null);
      mockGetMarkdownFiles.mockReturnValue([]);

      const result = await service.getFileHeadings('nonexistent.md');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('FILE_NOT_FOUND');
    });
  });
});

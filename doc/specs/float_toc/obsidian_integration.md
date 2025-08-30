# Obsidian API Survey: File Metadata & Heading Extraction

## Overview
This document captures the results of surveying Obsidian's official APIs for extracting headings via cached metadata, with a fallback approach via parsing the file content with file-relative pai.

## Core APIs Surveyed

### 1. MetadataCache API
**Primary API for heading and metadata extraction**

- **Key Method**: `app.metadataCache.getFileCache(file: TFile): CachedMetadata | null`
- **Purpose**: Retrieves cached metadata for a file including frontmatter, headings, sections, links, tags, etc.
- **Performance**: Fast, cached results - preferred over manual parsing
- **Documentation**: [MetadataCache API](https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache)

**Key Properties in CachedMetadata:**
```typescript
interface CachedMetadata {
  frontmatter?: Record<string, any>;      // YAML frontmatter as object
  headings?: HeadingCache[];              // Array of headings with position info
  sections?: SectionCache[];              // Document sections
  links?: LinkCache[];                    // Internal/external links
  tags?: TagCache[];                      // Tags in the file
  blocks?: Record<string, BlockCache>;    // Block references
  listItems?: ListItem[];                 // List items
}
```

### 2. HeadingCache Structure
**Official heading data structure**

```typescript
interface HeadingCache {
  heading: string;        // The heading text (e.g., "My Heading")
  level: number;          // Heading level 1-6 (H1-H6)
  position: {
    start: { line: number; col: number; offset: number; };
    end: { line: number; col: number; offset: number; };
  };
}
```

## Fallback Approach: Manual Parsing (if needed)



### 1. Vault API
**File system operations**

- **Key Methods**:
  - `app.vault.getMarkdownFiles(): TFile[]` - Get all markdown files
  - `app.vault.getAbstractFileByPath(path: string): TAbstractFile | null` - Get file by path
  - `app.vault.cachedRead(file: TFile): Promise<string>` - Read file content (cached)
  - `app.vault.read(file: TFile): Promise<string>` - Read file content (fresh)

- **Documentation**: [Vault API](https://docs.obsidian.md/Reference/TypeScript+API/Vault)

### 2. Workspace API
**Active file and UI state**

- **Key Methods**:
  - `app.workspace.getActiveFile(): TFile | null` - Get currently active file
  - `app.workspace.on('file-open', callback)` - Listen for file switches

## Recommended Implementation Pattern

### Primary Approach: Use MetadataCache
```typescript
import type { App, TFile } from 'obsidian';
import type { TocHeading, TocFile, TocData } from './toc';

function mapHeadingsToToc(headings: HeadingCache[]): TocHeading[] {
  return (headings ?? []).map(h => ({
    id: `${h.position.start.line}`, // Use line number as stable ID
    text: h.heading,
    level: h.level,
    line: h.position.start.line,
  }));
}

export function getTocData(app: App, file: TFile | null): TocData | null {
  if (!file) return null;

  const cache = app.metadataCache.getFileCache(file);
  if (!cache) return null;

  const tocHeadings = mapHeadingsToToc(cache.headings ?? []);
  const tocFile: TocFile = {
    path: file.path,
    headings: tocHeadings
  };

  return {
    file: tocFile,
    headings: tocHeadings
  };
}
```

### Fallback Approach: Manual Parsing (if needed)
```typescript
async function parseHeadingsFallback(app: App, file: TFile): Promise<TocHeading[]> {
  const content = await app.vault.cachedRead(file);
  const lines = content.split('\n');
  const headings: TocHeading[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = /^(#{1,6})\s+(.*)$/.exec(lines[i]);
    if (match) {
      headings.push({
        id: `${i}`,
        text: match[2].trim(),
        level: match[1].length,
        line: i,
      });
    }
  }

  return headings;
}
```

## Event Handling for Real-time Updates

### Recommended Events to Listen
```typescript
const detachFunctions: Array<() => void> = [];

function setupTocListeners(app: App, onFileChange: (file: TFile) => void) {
  // Active file changes
  detachFunctions.push(
    app.workspace.on('file-open', (file) => {
      if (file instanceof TFile) onFileChange(file);
    })
  );

  // Metadata updates (file edits)
  detachFunctions.push(
    app.metadataCache.on('changed', (file) => {
      if (file instanceof TFile) onFileChange(file);
    })
  );

  // Initial metadata resolution
  detachFunctions.push(
    app.metadataCache.on('resolved', () => {
      const activeFile = app.workspace.getActiveFile();
      if (activeFile) onFileChange(activeFile);
    })
  );

  // File system changes
  detachFunctions.push(
    app.vault.on('modify', (file) => {
      if (file instanceof TFile) onFileChange(file);
    })
  );

  detachFunctions.push(
    app.vault.on('rename', (file) => {
      if (file instanceof TFile) onFileChange(file);
    })
  );
}

function cleanupListeners() {
  detachFunctions.splice(0).forEach(detach => detach());
}
```

## File Metadata Access

### File Statistics
```typescript
function getFileStats(file: TFile) {
  return {
    path: file.path,
    basename: file.basename,
    extension: file.extension,
    stat: file.stat, // { ctime, mtime, size }
  };
}
```

## Best Practices & Considerations

### 1. Prefer Cached Data
- Use `metadataCache.getFileCache()` for headings - it's faster and more reliable than parsing
- Use `vault.cachedRead()` for content when possible

### 2. Handle Null/Undefined Cases
- `getFileCache()` may return `null` during file loading
- Always check for `headings` array existence
- Use `metadataCache.on('resolved')` for initial data load

### 3. Event Debouncing
- Multiple events may fire rapidly - consider debouncing UI updates
- Use `requestAnimationFrame` or setTimeout for smooth updates

### 4. Race Conditions
- Avoid direct file writing that could conflict with Obsidian's cache

### 5. Memory Management
- Clean up event listeners when component unmounts
- Use weak references if caching file data


## References

- [Obsidian API Documentation](https://docs.obsidian.md/Reference/TypeScript+API/)
- [MetadataCache API](https://docs.obsidian.md/Reference/TypeScript+API/MetadataCache)
- [Vault API](https://docs.obsidian.md/Reference/TypeScript+API/Vault)

- [Workspace API](https://docs.obsidian.md/Reference/TypeScript+API/Workspace)


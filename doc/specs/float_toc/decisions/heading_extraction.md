# Obsidian API Survey: File Metadata & Heading Extraction

# Overview
This document captures the results of surveying Obsidian's official APIs for extracting headings via cached metadata, with a fallback approach via parsing the file content with file-relative pai.


# Discovery
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



# Decision
we choose the metadataCache API for heading extraction because it is the official API and it is fast and cached.
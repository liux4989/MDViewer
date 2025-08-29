# Phase 1: Core Setup

## Task 1: Initialize React Integration Obsidian [AI]


1. init obsidian plugin environments
2. init react integration and app context with obsidian app
3. init thrid plugins : tanstack-query , vitest , zod
4. init styling system with obsidian css variables

# Success Criteria
1. obsidian community plugin is initialized  [Human Test]


# Phase 2: Data Layer Implementation

## Task 2.1: Define Core Interfaces [AI]

### Subtasks:
1. Create TOC data structures
   - `TocHeading` (id, text, level, position)
   - `TocFile` (path, headings, metadata)
   - `TocData` (file, headings, activeHeading)
2. Create Obsidian interfaces
   - `ObsidianFile` (metadata from metadataCache)
   - `ObsidianHeading` (raw heading data)
3. Add validation schemas (Zod optional)

### Success Criteria:
- ✅ Interfaces compile without errors
- ✅ Unit tests pass with mock data

## Task 2.2: Obsidian Data Integration [AI]

### Subtasks:
1. Survey Obsidian APIs (metadataCache, vault, workspace)
2. Implement file metadata extraction
3. Implement heading extraction
4. Create  integration test via Obsidian command 

### Success Criteria:
- ✅ Real Obsidian environment testing works [Human]
- ✅ Mock tests cover basic error cases

## Task 2.3: Data Transformation & Service [AI]

### Subtasks:
1. Create conversion functions
   - `obsidianToTocHeading()`
   - `obsidianToTocFile()`
2. Add data validation (levels 1-3, text sanitization)
3. Build `TocDataService` class
   - `getCurrentFileHeadings()`
   - `getFileHeadings(filePath)`
   - `refreshHeadings()`

### Success Criteria:
- ✅ Mock data transforms correctly
- ✅ Basic error handling works




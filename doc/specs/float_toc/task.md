# Phase 1: Core Setup

## Task 1: Initialize React Integration Obsidian [AI]

### Subtasks:
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

### Success Criteria:
- ✅ Interfaces compile without errors
- ✅ Unit tests pass with mock data
- ✅ **COMPLETED**: Task 2.1 finished and committed

Task History : Execute task2(e65ea9e2-c854-4ddb-a915-dd5140d52b8f)


## Task 2.2: Obsidian Data Integration [AI]

### Subtasks:
1. Survey Obsidian APIs (metadataCache, vault, workspace)
2. Implement file metadata extraction api with *ObsidianFile* interface
3. Implement heading extraction api with *ObsidianHeading* interface
4. Add integration tests of ObsidianDataService methods in Obsidian env(test in the Obsidian view and display the test status  )

### Success Criteria:
- ✅ Real Obsidian environment testing works [Human]
- ✅ Mock tests cover basic error cases
- ✅ **COMPLETED**: Task 2.2 finished and committed

## Task 2.3: Data Transformation & Service [AI]

### Subtasks:
1. Create conversion functions
   - `obsidianToTocHeading()`
   - `obsidianToTocFile()`
2. Add data validation (levels 1-3, text sanitization)
3. Build `TocDataService` class
   - `getCurrentFileHeadings()`
   - `getFileHeadings(filePath)`

### Success Criteria:
- ✅ Mock data transforms correctly
- ✅ Basic error handling works


# Phase 3: Repository Layer

## Task 3.1: Define Domain Models [AI]

### Subtasks:
1. Create domain-specific TocHeading model
   - Extend base TocHeading with domain logic
   - Add methods for heading manipulation (getLevel(), getText(), getId())
   - Implement heading hierarchy logic
2. Create TocFile domain model
   - Business logic for file operations
   - Heading collection management
   - File metadata handling
3. Create TocData domain model
   - Active heading tracking
   - State management for current file
   - Navigation state handling

### Success Criteria:
- ✅ Domain models encapsulate business logic
- ✅ Unit tests cover domain behavior
- ✅ Models are immutable where appropriate


## Task 3.2: Repository Pattern Implementation [AI]

### Subtasks:
1. Create TocHeadingRepository interface
   - `findById(id: string): TocHeading | null`
   - `findByFile(filePath: string): TocHeading[]`
   - `findByLevel(level: number): TocHeading[]`
   - `getActiveHeading(): TocHeading | null`
2. Implement TocHeadingRepositoryImpl
   - Wrap TocDataService with repository pattern
   - Add caching layer for performance
   - Implement error handling and logging
3. Create TocFileRepository interface
   - `getCurrentFile(): TocFile | null`
   - `getFileByPath(path: string): TocFile | null`
   - `getAllFiles(): TocFile[]`

### Success Criteria:
- ✅ Repository interfaces are well-defined
- ✅ Implementation provides clean data access
- ✅ Caching improves performance


## Task 3.3: API Layer Creation [AI]

### Subtasks:
1. Create public API interfaces
   - `getHeading(id: string): Promise<TocHeading | null>`
   - `getHeadingsByFile(filePath: string): Promise<TocHeading[]>`
   - `getCurrentFileHeadings(): Promise<TocHeading[]>`
   - `getActiveHeading(): Promise<TocHeading | null>`
2. Implement API service layer
   - Wrap repository calls with API contracts
   - Add input validation and sanitization
   - Implement consistent error responses
3. Add integration tests
   - Test API endpoints with mock repositories
   - Verify error handling and edge cases
   - Test performance with large datasets

### Success Criteria:
- ✅ Public APIs are stable and documented
- ✅ Error handling is consistent across APIs
- ✅ Integration tests verify end-to-end functionality




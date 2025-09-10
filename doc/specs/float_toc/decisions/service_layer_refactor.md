# Decision: Service Layer Refactor - Single Responsibility Services

**Date**: 2024-12-19  
**Status**: Accepted  
**Context**: Architecture Cleanup - Phase 3  

## Problem

After removing the repository layer, we identified additional architectural issues:

1. **Data Source Mixed Responsibilities**: The data source was handling both raw data extraction AND UI-specific data composition (`getCurrentFileTocData()` creating `TocData`)

2. **TocSyncEffects Violated Single Responsibility**: One class was handling 4 different concerns:
   - File change management (file open/change events)
   - Scroll state management (scroll start/stop tracking) 
   - Active heading detection (scroll position calculation)
   - Edit state management (editor change events)

3. **UI Logic in Data Layer**: Data transformation and composition logic was mixed between data source and utilities, making testing and maintenance difficult

## Analysis

### Current Architecture Problems

**Data Source Issues:**
- `getCurrentFileTocData()` was creating UI-specific `TocData` structures
- Mixed raw data extraction with UI data composition
- Data source should focus only on Obsidian API interactions

**TocSyncEffects Issues:**
- 167 lines handling 4 different responsibilities
- Difficult to test individual concerns
- Changes to one concern affected others
- Violated Single Responsibility Principle

**UI Logic Placement:**
- Data transformation scattered between data source and utilities
- No clear place for UI-specific data composition
- Business logic mixed with data extraction

### Architecture Violations

```typescript
// BEFORE: Mixed responsibilities
class TocSyncEffects {
  // File management
  handleFileRefresh() { /* 20 lines */ }
  
  // Scroll management  
  onEditorScrollStart() { /* 5 lines */ }
  onEditorScrollStop() { /* 30 lines */ }
  
  // Edit management
  onEditorChangeIdle() { /* 25 lines */ }
  
  // Active heading detection
  getCurrentHeading() { /* 10 lines */ }
}

// Data source doing UI work
class ObsidianDataSource {
  getCurrentFileTocData(): TocData { /* Creates UI structure */ }
}
```

## Decision

**Refactor the service layer to follow Single Responsibility Principle** with focused services and proper separation of concerns.

### New Architecture

```
Business Logic → ServiceCoordinator → Focused Services → DataSource (raw data only)
                                   ↘ DataComposer (UI logic)
```

## Implementation

### 1. Simplified Data Source

**Removed UI-specific methods:**
- `getCurrentFileTocData()` - UI data composition
- `getFileTocData()` - UI data transformation

**Kept only raw data extraction:**
- `getActiveFile()`, `extractHeadings()`, `extractFileMetadata()`
- Pure Obsidian API interactions
- No UI concerns

### 2. Created TocDataComposer

**Purpose**: Handle UI data transformation and composition

```typescript
interface ITocDataComposer {
  composeTocData(tocFile: TocFile, activeHeadingId?: string): TocData;
  transformFileToToc(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null;
}
```

**Responsibilities:**
- Transform raw Obsidian data to TOC format
- Compose UI-specific data structures (`TocData`)
- Handle data validation and error cases
- Separate UI concerns from data extraction

### 3. Split TocSyncEffects into Focused Services

#### TocFileService (`ui/services/tocFileService.ts`)
**Single Responsibility**: File change management and data loading

```typescript
class TocFileService {
  // Handle file open/change events
  // Load and transform file data  
  // Update TOC store with file data
}
```

#### TocScrollService (`ui/services/tocScrollService.ts`) 
**Single Responsibility**: Scroll and active heading management

```typescript
class TocScrollService {
  // Handle scroll events
  // Update mode store (scrolling state)
  // Calculate and update active heading using line-based position tracking
}
```

#### TocEditService (`ui/services/tocEditService.ts`)
**Single Responsibility**: Edit state management

```typescript
class TocEditService {
  // Handle editor change events
  // Background data refresh without UI disruption
}
```

### 4. Created Service Coordinator

**Purpose**: Orchestrate all services with unified interface

```typescript
class TocServiceCoordinator {
  constructor(
    events: IObsidianEvents,
    dataSource: IObsidianDataSource, 
    tocStore: ITocStoreAdapter,
    modeStore: ITocModeStoreAdapter
  );
  
  init(): () => void; // Initialize all services
  loadInitialData(): Promise<void>; // Load initial TOC data
}
```

### Files Changed

**Created:**
- `ui/services/tocDataComposer.ts` - UI data transformation and composition
- `ui/services/tocFileService.ts` - File change management (33 lines)
- `ui/services/tocScrollService.ts` - Scroll and active heading management (42 lines)
- `ui/services/tocEditService.ts` - Edit state management (31 lines)
- `ui/services/tocServiceCoordinator.ts` - Service orchestration (35 lines)

**Removed:**
- `ui/services/tocSyncEffects.ts` - Replaced by focused services (was 167 lines)

**Modified:**
- `ui/datasources/obsidianDataSource.ts` - Removed UI-specific methods
- `ui/stores/tocProvidersWithEffects.tsx` - Updated to use service coordinator

## Benefits

### 1. Single Responsibility Principle
- Each service has one clear, focused responsibility
- Easy to understand what each service does
- Changes to one concern don't affect others

### 2. Better Testability
- Can test each service independently
- Mock dependencies more easily
- Focused test cases for specific concerns

### 3. Improved Maintainability
- Smaller, focused classes (30-40 lines each vs 167 lines)
- Clear separation of concerns
- Easy to modify or extend individual services

### 4. Cleaner Architecture
- Data source focuses only on raw data extraction
- UI business logic clearly separated in dedicated services
- Proper layering with clear dependencies

### 5. Better Error Handling
- Each service can handle errors specific to its domain
- More contextual error messages
- Easier to debug issues

## Comparison

### Before: Monolithic Service
```typescript
// TocSyncEffects: 167 lines, 4 responsibilities
class TocSyncEffects {
  init() {
    // File change handling: 26 lines
    // Scroll start handling: 4 lines  
    // Scroll stop handling: 31 lines
    // Edit change handling: 25 lines
  }
}
```

### After: Focused Services
```typescript
// TocFileService: 33 lines, 1 responsibility
// TocScrollService: 42 lines, 1 responsibility  
// TocEditService: 31 lines, 1 responsibility
// TocServiceCoordinator: 35 lines, orchestration only
```

## Trade-offs

### Potential Concerns
- More files to manage (4 services vs 1)
- Additional coordination layer

### Mitigated By
- Each service is small and focused
- Service coordinator provides unified interface
- Better separation makes maintenance easier
- Improved testability outweighs file count

## Validation

- All existing functionality preserved
- No linting errors
- Architecture documentation updated
- Clear separation of concerns achieved
- Each service follows Single Responsibility Principle

## Related Decisions

- [Repository Removal](./repository_removal.md) - Previous step that identified these issues
- [Data Layer Refactor](./data_layer_refactor.md) - Original data layer organization
- [Store Separation](./store_separation.md) - Store architecture that works well with focused services

## Conclusion

The service layer refactor successfully applies Single Responsibility Principle to create a cleaner, more maintainable architecture. Each service has a clear, focused purpose, making the codebase easier to understand, test, and maintain. The new architecture properly separates data extraction, UI business logic, and event handling concerns.

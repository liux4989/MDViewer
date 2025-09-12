# Decision: Move Business Logic to Store Layer

**Date**: 2024-12-19  
**Status**: Accepted  
**Context**: Architecture Refinement - Business Logic Placement  

## Problem

After the service layer refactor, we identified that business logic was still in the wrong layer:

1. **Utilities had business logic**: `transformFileToToc()` contained business decisions about error handling
2. **Services had business logic**: Services were making business decisions about data processing
3. **Store was just setters**: Store only had basic CRUD operations, no business logic

## Analysis

### Current Architecture Issues

**❌ BEFORE (Wrong):**
```
Services → Business Logic (error handling, validation decisions)
         ↓
Utilities → Pure transformations + Business decisions
         ↓  
Store → Just setters (setHeadings, setActiveFile)
```

**Problems:**
- Business logic scattered across layers
- Utilities making business decisions (return null vs throw error)
- Services handling business logic instead of coordinating
- Store not handling state management decisions

### What Should Be Where

**✅ CORRECT:**
```
Services → Event coordination only
         ↓
Store → Business logic + State management decisions  
         ↓
Utilities → Pure transformations only
```

## Decision

**Move business logic to the store layer** where state management decisions belong, and make utilities purely functional.

### Rationale

1. **Store = State Management**: Business logic about how to handle state changes belongs in the store
2. **Utilities = Pure Functions**: Should only transform data, no business decisions
3. **Services = Event Coordination**: Should only coordinate events, not make business decisions

## Implementation

### 1. Created TocDataProcessor for Business Logic

**Purpose**: Handle business decisions about data processing

```typescript
export class TocDataProcessor {
  processFileData(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null {
    // Business Logic: Input validation strategy
    if (!file || !obsidianFile) {
      this.handleProcessingError('Invalid file or metadata', file?.path || 'unknown');
      return null;
    }
    
    // Business Logic: Empty headings handling
    if (obsidianHeadings.length === 0) {
      return { path: obsidianFile.path, headings: [] }; // Business decision
    }
    
    // Use pure utility for transformation
    const tocFile = obsidianToTocFile(obsidianFile, obsidianHeadings);
    
    // Business Logic: Validation strategy
    if (!validateTocFile(tocFile)) {
      this.handleProcessingError('Validation failed', file.path);
      return null;
    }
    
    return tocFile;
  }
}
```

### 2. Enhanced Store with Business Logic Actions

**Added business logic methods to store:**

```typescript
export interface TocActions {
  // Basic actions
  setActiveFile(filePath: string | null): void;
  setHeadings(headings: TocHeading[]): void;
  
  // Business logic actions
  loadFileData(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): void;
  refreshHeadings(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): void;
}

// Implementation
const loadFileData = useCallback((file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]) => {
  const tocFile = dataProcessor.processFileData(file, obsidianFile, obsidianHeadings);
  if (tocFile) {
    setHeadings(tocFile.headings);
    setActiveFile(file.path);
    setActiveHeading(null); // Business decision: reset active heading on file change
  }
}, [dataProcessor, setHeadings, setActiveFile, setActiveHeading]);
```

### 3. Purified Utilities

**Removed business logic from utilities:**

```typescript
// BEFORE: Had business decisions
export function transformFileToToc(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null {
  if (!file || !obsidianFile || !Array.isArray(obsidianHeadings)) {
    return null; // Business decision
  }
  // ... more business logic
}

// AFTER: Pure utilities only
export function obsidianToTocFile(obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): TocFile | null {
  // Pure transformation, no business decisions
}

export function validateTocFile(file: TocFile): boolean {
  // Pure validation, just true/false
}
```

### 4. Simplified Services

**Services now only coordinate events:**

```typescript
// BEFORE: Services had business logic
class TocFileService {
  async loadFileData(filePath: string) {
    const tocFile = transformFileToToc(activeFile, obsidianFile, obsidianHeadings);
    if (!tocFile) {
      console.error('Failed to transform'); // Business decision
      return;
    }
    this.tocStore.setHeadings(tocFile.headings);
  }
}

// AFTER: Services just coordinate
class TocFileService {
  async loadFileData(filePath: string) {
    const activeFile = this.dataSource.getActiveFile();
    const obsidianFile = this.dataSource.extractFileMetadata(activeFile);
    const obsidianHeadings = this.dataSource.extractHeadings(activeFile);
    
    // Delegate business logic to store
    if (obsidianFile && obsidianHeadings) {
      this.tocStore.loadFileData(activeFile, obsidianFile, obsidianHeadings);
    }
  }
}
```

### 5. Created Unified Store Adapter

**Unified interface for all services:**

```typescript
export interface ITocStoreAdapter {
  // State access
  getState(): { activeFile: string | null; activeHeadingId: string | null; headings: TocHeading[]; };
  
  // Basic actions
  setActiveFile(path: string | null): void;
  setHeadings(headings: TocHeading[]): void;
  setActiveHeading(id: string | null): void;
  
  // Business logic actions
  loadFileData(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): void;
  refreshHeadings(file: TFile, obsidianFile: ObsidianFile, obsidianHeadings: ObsidianHeading[]): void;
}
```

## Benefits

### 1. Correct Layer Responsibilities
- **Services**: Event coordination only
- **Store**: Business logic and state management decisions
- **Utilities**: Pure data transformations only

### 2. Better Testability
- Business logic can be tested independently in the store
- Utilities are pure functions, easy to test
- Services are simple coordinators, easy to test

### 3. Cleaner Architecture
- Business decisions centralized in store
- Clear separation of concerns
- Each layer has single responsibility

### 4. Better Maintainability
- Business logic changes only affect store layer
- Utilities remain stable (pure functions)
- Services remain simple (event coordination)

## Comparison

### Before: Scattered Business Logic
```typescript
// Service: Business logic about error handling
if (!tocFile) {
  console.error('Failed to transform');
  return;
}

// Utility: Business logic about validation
if (!validateTocFile(tocFile)) {
  return null; // Business decision
}

// Store: Just setters
setHeadings(tocFile.headings);
```

### After: Centralized Business Logic
```typescript
// Service: Just coordination
this.tocStore.loadFileData(activeFile, obsidianFile, obsidianHeadings);

// Store: Business logic
const loadFileData = (file, obsidianFile, obsidianHeadings) => {
  const tocFile = dataProcessor.processFileData(file, obsidianFile, obsidianHeadings);
  if (tocFile) {
    setHeadings(tocFile.headings);
    setActiveFile(file.path);
    setActiveHeading(null); // Business decision
  }
};

// Utility: Pure transformation
const tocFile = obsidianToTocFile(obsidianFile, obsidianHeadings);
```

## Validation

- All tests pass (14/14 tests passing)
- No linting errors
- Business logic centralized in store
- Utilities are pure functions
- Services are simple coordinators

## Related Decisions

- [Service Layer Refactor](./service_layer_refactor.md) - Previous service split
- [Service vs Utility Refinement](./service_vs_utility_refinement.md) - Utility function approach

## Conclusion

Moving business logic to the store layer creates a much cleaner architecture where each layer has a clear, single responsibility. The store now properly handles state management decisions, utilities are purely functional, and services are simple event coordinators. This follows proper separation of concerns and makes the codebase more maintainable and testable.


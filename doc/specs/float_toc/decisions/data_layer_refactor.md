# Data Layer Refactor: Repository Pattern Implementation

Chats: Data layer design analysis and repository layer refactor planning

# Decision
Refactor the current data layer architecture to implement a proper repository pattern, separating concerns between data sources, repositories, and domain models.

## Current Architecture Issues
- `TocDataService` mixes repository logic with data source concerns
- Data transformation functions are in services but should be in repositories
- No clear separation between raw data access and domain logic
- Caching is mentioned but not implemented

## Refactor Plan

### 1. Folder Structure Reorganization
```
ui/
├── datasources/           # Raw data access (Obsidian APIs)
│   └── obsidianDataSource.ts
├── repositories/          # Domain-facing data operations
│   ├── tocRepository.ts
│   └── tocMappers.ts
├── schemas/              # Domain models (unchanged)
│   └── toc.ts
└── services/             # Business logic (future)
```

### 2. Component Responsibilities

#### DataSource Layer (`ui/datasources/`)
- **Purpose**: Raw access to external data (Obsidian APIs)
- **Responsibilities**: 
  - File system operations
  - Metadata cache access
  - Raw data extraction
- **Interface**: `IObsidianDataSource`
- **Implementation**: Move `ObsidianDataService` here

#### Repository Layer (`ui/repositories/`)
- **Purpose**: Domain-facing data operations with transformation
- **Responsibilities**:
  - Data transformation and mapping
  - Validation and error handling
  - Caching and performance optimization
  - Domain model construction
- **Interface**: `ITocRepository`
- **Implementation**: Refactor `TocDataService` → `TocRepository`

#### Mappers (`ui/repositories/tocMappers.ts`)
- **Purpose**: Pure transformation functions
- **Responsibilities**:
  - Convert raw data to domain models
  - Data sanitization and validation
  - Type safety enforcement
- **Implementation**: Move `tocDataTransformation.ts` here

### 3. Interface Definitions

```typescript
// Data Source Interface
export interface IObsidianDataSource {
  getActiveFile(): TFile | null;
  getMarkdownFiles(): TFile[];
  extractFileMetadata(file: TFile | null): ObsidianFile | null;
  extractHeadings(file: TFile | null): ObsidianHeading[];
  isCacheAvailable(file: TFile | null): boolean;
}

// Repository Interface
export interface ITocRepository {
  getCurrentFileHeadings(): Promise<Result<TocData, TocDataServiceError>>;
  getFileHeadings(filePath: string): Promise<Result<TocFile, TocDataServiceError>>;
  clearCache(): void;
}
```

### 4. Implementation Steps

#### Phase 1: Create New Structure
1. Create `ui/datasources/` and `ui/repositories/` folders
2. Move `obsidianDataService.ts` → `ui/datasources/obsidianDataSource.ts`
3. Move `tocDataTransformation.ts` → `ui/repositories/tocMappers.ts`
4. Create `ITocRepository` interface

#### Phase 2: Refactor TocDataService
1. Rename `TocDataService` → `TocRepository`
2. Implement `ITocRepository` interface
3. Update constructor to accept `IObsidianDataSource`
4. Move file to `ui/repositories/tocRepository.ts`

#### Phase 3: Update Dependencies
1. Update all import statements
2. Update test files with new paths
3. Update `ui/schemas/index.ts` exports
4. Verify compilation and tests pass

#### Phase 4: Add Caching
1. Implement simple in-memory cache in `TocRepository`
2. Add cache invalidation methods
3. Add cache configuration options

### 5. Benefits
- **Separation of Concerns**: Clear boundaries between data access and domain logic
- **Testability**: Easier to mock data sources and test repositories independently
- **Maintainability**: Changes to data sources don't affect domain logic
- **Extensibility**: Can easily add new data sources or caching strategies
- **Performance**: Centralized caching and optimization

### 6. Risks and Mitigation
- **Risk**: Breaking existing functionality during refactor
  - **Mitigation**: Incremental refactor with tests running at each step
- **Risk**: Increased complexity for simple use cases
  - **Mitigation**: Keep interfaces simple and focused
- **Risk**: Performance overhead from additional abstraction
  - **Mitigation**: Profile and optimize critical paths

## Status
- **Date**: [2025-01-27]
- **Phase**: Planning
- **Next Review**: After Phase 1 completion
- **Dependencies**: Current Phase 2 completion

## Future Considerations
- Add configuration options for heading depth limits
- Implement more sophisticated caching strategies
- Add support for multiple data sources
- Consider adding data persistence layer for offline scenarios

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




# Phase 4: State Handling

## Task 4.1: Define UI State & Store Contract [AI]

### Subtasks:
1. Define core UI state shape
   - `mode`: "compact" | "detail"
   - `activeFile`: string | null
   - `activeHeadingId`: string | null
   - `headings`: TocHeading[]
2. Define `ITocUIStore` contract (state, actions, selectors)
   - Actions: `toggleMode()`, `setActiveFile()`, `setActiveHeading()`, `setHeadings()`, `navigate()`
   - Selectors typed and memo-friendly
3. Provide facade hooks depending only on `ITocUIStore`
   - `ui/hooks/`: `useTocState()`, `useActiveHeading()`, `useTocMode()`, `useNavigate()`
4. Add Zod schema to validate state shape
   - Extend `ui/schemas/toc.ts` or `ui/schemas/index.ts` as needed
5. Document contract and exported hooks

### Success Criteria:
- ✅ Contract is type-safe and reusable across UI
- ✅ Unit tests validate initial state and selectors
- ✅ Components import hooks only; no coupling to implementation


## Task 4.2: State Implement  [AI]

### Subtasks:
1. Create store provider `ui/stores/tocUIStore.tsx`
   - Implement `ITocUIStore` contract using React Context + Reducer
   - Export `TocUIProvider` that sets `_setTocUIContext()` for facade hooks
   - Accept optional dependencies: `navigator: IObsidianNavigator`
2. Implement pure reducer `ui/stores/tocUIReducer.ts`
   - Handle actions: `toggleMode`, `setActiveFile`, `setActiveHeading`, `setHeadings`
   - Derive next state immutably; no side-effects
   - Use `createInitialTocUIState()` for initial state
3. Wire navigation actions in store
   - `navigate(id: string)`: set active heading, call `navigator.goToLine(line)` if provided
   - `navigateDirection(dir)`: compute target inline, then delegate to `navigate()`
   - No repository calls here (effects handle data refresh)
5. Provider value stability & performance
   - Memoize action creators with `useCallback`
   - Memoize context value with `useMemo` to minimize re-renders
6. Unit tests (Vitest)
   - Reducer: initial state, each action, immutability
   - Navigation helpers: next/prev/parent/child across boundaries/levels
   - Store actions: `navigate`/`navigateDirection` with mocked `IObsidianNavigator`
   - No DOM or Obsidian runtime dependencies
7. Types & validation
   - Reuse `TocUIState`, `ITocUIStore`
   - Optional runtime check with `validateTocUIState()` in dev-only paths

### Success Criteria:
- ✅ Store provider compiles and satisfies `ITocUIStore`
- ✅ Reducer is pure, fully unit-tested
- ✅ Navigation actions work for linear and nested headings with boundaries
- ✅ `TocUIProvider` integrates with facade hooks via `_setTocUIContext`
- ✅ Tests run without DOM/Obsidian runtime

### Deliverables:
- `ui/stores/tocUIStore.tsx` (provider + wiring)
- `ui/stores/tocUIReducer.ts` (pure reducer + types)
- Tests under `src/test/` for reducer, navigation, and actions


## Task 4.3: Side-Effects & Obsidian Sync [AI]

### Subtasks:
1. ✅ **COMPLETED**: Create event abstraction layer (`ui/datasources/obsidianEvents.ts`)
   - `IObsidianEvents` interface for decoupling business logic from Obsidian runtime
   - `ObsidianEvents` implementation with proper debouncing and cleanup
   - File change events: `onFileOpen()`, `onFileChanged()` 
   - Editor events: `onEditorScrollStart()`, `onEditorScrollStop()`, `onEditorChangeIdle()`

2. ✅ **COMPLETED**: Implement effects coordination service (`ui/services/tocSyncEffects.ts`)
   - `TocSyncEffects` class that wires events to store and repository
   - **File change side effects**: Reset mode to "compact" and refresh headings
   - **Scroll side effects**: Switch to "compact" mode during scrolling, update active heading when stopped
   - **Edit side effects**: Update heading cache when user finishes editing (debounced)
   - Dependency injection pattern for testability

3. ✅ **COMPLETED**: Create viewport analysis utilities (`ui/services/headingViewport.ts`)
   - `computeActiveHeadingFromViewport()` pure function for active heading detection
   - `computeActiveHeadingEnhanced()` with scroll direction awareness
   - No Obsidian API dependencies for easy unit testing
   - Fallback strategies for edge cases

4. ✅ **COMPLETED**: Update architecture documentation
   - Added Services Layer section with event synchronization details
   - Updated data flow diagram to show event-driven architecture
   - Documented integration wiring and component access patterns
   - Created decision record for architectural choice

### Success Criteria:
- ✅ Event abstraction layer isolates Obsidian runtime coupling
- ✅ Effects service coordinates events with store and repository
- ✅ Pure functions enable unit testing without Obsidian runtime
- ✅ Clear separation of concerns across all layers
- ✅ Documentation reflects new architecture
 

# Phase 5: UI Layer

## Task 5.1: Compact Mode TOC UI [AI]

### Subtasks:
1. Design compact mode UI component structure
   - Create `TocCompactView` component for minimal, read-only display
   - Focus on space-efficient layout with no interactive elements
   - Display only essential heading information (text and level indication)
2. Implement compact mode styling
   - Use Obsidian CSS variables for consistent theming
   - Minimize vertical space usage with compact typography
   - Add subtle level indentation or visual hierarchy
   - Ensure readability in both light and dark themes
3. Create compact mode component
   - Build `ui/components/TocCompactView.tsx` with pure display logic
   - Accept headings array and activeHeadingId as props
   - Render headings in a space-efficient list format
   - Highlight active heading with subtle visual indicator
4. Integrate with existing architecture
   - Connect to existing `useTocState()` and `useTocMode()` hooks
   - Ensure proper re-rendering when state changes
   - Add conditional rendering logic in main TOC component

### Success Criteria:
- ✅ Compact view displays headings in minimal space
- ✅ No interactive elements (clicks, hovers, keyboard navigation)
- ✅ Active heading is visually highlighted
- ✅ Styling integrates seamlessly with Obsidian theme
- ✅ Component is performant and re-renders efficiently
- ✅ Floating TOC properly attaches to Obsidian workspace root split
- ✅ **COMPLETED**: Task 4.4 finished and integrated

### Deliverables:
- ✅ `ui/components/TocCompactView.tsx` (compact display component)
- ✅ `ui/components/TocView.tsx` (main TOC component with mode switching)
- ✅ `ui/components/TocFloating.tsx` (floating overlay with workspace attachment)
- ✅ `ui/components/TocDemo.tsx` (demo component with sample data)
- ✅ Compact mode styles using Obsidian CSS variables
- ✅ Integration with existing store and hooks architecture

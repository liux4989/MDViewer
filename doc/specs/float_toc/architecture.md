# Overview

The plugin mounts a lightweight React root as a floating overlay within the Obsidian workspace. The overlay renders a Table of Contents (TOC) that operates in two display modes sharing the same data source:
- Preview mode: compact tree hierarchy for quick structure overview (default state)
- Detail mode: interactive scrollable table of contents (appears on hover, closes when mouse leaves)

Both modes access the same headings list from metadataCache - they differ only in display style and interaction level. The active heading is tracked using line-based position detection. 


# Data Layer

## Data Source
### ObsidianDataSource (`ui/datasources/obsidianDataSource.ts`)

**Purpose**: Raw access to Obsidian APIs for file metadata and heading extraction.

**Interface**: `IObsidianDataSource` and `IObsidianNavigator`
```typescript
interface IObsidianDataSource {
  getActiveFile(): TFile | null;
  getMarkdownFiles(): TFile[];
  extractFileMetadata(file: TFile | null): ObsidianFile | null;
  extractHeadings(file: TFile | null): ObsidianHeading[];
  isCacheAvailable(file: TFile | null): boolean;
  getRawCache(file: TFile | null): any;
}

interface IObsidianNavigator {
  goToLine(line: number, options?: { center?: boolean }): void;
}
```

**Responsibilities**:
- File system operations using `app.vault`
- Metadata cache access via `app.metadataCache`
- Raw heading extraction from cache
- Active file detection via `app.workspace`
- Navigation operations (scroll, cursor positioning) via `app.workspace` and editor APIs
- Error handling for invalid files/cache states

**Implementation**: `ObsidianDataSource` class that implements both `IObsidianDataSource` and `IObsidianNavigator` interfaces.

### ObsidianEvents (`ui/datasources/obsidianEvents.ts`)

**Purpose**: Event abstraction layer that decouples business logic from Obsidian runtime events.

**Interface**: `IObsidianEvents`
```typescript
interface IObsidianEvents {
  onFileOpen(cb: (path: string) => void): () => void;
  onFileChanged(cb: (path: string) => void): () => void;
  onEditorScrollStart(cb: () => void): () => void;
  onEditorScrollStop(cb: () => void): () => void;
  onEditorChangeIdle(cb: (path: string) => void): () => void;
  getCurrentScrollLine(): number | null;
}
```

**Responsibilities**:
- File change event handling (`metadataCache.on('changed')`, `vault.on('modify')`, `vault.on('rename')`)
- Editor scroll event detection with debouncing (150ms for scroll stop)
- Editor content change detection with debouncing (300ms for edit idle)
- Current scroll line position detection via `editor.getCursor().line`
- Event listener lifecycle management and cleanup
- Isolation of all Obsidian runtime dependencies

**Implementation**: `ObsidianEvents` class with proper debouncing, cleanup, and error handling.

## Navigation
### ObsidianNavigator (`ui/datasources/navigator.ts`)

**Purpose**: Provides navigation capabilities for moving between headings in the active editor.

**Interface**: `IObsidianNavigator`
```typescript
interface IObsidianNavigator {
  goToLine(line: number, options?: { center?: boolean }): void;
}
```

**Responsibilities**:
- Line-based navigation to specific positions in the editor
- Cursor positioning and viewport scrolling
- Integration with Obsidian's MarkdownView and editor APIs
- Graceful fallback when no active editor is available

**Implementation**: Integrated into `ObsidianDataSource` class to maintain single responsibility for all Obsidian API interactions.

## Data Repository
### TocRepository (`ui/repositories/tocRepository.ts`)

**Purpose**: Domain-facing repository for TOC data operations with caching and error handling.

**Interface**: `ITocRepository`
```typescript
interface ITocRepository {
  getCurrentFileHeadings(): Promise<Result<TocData, TocDataServiceError>>;
  getFileHeadings(filePath: string): Promise<Result<TocFile, TocDataServiceError>>;
  clearCache(): void;
}
```

**Responsibilities**:
- Data transformation using mappers
- Input validation and error handling
- In-memory caching for performance
- Domain model construction
- Consistent error reporting via `Result<T, E>` pattern

**Implementation**: `TocRepository` class with:
- Cache management (`Map<string, TocFile>`)
- Dependency injection of `IObsidianDataSource`
- Error handling with typed error codes


# Services Layer

## Event Synchronization
### TocSyncEffects (`ui/services/tocSyncEffects.ts`)

**Purpose**: Coordinates Obsidian events with store updates and repository cache management using separate store adapters.

**Interface**: Split store adapters for focused responsibilities
```typescript
interface ITocStoreAdapter {
  getState(): { activeFile: string | null; activeHeadingId: string | null; headings: TocHeading[]; };
  setActiveFile(path: string | null): void;
  setHeadings(headings: TocHeading[]): void;
  setActiveHeading(id: string | null): void;
}

interface ITocModeStoreAdapter {
  setScrolling(isScrolling: boolean): void;
}

class TocSyncEffects {
  constructor(
    events: IObsidianEvents,
    repository: ITocRepository,
    tocStore: ITocStoreAdapter,
    modeStore: ITocModeStoreAdapter
  );
  init(): () => void; // Returns cleanup function
}
```

**Responsibilities**:
- **File change side effects**: Reset active heading and refresh headings when files change
- **Scroll side effects**: Update scrolling state in mode store, update active heading in TOC store when scrolling stops
- **Edit side effects**: Update heading cache when user finishes editing (debounced)
- **Event coordination**: Wire Obsidian events to appropriate store actions and repository operations
- **Error handling**: Graceful degradation when event handling fails
- **Cleanup management**: Proper disposal of event listeners and timers

**Implementation**: `TocSyncEffects` class with dependency injection of events, repository, and separate store adapters for focused responsibilities.

## Active Heading Detection
### Line-Based Position Tracking

**Purpose**: Calculate active headings using the established line-based position tracking algorithm.

**Algorithm**: Uses the decision from `@match_heading.md`
```typescript
function getCurrentHeading(scrollLine: number, headings: TocHeading[]): TocHeading | undefined {
  return headings.find((heading, index) => {
    const startLine = heading.line;
    const endLine = index < headings.length - 1 
      ? headings[index + 1].line - 1
      : Number.MAX_SAFE_INTEGER;
    
    return scrollLine >= startLine && scrollLine <= endLine;
  });
}
```

**Responsibilities**:
- **Line-based matching**: Uses `heading.line` positions for reliable heading detection
- **Range calculation**: Determines heading sections from start line to next heading's start line
- **Performance optimized**: O(n) linear search with early termination
- **No content matching**: Avoids issues with duplicate content across sections

**Implementation**: Integrated directly into `TocSyncEffects` class, uses `events.getCurrentScrollLine()` for current position.


# UI Layer

## Store Architecture

The UI layer uses a split-store architecture with clear separation of concerns:

### Mode Store (`ITocModeStore`)
**Purpose**: Manages UI interaction state and display mode computation
**Location**: `ui/stores/tocModeStore.tsx`

**Interface**:
```typescript
interface ITocModeStore {
  // State
  isHovering: boolean;
  isScrolling: boolean;
  isNavigating: boolean;
  
  // Actions
  setHovering(isHovering: boolean): void;
  setScrolling(isScrolling: boolean): void;
  setNavigating(isNavigating: boolean): void;
  
  // Selectors
  getDisplayMode(): TocUIMode;
  isPreviewMode(): boolean;
  isDetailMode(): boolean;
}
```

**Responsibilities**:
- Track user interaction states (hover, scroll, navigation)
- Compute display mode based on interaction state
- Provide mode-related selectors for components

### TOC Store (`ITocStore`)
**Purpose**: Manages TOC data and navigation operations
**Location**: `ui/stores/tocStore.tsx`

**Interface**:
```typescript
interface ITocStore {
  // State
  activeFile: string | null;
  activeHeadingId: string | null;
  headings: TocHeading[];
  
  // Actions
  setActiveFile(filePath: string | null): void;
  setActiveHeading(headingId: string | null): void;
  setHeadings(headings: TocHeading[]): void;
  navigate(headingId: string): void;
  
  // Selectors
  getActiveHeading(): TocHeading | null;
  getHeadingsByLevel(level: number): TocHeading[];
}
```

**Responsibilities**:
- Manage document structure data (headings, active file)
- Handle navigation operations
- Provide data-related selectors for components

### Provider Integration
**Location**: `ui/stores/tocProvidersWithEffects.tsx`

**Architecture**:
- **Top-level**: Mode provider (global UI state)
- **Container-level**: TOC provider (document-specific data)
- **Effects integration**: Sync effects coordinate between both stores

## Component Architecture

### Container Components
- **TocContainer**: Fixed overlay at middle-left; switches between preview and detail views based on mode
- **TocPreviewView**: Preview tree in the shape of lines with different lengths for different levels
- **TocDetailView**: Table of contents showing 5–8 items at once; scrollable; active item highlighted; heading text truncated with ellipsis

### Hook Design
- **`useTocMode()`**: Access to interaction state and display mode
- **`useToc()`**: Access to TOC data and navigation
- **`useNavigate()`**: Coordinates between both stores for navigation
- **`useActiveHeading()`**: Focused access to active heading data

### Component Responsibilities
- **Pure Presentational**: Components receive data via props, no direct store access
- **Focused Hooks**: Each hook provides access to a specific store concern
- **Coordinated Actions**: Navigation operations coordinate between stores as needed

## Design Token
All styling relies on Obsidian CSS variables to match themes and avoid hard-coded colors.

# Data Flow

```mermaid
flowchart TD
    A[Plugin Enabled] --> B[Initialize TocProvidersWithEffects]
    B --> C[Setup Mode Store + TOC Store]
    C --> D[Initialize TocSyncEffects with Store Adapters]
    D --> E[Setup Event Listeners]
    E --> F[Read Initial TOC Data]
    F --> G[TOC Display]

    H[File Changed Event] --> I[ObsidianEvents]
    I --> J[TocSyncEffects]
    J --> K[Repository.refresh]
    K --> L[TOC Store: setHeadings + setActiveFile]
    L --> G

    M[Editor Scroll Start] --> I
    I --> N[Mode Store: setScrolling true]
    N --> G

    O[Editor Scroll Stop] --> I
    I --> P[Mode Store: setScrolling false]
    P --> Q[Compute Active Heading]
    Q --> R[TOC Store: setActiveHeading]
    R --> G

    S[Editor Change Idle] --> I
    I --> T[Repository.refresh Background]
    T --> U[TOC Store: setHeadings]
    U --> G

    G --> V[User Views TOC]
    V --> W{User Action}
    W -->|Navigate| X[useNavigate: Coordinate Mode + TOC Stores]
    W -->|Hover| Y[Mode Store: setHovering]
    X --> G
    Y --> G
```

## CRUD Operations Summary
- **Create**: Plugin activation generates initial TOC data models
- **Read**: TOC displays current data models to user
- **Update/Delete**: File changes trigger data model replacement



# Obsidian API Integration

## Plugin Lifecycle
- Lifecycle: extend Plugin; mount in onload, unmount in onunload
- Container: append overlay root to app.workspace.containerEl with a scoped class for positioning
- Settings: addSettingTab, persist with loadData/saveData
- Theming: use Obsidian CSS variables (e.g., --text-normal, --background-secondary) and avoid hard-coded colors

## Event-Driven Architecture
The new architecture uses a layered event system that maintains separation of concerns:

### Integration Wiring (main.ts)
```typescript
// In React view initialization
const events = new ObsidianEvents(this.app);
const dataSource = new ObsidianDataSource(this.app);
const repository = new TocRepository(dataSource);

// Initialize providers with effects
<TocProvidersWithEffects app={this.app} navigator={dataSource}>
  <TocContainer visible={true} />
</TocProvidersWithEffects>
```

### Event Flow
1. **Obsidian Events** → `ObsidianEvents` (data layer)
2. **Event Abstraction** → `TocSyncEffects` (services layer) 
3. **Business Logic** → Split store actions (Mode Store + TOC Store) and Repository operations
4. **UI Updates** → React components via focused store hooks

### Side Effects Implementation
- **File changes**: `metadataCache.on('changed')` + `vault.on('modify')` → TOC Store: refresh headings + reset active heading
- **Editor scrolling**: Editor scroll events → Mode Store: setScrolling + TOC Store: update active heading
- **User editing**: Editor change events (debounced) → TOC Store: update headings cache without UI disruption

## How React Components Access Data
- **Focused Store Hooks**: `useToc()`, `useTocMode()`, `useActiveHeading()`, `useNavigate()`
- **Repository Access**: Via store effects, not direct component access
- **Obsidian Context**: `useObsidianApp()` hook only for initialization, not in components
- **Pure Components**: UI components receive data via props from focused hooks, no Obsidian API coupling
- **Store Coordination**: `useNavigate()` coordinates between Mode Store and TOC Store for navigation operations



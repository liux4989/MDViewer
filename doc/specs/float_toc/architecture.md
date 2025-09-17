# Floating TOC Architecture

A React-based Obsidian plugin that renders a floating Table of Contents overlay with two display modes:
- **Preview mode**: Compact tree hierarchy (default)
- **Detail mode**: Interactive scrollable TOC (on hover)

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Layer    │    │  Business Logic  │    │    UI Layer     │
│                 │    │                  │    │                 │
│ • ObsidianData  │───▶│ • TocProcessor   │───▶│ • React Stores  │
│ • ObsidianEvents│    │ • Transformers   │    │ • Components    │
│ • Navigator     │    │                  │    │ • Effects       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Data Layer

### ObsidianDataSource
**Purpose**: Abstraction layer for Obsidian APIs
- File operations (`app.vault`)
- Metadata cache access (`app.metadataCache`)
- Heading extraction and navigation

### ObsidianEvents
**Purpose**: Event coordination with debouncing
- File changes (150ms debounce)
- Editor scrolling (300ms debounce)
- Viewport calculations

### Navigation
**Purpose**: Line-based navigation to headings

## UI Layer

### React Context + Reducer Pattern
Two separate contexts for optimal performance:

**TocContext**: Document data management
- State: `{ activeFile, activeHeadingId, headings }`
- Actions: Load file data, set active heading, refresh headings

**TocModeContext**: UI interaction state
- State: `{ isHovering, isScrolling, isNavigating }`
- Computed: Display mode based on interaction state

### Custom Hooks
**Effects Coordination**:
- `useFileEvents()`: File change handling
- `useScrollEvents()`: Scroll + active heading detection
- `useNavigate()`: Cross-store navigation coordination

**Store Access**:
- `useToc()` / `useTocActions()` / `useTocSelectors()`
- `useTocMode()` / `useTocModeActions()` / `useTocModeSelectors()`

### Components
- **TocContainer**: Mode-based view switching
- **TocPreviewView**: Line-based tree visualization
- **TocDetailView**: Scrollable heading list (5-8 items)

## Data Flow

**Initialization**: Plugin → Providers → Stores → Event Listeners → Initial Data

**File Changes**: Obsidian Events → `useFileEvents` → Store Actions → UI Update

**Scrolling**: Editor Scroll → `useScrollEvents` → Active Heading Calculation → Store Update

**Navigation**: User Click → `useNavigate` → Store Coordination → Obsidian Navigation

## Integration

### Plugin Lifecycle
- Extend Obsidian `Plugin` class
- Mount React root in `onload()`
- Cleanup in `onunload()`

### Obsidian API Usage
- **Events**: `metadataCache`, `vault`, editor events
- **Data**: `app.workspace`, `app.metadataCache`
- **Navigation**: Editor scroll/cursor positioning
- **Theming**: CSS variables (`--text-normal`, `--background-secondary`)

### React Integration
```typescript
<TocProvidersWithEffects app={this.app}>
  <TocContainer />
</TocProvidersWithEffects>
```

## Directory Structure

```
ui/
├── stores/                    # React Context + Reducer
│   ├── TocContext.tsx         # Document data management
│   ├── TocModeContext.tsx     # UI interaction state
│   └── TocProvidersWithEffects.tsx # Combined providers + effects
├── hooks/                     # Effects coordination
│   ├── useNavigate.ts         # Cross-store navigation
│   └── useTocEffects.ts       # Obsidian event handling
├── components/                # Pure UI components
├── datasources/               # Obsidian API abstraction
├── utils/                     # Data transformers
└── schemas/                   # TypeScript definitions
```

## Key Decisions

1. **Separate Contexts**: TocContext (data) + TocModeContext (UI state) for optimal performance
2. **Hook-Based Effects**: Custom hooks replace service classes for better React integration
3. **Direct Store Access**: No adapters - hooks directly interact with stores
4. **Atomic Actions**: Single dispatch per business operation prevents intermediate states
5. **Pure Components**: Data flows down via props, actions flow up via callbacks
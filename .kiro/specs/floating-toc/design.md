# Design Document

## Overview

The Floating TOC plugin is built as an Obsidian plugin using TypeScript and React. The plugin creates a floating overlay positioned within the markdown editor window that displays an interactive table of contents for the currently active markdown document. The design follows Obsidian's plugin architecture patterns and integrates seamlessly with the editor's event system to provide real-time updates and navigation functionality while remaining contextually bound to the specific editor instance.

## Architecture

The plugin follows a modular architecture with clear separation of concerns:

```
FloatingTocPlugin (Main Plugin Class)
├── FloatingTocOverlay (Overlay Management)
│   ├── EditorDetection
│   ├── OverlayPositioning
│   └── ReactIntegration
├── TocComponents (React Components)
│   ├── TocContainer
│   ├── TocItem
│   ├── TocHeader
│   └── TocList
├── TocManager (Core Logic)
│   ├── HeadingExtractor
│   ├── ScrollTracker
│   └── NavigationHandler
└── SettingsManager (Configuration)
    ├── PositionSettings
    ├── AppearanceSettings
    └── BehaviorSettings
```

### Key Architectural Decisions

1. **Simplified Editor Targeting**: Targets the first available markdown editor (single-split assumption)
2. **React Integration**: Leverages React for component-based UI with efficient re-rendering
3. **Editor-Bound Positioning**: TOC is positioned within the primary markdown editor window (left or right side, configurable)
4. **Static Editor Detection**: Uses first markdown leaf for overlay placement (simplified approach)
5. **Mock Data Integration**: Currently uses mock data for development and testing
6. **Native Obsidian Styling**: Uses Obsidian's CSS variables, components, and layouts for consistent appearance

## Components and Interfaces

### Core Plugin Interface

```typescript
interface FloatingTocPlugin extends Plugin {
  floatingToc: FloatingTocOverlay | null;
  tocManager: TocManager;
  settingsManager: SettingsManager;
}

interface FloatingTocOverlay {
  show(): void;
  hide(): void;
  destroy(): void;
  updateEntries(entries: TocEntry[]): void;
  setVisibility(visible: boolean): void;
}
```

### TOC Data Structures

```typescript
interface TocEntry {
  id: string;
  text: string;
  level: number; // 1-6 for H1-H6
  element: HTMLElement;
  children: TocEntry[];
}

interface TocState {
  entries: TocEntry[];
  activeEntry: string | null;
  isVisible: boolean;
  position: { x: number; y: number };
}
```

### Component Hierarchy

#### TocManager
- **Responsibility**: Core business logic for TOC generation and management
- **Key Methods**:
  - `extractHeadings(document: Document): TocEntry[]`
  - `updateActiveSection(scrollPosition: number): void`
  - `navigateToSection(entryId: string): void`

#### HeadingExtractor
- **Responsibility**: Parse document and extract heading structure
- **Key Methods**:
  - `scanDocument(): TocEntry[]`
  - `buildHierarchy(headings: HTMLElement[]): TocEntry[]`
  - `generateUniqueIds(entries: TocEntry[]): void`

#### ScrollTracker
- **Responsibility**: Monitor scroll position and determine active section
- **Key Methods**:
  - `startTracking(): void`
  - `stopTracking(): void`
  - `getCurrentSection(): string | null`

#### FloatingTocOverlay
- **Responsibility**: Manage overlay creation, positioning, and lifecycle within the primary markdown editor
- **Key Methods**:
  - `createOverlay(): void` - Creates overlay within the first markdown editor
  - `findEditorContainer(): Element` - Gets the first available markdown editor container
  - `show(): void` / `hide(): void` - Controls overlay visibility

#### TocContainer (React Component)
- **Responsibility**: Render the floating TOC interface within editor overlay
- **Props**: `{ entries: TocEntry[], activeEntry: string, onNavigate: Function, position: 'left' | 'right' }`
- **State**: `{ isVisible: boolean }`

## Data Models

### TocEntry Model
```typescript
class TocEntry {
  constructor(
    public id: string,
    public text: string,
    public level: number,
    public element: HTMLElement
  ) {}
  
  get depth(): number {
    return this.level - 1; // 0-based for styling
  }
  
  get hasChildren(): boolean {
    return this.children.length > 0;
  }
}
```

### Settings Model
```typescript
interface PluginSettings {
  isVisible: boolean;
  position: 'left' | 'right'; // Fixed at middle of chosen side
  appearance: {
    width: number;
    maxHeight: number;
  };
  behavior: {
    autoHide: boolean;
    smoothScroll: boolean;
    collapseNested: boolean;
  };
}
```

## Error Handling

### Document Parsing Errors
- **Strategy**: Graceful degradation when headings cannot be extracted
- **Implementation**: Return empty TOC with user notification
- **Recovery**: Retry parsing on document updates

### Scroll Tracking Errors
- **Strategy**: Fallback to manual section detection
- **Implementation**: Use basic scroll position calculations
- **Recovery**: Re-initialize intersection observers

### React Rendering Errors
- **Strategy**: Error boundaries to prevent plugin crashes
- **Implementation**: Display fallback UI with error message
- **Recovery**: Provide manual refresh mechanism

### Navigation Errors
- **Strategy**: Validate target elements before scrolling
- **Implementation**: Check element existence and visibility
- **Recovery**: Scroll to document top if target not found

## Testing Strategy

### Unit Testing
- **Framework**: Jest with TypeScript support
- **Coverage**: Core logic classes (TocManager, HeadingExtractor, ScrollTracker)
- **Mocking**: Obsidian API calls and DOM elements
- **Test Cases**:
  - Heading extraction from various document structures
  - Active section detection logic
  - Navigation functionality
  - Settings persistence

### Integration Testing
- **Framework**: Jest with jsdom for DOM simulation
- **Coverage**: Plugin initialization and React component integration
- **Test Cases**:
  - Plugin lifecycle (load, enable, disable, unload)
  - Event system integration
  - Settings synchronization
  - Theme adaptation

### Component Testing
- **Framework**: React Testing Library
- **Coverage**: React components and user interactions
- **Test Cases**:
  - TOC rendering with different heading structures
  - Click navigation behavior
  - Fixed positioning (left/right middle)
  - Obsidian CSS variable integration

### End-to-End Testing
- **Framework**: Playwright or similar
- **Coverage**: Full plugin functionality in Obsidian environment
- **Test Cases**:
  - Plugin installation and activation
  - TOC generation for real documents
  - Cross-document navigation
  - Settings persistence across sessions

## Editor Integration Strategy

### Active Editor Detection
The plugin uses a simplified approach for single-split scenarios:

1. **Primary**: Get all markdown leaves using `getLeavesOfType('markdown')`
2. **Selection**: Use the first markdown leaf (single split assumption)
3. **Fallback**: Use document body as last resort with appropriate warnings

### Overlay Positioning
- **Container Target**: `.view-content` element within the active editor
- **Positioning**: Absolute positioning relative to editor container
- **Z-Index Management**: Layered above editor content but below Obsidian modals
- **Responsive**: Adapts to editor window resizing and layout changes

### Single-Split Support (Phase 1)
- **Simplified Targeting**: TOC targets the first available markdown editor
- **Single Instance**: One overlay instance for the primary markdown editor
- **Future Enhancement**: Multi-editor support planned for later phases

### Editor Lifecycle Integration
- **Creation**: Overlay created on plugin initialization and first show
- **Destruction**: Proper cleanup when plugin is disabled or unloaded
- **Persistence**: Settings and visibility state maintained across sessions

## Performance Considerations

### Efficient Heading Extraction
- **Optimization**: Use document.querySelectorAll with specific selectors
- **Caching**: Cache heading structure until document changes
- **Debouncing**: Debounce re-extraction on rapid document updates

### Scroll Performance
- **Optimization**: Use Intersection Observer API for efficient scroll tracking
- **Throttling**: Throttle scroll event handlers to 16ms (60fps)
- **Passive Listeners**: Use passive event listeners where possible

### React Rendering
- **Optimization**: Use React.memo for TocItem components
- **Virtual Scrolling**: Implement virtual scrolling for documents with many headings
- **State Management**: Minimize re-renders through careful state design

### Memory Management
- **Cleanup**: Properly remove event listeners and observers on plugin disable
- **Weak References**: Use weak references for DOM element storage where appropriate
- **Garbage Collection**: Ensure no memory leaks in long-running sessions

## Styling Integration

### Obsidian CSS Variables Usage
The plugin will use Obsidian's native CSS variables to ensure consistent theming:

```css
.floating-toc-container {
  background-color: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  border-radius: var(--radius-s);
  box-shadow: var(--shadow-s);
}

.floating-toc-item {
  color: var(--text-muted);
  padding: var(--size-2-1) var(--size-4-2);
}

.floating-toc-item--active {
  background-color: var(--background-modifier-hover);
  color: var(--text-accent);
}

.floating-toc-item:hover {
  background-color: var(--background-modifier-hover);
  color: var(--text-normal);
}
```

### Editor-Bound Positioning System
```css
.floating-toc-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.view-content {
  position: relative; /* Enable absolute positioning for overlay */
}

.floating-toc-container {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
  pointer-events: auto;
}

.floating-toc-container--left {
  left: var(--size-4-4);
}

.floating-toc-container--right {
  right: var(--size-4-4);
}
```

### Component Layout
The TOC will use Obsidian's layout patterns:
- Consistent spacing using Obsidian's size variables
- Typography matching Obsidian's text hierarchy
- Interactive states following Obsidian's hover/active patterns
- Scrollbar styling consistent with Obsidian's custom scrollbars
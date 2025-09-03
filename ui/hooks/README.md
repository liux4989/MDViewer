# TOC UI Hooks

This directory contains facade hooks that provide a clean interface to the TOC UI store. All hooks depend only on the `ITocUIStore` contract, ensuring loose coupling and easy testing.

## Available Hooks

### `useTocState()`

The core hook that provides access to the complete TOC UI store.

```typescript
import { useTocState } from './hooks';

function MyComponent() {
  const store = useTocState();
  // Access to complete state, actions, and selectors
}
```

**Throws:** Error if used outside of `TocUIProvider`

### `useActiveHeading()`

Provides access to active heading state and related operations.

```typescript
import { useActiveHeading } from './hooks';

function MyComponent() {
  const {
    activeHeading,           // Currently active TocHeading | null
    activeHeadingId,         // ID of active heading
    setActiveHeading,        // (id: string | null) => void
    navigateToHeading,       // (id: string) => void
    isHeadingActive          // (heading: TocHeading) => boolean
  } = useActiveHeading();
}
```

### `useTocMode()`

Provides access to display mode state and mode switching operations.

```typescript
import { useTocMode } from './hooks';

function MyComponent() {
  const {
    mode,              // 'compact' | 'detail'
    isCompactMode,     // boolean
    isDetailMode,      // boolean
    toggleMode,        // () => void
    setCompactMode,    // () => void
    setDetailMode,     // () => void
    setMode            // (mode: TocUIMode) => void
  } = useTocMode();
}
```

### `useNavigate()`

Provides navigation operations for TOC headings.

```typescript
import { useNavigate } from './hooks';

function MyComponent() {
  const {
    navigateToHeading,         // (id: string) => void
    navigateToHeadingByIndex,  // (index: number) => void
  } = useNavigate();
}
```

## Design Principles

1. **Contract-Based**: All hooks depend only on `ITocUIStore` interface, not specific implementations
2. **Memoized**: All hooks use `useMemo` and `useCallback` for performance optimization
3. **Type-Safe**: Full TypeScript support with strict typing
4. **Error-Safe**: Proper error handling with descriptive error messages
5. **Testable**: Easy to mock and test in isolation

## Usage Guidelines

- Always use these facade hooks instead of directly accessing the store
- Components should import hooks, not the store implementation
- Hooks will throw errors if used outside of the provider context
- All navigation operations are debounced and safe to call repeatedly

## Store Contract

The hooks expect a store that implements `ITocUIStore` interface with:

- **State**: `mode`, `activeFile`, `activeHeadingId`, `headings`
- **Actions**: `toggleMode()`, `setActiveFile()`, `setActiveHeading()`, `setHeadings()`, `navigate()`
- **Selectors**: `getActiveHeading()`, `isCompactMode()`, `isDetailMode()`, `getHeadingsByLevel()`, navigation getters

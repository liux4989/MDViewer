# TOC UI Store Implementation

This directory contains the React Context + Reducer implementation of the `ITocUIStore` contract defined in Task 4.1.

## Files

### `tocUIReducer.ts`
Pure reducer that handles all state transitions:
- **Actions**: `TOGGLE_MODE`, `SET_ACTIVE_FILE`, `SET_ACTIVE_HEADING`, `SET_HEADINGS`, `NAVIGATE_TO_HEADING`, `NAVIGATE_DIRECTION`
- **Navigation Logic**: Inline, simplified logic for next/prev/parent/child navigation
- **Immutable**: All state changes return new state objects
- **Testable**: Pure functions with no side effects

### `tocUIStore.tsx`
React Context provider that implements `ITocUIStore`:
- **Context**: Creates and exports `TocUIContext`
- **Provider**: `TocUIProvider` component with optional `IObsidianNavigator`
- **Actions**: Memoized action creators for performance
- **Selectors**: Memoized selector functions
- **Integration**: Connects to facade hooks via `_setTocUIContext()`

## Usage

```tsx
import { TocUIProvider } from './stores/tocUIStore';
import { useTocState } from './hooks/useTocState';

// In your app root
function App() {
  return (
    <TocUIProvider navigator={obsidianNavigator}>
      <YourTocComponent />
    </TocUIProvider>
  );
}

// In any component
function YourTocComponent() {
  const store = useTocState();
  
  return (
    <div>
      <button onClick={store.toggleMode}>
        Mode: {store.mode}
      </button>
      {store.headings.map(heading => (
        <button 
          key={heading.id}
          onClick={() => store.navigate(heading.id)}
        >
          {heading.text}
        </button>
      ))}
    </div>
  );
}
```

## Key Design Decisions

### ✅ **Simplified Navigation Logic**
- Removed pre-designed helper functions (`findNextHeading`, etc.)
- Inline logic directly in the reducer for next/prev/parent/child
- Leaner, more maintainable code

### ✅ **Performance Optimized**
- Memoized action creators with `useCallback`
- Memoized context value with `useMemo`
- Memoized selectors to prevent unnecessary re-renders

### ✅ **Type Safe**
- Full TypeScript support with strict contracts
- Runtime validation in development mode
- Proper error handling for missing context

### ✅ **Testable**
- Pure reducer functions easy to unit test
- No DOM or Obsidian runtime dependencies in core logic
- Mockable `IObsidianNavigator` for testing

## Navigation Logic

The reducer handles four navigation directions:

- **next**: Move to next heading in array
- **prev**: Move to previous heading in array  
- **parent**: Move to nearest heading with lower level number (higher hierarchy)
- **child**: Move to first heading with higher level number (lower hierarchy)

All navigation respects boundaries and handles edge cases (no active heading, end of list, etc.).

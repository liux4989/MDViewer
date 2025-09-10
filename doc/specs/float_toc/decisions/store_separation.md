# Store Separation Decision

**Date**: 2024-12-19  
**Status**: Accepted  
**Context**: TOC UI State Management Refactor  

## Problem

The original `ITocUIStore` was handling too many responsibilities:
- Mode state management (hover, scroll, navigation flags)
- TOC data management (headings, active file, active heading)
- Display mode computation logic
- Navigation coordination

This violated the Single Responsibility Principle and made the code harder to test, maintain, and reason about. Components were tightly coupled to a monolithic store that mixed UI interaction concerns with data management concerns.

## Decision

Split the monolithic `ITocUIStore` into two focused stores with clear separation of concerns:

### 1. Mode Store (`ITocModeStore`)
**Responsibility**: UI interaction state and display mode computation
- **State**: `{ isHovering, isScrolling, isNavigating }`
- **Logic**: `computeDisplayMode()` function
- **Scope**: Global UI behavior that affects how the TOC is displayed

### 2. TOC Store (`ITocStore`)
**Responsibility**: TOC data management and navigation
- **State**: `{ activeFile, activeHeadingId, headings }`
- **Actions**: File/heading management, navigation operations
- **Scope**: Document structure data and navigation functionality

## Implementation

### Provider Architecture
- **Top-level**: Mode provider (handles global UI state)
- **Container-level**: TOC provider (handles document-specific data)
- **Views**: Pure presentational components that receive data via props

### Hook Design
- `useTocMode()`: Access to interaction state and display mode
- `useToc()`: Access to TOC data and navigation
- `useNavigate()`: Coordinates between both stores for navigation

### Effects Integration
- `TocSyncEffects` updated to use separate adapters:
  - `ITocStoreAdapter`: For data operations
  - `ITocModeStoreAdapter`: For scrolling state updates

## Consequences

### Positive
- **Better Separation of Concerns**: Mode logic isolated from data logic
- **Improved Testability**: Each store can be tested independently
- **Cleaner Components**: UI components use focused, single-purpose hooks
- **Better Maintainability**: Changes to mode logic don't affect data logic and vice versa
- **Performance**: Memoized selectors prevent unnecessary re-renders

### Negative
- **Increased Complexity**: More files and providers to manage
- **Learning Curve**: Developers need to understand which store to use for what
- **Coordination Overhead**: Some operations (like navigation) require coordination between stores

### Mitigations
- Clear naming conventions (`useToc`, `useTocMode`)
- Comprehensive documentation and examples
- TypeScript interfaces provide clear contracts
- Combined providers (`TocProvidersWithEffects`) simplify integration

## Alternative Approaches Considered

### 1. Single Store with Better Organization
- **Rejected**: Still violates SRP, harder to test individual concerns

### 2. Provider-per-View
- **Rejected**: Would duplicate TOC state across views, breaking shared state

### 3. Context Composition
- **Rejected**: More complex than needed for this use case

## Files Changed

### New Files
- `ui/schemas/mode.ts` - Mode types and computation logic
- `ui/stores/tocModeReducer.ts` - Mode state reducer
- `ui/stores/tocModeStore.tsx` - Mode store provider
- `ui/stores/tocReducer.ts` - TOC data reducer
- `ui/stores/tocStore.tsx` - TOC store provider
- `ui/stores/providers.tsx` - Combined providers
- `ui/stores/tocProvidersWithEffects.tsx` - Full integration
- `ui/hooks/useToc.ts` - TOC store hook
- `ui/hooks/useTocMode.ts` - Mode store hook

### Updated Files
- `ui/hooks/useNavigate.ts` - Coordinates between stores
- `ui/hooks/useActiveHeading.ts` - Uses TOC store only
- `ui/components/*` - Use focused hooks
- `ui/services/tocSyncEffects.ts` - Separate adapters
- `ui/App.tsx` - New provider integration

### Removed Files
- `ui/hooks/useTocState.ts` - Replaced by focused hooks
- `ui/stores/tocUIReducer.ts` - Split into separate reducers
- `ui/stores/tocUIStore.tsx` - Split into separate stores

## Validation

The refactor maintains identical external behavior while providing:
- Better code organization
- Improved testability
- Clearer separation of concerns
- Better performance through focused memoization

All existing functionality preserved with no breaking changes to the public API.



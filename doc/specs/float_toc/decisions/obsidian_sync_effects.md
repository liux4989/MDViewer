# Decision: Event-Driven Obsidian Synchronization Architecture

# Context

The TOC plugin needs to respond to three main Obsidian events:
1. File changes → reset mode and update headings
2. Editor scrolling → switch to preview mode and track active heading  
3. User editing → update heading cache when editing completes

# Decision

We implement a **Services Layer** with event abstraction to maintain separation of concerns:

### Architecture Layers
- **Data Layer**: `ObsidianEvents` provides event abstraction, isolating all Obsidian runtime coupling
- **Services Layer**: `TocSyncEffects` coordinates events with store and repository, owns all side effect logic
- **Repository Layer**: Cache invalidation and data refresh, no UI knowledge
- **UI Layer**: Pure components using store hooks, no direct Obsidian API access

### Key Design Choices
1. **Event Abstraction**: `IObsidianEvents` interface decouples business logic from Obsidian runtime
2. **Pure Store**: UI store contains no Obsidian APIs, only state and actions
3. **Debounced Events**: Scroll stop (150ms) and edit idle (300ms) prevent excessive updates
4. **Dependency Injection**: `TocSyncEffects` receives events, repository, and store as dependencies
5. **Cleanup Management**: All event listeners properly disposed via cleanup functions

### Benefits
- **Testability**: Each layer can be unit tested with mocks [[memory:7656957]]
- **Maintainability**: Clear separation between Obsidian coupling and business logic
- **Performance**: Debounced events and background cache updates
- **Reliability**: Graceful error handling and proper cleanup

## Consequences

### Positive
- UI components remain pure and testable
- Repository layer focuses solely on data concerns
- Event handling is centralized and manageable
- Easy to mock for testing without Obsidian runtime

### Negative
- Slightly more complex wiring in main.ts
- Additional abstraction layer adds some indirection
- Need to manage cleanup functions carefully

## Implementation

Effects layer owns Obsidian coupling, store remains pure, repository owns cache invalidation.

Date: 2024-12-19


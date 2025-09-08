# Navigation Architecture: Data Layer Implementation

**Date**: 2025-01-27  
**Status**: Implemented  
**Review**: After Phase 2 completion and user feedback  


Implement navigation logic in the data layer through a dedicated `IObsidianNavigator` interface, with concrete implementation in `ObsidianDataSource`.

## Context
In state design phase, we require navigation helpers operating on `TocHeading[]` and exposing navigation actions. The question was whether to:
1. Expose Obsidian navigation APIs directly in the data layer
2. Invoke Obsidian APIs directly in state management

# Discovery

## Option1 -- Expose navigation through data layer abstraction

### Implementation Details
- **Interface**: `ui/datasources/navigator.ts` - `IObsidianNavigator.goToLine()`
- **Implementation**: `ui/datasources/obsidianDataSource.ts` - Implements both `IObsidianDataSource` and `IObsidianNavigator`
- **Method**: `goToLine(line: number, options?: { center?: boolean })`

### Architecture Benefits
1. **Separation of Concerns**: Navigation side-effects (scroll, cursor) are isolated in data layer
2. **Testability**: Higher layers can mock `IObsidianNavigator` without Obsidian dependencies
3. **Single Responsibility**: `ObsidianDataSource` handles all Obsidian API interactions
4. **Clean Interface**: Simple line-based navigation contract for domain logic
5. **Consistency**: Follows established repository pattern and data layer architecture

## Option2 -- Direct Obsidian API calls in state management
- **Pros**: Simpler implementation, fewer files
- **Cons**: Couples state logic to Obsidian internals, harder to test, violates separation of concerns

# Decision
we choose option 1 because it is follow our layered architecture design.


## Future Considerations
- If navigation logic grows complex, consider extracting `ObsidianNavigator` as separate class
- Multiple navigation backends (editor vs preview) may require interface evolution
- Performance optimization for large files with many headings

## Dependencies
- Phase 1 data layer refactor completion
- `IObsidianDataSource` interface implementation
- Obsidian API access through `App` instance

## Status
- **Date**: [2025-01-27]
- **Phase**: Implementation Complete
- **Next Review**: After Phase 2 completion and user feedback

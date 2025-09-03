# Phase 1:  Core setup and structure
- Init Obsidian plugin environment : plugin lifecycle, react components, obsidian hooks
- Initial styling system with Obsidian CSS variables
**Dependencies**: None


# Phase2 : Data Layer

- obsidian raw data provider: 

**Dependencies**:
- Phase 1

# Phase 3: Domain Layer
- transform obsidian raw data to domain specific model

**Dependencies**:
- Phase 2

### Phase 4 : State Handling
- define ui state: mode, activeHeading, activeFile, headings
- business logic for current feature : toggleMode(),  Navigate()


# Phase 4: UI Layer's Preview Mode
**Goal**: Implement the toc 's preview mode
**Deliverables**:
- Preview mode component
- Preview mode styling
- Preview mode functionality : switch mode
**Dependencies**:
- Phase 4

# Phase 5: UI Layer's Detail Mode
**Goal**: Implement the toc 's detail mode
**Deliverables**:
- Detail mode component
- Detail mode styling
- Detail mode functionality : switch mode, navigate to article
**Dependencies**:
- Phase 4


# Improvement Phase:
- suport preiewmode 's highlight following on scroll
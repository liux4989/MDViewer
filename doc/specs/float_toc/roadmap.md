# Phase 1:  Core setup and structure
- Init Obsidian plugin environment : plugin lifecycle, react components, obsidian hooks
- Initial styling system with Obsidian CSS variables
**Dependencies**: None


# Phase2 : Data Layer
- create Data Interface
- obsidian integration:  exposed apis for data building
- convert obsidian data to data interface
**Dependencies**:
- Phase 1

# Phase 3: Repository Layer
- create domain specific model: **tocHeading**
- exposed api: getHeading(), 
**Dependencies**:
- Phase 2

### Phase 4 : Business Logic Layer
- create a model to keep trck of toc state: **TocState**
- exposed user input events : changeMode
- exposed observable events :  fileChanged

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
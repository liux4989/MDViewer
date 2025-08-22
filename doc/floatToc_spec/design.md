
# Overview
An interactive floating table of contents overlay that provides quick navigation and visual context for markdown documents in Obsidian. 


# 3. Core Features

### 3.1 Display Modes
**Compact Mode**
- Tree view representation of document headings
- Different line lengths to represent heading hierarchy levels
- Minimal screen real estate usage
- Default state when not actively used

**Detailed Mode**
- Full heading text display
- Enhanced readability
- Scrollable interface for long documents
- Activated on hover

### 3.2 Content Display
- Support for H1, H2, H3 heading levels only (3 levels maximum)
- Hierarchical tree structure representation
- Real-time content updates when document changes

### 3.3 Interactive Behaviors

**Scroll Tracking**
- Compact Mode: Highlight current heading based on scroll position
- Detailed Mode: Highlight current heading + auto-scroll TOC to current position

**Hover Interactions**
- Compact → Detailed: Convert to detailed mode on hover
- Detailed → Compact: Revert to compact mode when pointer leaves
- Heading Hover: Highlight specific headings in detailed mode

**Click Navigation**
- Click heading in detailed mode → scroll document to that heading
- Smooth scrolling animation

### 3.4 Visual Design
- Use Obsidian's built-in styling system
- Consistent with Obsidian's design language
- Non-intrusive overlay design
- Position: Middle-left of editor view



## 6. Constraints & Limitations

### 6.1 Technical Constraints
- Limited to 3 heading levels (H1-H3)
- Dependent on Obsidian API capabilities

### 6.2 Design Constraints
- Must use Obsidian's styling system
- No settings panel in initial version

## 7. Success Criteria

### 7.1 Functional Success
- All interactive behaviors work as specified
- Smooth performance across different document sizes
- Consistent behavior across different Obsidian themes



## 8. Future Considerations

### 8.1 Potential Enhancements
- Settings panel for customization
- Support for additional heading levels
- Custom positioning options
- Keyboard shortcuts
- Search within TOC

### 8.2 Advanced Features
- Bookmark functionality
- Document outline export
- Integration with Obsidian's outline core plugin

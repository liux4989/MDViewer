# Requirements Document

## Introduction

The Floating TOC plugin is an Obsidian plugin that provides users with a floating, interactive table of contents overlay positioned within the markdown editor window. The plugin addresses the challenge of navigating and understanding the structure of lengthy markdown files by automatically generating a visual outline based on document headings. This floating overlay enhances the reading experience by offering quick navigation shortcuts and visual context about the user's current position within the document, while remaining contextually bound to the specific editor window.

## Requirements

### Requirement 1

**User Story:** As an Obsidian user reading long markdown documents, I want to see a floating table of contents overlay, so that I can quickly understand the document structure without losing my current reading position.

#### Acceptance Criteria

1. WHEN a markdown file is opened in Obsidian THEN the system SHALL display a floating TOC overlay positioned within the editor window
2. WHEN the document contains heading elements (H1-H6) THEN the system SHALL automatically generate TOC entries for each heading
3. WHEN the TOC is displayed THEN the system SHALL show headings in a hierarchical structure that reflects the document's heading levels
4. WHEN the user scrolls through the document THEN the system SHALL keep the floating TOC visible within the editor bounds and accessible
5. WHEN multiple markdown editors are open THEN the system SHALL position the TOC within the active editor window

### Requirement 2

**User Story:** As an Obsidian user, I want to click on TOC entries to navigate directly to specific sections, so that I can quickly jump to relevant content without manual scrolling.

#### Acceptance Criteria

1. WHEN a user clicks on a TOC entry THEN the system SHALL scroll the document to the corresponding heading
2. WHEN navigation occurs THEN the system SHALL position the target heading at the top of the visible area
3. WHEN a TOC entry is clicked THEN the system SHALL provide smooth scrolling animation to the target section
4. WHEN navigation is complete THEN the system SHALL maintain focus on the document content for continued reading

### Requirement 3

**User Story:** As an Obsidian user, I want to see which section I'm currently reading highlighted in the TOC, so that I can maintain awareness of my position within the document structure.

#### Acceptance Criteria

1. WHEN a user scrolls through the document THEN the system SHALL highlight the TOC entry corresponding to the currently visible section
2. WHEN multiple headings are visible THEN the system SHALL highlight the entry for the topmost heading in the viewport
3. WHEN the active section changes THEN the system SHALL update the highlighting in real-time
4. WHEN a section is highlighted THEN the system SHALL use visual indicators (color, background, or styling) to distinguish it from other entries


### Requirement 4

**User Story:** As an Obsidian user, I want the floating TOC to integrate seamlessly with Obsidian's interface, so that it feels like a native part of the application rather than an intrusive overlay.

#### Acceptance Criteria

1. WHEN the plugin is installed THEN the system SHALL follow Obsidian's design patterns and styling conventions
2. WHEN Obsidian's theme changes THEN the system SHALL adapt the TOC appearance to match the current theme
3. WHEN other plugins are active THEN the system SHALL avoid conflicts with existing UI elements
4. WHEN the TOC is displayed THEN the system SHALL respect Obsidian's responsive design principles for different screen sizes
5. WHEN the TOC is positioned within the editor THEN the system SHALL not interfere with document editing or selection
6. WHEN switching between editor tabs THEN the system SHALL position the TOC within the currently active editor window
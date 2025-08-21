# Implementation Plan

## Foundation Tasks (1-3): Project Setup, Data Models, and Core Interfaces

- [x] 1. Set up Obsidian plugin project structure and configuration
  - Create plugin manifest.json with metadata and permissions
  - Set up TypeScript configuration for Obsidian plugin development
  - Create main plugin entry point with basic Plugin class structure
  - Configure build system (esbuild/rollup) for plugin compilation
  - _Requirements: 5.1, 5.3_

- [x] 2. Create TOC data models and interfaces
  - Define TocEntry interface with id, text, level, element, children properties
  - Implement TocState interface for managing plugin state
  - Create PluginSettings interface with position, appearance, and behavior options
  - Write TypeScript type definitions for all plugin interfaces
  - _Requirements: 1.1, 4.3_

- [x] 3. Create mock data for development and testing
  - Generate sample TocEntry data representing various document structures
  - Create mock data with nested headings (H1-H6) and different hierarchies
  - Add mock data for edge cases (no headings, single heading, deep nesting)
  - Export mock data utilities for use in components and tests
  - _Requirements: 1.2, 1.3_

## Build Static Version (4-7): Display Mock Data with React Components

- [x] 4. Create React components for TOC display
  - Create TocItem component to display individual heading entries with hierarchical indentation
  - Create TocContainer component as main wrapper with fixed positioning (left/right middle)
  - Create TocHeader component with title and control buttons
  - Create TocList component for scrollable TOC entries
  - Add basic styling using Obsidian CSS variables and design patterns
  - _Requirements: 1.1, 1.3, 2.1, 4.2_

- [x] 5. Set up Obsidian plugin view integration
  - Create FloatingTocOverlay class for managing overlay within editor windows
  - Set up React root and component mounting/unmounting in overlay lifecycle
  - Configure React and ReactDOM for Obsidian plugin environment
  - Implement editor detection to target active markdown editor containers
  - Mount TocContainer component in editor overlay with mock data
  - _Requirements: 4.1, 4.2, 4.5, 4.6_

- [x] 6. Implement static TOC display with mock data
  - Display static TOC using mock data within editor overlay
  - Verify positioning within editor bounds, styling, and hierarchical display
  - Test recursive rendering of nested TocItem components
  - Test with different mock data scenarios (simple, nested, large, empty)
  - Implement toggle functionality for showing/hiding overlay
  - _Requirements: 1.4, 1.5, 4.3_

## Add Interactivity (7-10): Handle User Input, Data Flow, State Management

- [x] 7. Implement business logic classes
  - Create HeadingExtractor class to scan documents for H1-H6 elements and build hierarchy
  - Create NavigationHandler class for smooth scrolling to target sections
  - Create ScrollTracker class using Intersection Observer API for active section detection
  - Create TocManager class to orchestrate all TOC functionality
  - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [x] 8. Implement click navigation functionality
  - Add onClick handlers to TocItem components
  - Integrate NavigationHandler for smooth scrolling behavior
  - Test navigation with mock data (simulate scroll targets)
  - Handle navigation errors and edge cases
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 9. Create state management system and active section highlighting
  - Implement React state for active section tracking and TOC visibility
  - Integrate ScrollTracker for real-time active section detection
  - Add visual highlighting for active TOC entries using Obsidian's accent colors
  - Create state update methods for user interactions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1_

- [-] 10. Build settings management and controls
  - Create SettingsManager class for settings persistence using Obsidian's data storage
  - Create settings interface for position (left/right) and visibility
  - Add settings panel in Obsidian's plugin settings
  - Connect settings to component state and positioning
  - _Requirements: 4.1, 4.3, 4.4_

## Core Logic Integration (11-13): Real Data and Document Integration

- [ ] 11. Integrate real document heading extraction
  - Replace mock data with real document heading extraction using HeadingExtractor
  - Add unique ID generation for headings without existing IDs
  - Handle document changes and re-extraction of headings
  - Test with various document structures and edge cases
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 12. Add Obsidian integration and event handling
  - Create ObsidianIntegration class for plugin lifecycle management
  - Register event listeners for document changes and active file switching
  - Add ribbon icon for TOC toggle and command palette commands
  - Handle plugin enable/disable and cleanup properly
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 13. Finalize plugin with error handling and optimization
  - Add error boundaries and graceful handling of edge cases
  - Implement performance optimizations (debouncing, memoization)
  - Add proper cleanup of event listeners and observers
  - Test plugin thoroughly with various document types and scenarios
  - _Requirements: 1.1, 4.4_
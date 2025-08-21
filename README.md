# Floating TOC Plugin

A floating, interactive table of contents overlay for Obsidian markdown documents that appears within the editor window.

## Features

- 🎯 **Editor-Bound Overlay**: TOC appears within the active markdown editor window
- 📱 **Responsive Design**: Adapts to different screen sizes and editor layouts
- 🎨 **Theme Integration**: Automatically matches Obsidian's current theme
- ⚡ **Fast Navigation**: Click any heading to jump directly to that section
- 🔧 **Configurable**: Adjustable position (left/right), size, and appearance
- 🧪 **Real-time Extraction**: Automatically extracts headings from active documents

## Installation

### Development Installation

1. Clone this repository to your Obsidian plugins folder:
   ```bash
   cd /path/to/your/vault/.obsidian/plugins/
   git clone https://github.com/your-username/floating-toc.git
   ```

2. Install dependencies and build:
   ```bash
   cd floating-toc
   npm install
   npm run build
   ```

3. Enable the plugin in Obsidian Settings → Community Plugins

### Manual Installation

1. Download the latest release
2. Extract to `.obsidian/plugins/floating-toc/` in your vault
3. Enable the plugin in Obsidian Settings → Community Plugins

## Usage

### Basic Usage

- **Toggle TOC**: Click the list icon in the ribbon or use `Ctrl/Cmd + P` → "Toggle Floating TOC"
- **Navigate**: Click any heading in the TOC to jump to that section
- **Position**: Use the arrow button in the TOC header to switch between left/right positioning
- **Hide**: Click the X button in the TOC header to hide the overlay

### Commands

Access these commands via `Ctrl/Cmd + P`:

- `Toggle Floating TOC` - Show/hide the TOC overlay
- `Refresh TOC` - Manually refresh the table of contents

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Building

```bash
npm install          # Install dependencies
npm run build        # Production build
npm run dev          # Development build with watch
```

### Project Structure

```
floating-toc/
├── components/          # React components
│   ├── TocContainer.tsx # Main container component
│   ├── TocHeader.tsx    # Header with controls
│   ├── TocItem.tsx      # Individual TOC entries
│   └── TocList.tsx      # List of TOC entries
├── views/               # Plugin views
│   └── FloatingTocOverlay.tsx # Overlay management
├── types/               # TypeScript definitions
│   ├── index.ts         # Core types
│   └── mock-data.ts     # Test data generators
├── constants/           # Constants and configuration
│   └── index.ts         # CSS classes, selectors, etc.
├── utils/               # Utility functions
│   └── navigation.ts    # Navigation helpers
├── styles/              # CSS styles
│   └── toc-components.css # Component styles
└── main.ts              # Main plugin class
```

### Architecture

The plugin uses a modular architecture:

- **FloatingTocPlugin**: Main plugin class managing lifecycle
- **FloatingTocOverlay**: Manages overlay creation and positioning within editors
- **React Components**: Modular UI components for the TOC interface
- **Constants & Utils**: Shared configuration and utility functions

## Documentation

- **Requirements**: See `.kiro/specs/floating-toc/requirements.md`
- **Design**: See `.kiro/specs/floating-toc/design.md`
- **Tasks**: See `.kiro/specs/floating-toc/tasks.md`

## Roadmap

- [ ] Real document heading extraction
- [ ] Active section highlighting based on scroll position
- [ ] Collapsible nested sections
- [ ] Settings panel
- [ ] Keyboard navigation
- [ ] Search within TOC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
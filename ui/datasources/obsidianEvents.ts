/**
 * Event abstraction layer for Obsidian API events
 * Provides high-level event interfaces that decouple business logic from Obsidian runtime
 */

import { App, TFile, MarkdownView } from 'obsidian';

export interface ViewportRange {
  /** Start line of the current viewport (top) */
  startLine: number;
  /** End line of the current viewport (bottom) */
  endLine: number;
}

export interface IObsidianEvents {
  /**
   * Triggered when a file is opened in the workspace
   * @param cb Callback with the file path
   * @returns Cleanup function to remove the listener
   */
  onFileOpen(cb: (path: string) => void): () => void;

  /**
   * Triggered when a file's content or metadata changes
   * @param cb Callback with the file path
   * @returns Cleanup function to remove the listener
   */
  onFileChanged(cb: (path: string) => void): () => void;

  /**
   * Triggered when editor scrolling occurs in any mode
   * Handles both source and preview containers internally
   * @param cb Callback fired on scroll
   * @returns Cleanup function to remove the listener
   */
  onScroll(cb: () => void): () => void;


  /**
   * Triggered when user finishes editing (debounced after changes stop)
   * @param cb Callback with the file path that was edited
   * @returns Cleanup function to remove the listener
   */
  onEditorChangeIdle(cb: (path: string) => void): () => void;

  /**
   * Get the current viewport range in the active editor
   * @returns Viewport range with start and end lines, or null if no active editor
   */
  getCurrentViewportRange(): ViewportRange | null;


  /**
   * Clean up all active event listeners
   * Should be called when the plugin is unloaded
   */
  cleanup(): void;
}

/**
 * Concrete implementation of IObsidianEvents using Obsidian APIs
 * Isolates all Obsidian runtime dependencies in this single class
 */
export class ObsidianEvents implements IObsidianEvents {
  private activeCleanupFunctions: Array<() => void> = [];

  constructor(private app: App) {}

  onFileOpen(cb: (path: string) => void): () => void {
    const eventRef = this.app.workspace.on('file-open', (file) => {
      if (file instanceof TFile) {
        cb(file.path);
      }
    });
    
    const cleanup = () => this.app.workspace.offref(eventRef);
    this.activeCleanupFunctions.push(cleanup);

    return cleanup;
  }

  onFileChanged(cb: (path: string) => void): () => void {
    const metadataRef = this.app.metadataCache.on('changed', (file) => {
      if (file instanceof TFile) {
        cb(file.path);
      }
    });

    const vaultRef = this.app.vault.on('modify', (file) => {
      if (file instanceof TFile) {
        cb(file.path);
      }
    });

    const renameRef = this.app.vault.on('rename', (file, oldPath) => {
      if (file instanceof TFile) {
        cb(file.path);
      }
    });

    const cleanup = () => {
      this.app.metadataCache.offref(metadataRef);
      this.app.vault.offref(vaultRef);
      this.app.vault.offref(renameRef);
    };

    this.activeCleanupFunctions.push(cleanup);
    return cleanup;
  }

  onScroll(cb: () => void): () => void {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      return () => { }; // No active editor, return empty cleanup
    }

    let isDisposed = false;
    const registeredContainers = new Set<HTMLElement>();

    const registerScrollListener = (container: HTMLElement) => {
      if (isDisposed || registeredContainers.has(container)) {
        return;
      }

      container.addEventListener('scroll', cb, { passive: true });
      registeredContainers.add(container);
    };

    // MutationObserver to detect DOM changes and register listeners dynamically
    const observer = new MutationObserver((mutations) => {
      if (isDisposed) return;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if containers were created or recreated
          const sourceContainer = this.getScrollContainerForMode(view, 'source');
          const previewContainer = this.getScrollContainerForMode(view, 'preview');

          // Register on any new containers found
          if (sourceContainer && !registeredContainers.has(sourceContainer)) {
            registerScrollListener(sourceContainer);
          }
          if (previewContainer && !registeredContainers.has(previewContainer)) {
            registerScrollListener(previewContainer);
          }
        }
      });
    });

    // Start observing the view container for changes
    observer.observe(view.containerEl, {
      childList: true,
      subtree: true
    });

    const cleanup = () => {
      isDisposed = true;
      observer.disconnect();

      // Clean up all registered listeners
      registeredContainers.forEach(container => {
        try {
          container.removeEventListener('scroll', cb);
        } catch (error) {
          console.warn('Error removing scroll event listener:', error);
        }
      });
      registeredContainers.clear();
    };

    this.activeCleanupFunctions.push(cleanup);
    return cleanup;
  }


  onEditorChangeIdle(cb: (path: string) => void): () => void {
    let changeTimer: number | null = null;
    let isDisposed = false;

    const handleChange = (file: TFile) => {
      if (isDisposed) return;
      
      if (changeTimer) {
        clearTimeout(changeTimer);
      }

      changeTimer = window.setTimeout(() => {
        if (!isDisposed) {
          cb(file.path);
        }
      }, 300); // 300ms debounce for edit idle
    };

    // Listen to metadata changes instead of direct editor events
    // This is more reliable and follows Obsidian patterns
    const metadataRef = this.app.metadataCache.on('changed', handleChange);

    const cleanup = () => {
      isDisposed = true;
      this.app.metadataCache.offref(metadataRef);
      if (changeTimer) {
        clearTimeout(changeTimer);
      }
    };

    this.activeCleanupFunctions.push(cleanup);
    return cleanup;
  }

  getCurrentViewportRange(): ViewportRange | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;

    const mode = view.getMode();

    if (mode === 'source') {
      return this.getSourceModeViewportRange(view);
    } else if (mode === 'preview') {
      return this.getPreviewModeViewportRange(view);
    }

    return null;
  }


  /**
   * Clean up all active event listeners
   * Should be called when the plugin is unloaded
   */
  cleanup(): void {
    this.activeCleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during event cleanup:', error);
      }
    });
    this.activeCleanupFunctions = [];
  }

  private getSourceModeViewportRange(view: MarkdownView): ViewportRange | null {
    const editor = view.editor;
    const editorView = (editor as any).cm; // CodeMirror 6 EditorView instance

    if (!editorView || !editorView.dom) return null;

    // Get viewport information from CodeMirror
    const viewportTop = editorView.viewport.from;
    const viewportBottom = editorView.viewport.to;

    const topLine = editorView.state.doc.lineAt(viewportTop);
    const bottomLine = editorView.state.doc.lineAt(viewportBottom);

    return {
      startLine: topLine.number - 1, // Convert to 0-based indexing
      endLine: bottomLine.number - 1
    };
  }

  private getPreviewModeViewportRange(view: MarkdownView): ViewportRange | null {
    const file = view.file;
    if (!file) return null;

    const previewContainer = view.containerEl.querySelector('.markdown-preview-view');
    if (!previewContainer) return null;

    // Get scroll information
    const scrollTop = previewContainer.scrollTop;
    const containerHeight = previewContainer.clientHeight;
    const contentHeight = previewContainer.scrollHeight;

    // If we can't determine content height, return a default range
    if (contentHeight <= 0) {
      return {
        startLine: 0,
        endLine: 50
      };
    }

    try {
      // Get actual total lines from the editor using Obsidian API
      const editor = view.editor;
      const totalLines = editor.lineCount();

      // Calculate scroll ratio (0 = top, 1 = bottom)
      const scrollRatio = contentHeight > containerHeight
        ? scrollTop / (contentHeight - containerHeight)
        : 0;

      // Calculate current line position based on scroll ratio
      const startLine = Math.floor(scrollRatio * totalLines);

      // Calculate end line based on viewport height
      const viewportLines = Math.ceil((containerHeight / contentHeight) * totalLines);
      const endLine = Math.min(startLine + viewportLines, totalLines - 1);

      return {
        startLine: Math.max(0, startLine),
        endLine: Math.max(startLine, endLine)
      };
    } catch (error) {
      // If calculation fails, return a default range
      console.warn('Failed to calculate viewport range:', error);
      return {
        startLine: 0,
        endLine: 50
      };
    }
  }

  /**
   * Get the appropriate scroll container for a specific mode
   * @param view The active MarkdownView
   * @param mode The mode to get scroll container for
   * @returns The scrollable DOM element or null if not found
   */
  private getScrollContainerForMode(view: MarkdownView, mode: 'source' | 'preview'): HTMLElement | null {
    if (mode === 'source') {
      // Source mode: find the CodeMirror scroll container
      // Try multiple selectors to handle different Obsidian versions/themes
      const selectors = [
        '.cm-scroller',           // CodeMirror 6 scroll container
        '.cm-editor .cm-content', // Alternative CodeMirror container
        '.markdown-source-view .cm-editor' // Fallback selector
      ];

      for (const selector of selectors) {
        const container = view.containerEl.querySelector(selector);
        if (container && container.scrollHeight > container.clientHeight) {
          return container as HTMLElement;
        }
      }

      // Fallback: use the entire editor container
      return view.containerEl.querySelector('.cm-editor') as HTMLElement;

    } else if (mode === 'preview') {
      // Preview mode: Based on actual DOM structure analysis
      // The DOM structure is: .markdown-reading-view > .markdown-preview-view > .markdown-preview-sizer

      // First, try to find the actual scroll container within the view
      const scrollableSelectors = [
        '.markdown-reading-view',           // Root reading view container (most likely scroll container)
        '.markdown-preview-view',           // Preview view container
        '.markdown-preview-sizer'           // Content sizer (has the actual content height)
      ];

      for (const selector of scrollableSelectors) {
        const container = view.containerEl.querySelector(selector);
        if (container && container.scrollHeight > container.clientHeight) {
          return container as HTMLElement;
        }
      }

      // If no scrollable container found in view, check parent containers
      // The scrolling might happen at the workspace leaf level
      let currentElement = view.containerEl.parentElement;
      while (currentElement && currentElement !== document.body) {
        if (currentElement.scrollHeight > currentElement.clientHeight) {
          return currentElement as HTMLElement;
        }
        currentElement = currentElement.parentElement;
      }

      // Fallback: use the reading view container (based on actual DOM structure)
      const fallback = view.containerEl.querySelector('.markdown-reading-view') as HTMLElement;
      return fallback;
    }

    return null;
  }

  /**
   * Fallback method to estimate line number from heading text
   * This is used when data attributes are not available in reading mode
   */
  private estimateLineFromHeading(headingText: string): number | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view || !view.file) return null;

    try {
      // Get the cached content synchronously
      const cache = this.app.metadataCache.getFileCache(view.file);
      if (!cache?.headings) return null;

      // Find the heading in the cached metadata
      const matchingHeading = cache.headings.find(h =>
        h.heading.trim() === headingText.trim()
      );

      return matchingHeading ? matchingHeading.position.start.line : null;
    } catch (error) {
      // Remove debug log, but keep warning for actual error
      console.warn('Error estimating line from heading:', error);
      return null;
    }
  }
}
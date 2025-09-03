/**
 * Event abstraction layer for Obsidian API events
 * Provides high-level event interfaces that decouple business logic from Obsidian runtime
 */

import { App, TFile, MarkdownView } from 'obsidian';

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
   * Triggered when editor scrolling begins
   * @param cb Callback fired on scroll start
   * @returns Cleanup function to remove the listener
   */
  onEditorScrollStart(cb: () => void): () => void;

  /**
   * Triggered when editor scrolling stops (debounced)
   * @param cb Callback fired when scrolling has stopped
   * @returns Cleanup function to remove the listener
   */
  onEditorScrollStop(cb: () => void): () => void;

  /**
   * Triggered when user finishes editing (debounced after changes stop)
   * @param cb Callback with the file path that was edited
   * @returns Cleanup function to remove the listener
   */
  onEditorChangeIdle(cb: (path: string) => void): () => void;

  /**
   * Get the current scroll line position in the active editor
   * @returns Current line number at the top of the viewport, or null if no active editor
   */
  getCurrentScrollLine(): number | null;
}

/**
 * Concrete implementation of IObsidianEvents using Obsidian APIs
 * Isolates all Obsidian runtime dependencies in this single class
 */
export class ObsidianEvents implements IObsidianEvents {
  private stopScrollEmitter?: () => void;
  private subscribeScrollStop?: (fn: () => void) => void;

  constructor(private app: App) {}

  onFileOpen(cb: (path: string) => void): () => void {
    const eventRef = this.app.workspace.on('file-open', (file) => {
      if (file instanceof TFile) {
        cb(file.path);
      }
    });
    
    return () => this.app.workspace.offref(eventRef);
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

    return () => {
      this.app.metadataCache.offref(metadataRef);
      this.app.vault.offref(vaultRef);
      this.app.vault.offref(renameRef);
    };
  }

  onEditorScrollStart(cb: () => void): () => void {
    let isScrolling = false;
    let stopTimer: number | null = null;
    let isDisposed = false;

    const handleScroll = () => {
      if (isDisposed) return;
      
      if (!isScrolling) {
        isScrolling = true;
        cb(); // Emit scroll start
      }

      // Schedule scroll stop detection
      if (stopTimer) {
        clearTimeout(stopTimer);
      }
      
      stopTimer = window.setTimeout(() => {
        if (!isDisposed) {
          isScrolling = false;
          this.stopScrollEmitter?.();
        }
      }, 150); // 150ms debounce for scroll stop
    };

    // Set up scroll stop subscription mechanism
    this.subscribeScrollStop = (fn: () => void) => {
      this.stopScrollEmitter = fn;
    };

    // Use workspace active-leaf-change as a proxy for scroll events
    // This is more reliable than direct editor events
    const leafChangeRef = this.app.workspace.on('active-leaf-change', () => {
      // Trigger scroll detection when view changes
      handleScroll();
    });

    return () => {
      isDisposed = true;
      this.app.workspace.offref(leafChangeRef);
      if (stopTimer) {
        clearTimeout(stopTimer);
      }
      this.stopScrollEmitter = undefined;
      this.subscribeScrollStop = undefined;
    };
  }

  onEditorScrollStop(cb: () => void): () => void {
    // This works in conjunction with onEditorScrollStart
    this.subscribeScrollStop?.(cb);
    
    return () => {
      if (this.subscribeScrollStop) {
        this.subscribeScrollStop(() => {});
      }
    };
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

    return () => {
      isDisposed = true;
      this.app.metadataCache.offref(metadataRef);
      if (changeTimer) {
        clearTimeout(changeTimer);
      }
    };
  }

  getCurrentScrollLine(): number | null {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;

    const editor = view.editor;
    
    // Get cursor position as a proxy for current position
    // In Obsidian, we can use the cursor line as the active line
    const cursor = editor.getCursor();
    return cursor.line;
  }
}

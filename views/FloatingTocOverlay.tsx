import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { App } from 'obsidian';
import { TocContainer } from '../components/TocContainer';
import { TocEntry, PluginSettings, DEFAULT_SETTINGS, TocState } from '../types';
import { CSS_CLASSES, SELECTORS } from '../constants';
import { TocManager } from '../business-logic/TocManager';

export class FloatingTocOverlay {
    private root: Root | null = null;
    private overlayElement: HTMLElement | null = null;
    private tocManager: TocManager;
    private currentState: TocState;
    private settings: PluginSettings = DEFAULT_SETTINGS;
    private onItemClick: (id: string) => void;
    private app: App;
    private documentContainer: HTMLElement | null = null;

    public get isVisible(): boolean {
        return this.currentState.isVisible;
    }

    constructor(app: App, onItemClick: (id: string) => void) {
        this.app = app;
        this.onItemClick = onItemClick;
        
        // Initialize TOC manager with configuration
        this.tocManager = new TocManager({
            includeLevels: [1, 2, 3, 4, 5, 6],
            minTextLength: 1,
            maxDepth: 6,
            autoGenerateIds: true,
            rootMargin: '-10% 0px -80% 0px',
            threshold: [0, 0.1, 0.5, 1.0]
        });

        // Initialize state
        this.currentState = {
            entries: [],
            activeEntry: null,
            isVisible: false,
            position: 'right',
            isLoading: false
        };
    }

    public show(): void {
        this.updateState({ isVisible: true });
        
        if (this.overlayElement) {
            this.overlayElement.style.display = 'block';
            this.renderComponent();
            return;
        }

        this.createOverlay();
        this.initializeDocument();
    }

    public hide(): void {
        this.updateState({ isVisible: false });
        
        if (this.overlayElement) {
            this.overlayElement.style.display = 'none';
        }
        
        // Stop tracking when hidden
        this.tocManager.cleanup();
    }

    public destroy(): void {
        // Cleanup TOC manager
        this.tocManager.cleanup();
        
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        
        this.documentContainer = null;
    }

    public updateEntries(entries: TocEntry[]): void {
        this.updateState({ entries });
    }

    public updateActiveEntry(entryId: string | null): void {
        this.updateState({ activeEntry: entryId });
    }

    public updateSettings(settings: PluginSettings): void {
        this.settings = settings;
        this.updateState({ position: settings.position });
    }

    public setVisibility(visible: boolean): void {
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    public refreshToc(): void {
        if (this.documentContainer) {
            this.updateState({ isLoading: true });
            
            try {
                const entries = this.tocManager.updateToc(this.documentContainer);
                this.updateState({ 
                    entries, 
                    isLoading: false 
                });
                
                // Restart tracking with new entries
                if (this.currentState.isVisible) {
                    this.startActiveTracking();
                }
            } catch (error) {
                console.error('Error refreshing TOC:', error);
                this.updateState({ isLoading: false });
            }
        }
    }

    public getState(): TocState {
        return { ...this.currentState };
    }



    private updateState(updates: Partial<TocState>): void {
        this.currentState = { ...this.currentState, ...updates };
        this.renderComponent();
    }

    private initializeDocument(): void {
        this.documentContainer = this.findDocumentContainer();
        
        if (this.documentContainer) {
            // Initialize TOC manager with document
            const state = this.tocManager.initialize(this.documentContainer);
            this.updateState(state);
            
            // Start active section tracking
            this.startActiveTracking();
        }
    }

    private startActiveTracking(): void {
        if (this.currentState.entries.length > 0) {
            this.tocManager.startTracking((activeId: string | null) => {
                this.updateState({ activeEntry: activeId });
            });
        }
    }

    private createOverlay(): void {
        const editorContainer = this.findEditorContainer();

        // Create overlay container
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = CSS_CLASSES.OVERLAY;

        // Add to the editor container
        editorContainer.appendChild(this.overlayElement);

        // Create React root and render
        this.root = createRoot(this.overlayElement);
        this.renderComponent();
    }

    private findEditorContainer(): Element {
        // Simple approach: get the first markdown view (assuming single split)
        const markdownLeaves = this.app.workspace.getLeavesOfType(SELECTORS.MARKDOWN_VIEW);

        if (markdownLeaves.length === 0) {
            console.warn('No markdown editor found, using document body');
            return document.body;
        }

        // Use the first markdown leaf (single split assumption)
        const markdownLeaf = markdownLeaves[0];
        const viewContent = markdownLeaf.view.containerEl.querySelector(SELECTORS.VIEW_CONTENT);

        if (viewContent) {
            return viewContent;
        }

        // Fallback to the container itself
        return markdownLeaf.view.containerEl;
    }

    private findDocumentContainer(): HTMLElement | null {
        // Get the markdown content container for heading extraction
        const markdownLeaves = this.app.workspace.getLeavesOfType(SELECTORS.MARKDOWN_VIEW);

        if (markdownLeaves.length === 0) {
            console.warn('No markdown editor found for document analysis');
            return null;
        }

        // Use the first markdown leaf (single split assumption)
        const markdownLeaf = markdownLeaves[0];
        
        // Try to find the markdown preview or editor content
        const previewContent = markdownLeaf.view.containerEl.querySelector('.markdown-preview-view .markdown-preview-section');
        if (previewContent) {
            return previewContent as HTMLElement;
        }

        // Fallback to the entire view content
        const viewContent = markdownLeaf.view.containerEl.querySelector(SELECTORS.VIEW_CONTENT);
        if (viewContent) {
            return viewContent as HTMLElement;
        }

        // Last resort fallback
        return markdownLeaf.view.containerEl;
    }

    private renderComponent(): void {
        if (!this.root || !this.currentState.isVisible) return;

        this.root.render(
            React.createElement(TocContainer, {
                entries: this.currentState.entries,
                activeEntry: this.currentState.activeEntry,
                isVisible: this.currentState.isVisible,
                position: this.currentState.position,
                settings: this.settings,
                onItemClick: this.handleItemClick.bind(this),
                onToggleVisibility: this.handleToggleVisibility.bind(this),
                onPositionChange: this.handlePositionChange.bind(this),
                isLoading: this.currentState.isLoading
            })
        );
    }

    private handleItemClick(id: string): void {
        // Use TOC manager for navigation with smooth scrolling
        this.tocManager.navigateToEntry(id, this.settings.behavior.smoothScroll)
            .then(() => {
                // Navigation successful - active entry will be updated by scroll tracker
                console.log(`Successfully navigated to section: ${id}`);
            })
            .catch((error) => {
                console.error('Navigation failed:', error);
                // Fallback to manual click handling
                this.onItemClick(id);
            });
    }

    private handleToggleVisibility(): void {
        this.setVisibility(false);
    }

    private handlePositionChange(position: 'left' | 'right'): void {
        this.settings = {
            ...this.settings,
            position
        };
        this.updateState({ position });
    }
}
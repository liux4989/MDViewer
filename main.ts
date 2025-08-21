import { Plugin, MarkdownView } from 'obsidian';
import { FloatingTocOverlay } from './views/FloatingTocOverlay';
import { TocManager } from './business-logic/TocManager';
import { SettingsManager, FloatingTocSettingsTab } from './business-logic';
import { COMMANDS, PLUGIN_NAME } from './constants';
import './styles/toc-components.css';

// Import test functions
import { testStateManagement, testReactStateIntegration } from './test-state-management';
import { verifyStateManagement } from './verify-state-management';

export default class FloatingTocPlugin extends Plugin {
	private floatingToc: FloatingTocOverlay | null = null;
	private tocManager: TocManager | null = null;
	private settingsManager: SettingsManager | null = null;

	async onload() {
		console.log(`Loading ${PLUGIN_NAME} plugin`);

		// Initialize settings manager and load settings
		this.settingsManager = new SettingsManager(this);
		await this.settingsManager.loadSettings();

		// Initialize TOC manager
		this.tocManager = new TocManager({
			includeLevels: [1, 2, 3, 4, 5, 6],
			minTextLength: 1,
			maxDepth: 6,
			autoGenerateIds: true,
			rootMargin: '-10% 0px -80% 0px',
			threshold: [0, 0.1, 0.5, 1.0]
		});

		// Initialize floating TOC overlay
		this.initializeFloatingToc();
		
		// Register commands and UI elements
		this.registerCommands();
		this.registerRibbonIcon();
		this.registerSettingsTab();

		// Register event listeners for document changes
		this.registerEventListeners();

		// Listen for settings changes
		this.registerSettingsListeners();
	}

	onunload() {
		console.log(`Unloading ${PLUGIN_NAME} plugin`);
		this.cleanup();
	}

	private initializeFloatingToc(): void {
		if (!this.settingsManager) {
			console.error('Settings manager not initialized');
			return;
		}

		// Create floating TOC overlay with current settings
		this.floatingToc = new FloatingTocOverlay(this.app, this.handleTocItemClick.bind(this));
		
		// Apply current settings to the overlay
		const settings = this.settingsManager.getSettings();
		this.floatingToc.updateSettings(settings);
		
		// Extract TOC from current document and show if enabled
		this.updateTocFromCurrentDocument();
		
		if (settings.isVisible) {
			this.floatingToc.show();
		}
	}

	private registerCommands(): void {
		// Main toggle command
		this.addCommand({
			id: COMMANDS.TOGGLE,
			name: 'Toggle Floating TOC',
			callback: () => this.toggleFloatingToc()
		});

		// Refresh TOC command
		this.addCommand({
			id: COMMANDS.REFRESH,
			name: 'Refresh TOC',
			callback: () => this.updateTocFromCurrentDocument()
		});

		// Debug command to test extraction
		this.addCommand({
			id: 'debug-toc-extraction',
			name: 'Debug TOC Extraction',
			callback: () => this.debugTocExtraction()
		});
	}

	private registerRibbonIcon(): void {
		this.addRibbonIcon('list', 'Toggle Floating TOC', () => {
			this.toggleFloatingToc();
		});
	}

	private registerSettingsTab(): void {
		if (this.settingsManager) {
			this.addSettingTab(new FloatingTocSettingsTab(this.app, this, this.settingsManager));
		}
	}

	private registerSettingsListeners(): void {
		if (this.settingsManager) {
			this.settingsManager.onChange((settings) => {
				// Update floating TOC with new settings
				if (this.floatingToc) {
					this.floatingToc.updateSettings(settings);
					
					// Update visibility based on settings
					if (settings.isVisible && !this.floatingToc.isVisible) {
						this.floatingToc.show();
					} else if (!settings.isVisible && this.floatingToc.isVisible) {
						this.floatingToc.hide();
					}
				}
			});
		}
	}

	private toggleFloatingToc(): void {
		if (this.floatingToc && this.settingsManager) {
			const newVisibility = !this.floatingToc.isVisible;
			this.floatingToc.setVisibility(newVisibility);
			
			// Update settings to persist the visibility state
			this.settingsManager.updateVisibility(newVisibility);
		}
	}

	private registerEventListeners(): void {
		// Listen for active leaf changes (when user switches between files)
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.updateTocFromCurrentDocument();
			})
		);

		// Listen for file modifications
		this.registerEvent(
			this.app.workspace.on('editor-change', () => {
				// Debounce the update to avoid excessive calls
				this.debounceUpdateToc();
			})
		);

		// Listen for layout changes
		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				this.updateTocFromCurrentDocument();
			})
		);
	}

	private debounceTimer: NodeJS.Timeout | null = null;
	
	private debounceUpdateToc(): void {
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}
		
		this.debounceTimer = setTimeout(() => {
			this.updateTocFromCurrentDocument();
		}, 500); // 500ms debounce
	}

	private updateTocFromCurrentDocument(): void {
		if (!this.tocManager || !this.floatingToc) {
			console.log('TOC Manager or Floating TOC not initialized');
			return;
		}

		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			console.log('No active markdown view found');
			this.floatingToc.updateEntries([]);
			return;
		}

		console.log('Active view found:', activeView);

		try {
			let contentElement: HTMLElement | null = null;

			// Try multiple approaches to get the rendered content
			
			// Approach 1: Try to get preview mode content
			if (activeView.getMode() === 'preview') {
				console.log('Document is in preview mode');
				contentElement = activeView.previewMode?.containerEl?.querySelector('.markdown-preview-view') as HTMLElement;
				if (contentElement) {
					console.log('Found preview content element');
				}
			}

			// Approach 2: Try reading mode content
			if (!contentElement) {
				console.log('Trying reading mode...');
				const readingView = activeView.containerEl.querySelector('.markdown-reading-view') as HTMLElement;
				if (readingView) {
					contentElement = readingView;
					console.log('Found reading mode content element');
				}
			}

			// Approach 3: Try any markdown preview view in the container
			if (!contentElement) {
				console.log('Trying any markdown preview view...');
				contentElement = activeView.containerEl.querySelector('.markdown-preview-view, .markdown-reading-view') as HTMLElement;
				if (contentElement) {
					console.log('Found markdown content element via fallback selector');
				}
			}

			// Approach 4: For source mode, try to parse markdown content
			if (!contentElement && activeView.getMode() === 'source') {
				console.log('Document is in source mode, attempting to parse markdown...');
				
				try {
					// Get the markdown content from the editor
					const markdownContent = activeView.editor.getValue();
					console.log('Got markdown content, length:', markdownContent.length);
					
					if (markdownContent.trim()) {
						// Create a temporary container with parsed headings
						contentElement = this.createTempContainerFromMarkdown(markdownContent);
						if (contentElement) {
							console.log('Created temporary container from markdown');
						}
					}
				} catch (error) {
					console.error('Error parsing markdown content:', error);
				}
				
				if (!contentElement) {
					console.log('Could not extract headings from source mode');
					this.floatingToc.updateEntries([]);
					return;
				}
			}

			if (contentElement) {
				console.log('Extracting headings from content element...');
				
				// Debug: log the content element structure
				console.log('Content element tag:', contentElement.tagName);
				console.log('Content element classes:', contentElement.className);
				console.log('Content element children count:', contentElement.children.length);
				
				// Check if there are any headings
				const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
				console.log(`Found ${headings.length} headings in document`);
				
				if (headings.length > 0) {
					// Log first few headings for debugging
					Array.from(headings).slice(0, 3).forEach((heading, index) => {
						console.log(`Heading ${index + 1}:`, heading.tagName, heading.textContent?.trim());
					});
				}

				// Initialize TOC manager with the content
				const state = this.tocManager.initialize(contentElement);
				console.log(`TOC extraction result: ${state.entries.length} entries`);
				
				// Update the floating TOC
				this.floatingToc.updateEntries(state.entries);

				// Start tracking active sections if we have entries
				if (state.entries.length > 0) {
					this.tocManager.startTracking((activeId) => {
						console.log('Active section changed to:', activeId);
						this.floatingToc?.updateActiveEntry(activeId);
					});
				}
			} else {
				console.log('No content element found - showing empty TOC');
				this.floatingToc.updateEntries([]);
			}
		} catch (error) {
			console.error('Error updating TOC from document:', error);
			this.floatingToc.updateEntries([]);
		}
	}

	private handleTocItemClick(id: string): void {
		console.log(`TOC item clicked: ${id}`);
		
		if (this.tocManager) {
			// Use the TOC manager's navigation handler for smooth scrolling
			this.tocManager.navigateToEntry(id, true)
				.then(() => {
					console.log(`Successfully navigated to: ${id}`);
				})
				.catch((error) => {
					console.error(`Navigation failed for ${id}:`, error);
					// Fallback to basic navigation on error
					this.fallbackNavigation(id);
				});
		} else {
			// Fallback to basic navigation
			this.fallbackNavigation(id);
		}
	}

	private fallbackNavigation(id: string): void {
		try {
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				console.log(`Fallback navigation to: ${id}`);
			} else {
				console.warn(`Fallback navigation failed: element with ID "${id}" not found`);
			}
		} catch (error) {
			console.error(`Fallback navigation error for ${id}:`, error);
		}
	}

	private cleanup(): void {
		// Clear debounce timer
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}

		// Cleanup settings manager
		if (this.settingsManager) {
			this.settingsManager.cleanup();
			this.settingsManager = null;
		}

		// Cleanup TOC manager
		if (this.tocManager) {
			this.tocManager.cleanup();
			this.tocManager = null;
		}

		// Cleanup floating TOC overlay
		if (this.floatingToc) {
			this.floatingToc.destroy();
			this.floatingToc = null;
		}
	}

	private createTempContainerFromMarkdown(markdownContent: string): HTMLElement | null {
		try {
			const container = document.createElement('div');
			
			// Simple regex to extract headings from markdown
			const headingRegex = /^(#{1,6})\s+(.+)$/gm;
			let match;
			let headingIndex = 0;
			
			while ((match = headingRegex.exec(markdownContent)) !== null) {
				const level = match[1].length; // Number of # characters
				const text = match[2].trim();
				
				if (text) {
					const headingElement = document.createElement(`h${level}`);
					headingElement.textContent = text;
					
					// Generate a simple ID from the text
					const id = text
						.toLowerCase()
						.replace(/[^\w\s-]/g, '')
						.replace(/[\s_-]+/g, '-')
						.replace(/^-+|-+$/g, '') || `heading-${headingIndex}`;
					
					headingElement.id = id;
					container.appendChild(headingElement);
					headingIndex++;
				}
			}
			
			console.log(`Created temp container with ${container.children.length} headings`);
			return container.children.length > 0 ? container : null;
		} catch (error) {
			console.error('Error creating temp container from markdown:', error);
			return null;
		}
	}

	private debugTocExtraction(): void {
		console.log('=== DEBUG TOC EXTRACTION ===');
		
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) {
			console.log('No active markdown view');
			return;
		}

		console.log('Active view mode:', activeView.getMode());
		console.log('Active view container:', activeView.containerEl);
		
		// Try to find all possible content containers
		const containers = [
			activeView.containerEl.querySelector('.markdown-preview-view'),
			activeView.containerEl.querySelector('.markdown-reading-view'),
			activeView.previewMode?.containerEl?.querySelector('.markdown-preview-view'),
			activeView.containerEl.querySelector('.view-content'),
			activeView.containerEl
		];

		containers.forEach((container, index) => {
			if (container) {
				console.log(`Container ${index + 1}:`, container.tagName, container.className);
				const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
				console.log(`  - Found ${headings.length} headings`);
				if (headings.length > 0) {
					Array.from(headings).slice(0, 3).forEach((h, i) => {
						console.log(`    ${i + 1}. ${h.tagName}: "${h.textContent?.trim()}"`);
					});
				}
			} else {
				console.log(`Container ${index + 1}: null`);
			}
		});

		// Test markdown parsing
		if (activeView.getMode() === 'source') {
			console.log('Testing markdown parsing...');
			const content = activeView.editor.getValue();
			console.log('Markdown content preview:', content.substring(0, 200) + '...');
			
			const tempContainer = this.createTempContainerFromMarkdown(content);
			if (tempContainer) {
				console.log('Temp container created successfully');
				const headings = tempContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
				console.log(`Temp container has ${headings.length} headings`);
			}
		}

		// Force update TOC
		this.updateTocFromCurrentDocument();
	}

	// Public API
	public getFloatingToc(): FloatingTocOverlay | null {
		return this.floatingToc;
	}

	public getSettingsManager(): SettingsManager | null {
		return this.settingsManager;
	}
}

// Export test functions to global scope for browser testing
if (typeof window !== 'undefined') {
	(window as any).testStateManagement = testStateManagement;
	(window as any).testReactStateIntegration = testReactStateIntegration;
	(window as any).verifyStateManagement = verifyStateManagement;
}
import { App, Plugin, PluginSettingTab, Setting, MarkdownView } from 'obsidian';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import AppComponent from './ui/App';
import { ObsidianAppProvider } from './ui/ObsidianAppContext';

interface FloatingTocPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: FloatingTocPluginSettings = {
	mySetting: 'default'
}

export default class FloatingTocPlugin extends Plugin {
	settings: FloatingTocPluginSettings = DEFAULT_SETTINGS;
	root: Root | null = null;
	tocContainer: HTMLElement | null = null;
	isFloatingTocEnabled: boolean = false;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new FloatingTocPluginSettingTab(this.app, this));

		// Add command to toggle floating TOC
		this.addCommand({
			id: 'toggle-floating-toc',
			name: 'Toggle Floating TOC',
			callback: () => {
				this.toggleFloatingToc();
			}
		});

		this.addRibbonIcon('list', 'Toggle Floating TOC', () => {
			this.toggleFloatingToc();
		});

		// Initialize floating TOC when workspace is ready
		this.app.workspace.onLayoutReady(() => {
			this.initializeFloatingToc();
		});

		// Reattach TOC when active view changes
		this.app.workspace.on('active-leaf-change', () => {
			if (this.isFloatingTocEnabled && this.tocContainer) {
				this.reattachToActiveEditor();
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	toggleFloatingToc() {
		this.isFloatingTocEnabled = !this.isFloatingTocEnabled;
		if (this.isFloatingTocEnabled) {
			this.showFloatingToc();
		} else {
			this.hideFloatingToc();
		}
	}

	initializeFloatingToc() {
		// Create container element attached to markdown editor
		this.tocContainer = document.createElement('div');
		this.tocContainer.className = 'floating-toc-plugin-container';
		this.tocContainer.style.position = 'absolute';
		this.tocContainer.style.top = '50%';
		this.tocContainer.style.left = '20px';
		this.tocContainer.style.transform = 'translateY(-50%)';
		this.tocContainer.style.zIndex = '1000';
		this.tocContainer.style.pointerEvents = 'auto';

		// Attach to active markdown editor container
		this.attachToActiveEditor();

		// Initialize React root
		this.root = createRoot(this.tocContainer);

		// Start with TOC hidden
		this.hideFloatingToc();
	}

	attachToActiveEditor() {
		if (!this.tocContainer) return;

		// Get the active markdown view
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (markdownView) {
			// Attach to the markdown editor's container
			const editorContainer = markdownView.containerEl;
			editorContainer.appendChild(this.tocContainer);
		}
	}

	reattachToActiveEditor() {
		if (!this.tocContainer) return;

		// Remove from current parent if it exists
		if (this.tocContainer.parentElement) {
			this.tocContainer.parentElement.removeChild(this.tocContainer);
		}

		// Reattach to active editor
		this.attachToActiveEditor();
	}

	showFloatingToc() {
		if (!this.tocContainer) return;

		// Reinitialize React root if it was cleaned up
		if (!this.root) {
			this.root = createRoot(this.tocContainer);
		}

		this.tocContainer.style.display = 'block';

		try {
			// Render the React component
			this.root.render(
				React.createElement(ObsidianAppProvider, { 
					app: this.app,
					children: React.createElement(AppComponent)
				})
			);
		} catch (error) {
			console.error('Error rendering Floating TOC:', error);
			this.hideFloatingToc();
		}
	}

	hideFloatingToc() {
		if (!this.tocContainer) return;


		// Clean up React root (this will trigger the service coordinator cleanup via useEffect)
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}

		// Hide the container
		this.tocContainer.style.display = 'none';

	}

	onunload() {

		// Clean up React root (this will trigger the service coordinator cleanup via useEffect)
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}

		// Clean up DOM elements
		if (this.tocContainer) {
			this.tocContainer.remove();
			this.tocContainer = null;
		}

	}
}

// Removed MyReactView - now using direct floating attachment to workspace



class FloatingTocPluginSettingTab extends PluginSettingTab {
	plugin: FloatingTocPlugin;

	constructor(app: App, plugin: FloatingTocPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Floating TOC Plugin Settings' });

		new Setting(containerEl)
			.setName('My Setting')
			.setDesc('A sample setting for the plugin')
			.addText(text => text
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
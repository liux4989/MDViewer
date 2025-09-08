import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import AppComponent from './ui/App';
import { ObsidianAppProvider } from './ui/ObsidianAppContext';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings = DEFAULT_SETTINGS;
	root: Root | null = null;
	tocContainer: HTMLElement | null = null;
	isFloatingTocEnabled: boolean = false;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new MyPluginSettingTab(this.app, this));

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
		// Create container element attached to workspace
		this.tocContainer = document.createElement('div');
		this.tocContainer.className = 'floating-toc-plugin-container';
		this.tocContainer.style.position = 'fixed';
		this.tocContainer.style.top = '80px';
		this.tocContainer.style.right = '20px';
		this.tocContainer.style.zIndex = '1000';
		this.tocContainer.style.pointerEvents = 'auto';
		
		// Attach to workspace container (editor area)
		const workspaceContainer = this.app.workspace.containerEl;
		workspaceContainer.appendChild(this.tocContainer);

		// Initialize React root
		this.root = createRoot(this.tocContainer);
		
		// Start with TOC hidden
		this.hideFloatingToc();
	}

	showFloatingToc() {
		if (!this.tocContainer || !this.root) return;
		
		this.tocContainer.style.display = 'block';
		
		// Render the floating TOC component
		this.root.render(
			React.createElement(ObsidianAppProvider, {
				app: this.app,
				children: React.createElement(AppComponent, { floatingMode: true })
			})
		);
	}

	hideFloatingToc() {
		if (!this.tocContainer) return;
		this.tocContainer.style.display = 'none';
	}

	onunload() {
		// Clean up
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
		
		if (this.tocContainer) {
			this.tocContainer.remove();
			this.tocContainer = null;
		}
	}
}

// Removed MyReactView - now using direct floating attachment to workspace



class MyPluginSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'My React Plugin Settings' });

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
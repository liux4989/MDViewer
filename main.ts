import { Plugin, WorkspaceLeaf, MarkdownView, TFile } from 'obsidian';
import { FloatingTocSettingsTab, FloatingTocSettings, DEFAULT_SETTINGS } from './src/settings/SettingsTab';
import { FloatingTocManager } from './src/core/FloatingTocManager';

export default class FloatingTocPlugin extends Plugin {
	settings!: FloatingTocSettings;
	tocManagers: Map<string, FloatingTocManager> = new Map();

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new FloatingTocSettingsTab(this.app, this));

		// Register events
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				this.handleActiveLeafChange(leaf);
			})
		);

		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				this.refreshAllTocManagers();
			})
		);

		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file instanceof TFile && file.extension === 'md') {
					this.refreshTocForFile(file);
				}
			})
		);

		// Initialize TOC for current active view
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			this.createTocManager(activeView);
		}

		// Add command to toggle TOC
		this.addCommand({
			id: 'toggle-floating-toc',
			name: 'Toggle Floating TOC',
			callback: () => {
				this.settings.enabled = !this.settings.enabled;
				this.saveSettings();
				this.refreshAllTocManagers();
			}
		});
	}

	onunload() {
		// Clean up all TOC managers
		this.tocManagers.forEach(manager => manager.destroy());
		this.tocManagers.clear();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateAllTocManagers();
	}

	private handleActiveLeafChange(leaf: WorkspaceLeaf | null) {
		if (!leaf) return;

		const view = leaf.view;
		if (view instanceof MarkdownView) {
			this.createTocManager(view);
		}
	}

	private createTocManager(view: MarkdownView) {
		const leafId = (view.leaf as any).id || Math.random().toString(36);
		
		// Clean up existing manager for this leaf
		if (this.tocManagers.has(leafId)) {
			this.tocManagers.get(leafId)?.destroy();
		}

		// Create new manager if enabled
		if (this.settings.enabled) {
			const manager = new FloatingTocManager(view, this.settings);
			this.tocManagers.set(leafId, manager);
		}
	}

	private refreshTocForFile(file: TFile) {
		this.tocManagers.forEach((manager, leafId) => {
			const leaf = this.app.workspace.getLeafById(leafId);
			if (leaf?.view instanceof MarkdownView && leaf.view.file === file) {
				manager.refresh();
			}
		});
	}

	private refreshAllTocManagers() {
		// Clean up all existing managers
		this.tocManagers.forEach(manager => manager.destroy());
		this.tocManagers.clear();

		// Recreate managers for all markdown views if enabled
		if (this.settings.enabled) {
			this.app.workspace.iterateAllLeaves(leaf => {
				if (leaf.view instanceof MarkdownView) {
					this.createTocManager(leaf.view);
				}
			});
		}
	}

	private updateAllTocManagers() {
		// Update settings for all existing managers
		this.tocManagers.forEach(manager => {
			manager.updateSettings(this.settings);
		});
		
		// If plugin was disabled, clean up
		if (!this.settings.enabled) {
			this.tocManagers.forEach(manager => manager.destroy());
			this.tocManagers.clear();
		}
		// If plugin was enabled and no managers exist, create them
		else if (this.tocManagers.size === 0) {
			this.app.workspace.iterateAllLeaves(leaf => {
				if (leaf.view instanceof MarkdownView) {
					this.createTocManager(leaf.view);
				}
			});
		}
	}
}

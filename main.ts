import { App, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } from 'obsidian';
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

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new MyPluginSettingTab(this.app, this));

		this.registerView(
			'floating-toc-view',
			(leaf) => new MyReactView(leaf, this)
		);

		this.addRibbonIcon('list', 'Activate Floating TOC', () => {
			this.activateView();
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType('floating-toc-view');
		await this.app.workspace.getRightLeaf(false)?.setViewState({
			type: 'floating-toc-view',
			active: true,
		});
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType('floating-toc-view')[0]
		);
	}
}

class MyReactView extends ItemView {
	plugin: MyPlugin;
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return 'floating-toc-view';
	}

	getDisplayText() {
		return 'My React View';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		this.root = createRoot(container as HTMLElement);
		this.root.render(
			React.createElement(ObsidianAppProvider, {
				app: this.plugin.app,
				children: React.createElement(AppComponent, null)
			})
		);
	}

	async onClose() {
		if (this.root) {
			this.root.unmount();
		}
	}
}



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
/**
 * Settings Tab for Floating TOC Plugin
 * Provides UI for configuring plugin settings in Obsidian's settings panel
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import { PluginSettings } from '../types';
import { SettingsManager } from './SettingsManager';

export class FloatingTocSettingsTab extends PluginSettingTab {
  private settingsManager: SettingsManager;

  constructor(app: App, plugin: any, settingsManager: SettingsManager) {
    super(app, plugin);
    this.settingsManager = settingsManager;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Header
    containerEl.createEl('h2', { text: 'Floating TOC Settings' });

    const settings = this.settingsManager.getSettings();

    // General Settings Section
    containerEl.createEl('h3', { text: 'General' });

    // Visibility setting
    new Setting(containerEl)
      .setName('Show TOC by default')
      .setDesc('Whether the TOC should be visible when opening documents')
      .addToggle(toggle => toggle
        .setValue(settings.isVisible)
        .onChange(async (value) => {
          await this.settingsManager.updateVisibility(value);
        }));

    // Position setting
    new Setting(containerEl)
      .setName('TOC position')
      .setDesc('Choose which side of the editor to display the TOC')
      .addDropdown(dropdown => dropdown
        .addOption('left', 'Left side')
        .addOption('right', 'Right side')
        .setValue(settings.position)
        .onChange(async (value) => {
          await this.settingsManager.updatePosition(value as 'left' | 'right');
        }));

    // Appearance Settings Section
    containerEl.createEl('h3', { text: 'Appearance' });

    // Width setting
    new Setting(containerEl)
      .setName('TOC width')
      .setDesc('Width of the TOC panel in pixels (200-800)')
      .addSlider(slider => slider
        .setLimits(200, 800, 50)
        .setValue(settings.appearance.width)
        .setDynamicTooltip()
        .onChange(async (value) => {
          await this.settingsManager.updateAppearance({ width: value });
        }));

    // Max height setting
    new Setting(containerEl)
      .setName('Maximum height')
      .setDesc('Maximum height of the TOC panel in pixels (300-1200)')
      .addSlider(slider => slider
        .setLimits(300, 1200, 50)
        .setValue(settings.appearance.maxHeight)
        .setDynamicTooltip()
        .onChange(async (value) => {
          await this.settingsManager.updateAppearance({ maxHeight: value });
        }));

    // Font size setting
    new Setting(containerEl)
      .setName('Font size')
      .setDesc('Size of the text in the TOC')
      .addDropdown(dropdown => dropdown
        .addOption('small', 'Small')
        .addOption('medium', 'Medium')
        .addOption('large', 'Large')
        .setValue(settings.appearance.fontSize)
        .onChange(async (value) => {
          await this.settingsManager.updateAppearance({ fontSize: value as 'small' | 'medium' | 'large' });
        }));

    // Behavior Settings Section
    containerEl.createEl('h3', { text: 'Behavior' });

    // Auto-hide setting
    new Setting(containerEl)
      .setName('Auto-hide TOC')
      .setDesc('Hide the TOC when not hovering over it')
      .addToggle(toggle => toggle
        .setValue(settings.behavior.autoHide)
        .onChange(async (value) => {
          await this.settingsManager.updateBehavior({ autoHide: value });
        }));

    // Smooth scroll setting
    new Setting(containerEl)
      .setName('Smooth scrolling')
      .setDesc('Use smooth scrolling animation when navigating to sections')
      .addToggle(toggle => toggle
        .setValue(settings.behavior.smoothScroll)
        .onChange(async (value) => {
          await this.settingsManager.updateBehavior({ smoothScroll: value });
        }));

    // Collapse nested setting
    new Setting(containerEl)
      .setName('Collapse nested sections')
      .setDesc('Start with nested sections collapsed by default')
      .addToggle(toggle => toggle
        .setValue(settings.behavior.collapseNested)
        .onChange(async (value) => {
          await this.settingsManager.updateBehavior({ collapseNested: value });
        }));

    // Show level numbers setting
    new Setting(containerEl)
      .setName('Show heading level numbers')
      .setDesc('Display heading level indicators (H1, H2, etc.) next to entries')
      .addToggle(toggle => toggle
        .setValue(settings.behavior.showLevelNumbers)
        .onChange(async (value) => {
          await this.settingsManager.updateBehavior({ showLevelNumbers: value });
        }));

    // Reset Settings Section
    containerEl.createEl('h3', { text: 'Reset' });

    new Setting(containerEl)
      .setName('Reset to defaults')
      .setDesc('Reset all settings to their default values')
      .addButton(button => button
        .setButtonText('Reset')
        .setWarning()
        .onClick(async () => {
          await this.settingsManager.resetSettings();
          this.display(); // Refresh the settings display
        }));

    // Add some helpful information
    containerEl.createEl('div', { 
      text: 'Changes are saved automatically and applied immediately.',
      cls: 'setting-item-description'
    });
  }
}
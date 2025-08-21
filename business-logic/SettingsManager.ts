/**
 * Settings Manager for Floating TOC Plugin
 * Handles settings persistence using Obsidian's data storage API
 */

import { Plugin } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from '../types';
import { ISettingsManager } from '../types/business-logic';

export class SettingsManager implements ISettingsManager {
  private plugin: Plugin;
  private settings: PluginSettings;
  private changeCallbacks: ((settings: PluginSettings) => void)[] = [];

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Load settings from Obsidian's data storage
   */
  async loadSettings(): Promise<PluginSettings> {
    try {
      const data = await this.plugin.loadData();
      
      if (data && typeof data === 'object') {
        // Merge loaded data with defaults to ensure all properties exist
        this.settings = this.mergeWithDefaults(data);
      } else {
        // No saved data, use defaults
        this.settings = { ...DEFAULT_SETTINGS };
      }

      // Validate the loaded settings
      if (!this.validateSettings(this.settings)) {
        console.warn('Invalid settings detected, resetting to defaults');
        this.settings = { ...DEFAULT_SETTINGS };
        await this.saveSettings(this.settings);
      }

      console.log('Settings loaded:', this.settings);
      return this.settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = { ...DEFAULT_SETTINGS };
      return this.settings;
    }
  }

  /**
   * Save settings to Obsidian's data storage
   */
  async saveSettings(settings: PluginSettings): Promise<void> {
    try {
      if (!this.validateSettings(settings)) {
        throw new Error('Invalid settings provided');
      }

      this.settings = { ...settings };
      await this.plugin.saveData(this.settings);
      
      console.log('Settings saved:', this.settings);
      
      // Notify listeners of settings change
      this.notifyChange();
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    try {
      this.settings = { ...DEFAULT_SETTINGS };
      await this.plugin.saveData(this.settings);
      
      console.log('Settings reset to defaults');
      this.notifyChange();
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  /**
   * Get default settings
   */
  getDefaults(): PluginSettings {
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Get current settings
   */
  getSettings(): PluginSettings {
    return { ...this.settings };
  }

  /**
   * Update specific setting values
   */
  async updateSettings(updates: Partial<PluginSettings>): Promise<void> {
    const newSettings = this.deepMerge(this.settings, updates);
    await this.saveSettings(newSettings);
  }

  /**
   * Update position setting
   */
  async updatePosition(position: 'left' | 'right'): Promise<void> {
    await this.updateSettings({ position });
  }

  /**
   * Update visibility setting
   */
  async updateVisibility(isVisible: boolean): Promise<void> {
    await this.updateSettings({ isVisible });
  }

  /**
   * Update appearance settings
   */
  async updateAppearance(appearance: Partial<PluginSettings['appearance']>): Promise<void> {
    const newAppearance = { ...this.settings.appearance, ...appearance };
    await this.updateSettings({ appearance: newAppearance });
  }

  /**
   * Update behavior settings
   */
  async updateBehavior(behavior: Partial<PluginSettings['behavior']>): Promise<void> {
    const newBehavior = { ...this.settings.behavior, ...behavior };
    await this.updateSettings({ behavior: newBehavior });
  }

  /**
   * Validate settings object structure and values
   */
  validateSettings(settings: any): boolean {
    if (!settings || typeof settings !== 'object') {
      return false;
    }

    // Check required top-level properties
    if (typeof settings.isVisible !== 'boolean' ||
        !['left', 'right'].includes(settings.position)) {
      return false;
    }

    // Check appearance settings
    if (!settings.appearance || typeof settings.appearance !== 'object') {
      return false;
    }

    const { appearance } = settings;
    if (typeof appearance.width !== 'number' || appearance.width < 200 || appearance.width > 800 ||
        typeof appearance.maxHeight !== 'number' || appearance.maxHeight < 300 || appearance.maxHeight > 1200 ||
        !['small', 'medium', 'large'].includes(appearance.fontSize)) {
      return false;
    }

    // Check behavior settings
    if (!settings.behavior || typeof settings.behavior !== 'object') {
      return false;
    }

    const { behavior } = settings;
    if (typeof behavior.autoHide !== 'boolean' ||
        typeof behavior.smoothScroll !== 'boolean' ||
        typeof behavior.collapseNested !== 'boolean' ||
        typeof behavior.showLevelNumbers !== 'boolean') {
      return false;
    }

    return true;
  }

  /**
   * Register callback for settings changes
   */
  onChange(callback: (settings: PluginSettings) => void): void {
    this.changeCallbacks.push(callback);
  }

  /**
   * Unregister callback for settings changes
   */
  offChange(callback: (settings: PluginSettings) => void): void {
    const index = this.changeCallbacks.indexOf(callback);
    if (index > -1) {
      this.changeCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of settings change
   */
  private notifyChange(): void {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(this.settings);
      } catch (error) {
        console.error('Error in settings change callback:', error);
      }
    });
  }

  /**
   * Merge loaded data with defaults to ensure all properties exist
   */
  private mergeWithDefaults(data: any): PluginSettings {
    const defaults = this.getDefaults();
    
    return {
      isVisible: typeof data.isVisible === 'boolean' ? data.isVisible : defaults.isVisible,
      position: ['left', 'right'].includes(data.position) ? data.position : defaults.position,
      appearance: {
        width: typeof data.appearance?.width === 'number' ? 
          Math.max(200, Math.min(800, data.appearance.width)) : defaults.appearance.width,
        maxHeight: typeof data.appearance?.maxHeight === 'number' ? 
          Math.max(300, Math.min(1200, data.appearance.maxHeight)) : defaults.appearance.maxHeight,
        fontSize: ['small', 'medium', 'large'].includes(data.appearance?.fontSize) ? 
          data.appearance.fontSize : defaults.appearance.fontSize
      },
      behavior: {
        autoHide: typeof data.behavior?.autoHide === 'boolean' ? 
          data.behavior.autoHide : defaults.behavior.autoHide,
        smoothScroll: typeof data.behavior?.smoothScroll === 'boolean' ? 
          data.behavior.smoothScroll : defaults.behavior.smoothScroll,
        collapseNested: typeof data.behavior?.collapseNested === 'boolean' ? 
          data.behavior.collapseNested : defaults.behavior.collapseNested,
        showLevelNumbers: typeof data.behavior?.showLevelNumbers === 'boolean' ? 
          data.behavior.showLevelNumbers : defaults.behavior.showLevelNumbers
      }
    };
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.changeCallbacks = [];
  }
}
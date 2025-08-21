/**
 * Test Settings Management Integration
 * Verifies that settings are properly loaded, saved, and applied
 */

import { SettingsManager } from './business-logic/SettingsManager';
import { PluginSettings, DEFAULT_SETTINGS } from './types';

// Mock Plugin class for testing
class MockPlugin {
  private data: any = null;

  async loadData(): Promise<any> {
    console.log('Mock loadData called, returning:', this.data);
    return this.data;
  }

  async saveData(data: any): Promise<void> {
    console.log('Mock saveData called with:', data);
    this.data = data;
  }

  setMockData(data: any): void {
    this.data = data;
  }
}

/**
 * Test settings loading and saving
 */
export async function testSettingsManager(): Promise<void> {
  console.log('=== Testing Settings Manager ===');

  const mockPlugin = new MockPlugin();
  const settingsManager = new SettingsManager(mockPlugin as any);

  try {
    // Test 1: Load default settings (no saved data)
    console.log('\n1. Testing default settings load...');
    let settings = await settingsManager.loadSettings();
    console.log('Loaded settings:', settings);
    
    if (JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS)) {
      console.log('✅ Default settings loaded correctly');
    } else {
      console.log('❌ Default settings mismatch');
    }

    // Test 2: Save settings
    console.log('\n2. Testing settings save...');
    const testSettings: PluginSettings = {
      ...DEFAULT_SETTINGS,
      position: 'left',
      appearance: {
        ...DEFAULT_SETTINGS.appearance,
        width: 400
      }
    };

    await settingsManager.saveSettings(testSettings);
    console.log('✅ Settings saved successfully');

    // Test 3: Load saved settings
    console.log('\n3. Testing saved settings load...');
    settings = await settingsManager.loadSettings();
    
    if (settings.position === 'left' && settings.appearance.width === 400) {
      console.log('✅ Saved settings loaded correctly');
    } else {
      console.log('❌ Saved settings not loaded correctly');
    }

    // Test 4: Update specific settings
    console.log('\n4. Testing settings updates...');
    await settingsManager.updatePosition('right');
    await settingsManager.updateAppearance({ fontSize: 'large' });
    
    settings = settingsManager.getSettings();
    if (settings.position === 'right' && settings.appearance.fontSize === 'large') {
      console.log('✅ Settings updates working correctly');
    } else {
      console.log('❌ Settings updates failed');
    }

    // Test 5: Settings validation
    console.log('\n5. Testing settings validation...');
    const validSettings = settingsManager.validateSettings(DEFAULT_SETTINGS);
    const invalidSettings = settingsManager.validateSettings({ invalid: 'data' });
    
    if (validSettings && !invalidSettings) {
      console.log('✅ Settings validation working correctly');
    } else {
      console.log('❌ Settings validation failed');
    }

    // Test 6: Reset settings
    console.log('\n6. Testing settings reset...');
    await settingsManager.resetSettings();
    settings = settingsManager.getSettings();
    
    if (JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS)) {
      console.log('✅ Settings reset working correctly');
    } else {
      console.log('❌ Settings reset failed');
    }

    // Test 7: Settings change callbacks
    console.log('\n7. Testing settings change callbacks...');
    let callbackCalled = false;
    settingsManager.onChange((newSettings) => {
      console.log('Settings change callback called with:', newSettings);
      callbackCalled = true;
    });

    await settingsManager.updateVisibility(false);
    
    if (callbackCalled) {
      console.log('✅ Settings change callbacks working correctly');
    } else {
      console.log('❌ Settings change callbacks failed');
    }

    // Test 8: Partial data loading (migration scenario)
    console.log('\n8. Testing partial data loading...');
    mockPlugin.setMockData({
      position: 'left',
      appearance: { width: 350 }
      // Missing other properties
    });

    settings = await settingsManager.loadSettings();
    
    if (settings.position === 'left' && 
        settings.appearance.width === 350 && 
        settings.isVisible === DEFAULT_SETTINGS.isVisible &&
        settings.behavior.smoothScroll === DEFAULT_SETTINGS.behavior.smoothScroll) {
      console.log('✅ Partial data loading working correctly');
    } else {
      console.log('❌ Partial data loading failed');
    }

    console.log('\n=== Settings Manager Tests Complete ===');

  } catch (error) {
    console.error('Settings manager test error:', error);
  }
}

/**
 * Test settings integration with plugin
 */
export async function testSettingsIntegration(): Promise<void> {
  console.log('\n=== Testing Settings Integration ===');

  // This would test the integration with the actual plugin
  // For now, we'll just verify the API exists
  
  if (typeof window !== 'undefined' && (window as any).app) {
    const app = (window as any).app;
    
    // Try to get the plugin instance
    const plugin = app.plugins.plugins['md-viewer'];
    
    if (plugin) {
      console.log('Plugin found:', plugin);
      
      const settingsManager = plugin.getSettingsManager();
      if (settingsManager) {
        console.log('✅ Settings manager accessible from plugin');
        
        const settings = settingsManager.getSettings();
        console.log('Current settings:', settings);
        
        // Test settings update through plugin
        const floatingToc = plugin.getFloatingToc();
        if (floatingToc) {
          console.log('✅ Floating TOC accessible from plugin');
          console.log('Current TOC visibility:', floatingToc.isVisible);
        }
      } else {
        console.log('❌ Settings manager not accessible from plugin');
      }
    } else {
      console.log('❌ Plugin not found');
    }
  } else {
    console.log('⚠️ Not running in Obsidian environment');
  }

  console.log('\n=== Settings Integration Tests Complete ===');
}

// Export test functions to global scope for browser testing
if (typeof window !== 'undefined') {
  (window as any).testSettingsManager = testSettingsManager;
  (window as any).testSettingsIntegration = testSettingsIntegration;
}
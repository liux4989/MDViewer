import React, { createContext, useContext, ReactNode } from 'react';
import { App } from 'obsidian';

// Create the context
const ObsidianAppContext = createContext<App | null>(null);

// Provider component
interface ObsidianAppProviderProps {
	app: App;
	children: ReactNode;
}

export const ObsidianAppProvider: React.FC<ObsidianAppProviderProps> = ({ app, children }) => {
	return (
		<ObsidianAppContext.Provider value={app}>
			{children}
		</ObsidianAppContext.Provider>
	);
};

// Custom hook to use the Obsidian app
export const useObsidianApp = (): App => {
	const app = useContext(ObsidianAppContext);
	if (!app) {
		throw new Error('useObsidianApp must be used within an ObsidianAppProvider');
	}
	return app;
};

// Generic hook for plugin data/settings
// This allows components to access plugin-specific data that was passed to the provider
export const usePluginData = <T,>(): T | null => {
	// This is a placeholder - in a real implementation, you'd want to pass plugin data
	// through the context or have a more sophisticated system
	// For now, components can use useObsidianApp() and access what they need
	return null;
};

export default ObsidianAppContext;

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


export default ObsidianAppContext;

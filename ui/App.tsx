import React from 'react';
import { TocProvidersWithEffects } from './stores/tocProvidersWithEffects';
import TocContainer from './components/TocContainer';
import { useObsidianApp } from './ObsidianAppContext';
import { ObsidianDataSource } from './datasources/obsidianDataSource';

interface AppProps {
	floatingMode?: boolean;
}

const App: React.FC<AppProps> = ({ floatingMode = false }) => {
	const app = useObsidianApp();
	const navigator = new ObsidianDataSource(app);

	// If in floating mode, only render the TOC
	if (floatingMode) {
		return (
			<TocProvidersWithEffects app={app} navigator={navigator}>
				<TocContainer visible={true} />
			</TocProvidersWithEffects>
		);
	}
	else {
		return (
			<h1> debug mode {floatingMode.toString()} </h1>
		);
	}

};

export default App;




import React from 'react';
import { TocUIProvider } from './stores/tocUIStore';
import TocContainer from './components/TocContainer';
import { useObsidianApp } from './ObsidianAppContext';

interface AppProps {
	floatingMode?: boolean;
}

const App: React.FC<AppProps> = ({ floatingMode = false }) => {
	const app = useObsidianApp();

	// If in floating mode, only render the TOC
	if (floatingMode) {
		return (
			<TocUIProvider app={app}>
				<TocContainer visible={true} />
			</TocUIProvider>
		);
	}
	else {
		return (
			<h1> debug mode {floatingMode.toString()} </h1>
		);
	}

};

export default App;




import React from 'react';
import { TocProvidersWithEffects } from './stores/tocProvidersWithEffects';
import TocContainer from './components/TocContainer';
import { useObsidianApp } from './ObsidianAppContext';
import { ObsidianDataSource } from './datasources/obsidianDataSource';
import { ErrorBoundary } from './components/ErrorBoundary';

interface AppProps {
	floatingMode?: boolean;
}

const App: React.FC<AppProps> = ({ floatingMode = false }) => {
	const app = useObsidianApp();
	const navigator = new ObsidianDataSource(app);

	// If in floating mode, only render the TOC
	if (floatingMode) {
		return (
			<ErrorBoundary
				onError={(error, errorInfo) => {
					console.error('Floating TOC Error:', error, errorInfo);
				}}
			>
				<TocProvidersWithEffects app={app} navigator={navigator}>
					<TocContainer visible={true} />
				</TocProvidersWithEffects>
			</ErrorBoundary>
		);
	}
	else {
		return (
			<ErrorBoundary>
				<h1> debug mode {floatingMode.toString()} </h1>
			</ErrorBoundary>
		);
	}

};

export default App;




import React from 'react';
import { useObsidianApp } from './ObsidianAppContext';

const App: React.FC = () => {
	const app = useObsidianApp();
	const [count, setCount] = React.useState(0);

	// Example of accessing Obsidian app properties
	const activeFile = app.workspace.getActiveFile();
	const vaultName = app.vault.getName();

	return (
		<div className="floating-toc-view">
			<h1>Floating TOC</h1>
			<p>React scaffold initialized with Obsidian context.</p>
			<p>Current count: {count}</p>
			<button className="ft-button" onClick={() => setCount(count + 1)}>Increment</button>
			<div className="ft-info">
				<p>Vault: {vaultName}</p>
				<p>Active file: {activeFile?.basename || 'None'}</p>
				<p>App context available: ✅</p>
			</div>
		</div>
	);
};

export default App;




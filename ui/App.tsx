import React from 'react';
import { useObsidianApp } from './ObsidianAppContext';
import TocIntegrationTest from './components/TocIntegrationTest';

const App: React.FC = () => {
	const app = useObsidianApp();
	const [showTest, setShowTest] = React.useState(false);

	// Example of accessing Obsidian app properties
	const activeFile = app.workspace.getActiveFile();
	const vaultName = app.vault.getName();

	return (
		<div className="floating-toc-view">
			<h1>Floating TOC</h1>
			<p>React scaffold initialized with Obsidian context.</p>
			
			<div className="ft-info" style={{ marginBottom: '16px' }}>
				<p>Vault: {vaultName}</p>
				<p>Active file: {activeFile?.basename || 'None'}</p>
				<p>App context available: ✅</p>
			</div>

			<div style={{ marginBottom: '16px' }}>
				<button
					className="ft-button"
					onClick={() => setShowTest(!showTest)}
					style={{
						padding: '8px 16px',
						backgroundColor: 'var(--interactive-accent)',
						color: 'var(--text-on-accent)',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					{showTest ? 'Hide' : 'Show'} Task 2.2 Unit Tests
				</button>
			</div>

			{showTest && <TocIntegrationTest />}
		</div>
	);
};

export default App;




import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log the error to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('ErrorBoundary caught an error:', error, errorInfo);
		}

		// Update state with error info
		this.setState({ error, errorInfo });

		// Call custom error handler if provided
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default fallback UI
			return (
				<div className="floating-toc-error-boundary">
					<div className="error-content">
						<h3>⚠️ Floating TOC Error</h3>
						<p>Something went wrong with the Floating TOC plugin.</p>
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="error-details">
								<summary>Error Details (Development)</summary>
								<pre className="error-stack">
									{this.state.error.stack}
								</pre>
								{this.state.errorInfo && (
									<pre className="error-info">
										{this.state.errorInfo.componentStack}
									</pre>
								)}
							</details>
						)}
						<button 
							className="error-retry-button"
							onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
						>
							Try Again
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Hook-based error boundary for functional components
export const useErrorHandler = () => {
	const [error, setError] = React.useState<Error | null>(null);

	const resetError = React.useCallback(() => {
		setError(null);
	}, []);

	const handleError = React.useCallback((error: Error) => {
		setError(error);
	}, []);

	React.useEffect(() => {
		if (error) {
			throw error;
		}
	}, [error]);

	return { handleError, resetError };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
	Component: React.ComponentType<P>,
	errorBoundaryProps?: Omit<Props, 'children'>
) => {
	const WrappedComponent = (props: P) => (
		<ErrorBoundary {...errorBoundaryProps}>
			<Component {...props} />
		</ErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
	
	return WrappedComponent;
};

export default ErrorBoundary;

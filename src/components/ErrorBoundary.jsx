import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4">
                    <div className="bg-[#202c33] p-8 rounded-xl shadow-2xl max-w-md w-full text-center border border-white/10">
                        <div className="bg-red-500/20 p-4 rounded-full w-fit mx-auto mb-6">
                            <AlertTriangle className="size-12 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-[#e9edef] mb-3">Something went wrong</h1>
                        <p className="text-[var(--wa-gray)] mb-6 text-sm">
                            We encountered an unexpected error. Please try reloading the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="text-left bg-black/30 p-4 rounded-lg mb-6 overflow-auto max-h-48 text-xs font-mono text-red-300">
                                {this.state.error.toString()}
                                <br />
                                {this.state.errorInfo?.componentStack}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full transition-colors"
                        >
                            <RefreshCcw className="size-5" />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Caught by ErrorBoundary:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-card p-6">
          <div className="w-12 h-12 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center mb-4 mx-auto">
            !
          </div>
          <h1 className="text-lg font-semibold text-slate-900 text-center">Something went wrong</h1>
          <p className="text-sm text-slate-500 text-center mt-1">
            We hit an unexpected error. Please try again.
          </p>
          {this.state.error?.message && (
            <pre className="text-xs text-slate-400 bg-slate-50 p-2 rounded mt-3 overflow-x-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

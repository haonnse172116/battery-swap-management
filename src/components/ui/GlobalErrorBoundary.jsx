import React, { Component } from "react";

class GlobalErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log lỗi (ví dụ Sentry, Datadog...)
    console.error("Application crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Application Error
          </h1>
          <p className="text-gray-600 mb-6">
            The application has encountered an unexpected error.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

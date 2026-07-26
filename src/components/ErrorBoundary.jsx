import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error in Component Tree:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '450px',
            width: '100%',
            border: '1px solid #fee2e2'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              margin: '0 auto 1rem'
            }}>
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '1.25rem', color: '1e293b', marginBottom: '0.5rem' }}>
              Oops! Something went wrong
            </h2>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              {this.state.error?.toString() || "An unexpected rendering error occurred."}
            </p>

            {this.state.errorInfo && (
              <pre style={{
                textAlign: 'left',
                fontSize: '0.7rem',
                backgroundColor: '#f1f5f9',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                overflowX: 'auto',
                marginBottom: '1.25rem',
                maxHeight: '150px',
                color: '#334155'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                backgroundColor: '#475569',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} /> Reset & Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

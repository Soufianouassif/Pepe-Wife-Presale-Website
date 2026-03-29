import React from 'react';
import i18n from '../i18n/config';

const IS_DEV = import.meta?.env?.DEV;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (IS_DEV) {
      console.error("Uncaught error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#ff0000', 
          color: '#fff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'sans-serif',
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{i18n.t('error_boundary.title')}</h1>
          <pre style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '10px', maxWidth: '90%', overflow: 'auto' }}>
            {IS_DEV ? (this.state.error?.stack || this.state.error?.message || i18n.t('error_boundary.unknown_error')) : i18n.t('error_boundary.something_wrong')}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '15px 30px',
              backgroundColor: '#fff',
              color: '#ff0000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
          >
            {i18n.t('error_boundary.reload')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

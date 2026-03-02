import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ToastContainer } from './components/Toast'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-300">
          <div className="text-center space-y-4 max-w-md px-6">
            <div className="text-4xl">⚔️</div>
            <h1 className="text-xl font-cinzel font-bold tracking-widest text-red-400">CRITICAL FAILURE</h1>
            <p className="text-sm text-slate-500">Something went wrong. Click below to reload.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-900/50 hover:text-white font-bold rounded tracking-wider transition-all"
            >
              RELOAD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <ToastContainer />
  </React.StrictMode>,
)

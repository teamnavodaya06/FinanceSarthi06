import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-8 rounded-[28px] bg-slate-900 border border-slate-800 shadow-2xl space-y-6 flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                FinanceSarthi System Resilience Gateway
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected runtime condition occurred. We've isolated the state error so your financial profile remains completely safe.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-[11px] font-mono text-red-400 overflow-x-auto max-h-40">
                <p className="font-bold text-red-300">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="text-[9px] text-slate-500 mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset State & Reload System</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { isChunkLoadError, triggerStaleChunkReload } from '../utils/lazyWithRetry.ts';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isStaleChunk: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isStaleChunk: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isStale = isChunkLoadError(error);
    return { hasError: true, error, isStaleChunk: isStale };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
    if (isChunkLoadError(error)) {
      triggerStaleChunkReload(error);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.state.isStaleChunk) {
        return (
          <div className="flex items-center justify-center min-h-[60vh] w-full px-4">
            <div className="max-w-md w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-8 text-center backdrop-blur-xl shadow-2xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 animate-spin text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Phiên bản mới đã sẵn sàng</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Hệ thống vừa cập nhật phiên bản mới. Vui lòng làm mới trang để tải các thành phần mới nhất.
              </p>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-all shadow-lg shadow-orange-600/20 cursor-pointer active:scale-95"
              >
                Làm mới trang (Reload)
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center p-8">
            <p className="text-slate-400 text-sm">Something went wrong</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null, isStaleChunk: false })}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700 transition-colors"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm hover:bg-orange-500 transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

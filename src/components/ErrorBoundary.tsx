import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(_: Error): State { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('ErrorBoundary:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center p-8">
            <p className="text-slate-400 text-sm">Something went wrong</p>
            <button onClick={() => this.setState({ hasError: false })} className="mt-4 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm hover:bg-orange-500 transition-colors">Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

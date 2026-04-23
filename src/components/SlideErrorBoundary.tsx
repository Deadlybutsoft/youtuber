'use client';
import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallbackTitle?: string; }
interface State { hasError: boolean; }

export default class SlideErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.error('Slide render error:', err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full text-white/50 gap-3 p-8">
          <span className="text-[48px]">⚠️</span>
          <p className="text-[16px] font-mono">This slide couldn't render</p>
          {this.props.fallbackTitle && <p className="text-[14px] opacity-50">{this.props.fallbackTitle}</p>}
        </div>
      );
    }
    return this.props.children;
  }
}

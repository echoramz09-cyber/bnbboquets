/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Caught runtime error gracefully:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-beige-100 flex items-center justify-center p-4 font-montserrat text-beige-900">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl border border-beige-300 space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-[#5d4037] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🌸
            </div>
            <h2 className="text-lg font-bold text-beige-900">Bright 'n Bliss</h2>
            <p className="text-xs text-beige-900/70">
              The application resumed after being in the background. Tap below to continue smoothly.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-[#5d4037] hover:bg-[#4a332c] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Resume Store
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

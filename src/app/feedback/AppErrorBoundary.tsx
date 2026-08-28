import { Component, type ErrorInfo, type ReactNode } from "react";
import { C } from "../colorTokens";

type Props = { children: ReactNode };
type State = { error: Error | null; errorId: string };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorId: "" };

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    return { error, errorId };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ background: C.bg }}
        >
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 22, color: C.text }}>
            Something went wrong
          </p>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 400, color: C.textMuted, maxWidth: 420 }}>
            The application hit an unexpected error. Reload the page to continue.
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMuted }}>
            Reference: {this.state.errorId}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md"
            style={{
              background: C.accent,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

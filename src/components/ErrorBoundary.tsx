import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
};

type State = {
  error: Error | null;
};

/** Evita tela preta quando um filho (ex.: Dashboard) lança no render. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center min-h-[320px] p-6">
          <div className="max-w-md text-center space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              {this.props.fallbackTitle ?? 'Falha ao carregar esta tela'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error.message || 'Erro inesperado no frontend.'}
            </p>
            <button
              type="button"
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

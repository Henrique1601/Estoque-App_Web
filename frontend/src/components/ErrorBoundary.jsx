import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="min-h-[100dvh] bg-kraft flex items-center justify-center p-4">
          <div className="tag-card p-6 max-w-sm text-center" style={{ transform: 'none' }}>
            <span className="tag-hole" aria-hidden="true" />
            <h2 className="font-mono text-sm font-medium text-ink mb-2">Algo deu errado</h2>
            <p className="text-xs text-stamp font-mono mb-4">{this.state.erro.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-ink text-paper px-4 py-2 rounded-md text-sm btn-press"
            >
              recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

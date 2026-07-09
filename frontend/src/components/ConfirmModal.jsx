import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap, salvarFoco, restaurarFoco } from '../hooks/useFocusTrap.js';

export default function ConfirmModal({ aberto, titulo, mensagem, acao, acaoLabel, aoFechar, aoConfirmar }) {
  const ref = useRef(null);
  useFocusTrap(aberto, ref);

  useEffect(() => {
    if (!aberto) return;
    salvarFoco();
    function handleEsc(e) { if (e.key === 'Escape') aoFechar(); }
    document.addEventListener('keydown', handleEsc);
    return () => { restaurarFoco(); document.removeEventListener('keydown', handleEsc); };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4" role="alertdialog" aria-modal="true" aria-label={titulo}
      onClick={(e) => e.target === e.currentTarget && aoFechar()}>
      <div ref={ref} className="tag-card p-6 w-full max-w-sm space-y-4 card-enter" style={{ transform: 'none', animationDelay: '0s' }}>
        <span className="tag-hole" aria-hidden="true" />
        <h2 className="font-mono text-sm font-medium text-ink tracking-wide">{titulo}</h2>
        <p className="text-sm text-ink/70 font-mono leading-relaxed">{mensagem}</p>
        {acao && <p className="text-xs text-stamp font-mono">"{acao}"</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={aoConfirmar} autoFocus
            className="bg-stamp text-paper px-4 py-2 rounded-md text-sm font-medium btn-press">
            {acaoLabel || 'confirmar'}
          </button>
          <button onClick={aoFechar}
            className="border border-ink/20 px-4 py-2 rounded-md text-sm btn-press">
            cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

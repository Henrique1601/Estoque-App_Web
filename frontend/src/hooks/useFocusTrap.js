import { useEffect } from 'react';

const FOCO_ANTERIOR = typeof document !== 'undefined' ? document.activeElement : null;
let FOCO_SALVO = FOCO_ANTERIOR;

export function salvarFoco() {
  FOCO_SALVO = document.activeElement;
}

export function restaurarFoco() {
  if (FOCO_SALVO && FOCO_SALVO.focus) FOCO_SALVO.focus();
}

export function useFocusTrap(aberto, ref) {
  useEffect(() => {
    if (!aberto || !ref.current) return;

    const container = ref.current;
    const focado = container.querySelector('[autofocus]') || container;
    if (focado && focado.focus) focado.focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(ev);
        return;
      }
      if (e.key !== 'Tab') return;

      const focaveis = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [aberto, ref]);
}

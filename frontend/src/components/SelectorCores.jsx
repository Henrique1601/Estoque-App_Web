import { useState } from 'react';
import { CORES_CELULAR, corToHex } from '../constants/coresCelular.js';

export default function SelectorCores({ value, onChange, simples }) {
  const [pesquisa, setPesquisa] = useState('');

  if (simples) {
    return (
      <div>
        <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">cor</label>
        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto mb-2" role="listbox" aria-label="Cores sugeridas">
          {CORES_CELULAR.slice(0, 30).map((cor) => (
            <button key={cor} type="button" role="option" aria-selected={value === cor}
              onClick={() => onChange(cor)}
              className={`text-xs px-2 py-1 rounded border transition-all ${
                value === cor
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink/70 border-ink/15 hover:border-ink/40'
              }`}>
              {cor}
            </button>
          ))}
        </div>
        <input value={CORES_CELULAR.includes(value) ? '' : value}
          placeholder="ou digite cor personalizada..."
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper" aria-label="Cor personalizada" />
        {value && (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink/70 mt-1 font-mono" aria-live="polite">
            <span className="inline-block w-3 h-3 rounded-full border border-ink/20"
              style={{ backgroundColor: corToHex(value) }} />
            {value}
          </span>
        )}
      </div>
    );
  }

  const filtradas = CORES_CELULAR.filter((c) =>
    c.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div>
      <label className="block text-[10px] text-twine font-mono uppercase tracking-wider mb-1">cor</label>
      <input type="text" placeholder="buscar ou digitar cor..." value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper mb-2"
        aria-label="Buscar cor"
      />
      {pesquisa && filtradas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto mb-2 p-1.5 border border-ink/10 rounded-md bg-kraft-dark/10" role="listbox" aria-label="Cores sugeridas">
          {filtradas.slice(0, 20).map((cor) => (
            <button key={cor} type="button" role="option" aria-selected={value === cor}
              onClick={() => { onChange(cor); setPesquisa(''); }}
              className={`text-xs px-2 py-1 rounded border transition-all ${
                value === cor
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink/70 border-ink/15 hover:border-ink/40'
              }`}>
              {cor}
            </button>
          ))}
        </div>
      )}
      <input type="text" placeholder="cor personalizada..." value={CORES_CELULAR.includes(value) ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm input-tag bg-paper"
        aria-label="Cor personalizada"
      />
      {value && (
        <span className="inline-flex items-center gap-1.5 text-xs text-ink/70 mt-1 font-mono" aria-live="polite">
          <span className="inline-block w-3 h-3 rounded-full border border-ink/20"
            style={{ backgroundColor: corToHex(value) }}
          />
          {value}
        </span>
      )}
    </div>
  );
}

import { Database, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DATA_DICTIONARY,
  PROCESSES,
  SCREEN_MATRIX,
  SYSTEM_MESSAGES,
} from '../data/dataDictionary';

type Tab = 'entities' | 'messages' | 'processes' | 'matrix';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'entities', label: 'Entidades y campos' },
  { id: 'messages', label: 'Mensajes del sistema' },
  { id: 'processes', label: 'Procesos' },
  { id: 'matrix', label: 'Pantalla · proceso · datos' },
];

const MESSAGE_STYLE: Record<string, string> = {
  Error: 'bg-[#FDE8E8] text-[#BF2626]',
  Advertencia: 'bg-[#FFF5D9] text-[#A86A06]',
  Éxito: 'bg-[#E6F6EC] text-[#177A3D]',
};

export function DataDictionaryScreen() {
  const [tab, setTab] = useState<Tab>('entities');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const entities = useMemo(
    () =>
      DATA_DICTIONARY.filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.fields.some(
            (fld) =>
              fld.name.toLowerCase().includes(q) ||
              fld.description.toLowerCase().includes(q)
          )
      ),
    [q]
  );

  const fieldCount = DATA_DICTIONARY.reduce((s, e) => s + e.fields.length, 0);

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#E2E6ED] rounded-xl p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] mb-1">
              Caso de uso Realizar Matrícula · Periodo 2026-02
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight">
              Diccionario de datos y procesos
            </h1>
            <p className="mt-1.5 text-sm text-[#475569] leading-relaxed max-w-3xl">
              Cada campo de la interfaz se basa en estas entidades. {DATA_DICTIONARY.length}{' '}
              entidades, {fieldCount} campos, {SYSTEM_MESSAGES.length} mensajes del sistema
              y {PROCESSES.length} procesos del DFD. <strong>PK</strong> es llave primaria y{' '}
              <strong>FK</strong> llave foránea.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div role="tablist" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                tab === t.id
                  ? 'bg-[#0F1E36] text-white'
                  : 'bg-white border border-[#E2E6ED] text-[#475569] hover:text-[#0F1E36]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'entities' && (
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar entidad o campo…"
              aria-label="Buscar entidad o campo"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
            />
          </div>
        )}
      </div>

      {tab === 'entities' && (
        <div className="space-y-5">
          {entities.length === 0 && (
            <p className="text-sm text-[#475569] bg-white border border-[#E2E6ED] rounded-xl p-5">
              No hay entidades o campos que coincidan con “{query}”.
            </p>
          )}
          {entities.map((entity) => (
            <section
              key={entity.name}
              className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC]">
                <h2 className="text-sm font-bold text-[#0F1E36] font-mono">
                  {entity.name}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">{entity.description}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED]">
                      <th className="px-5 py-2.5 font-semibold">Campo</th>
                      <th className="px-3 py-2.5 font-semibold">Tipo</th>
                      <th className="px-3 py-2.5 font-semibold">Formato / longitud</th>
                      <th className="px-3 py-2.5 font-semibold">Obligatorio</th>
                      <th className="px-5 py-2.5 font-semibold">Descripción y regla</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E6ED]">
                    {entity.fields.map((fld) => (
                      <tr key={fld.name}>
                        <td className="px-5 py-2.5 font-mono text-xs font-semibold text-[#0F1E36] whitespace-nowrap">
                          {fld.name}
                          {fld.key && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                fld.key === 'PK'
                                  ? 'bg-[#E3EEFC] text-[#143F7A]'
                                  : 'bg-[#F1F5F9] text-[#475569]'
                              }`}
                            >
                              {fld.key}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[#475569] whitespace-nowrap">{fld.type}</td>
                        <td className="px-3 py-2.5 text-[#475569]">{fld.format}</td>
                        <td className="px-3 py-2.5 text-[#475569]">{fld.required ? 'Sí' : 'No'}</td>
                        <td className="px-5 py-2.5 text-[#475569]">{fld.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'messages' && (
        <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED] bg-[#F8FAFC]">
                <th className="px-5 py-3 font-semibold">Código</th>
                <th className="px-3 py-3 font-semibold">Tipo</th>
                <th className="px-3 py-3 font-semibold">Texto</th>
                <th className="px-5 py-3 font-semibold">Regla</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6ED]">
              {SYSTEM_MESSAGES.map((m) => (
                <tr key={m.code}>
                  <td className="px-5 py-2.5 font-mono text-xs font-semibold text-[#0F1E36] whitespace-nowrap">{m.code}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${MESSAGE_STYLE[m.type]}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#334155]">{m.text}</td>
                  <td className="px-5 py-2.5 text-[#475569]">{m.rule ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'processes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PROCESSES.map((p) => (
            <section key={p.id} className="bg-white border border-[#E2E6ED] rounded-xl p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-bold text-[#0F1E36]">
                  <span className="font-mono text-[#1D4ED8] mr-2">{p.id}</span>
                  {p.name}
                </h2>
                <span className="text-xs text-[#64748B] whitespace-nowrap">Pantallas {p.screens}</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-[#64748B]">Entradas</dt>
                  <dd className="text-[#334155]">{p.inputs}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#64748B]">Salidas</dt>
                  <dd className="text-[#334155]">{p.outputs}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#64748B]">Lógica</dt>
                  <dd className="text-[#334155] leading-relaxed">{p.logic}</dd>
                </div>
              </dl>
            </section>
          ))}
        </div>
      )}

      {tab === 'matrix' && (
        <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED] bg-[#F8FAFC]">
                <th className="px-5 py-3 font-semibold">Pantalla</th>
                <th className="px-3 py-3 font-semibold">Procesos</th>
                <th className="px-5 py-3 font-semibold">Entidades principales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6ED]">
              {SCREEN_MATRIX.map((r) => (
                <tr key={r.screen}>
                  <td className="px-5 py-2.5 font-medium text-[#0F1E36] whitespace-nowrap">{r.screen}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-[#1D4ED8] whitespace-nowrap">{r.processes}</td>
                  <td className="px-5 py-2.5 text-[#475569]">{r.entities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

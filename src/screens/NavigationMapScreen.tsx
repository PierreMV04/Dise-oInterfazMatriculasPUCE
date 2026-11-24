import { ArrowRight, Route } from 'lucide-react';
import { useState } from 'react';
import {
  INTERFACE_RULES,
  IO_MATRIX,
  MAIN_FLOW,
  NAV_CONNECTIONS,
} from '../data/navigationMap';

type Tab = 'map' | 'rules' | 'io';

export function NavigationMapScreen() {
  const [tab, setTab] = useState<Tab>('map');
  const [onlyMain, setOnlyMain] = useState(false);

  const rows = onlyMain
    ? NAV_CONNECTIONS.filter((c) => c.kind === 'principal')
    : NAV_CONNECTIONS;

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#E2E6ED] rounded-xl p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] mb-1">
              Caso de uso Realizar Matrícula · Pasos 1 y 3
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight">
              Mapa de navegación y reglas de interfaz
            </h1>
            <p className="mt-1.5 text-sm text-[#475569] leading-relaxed max-w-3xl">
              Las pantallas no son independientes: cada conexión tiene una condición que decide a
              cuál se va. Las excepciones salen del flujo principal y regresan a él.
            </p>
          </div>
        </div>
      </section>

      <div role="tablist" className="flex flex-wrap gap-2">
        {([
          ['map', 'Mapa de navegación'],
          ['rules', 'Reglas de interfaz y validaciones'],
          ['io', 'Matriz Entrada–Proceso–Salida'],
        ] as Array<[Tab, string]>).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              tab === id
                ? 'bg-[#0F1E36] text-white'
                : 'bg-white border border-[#E2E6ED] text-[#475569] hover:text-[#0F1E36]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'map' && (
        <>
          <section className="bg-white border border-[#E2E6ED] rounded-xl p-5 sm:p-6">
            <h2 className="text-sm font-bold text-[#0F1E36] mb-3">Flujo principal</h2>
            <ol className="flex flex-wrap items-center gap-2">
              {MAIN_FLOW.map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="px-3 py-2 rounded-lg bg-[#EFF6FF] text-[#143F7A] text-xs sm:text-sm font-semibold border border-[#BFD4F5]">
                    {s}
                  </span>
                  {i < MAIN_FLOW.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-[#64748B]">
              La consulta de estado (18) se abre desde el menú principal (03) y desde el
              comprobante (16). Las pantallas 02, 04, 05, 07 a 11, 13, 15 y 17 son excepciones.
            </p>
          </section>

          <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#0F1E36]">
                Conexiones entre pantallas ({rows.length})
              </h2>
              <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyMain}
                  onChange={(e) => setOnlyMain(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#1D4ED8]"
                />
                Mostrar solo el flujo principal
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED]">
                    <th className="px-5 py-2.5 font-semibold">Nº</th>
                    <th className="px-3 py-2.5 font-semibold">Pantalla origen</th>
                    <th className="px-3 py-2.5 font-semibold">Pantalla destino</th>
                    <th className="px-5 py-2.5 font-semibold">Condición o acción que dispara la navegación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6ED]">
                  {rows.map((c, i) => (
                    <tr key={`${c.from}-${c.to}-${i}`}>
                      <td className="px-5 py-2.5 font-mono text-xs text-[#64748B]">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-[#0F1E36]">{c.from}</td>
                      <td className="px-3 py-2.5 font-medium text-[#0F1E36]">{c.to}</td>
                      <td className="px-5 py-2.5 text-[#475569]">
                        {c.condition}
                        {c.kind === 'excepcion' && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FFF5D9] text-[#A86A06] text-[10px] font-bold uppercase">
                            excepción
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === 'rules' && (
        <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED] bg-[#F8FAFC]">
                  <th className="px-5 py-3 font-semibold">Nº</th>
                  <th className="px-3 py-3 font-semibold">Regla de negocio / validación</th>
                  <th className="px-3 py-3 font-semibold">¿En qué pantalla se aplica?</th>
                  <th className="px-3 py-3 font-semibold">¿Qué mensaje muestra al usuario?</th>
                  <th className="px-5 py-3 font-semibold">¿Qué acción toma el sistema?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED]">
                {INTERFACE_RULES.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="px-5 py-3 font-mono text-xs text-[#64748B]">{r.id}</td>
                    <td className="px-3 py-3 font-medium text-[#0F1E36]">{r.rule}</td>
                    <td className="px-3 py-3 text-[#475569]">{r.screen}</td>
                    <td className="px-3 py-3 text-[#475569]">“{r.message}”</td>
                    <td className="px-5 py-3 text-[#475569]">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'io' && (
        <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED] bg-[#F8FAFC]">
                  <th className="px-5 py-3 font-semibold">Entrada (formulario o pantalla)</th>
                  <th className="px-3 py-3 font-semibold">Proceso del sistema que lo atiende</th>
                  <th className="px-3 py-3 font-semibold">Salida que se genera</th>
                  <th className="px-5 py-3 font-semibold">¿Se conecta con el Taller 13.1? ¿En qué parte?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED]">
                {IO_MATRIX.map((r) => (
                  <tr key={r.input} className="align-top">
                    <td className="px-5 py-3 font-semibold text-[#0F1E36]">{r.input}</td>
                    <td className="px-3 py-3 text-[#475569]">{r.process}</td>
                    <td className="px-3 py-3 text-[#475569]">{r.output}</td>
                    <td className="px-5 py-3 text-[#475569]">{r.link}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

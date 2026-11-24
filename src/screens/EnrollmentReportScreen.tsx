import { ChevronDown, ChevronRight, Download, FileBarChart, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Course, EnrollmentReceipt } from '../types/enrollment';
import {
  REPORT_CAREERS,
  REPORT_PERIODS,
  ReportFilters,
  buildEnrollmentReport,
  reportToCsv,
} from '../utils/enrollmentReport';

interface EnrollmentReportScreenProps {
  initialCatalog: Course[];
  catalog: Course[];
  receipts: EnrollmentReceipt[];
  baselineStudents: string[];
}

const DEFAULT_FILTERS: ReportFilters = { period: '2026-02', career: 'all', subject: 'all' };

function Tag({ children }: { children: string }) {
  return <code className="ml-1.5 text-[10px] font-mono font-normal text-[#64748B]">{children}</code>;
}

export function EnrollmentReportScreen({
  initialCatalog,
  catalog,
  receipts,
  baselineStudents,
}: EnrollmentReportScreenProps) {
  const [draft, setDraft] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const [open, setOpen] = useState<Set<string>>(() => {
    const p = new URLSearchParams(window.location.search).get('abrir');
    return new Set(p ? p.split(',') : []);
  });

  const subjectOptions = useMemo(() => {
    const seen = new Map<string, string>();
    catalog.forEach((c) => seen.set(c.code, c.name));
    return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [catalog]);

  const report = useMemo(
    () => buildEnrollmentReport(initialCatalog, catalog, receipts, baselineStudents, applied),
    [initialCatalog, catalog, receipts, baselineStudents, applied]
  );

  const generate = () => {
    setApplied(draft);
    setGeneratedAt(new Date());
    setOpen(new Set());
  };

  const clear = () => {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setGeneratedAt(new Date());
    setOpen(new Set());
  };

  const toggle = (code: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const expandAll = () => setOpen(new Set(report.subjects.map((s) => s.code)));

  const handlePrint = () => {
    expandAll();
    setTimeout(() => window.print(), 150);
  };

  const handleCsv = () => {
    const blob = new Blob(['﻿' + reportToCsv(report, applied)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Matriculados_por_asignatura_${applied.period}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const when = generatedAt.toLocaleString('es-EC', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const selectBase =
    'w-full px-3 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15';

  return (
    <div className="space-y-6">
      <section className="no-print bg-white border border-[#E2E6ED] rounded-xl p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
            <FileBarChart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748B] mb-1">Secretaría Académica · Reporte gerencial</p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight">
              Estudiantes matriculados por asignatura
            </h1>
            <p className="mt-1.5 text-sm text-[#475569] max-w-3xl">
              Elige los filtros y genera el reporte. Los datos son simulados y se actualizan con las
              matrículas que se confirmen en el sistema.
            </p>
          </div>
        </div>
      </section>

      <section className="no-print bg-white border border-[#E2E6ED] rounded-xl p-5">
        <h2 className="text-sm font-bold text-[#0F1E36] mb-3">Filtros de entrada</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#0F1E36]">Periodo académico<Tag>PERIODO.codigo_periodo</Tag></span>
            <select value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} className={selectBase}>
              {REPORT_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#0F1E36]">Carrera<Tag>CARRERA.codigo_carrera</Tag></span>
            <select value={draft.career} onChange={(e) => setDraft({ ...draft, career: e.target.value })} className={selectBase}>
              <option value="all">Todas las carreras</option>
              {REPORT_CAREERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#0F1E36]">Asignatura<Tag>ASIGNATURA.codigo_asignatura</Tag></span>
            <select value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className={selectBase}>
              <option value="all">Todas las asignaturas</option>
              {subjectOptions.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={generate} className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg cursor-pointer">
            Generar reporte
          </button>
          <button type="button" onClick={clear} className="px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F1E36] text-sm font-semibold rounded-lg cursor-pointer">
            Limpiar filtros
          </button>
          <span className="flex-1" />
          <button type="button" onClick={expandAll} className="px-3 py-2 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer">
            Expandir todo
          </button>
          <button type="button" onClick={() => setOpen(new Set())} className="px-3 py-2 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer">
            Contraer todo
          </button>
          <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F1E36] text-xs font-semibold rounded-lg cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
          <button type="button" onClick={handleCsv} disabled={report.subjects.length === 0} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F1E36] text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </section>

      <article aria-label="Reporte de estudiantes matriculados por asignatura" className="print-only-container space-y-5">
        <header className="bg-white border border-[#E2E6ED] rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#1D4ED8]">Pontificia Universidad Católica del Ecuador · Secretaría Académica</p>
            <h2 className="text-lg font-bold text-[#0F1E36] mt-1">Estudiantes matriculados por asignatura</h2>
            <p className="text-sm text-[#475569] mt-0.5">
              Periodo {applied.period} · {applied.career === 'all' ? 'Todas las carreras' : applied.career} ·{' '}
              {applied.subject === 'all' ? 'Todas las asignaturas' : `Asignatura ${applied.subject}`}
            </p>
          </div>
          <p className="text-xs text-[#64748B] sm:text-right">
            Generado el <span className="font-mono text-[#0F1E36]">{when}</span>
          </p>
        </header>

        {report.subjects.length === 0 ? (
          <p className="bg-white border border-[#E2E6ED] rounded-xl p-6 text-sm text-[#475569]">
            No hay matrículas registradas para el periodo {applied.period} con los filtros elegidos.
          </p>
        ) : (
          <>
            {report.subjects.map((s) => {
              const isOpen = open.has(s.code);
              const pct = Math.round((s.occupied / s.seatsTotal) * 100);
              return (
                <section key={s.code} className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden break-inside-avoid-page">
                  <button
                    type="button"
                    onClick={() => toggle(s.code)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E6ED] flex flex-wrap items-center gap-x-4 gap-y-2 cursor-pointer"
                  >
                    {isOpen ? <ChevronDown className="w-4 h-4 text-[#64748B]" /> : <ChevronRight className="w-4 h-4 text-[#64748B]" />}
                    <span className="font-mono text-xs font-bold text-[#1D4ED8]">{s.code}</span>
                    <span className="text-sm font-bold text-[#0F1E36]">{s.name}</span>
                    <span className="text-xs text-[#64748B]">{s.credits} créditos · {s.professors}</span>
                    <span className="flex-1" />
                    {s.available === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FDE8E8] text-[#BF2626] text-[10px] font-bold uppercase">Sin cupo</span>
                    )}
                    <span className="text-xs font-semibold text-[#0F1E36] tabular-nums">
                      {s.occupied} / {s.seatsTotal} cupos ocupados ({pct}%)
                    </span>
                  </button>

                  {isOpen && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED]">
                            <th className="px-5 py-2.5 font-semibold">Nº</th>
                            <th className="px-3 py-2.5 font-semibold">Código de estudiante</th>
                            <th className="px-3 py-2.5 font-semibold">Apellidos y nombres</th>
                            <th className="px-3 py-2.5 font-semibold">Grupo</th>
                            <th className="px-3 py-2.5 font-semibold">Estado de matrícula</th>
                            <th className="px-5 py-2.5 font-semibold">Fecha de registro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E6ED]">
                          {s.rows.map((r, i) => (
                            <tr key={`${r.groupId}-${r.studentCode}`}>
                              <td className="px-5 py-2 font-mono text-xs text-[#64748B]">{i + 1}</td>
                              <td className="px-3 py-2 font-mono text-xs font-semibold text-[#0F1E36]">{r.studentCode}</td>
                              <td className="px-3 py-2 text-[#0F1E36]">{r.fullName}</td>
                              <td className="px-3 py-2 text-[#475569]">{r.section}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${r.state === 'Matriculado' ? 'bg-[#E6F6EC] text-[#177A3D]' : 'bg-[#FFF5D9] text-[#A86A06]'}`}>
                                  {r.state}
                                </span>
                              </td>
                              <td className="px-5 py-2 font-mono text-xs text-[#475569]">{r.registeredAt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="px-5 py-3 border-t border-[#E2E6ED] bg-[#F8FAFC] flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#475569]">
                    <span className="font-bold text-[#0F1E36]">Total {s.code}</span>
                    <span>Matriculados: <strong className="text-[#0F1E36]">{s.occupied}</strong></span>
                    <span>Cupo total: <strong className="text-[#0F1E36]">{s.seatsTotal}</strong></span>
                    <span>Disponibles: <strong className={s.available === 0 ? 'text-[#BF2626]' : 'text-[#0F1E36]'}>{s.available}</strong></span>
                    <span className="text-[#64748B]">
                      {s.groups.map((g) => `${g.section}: ${g.occupied}/${g.total}`).join(' · ')}
                    </span>
                  </div>
                </section>
              );
            })}

            <section className="bg-[#0F1E36] text-white rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3">Total general</h3>
              <dl className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                {[
                  ['Asignaturas', report.subjects.length],
                  ['Matrículas (estudiante–asignatura)', report.totalEnrollments],
                  ['Estudiantes distintos', report.distinctStudents],
                  ['Cupos ocupados / totales', `${report.occupied} / ${report.seatsTotal}`],
                  ['Cupos disponibles', report.available],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-xs text-[#BFD4F5]">{label}</dt>
                    <dd className="text-xl font-bold font-mono tabular-nums mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </>
        )}
      </article>
    </div>
  );
}

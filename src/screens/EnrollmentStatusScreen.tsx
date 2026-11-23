import {
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { StudentHeaderCard } from '../components/StudentHeaderCard';
import { STUDENTS_DATA } from '../data/mockAcademicData';
import {
  Course,
  EnrollmentReceipt,
  ScreenId,
  StudentProfile,
} from '../types/enrollment';

interface EnrollmentStatusScreenProps {
  student: StudentProfile;
  selectedCourses: Course[];
  confirmedReceipt: EnrollmentReceipt | null;
  onNavigate: (screen: ScreenId) => void;
}

export function EnrollmentStatusScreen({
  student,
  selectedCourses,
  confirmedReceipt,
  onNavigate,
}: EnrollmentStatusScreenProps) {
  const [lookupInput, setLookupInput] = useState(student.code);
  const [queriedStudent, setQueriedStudent] = useState<StudentProfile>(student);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const isViewingLoggedStudent = queriedStudent.code === student.code;
  const activeReceipt = isViewingLoggedStudent ? confirmedReceipt : null;
  const activeDraftCount = isViewingLoggedStudent ? selectedCourses.length : 0;
  const activeDraftCredits = isViewingLoggedStudent
    ? selectedCourses.reduce((s, c) => s + c.credits, 0)
    : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = lookupInput.trim().toLowerCase();

    if (!term) {
      setLookupError('Ingresa un código de estudiante o número de comprobante.');
      return;
    }

    if (
      confirmedReceipt &&
      confirmedReceipt.receiptCode.toLowerCase() === term
    ) {
      setQueriedStudent(student);
      setLookupError(null);
      return;
    }

    const foundByCode = STUDENTS_DATA.find(
      (s) =>
        s.code.toLowerCase() === term ||
        s.history.some((h) => h.receiptCode.toLowerCase() === term)
    );

    if (!foundByCode) {
      setLookupError(
        `No se encontraron registros para "${lookupInput.trim()}". Prueba con ${student.code} o 202420115.`
      );
      return;
    }

    setQueriedStudent(foundByCode);
    setLookupError(null);
  };

  const currentPeriodStatus = activeReceipt
    ? 'Matriculado Oficialmente'
    : activeDraftCount > 0
      ? 'Preselección en curso (Pendiente de confirmación)'
      : 'Habilitado (Sin registro confirmado aún)';

  return (
    <div className="space-y-6">
      <StudentHeaderCard
        student={queriedStudent}
        subtitle="Consulta de estado de matrícula y verificación administrativa"
        rightSlot={
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Menú principal</span>
          </button>
        }
      />

      {/* Lookup Bar */}
      <section
        aria-label="Buscador de estado de matrícula"
        className="bg-white border border-[#E2E6ED] rounded-xl p-5"
      >
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="flex-1">
            <label
              htmlFor="status-lookup"
              className="block text-xs font-semibold text-[#0F1E36] mb-1.5"
            >
              Consultar por código de estudiante o número de comprobante
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="status-lookup"
                type="text"
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Ej. L00412398 o MAT-2026-09823"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm font-mono text-[#0F1E36] focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Consultar estado
            </button>
            {!isViewingLoggedStudent && (
              <button
                type="button"
                onClick={() => {
                  setLookupInput(student.code);
                  setQueriedStudent(student);
                  setLookupError(null);
                }}
                className="px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F1E36] text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
              >
                Ver mi estado
              </button>
            )}
          </div>
        </form>

        {lookupError && (
          <p role="alert" className="mt-3 text-sm text-[#B91C1C] font-medium">
            {lookupError}
          </p>
        )}
      </section>

      {/* Current Period Status + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white border border-[#E2E6ED] rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E6ED]">
            <div>
              <p className="text-xs font-medium text-[#64748B]">
                Situación para el periodo {queriedStudent.period}
              </p>
              <h2 className="text-lg font-bold text-[#0F1E36] mt-0.5">
                {currentPeriodStatus}
              </h2>
            </div>

            {activeReceipt ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                <CheckCircle2 className="w-4 h-4" />
                Confirmada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309]">
                <Clock className="w-4 h-4" />
                Pendiente de cierre
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#64748B]">Asignaturas registradas</p>
              <p className="font-mono text-lg font-bold text-[#0F1E36] mt-0.5 tabular-nums">
                {activeReceipt ? activeReceipt.courses.length : activeDraftCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Créditos acumulados</p>
              <p className="font-mono text-lg font-bold text-[#1D4ED8] mt-0.5 tabular-nums">
                {activeReceipt ? activeReceipt.totalCredits : activeDraftCredits}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Comprobante</p>
              <p className="font-mono text-sm font-semibold text-[#0F1E36] mt-1 tabular-nums">
                {activeReceipt ? activeReceipt.receiptCode : 'No emitido'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E6ED] flex flex-wrap items-center gap-3">
            {activeReceipt ? (
              <button
                type="button"
                onClick={() => onNavigate('confirmation')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Ver e imprimir comprobante oficial</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('selection')}
                  className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Ir a Selección de asignaturas
                </button>
                {activeDraftCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigate('summary')}
                    className="px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F1E36] text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Revisar Resumen y Confirmar
                  </button>
                )}
              </>
            )}
          </div>
        </section>

        {/* Administrative Validations */}
        <section className="lg:col-span-5 bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E2E6ED] bg-[#F8FAFC]">
            <h2 className="text-sm font-bold text-[#0F1E36]">
              Validaciones administrativas y académicas
            </h2>
          </div>

          <ul className="divide-y divide-[#E2E6ED] text-sm">
            <li className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[#0F1E36]">
                  Situación académica ({queriedStudent.academicStanding})
                </p>
                <p className="text-xs text-[#64748B] tabular-nums">
                  Promedio ponderado: {queriedStudent.gpa.toFixed(2)}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#15803D] whitespace-nowrap">
                Aprobado
              </span>
            </li>

            <li className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[#0F1E36]">Estado financiero</p>
                <p className="text-xs text-[#64748B]">
                  Sin valores pendientes de periodos previos
                </p>
              </div>
              <span className="text-xs font-semibold text-[#15803D] whitespace-nowrap">
                {queriedStudent.financialClearance ? 'Sin adeudos' : 'Con deuda'}
              </span>
            </li>

            <li className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[#0F1E36]">
                  Expediente y documentación
                </p>
                <p className="text-xs text-[#64748B]">
                  Legajo estudiantil verificado
                </p>
              </div>
              <span className="text-xs font-semibold text-[#15803D] whitespace-nowrap">
                {queriedStudent.documentsComplete ? 'Completa' : 'Pendiente'}
              </span>
            </li>

            <li className="px-5 py-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-[#0F1E36]">Turno de matrícula</p>
                <p className="text-xs text-[#64748B]">
                  {queriedStudent.enrollmentTurn}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#1D4ED8] whitespace-nowrap">
                Habilitado
              </span>
            </li>
          </ul>
        </section>
      </div>

      {/* Historical Enrollments Table */}
      <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC]">
          <h2 className="text-sm font-bold text-[#0F1E36]">
            Historial de matrículas anteriores
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E6ED] text-xs text-[#64748B]">
                <th className="py-3 px-5 font-semibold">Periodo</th>
                <th className="py-3 px-5 font-semibold">N.° Comprobante</th>
                <th className="py-3 px-5 font-semibold">Estado</th>
                <th className="py-3 px-5 text-right font-semibold">
                  Asignaturas
                </th>
                <th className="py-3 px-5 text-right font-semibold">Créditos</th>
                <th className="py-3 px-5 text-right font-semibold">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6ED]">
              {activeReceipt && (
                <tr className="bg-[#F0FDF4]/50">
                  <td className="py-3.5 px-5 font-mono font-semibold text-[#0F1E36] tabular-nums">
                    {activeReceipt.period}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#1D4ED8] tabular-nums">
                    {activeReceipt.receiptCode}
                  </td>
                  <td className="py-3.5 px-5 text-xs font-semibold text-[#15803D]">
                    Matriculado (Actual)
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums">
                    {activeReceipt.courses.length}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-semibold tabular-nums">
                    {activeReceipt.totalCredits}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono text-[#64748B] tabular-nums">
                    En curso
                  </td>
                </tr>
              )}
              {queriedStudent.history.map((item) => (
                <tr key={item.period}>
                  <td className="py-3.5 px-5 font-mono font-semibold text-[#0F1E36] tabular-nums">
                    {item.period}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#475569] tabular-nums">
                    {item.receiptCode}
                  </td>
                  <td className="py-3.5 px-5 text-xs font-medium text-[#334155]">
                    {item.status}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums">
                    {item.coursesCount}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-semibold tabular-nums">
                    {item.credits}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-semibold text-[#0F1E36] tabular-nums">
                    {item.gpa}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

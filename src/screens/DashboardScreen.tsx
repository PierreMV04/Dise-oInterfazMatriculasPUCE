import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  Lock,
  SearchCheck,
  ShieldAlert,
} from 'lucide-react';
import { StudentHeaderCard } from '../components/StudentHeaderCard';
import {
  Course,
  Eligibility,
  EnrollmentReceipt,
  ScreenId,
  StudentProfile,
} from '../types/enrollment';
import { formatScheduleSummary } from '../utils/enrollmentLogic';

interface DashboardScreenProps {
  student: StudentProfile;
  selectedCourses: Course[];
  confirmedReceipt: EnrollmentReceipt | null;
  eligibility: Eligibility;
  onNavigate: (screen: ScreenId) => void;
}

export function DashboardScreen({
  student,
  selectedCourses,
  confirmedReceipt,
  eligibility,
  onNavigate,
}: DashboardScreenProps) {
  const locked = !eligibility.canEnroll && !confirmedReceipt;
  const selectedCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  const isConfirmed = Boolean(confirmedReceipt);

  const primaryActionScreen: ScreenId = isConfirmed
    ? 'confirmation'
    : selectedCourses.length > 0
      ? 'selection'
      : 'selection';

  const primaryActionLabel = isConfirmed
    ? 'Ver comprobante oficial'
    : selectedCourses.length > 0
      ? 'Continuar selección de asignaturas'
      : 'Iniciar selección de asignaturas';

  const activeCourses = isConfirmed
    ? confirmedReceipt!.courses
    : selectedCourses;

  return (
    <div className="space-y-6">
      <StudentHeaderCard
        student={student}
        subtitle="Menú principal del estudiante"
        rightSlot={
          <div className="text-left lg:text-right">
            <p className="text-xs text-[#64748B]">Estado actual</p>
            <p
              className={`text-sm font-semibold mt-0.5 ${
                isConfirmed ? 'text-[#15803D]' : locked ? 'text-[#BF2626]' : 'text-[#1D4ED8]'
              }`}
            >
              {isConfirmed
                ? `Matriculado (${confirmedReceipt!.receiptCode})`
                : locked
                  ? 'Matrícula bloqueada'
                  : selectedCourses.length > 0
                    ? 'Borrador de selección guardado'
                    : 'Habilitado para matrícula'}
            </p>
          </div>
        }
      />

      {/* Bloqueo A2 (deuda) o A1 (periodo cerrado): mensaje del sistema */}
      {locked && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-[#FDE8E8] border border-[#BF2626] text-[#BF2626] rounded-xl px-5 py-4"
        >
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">
              {eligibility.messageCode} · {eligibility.title}
            </p>
            <p className="text-sm mt-0.5 leading-relaxed">
              {eligibility.description}
            </p>
            <p className="text-xs mt-1.5 font-medium">
              No puedes avanzar a la selección de asignaturas hasta resolverlo.
            </p>
          </div>
        </div>
      )}

      {/* Focal Primary Action Panel */}
      <section
        aria-label="Proceso de matrícula activo"
        className="bg-white border border-[#E2E6ED] rounded-xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#1D4ED8] mb-1.5">
            Periodo Académico {student.period} · {student.enrollmentTurn}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] tracking-tight">
            {isConfirmed
              ? 'Tu matrícula del periodo se encuentra registrada'
              : locked
                ? 'Matrícula no disponible por ahora'
                : 'Proceso de Matrícula Ordinaria disponible'}
          </h2>
          <p className="mt-2 text-sm text-[#475569] leading-relaxed">
            {isConfirmed
              ? `Confirmaste ${confirmedReceipt!.courses.length} asignaturas (${confirmedReceipt!.totalCredits} créditos). Puedes descargar tu constancia oficial o consultar el estado administrativo.`
              : locked
                ? 'Resuelve el bloqueo indicado arriba para poder continuar con tu matrícula.'
                : `Puedes matricular hasta ${student.maxCredits} créditos académicos. Selecciona tus asignaturas, valida que no existan cruces horarios y confirma tu inscripción.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={locked}
            onClick={() => onNavigate(primaryActionScreen)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:bg-[#E3E8EF] disabled:text-[#9AA6B8] disabled:cursor-not-allowed"
          >
            {locked && <Lock className="w-4 h-4" aria-hidden="true" />}
            <span>{locked ? 'Realizar matrícula (bloqueado)' : primaryActionLabel}</span>
            {!locked && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* 4-Column Metrics Strip */}
      <section
        aria-label="Indicadores académicos"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white border border-[#E2E6ED] rounded-xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#64748B]">
            Créditos máximos
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold font-mono text-[#0F1E36] tabular-nums">
            {student.maxCredits}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Reglamento regular</p>
        </div>

        <div className="bg-white border border-[#E2E6ED] rounded-xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#64748B]">
            {isConfirmed ? 'Créditos matriculados' : 'Créditos en selección'}
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold font-mono text-[#1D4ED8] tabular-nums">
            {isConfirmed ? confirmedReceipt!.totalCredits : selectedCredits}
          </p>
          <p className="mt-1 text-xs text-[#64748B] tabular-nums">
            {activeCourses.length} asignaturas
          </p>
        </div>

        <div className="bg-white border border-[#E2E6ED] rounded-xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#64748B]">
            Promedio ponderado
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold font-mono text-[#0F1E36] tabular-nums">
            {student.gpa.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            Condición: {student.academicStanding}
          </p>
        </div>

        <div className="bg-white border border-[#E2E6ED] rounded-xl p-4 sm:p-5">
          <p className="text-xs font-medium text-[#64748B]">
            Estado administrativo
          </p>
          <p
            className={`mt-1.5 text-lg sm:text-xl font-bold ${
              locked ? 'text-[#BF2626]' : 'text-[#15803D]'
            }`}
          >
            {eligibility.status === 'debt'
              ? 'Con deuda'
              : eligibility.status === 'closed'
                ? 'Periodo cerrado'
                : 'Sin bloqueos'}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {eligibility.status === 'debt'
              ? `Valor pendiente ${student.debtAmount.toFixed(2)} USD`
              : eligibility.status === 'closed'
                ? 'Fuera del 2 al 13 de febrero'
                : 'Pagos y documentos al día'}
          </p>
        </div>
      </section>

      {/* Main Navigation Modules Grid */}
      <section aria-label="Módulos del portal estudiantil">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0F1E36]">
            Accesos directos del proceso de matrícula
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={locked}
            onClick={() => onNavigate('selection')}
            className="text-left bg-white border border-[#E2E6ED] hover:border-[#1D4ED8] rounded-xl p-5 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#E2E6ED]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1E36] group-hover:text-[#1D4ED8]">
                    Selección de asignaturas
                  </h3>
                  <p className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Busca cursos disponibles, revisa vacantes y horarios, arma tu
                    carga académica y valida prerrequisitos.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1D4ED8] shrink-0 mt-1" />
            </div>
          </button>

          <button
            type="button"
            disabled={locked}
            onClick={() => onNavigate('summary')}
            className="text-left bg-white border border-[#E2E6ED] hover:border-[#1D4ED8] rounded-xl p-5 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#E2E6ED]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] text-[#0F1E36] flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1E36] group-hover:text-[#1D4ED8]">
                    Resumen de matrícula
                  </h3>
                  <p className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Revisa tu horario consolidado, el desglose de aranceles por
                    crédito y confirma oficialmente tu matrícula.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1D4ED8] shrink-0 mt-1" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('confirmation')}
            className="text-left bg-white border border-[#E2E6ED] hover:border-[#1D4ED8] rounded-xl p-5 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] text-[#15803D] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1E36] group-hover:text-[#1D4ED8]">
                    Confirmación y generación de comprobante
                  </h3>
                  <p className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Visualiza tu constancia oficial de matrícula, imprime el
                    documento o descárgalo con código de verificación.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1D4ED8] shrink-0 mt-1" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('status')}
            className="text-left bg-white border border-[#E2E6ED] hover:border-[#1D4ED8] rounded-xl p-5 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] text-[#B45309] flex items-center justify-center shrink-0">
                  <SearchCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F1E36] group-hover:text-[#1D4ED8]">
                    Consulta de estado de matrícula
                  </h3>
                  <p className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Verifica tu situación académica, validaciones administrativas
                    y el historial de matrículas anteriores.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1D4ED8] shrink-0 mt-1" />
            </div>
          </button>
        </div>
      </section>

      {/* Current Courses Snapshot */}
      <section className="bg-white border border-[#E2E6ED] rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#E2E6ED]">
          <div>
            <h2 className="text-base font-bold text-[#0F1E36]">
              {isConfirmed
                ? `Asignaturas matriculadas (${student.period})`
                : 'Avance de selección actual'}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {activeCourses.length > 0
                ? `${activeCourses.length} cursos registrados en tu carga académica`
                : 'Aún no has agregado asignaturas para el periodo actual'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(isConfirmed ? 'confirmation' : 'selection')}
            className="text-xs font-semibold text-[#1D4ED8] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isConfirmed ? 'Ver comprobante completo' : 'Ir a Selección de asignaturas'}
          </button>
        </div>

        {activeCourses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#475569]">
              Tu bandeja de selección está vacía. Comienza agregando asignaturas
              desde el catálogo del periodo {student.period}.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('selection')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Explorar catálogo de asignaturas
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E2E6ED] text-xs text-[#64748B]">
                  <th className="py-2.5 pr-4 font-semibold">Código</th>
                  <th className="py-2.5 pr-4 font-semibold">Asignatura</th>
                  <th className="py-2.5 pr-4 font-semibold">Horario</th>
                  <th className="py-2.5 text-right font-semibold">Créditos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED]">
                {activeCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#0F1E36] tabular-nums whitespace-nowrap">
                      {course.code}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-[#0F1E36]">
                        {course.name}
                      </span>
                      <span className="block text-xs text-[#64748B]">
                        {course.section} · {course.professor}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#475569]">
                      {formatScheduleSummary(course.schedule)}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-[#0F1E36] tabular-nums">
                      {course.credits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

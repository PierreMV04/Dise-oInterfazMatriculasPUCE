import { ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { StudentHeaderCard } from '../components/StudentHeaderCard';
import { SystemMessageBanner } from '../components/SystemMessageBanner';
import { WeeklyScheduleGrid } from '../components/WeeklyScheduleGrid';
import {
  Course,
  EnrollmentRequest,
  PaymentModality,
  ScreenId,
  StudentProfile,
  SystemMessage,
} from '../types/enrollment';
import {
  calculateEnrollmentFees,
  formatCurrencyUSD,
  formatScheduleSummary,
  validateEnrollmentSelection,
} from '../utils/enrollmentLogic';

interface EnrollmentSummaryScreenProps {
  student: StudentProfile;
  selectedCourses: Course[];
  request: EnrollmentRequest;
  onConfirmEnrollment: (paymentModality: PaymentModality) => void;
  onCancelEnrollment: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export function EnrollmentSummaryScreen({
  student,
  selectedCourses,
  request,
  onConfirmEnrollment,
  onCancelEnrollment,
  onNavigate,
}: EnrollmentSummaryScreenProps) {
  const [message, setMessage] = useState<SystemMessage | null>(null);

  const validation = validateEnrollmentSelection(selectedCourses, student);
  const fees = calculateEnrollmentFees(selectedCourses);
  const remainingCredits = student.maxCredits - validation.totalCredits;
  const warningList = [
    ...validation.warnings,
    ...(remainingCredits > 0
      ? [`Te quedan ${remainingCredits} créditos disponibles de ${student.maxCredits}.`]
      : []),
    'Los cupos se revalidan al presionar Confirmar matrícula.',
  ];

  const handleCancel = () => {
    if (window.confirm('¿Cancelar la matrícula? Se descartará tu selección de asignaturas.')) {
      onCancelEnrollment();
    }
  };

  const handleConfirm = () => {
    if (!validation.isValid) {
      setMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'No es posible confirmar la matrícula',
        description:
          'Existen observaciones pendientes en tu selección de asignaturas:',
        details: validation.errors,
      });
      return;
    }

    if (request.paymentMethod === '') {
      onNavigate('request');
      return;
    }

    onConfirmEnrollment(request.paymentMethod as PaymentModality);
  };

  return (
    <div className="space-y-6">
      <StudentHeaderCard
        student={student}
        subtitle="Resumen de matrícula · Confirmación pendiente"
        rightSlot={
          <button
            type="button"
            onClick={() => onNavigate('selection')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modificar asignaturas</span>
          </button>
        }
      />

      {message && (
        <SystemMessageBanner
          message={message}
          onDismiss={() => setMessage(null)}
        />
      )}

      {selectedCourses.length > 0 && !validation.isValid && (
        <SystemMessageBanner
          message={{
            id: 'summary-errors',
            type: 'error',
            title: 'Hay observaciones que impiden confirmar',
            description: 'Corrige tu selección para poder confirmar la matrícula:',
            details: validation.errors,
          }}
        />
      )}

      {selectedCourses.length > 0 && (
        <SystemMessageBanner
          message={{
            id: 'summary-warnings',
            type: 'warning',
            title: 'Revisa tu selección',
            description: 'Antes de confirmar ten en cuenta lo siguiente:',
            details: warningList,
          }}
        />
      )}

      {selectedCourses.length === 0 ? (
        <section className="bg-white border border-[#E2E6ED] rounded-xl p-8 text-center space-y-4">
          <h2 className="text-lg font-bold text-[#0F1E36]">
            No tienes asignaturas en tu resumen de matrícula
          </h2>
          <p className="text-sm text-[#475569] max-w-md mx-auto">
            Para revisar el resumen académico y confirmar tu inscripción del
            periodo {student.period}, primero selecciona tus asignaturas.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('selection')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Ir a Selección de asignaturas
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Enrolled Courses Table & Schedule */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC] flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-[#0F1E36]">
                    Detalle de asignaturas a matricular ({selectedCourses.length})
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Verifica secciones, docentes y horarios antes de confirmar
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-[#1D4ED8] tabular-nums">
                  {validation.totalCredits} créditos · {validation.totalHours} hrs/sem
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E6ED] text-xs text-[#64748B] bg-white">
                      <th className="py-3 pl-5 pr-3 font-semibold">Código</th>
                      <th className="py-3 px-3 font-semibold">Asignatura y docente</th>
                      <th className="py-3 px-3 font-semibold">Horario y aula</th>
                      <th className="py-3 px-3 text-right font-semibold">
                        Créditos
                      </th>
                      <th className="py-3 pl-3 pr-5 text-right font-semibold">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E6ED]">
                    {selectedCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="py-3.5 pl-5 pr-3 font-mono text-xs font-semibold text-[#0F1E36] tabular-nums whitespace-nowrap align-top">
                          {course.code}
                        </td>
                        <td className="py-3.5 px-3 align-top">
                          <p className="font-semibold text-[#0F1E36]">
                            {course.name}
                          </p>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {course.section} · {course.modality} · {course.professor}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 align-top text-xs text-[#334155]">
                          <p className="font-mono text-[11px]">
                            {formatScheduleSummary(course.schedule)}
                          </p>
                          <p className="text-[#64748B] mt-0.5">
                            {course.schedule.map((s) => s.room).join(' / ')}
                          </p>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#0F1E36] tabular-nums align-top">
                          {course.credits}
                        </td>
                        <td className="py-3.5 pl-3 pr-5 text-right font-mono font-semibold text-[#0F1E36] tabular-nums align-top">
                          {formatCurrencyUSD(course.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-sm font-bold text-[#0F1E36]">
                Horario semanal consolidado
              </h2>
              <WeeklyScheduleGrid courses={selectedCourses} />
            </section>
          </div>

          {/* Right: Economic Summary, Payment Modality & Confirm Action */}
          <aside className="lg:col-span-4 space-y-4">
            <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1D4ED8]" />
                <h2 className="text-sm font-bold text-[#0F1E36]">
                  Resumen económico y confirmación
                </h2>
              </div>

              <div className="p-5 space-y-5">
                {/* Fee Breakdown */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-[#475569]">
                    <span>Derecho de matrícula ({student.period})</span>
                    <span className="font-mono tabular-nums text-[#0F1E36]">
                      {formatCurrencyUSD(fees.baseFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#475569]">
                    <span>
                      Materias ({selectedCourses.length}) · {validation.totalCredits} cr.
                    </span>
                    <span className="font-mono tabular-nums text-[#0F1E36]">
                      {formatCurrencyUSD(fees.creditCostTotal)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E2E6ED] flex items-baseline justify-between">
                    <span className="font-bold text-[#0F1E36]">Total periodo</span>
                    <span className="text-xl font-bold font-mono text-[#1D4ED8] tabular-nums">
                      {formatCurrencyUSD(fees.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Datos de la solicitud (solo lectura) */}
                <div className="pt-4 border-t border-[#E2E6ED] space-y-2 text-sm">
                  <p className="text-xs font-semibold text-[#0F1E36]">Datos de tu solicitud</p>
                  <dl className="space-y-1.5 text-[#475569]">
                    <div className="flex justify-between gap-3"><dt>Método de pago</dt><dd className="text-[#0F1E36] text-right">{request.paymentMethod === 'contado' ? 'Tarjeta (en línea)' : 'Ventanilla (orden 24 h)'}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Celular</dt><dd className="font-mono text-[#0F1E36]">{request.phone}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Reglamento</dt><dd className="text-[#15803D] font-semibold">Aceptado</dd></div>
                    {request.notes && <div><dt>Observaciones</dt><dd className="text-[#0F1E36]">{request.notes}</dd></div>}
                  </dl>
                  <button type="button" onClick={() => onNavigate('request')} className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer">Editar solicitud</button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar matrícula</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('selection')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Modificar selección
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[#BF2626] hover:bg-[#FDE8E8] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

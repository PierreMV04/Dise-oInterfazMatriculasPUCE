import { AlertCircle, Lock, Save } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { StudentHeaderCard } from '../components/StudentHeaderCard';
import { SystemMessageBanner } from '../components/SystemMessageBanner';
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

interface RequestFormScreenProps {
  student: StudentProfile;
  selectedCourses: Course[];
  request?: EnrollmentRequest;
  onSaveDraft: (request: EnrollmentRequest) => void;
  onSubmit: (request: EnrollmentRequest) => void;
  onCancel: () => void;
  onNavigate: (screen: ScreenId) => void;
}

type FieldErrors = Partial<Record<'phone' | 'paymentMethod' | 'notes' | 'accepted', string>>;

const NOTES_MAX = 200;
const PHONE_RE = /^09\d{8}$/;

/** Etiqueta con el nombre del campo en el Diccionario de Datos. */
function Label({ text, dd, required }: { text: string; dd: string; required?: boolean }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className="text-sm font-semibold text-[#0F1E36]">
        {text}
        {required && <span className="text-[#BF2626]"> *</span>}
      </span>
      <code className="text-[10px] font-mono text-[#64748B]">{dd}</code>
    </span>
  );
}

function ReadOnlyField({ text, dd, value }: { text: string; dd: string; value: string }) {
  return (
    <label className="block space-y-1.5">
      <Label text={text} dd={dd} />
      <span className="flex items-center gap-2 px-3 py-2.5 bg-[#F1F5F9] border border-[#E2E6ED] rounded-lg text-sm text-[#334155]">
        <Lock className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" aria-hidden="true" />
        <input
          readOnly
          tabIndex={-1}
          value={value}
          aria-label={`${text} (solo lectura)`}
          className="w-full bg-transparent outline-none cursor-default"
        />
      </span>
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-xs font-medium text-[#BF2626]">
      <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC]">
        <h2 className="text-sm font-bold text-[#0F1E36]">{title}</h2>
        <p className="text-xs text-[#64748B] mt-0.5">{hint}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function RequestFormScreen({
  student,
  selectedCourses,
  request,
  onSaveDraft,
  onSubmit,
  onCancel,
  onNavigate,
}: RequestFormScreenProps) {
  const [phone, setPhone] = useState(request?.phone ?? student.phone);
  const [paymentMethod, setPaymentMethod] = useState<PaymentModality | ''>(
    request?.paymentMethod ?? ''
  );
  const [notes, setNotes] = useState(request?.notes ?? '');
  const [accepted, setAccepted] = useState(request?.acceptedRegulation ?? false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<SystemMessage | null>(null);

  const validation = validateEnrollmentSelection(selectedCourses, student);
  const fees = calculateEnrollmentFees(selectedCourses);
  const creditPercent = Math.min(
    100,
    Math.round((validation.totalCredits / student.maxCredits) * 100)
  );

  const validateFields = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!PHONE_RE.test(phone)) {
      e.phone = 'Ingresa un celular de 10 dígitos que empiece con 09 (ej. 0991234567).';
    }
    if (paymentMethod === '') {
      e.paymentMethod = 'Selecciona un método de pago para continuar.';
    }
    if (notes.length > NOTES_MAX) {
      e.notes = `Las observaciones no pueden superar ${NOTES_MAX} caracteres.`;
    }
    if (!accepted) {
      e.accepted = 'Debes aceptar el Reglamento de Matrícula para continuar.';
    }
    return e;
  };

  const currentRequest = (submitted: boolean): EnrollmentRequest => ({
    phone,
    paymentMethod,
    notes: notes.trim(),
    acceptedRegulation: accepted,
    submitted,
  });

  const handleSaveDraft = () => {
    onSaveDraft(currentRequest(false));
    setMessage({
      id: String(Date.now()),
      type: 'success',
      title: 'Borrador guardado',
      description: 'Tu solicitud se guardó. Puedes continuar más tarde sin perder lo ingresado.',
    });
  };

  const handleSubmit = () => {
    if (selectedCourses.length === 0) {
      setMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'Selecciona al menos una materia para continuar',
        description: 'La solicitud no tiene asignaturas. Vuelve a la selección y agrega al menos una.',
      });
      return;
    }

    const fieldErrors = validateFields();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'Revisa los campos marcados',
        description: 'Corrige los datos señalados en rojo para enviar la solicitud.',
        details: Object.values(fieldErrors) as string[],
      });
      return;
    }

    // P4 Verificar prerrequisitos y cupos: revalida antes de enviar
    if (!validation.isValid) {
      setMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'No se puede enviar la solicitud',
        description: 'Tu selección ya no cumple las reglas de matrícula:',
        details: validation.errors,
      });
      return;
    }

    onSubmit(currentRequest(true));
  };

  const handleCancel = () => {
    if (window.confirm('¿Cancelar la solicitud? Se descartará tu selección y lo ingresado.')) {
      onCancel();
    }
  };

  const inputBase =
    'w-full px-3 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/15';

  return (
    <div className="space-y-6">
      <StudentHeaderCard
        student={student}
        subtitle="Solicitud de matrícula · Datos para el registro"
      />

      {message && (
        <SystemMessageBanner message={message} onDismiss={() => setMessage(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <Section
            title="1. Datos del estudiante (precargados, solo lectura)"
            hint="Vienen del sistema; si algún dato es incorrecto, se corrige en Secretaría."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField text="Código de estudiante" dd="ESTUDIANTE.codigo_estudiante" value={student.code} />
              <ReadOnlyField text="Nombres y apellidos" dd="ESTUDIANTE.nombres · apellidos" value={student.fullName} />
              <ReadOnlyField text="Cédula" dd="ESTUDIANTE.cedula" value={student.idNumber} />
              <ReadOnlyField text="Correo institucional" dd="ESTUDIANTE.correo_institucional" value={student.email} />
              <ReadOnlyField text="Carrera" dd="CARRERA.nombre_carrera" value={student.career} />
              <ReadOnlyField text="Nivel" dd="ESTUDIANTE.nivel_actual" value={`${student.cycle}°`} />
              <ReadOnlyField text="Periodo académico" dd="PERIODO.codigo_periodo" value={student.period} />
              <ReadOnlyField text="Tipo de matrícula" dd="PERIODO (ordinaria)" value="Ordinaria" />
            </div>
          </Section>

          <Section
            title="2. Asignaturas de la solicitud (precargadas, solo lectura)"
            hint="Vienen de tu selección guardada (SESION.seleccion_guardada). Aún no se registra la matrícula; se crea al confirmar en el Resumen."
          >
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-[#64748B] border-b border-[#E2E6ED]">
                    <th className="px-5 py-2 font-semibold">Código</th>
                    <th className="px-3 py-2 font-semibold">Asignatura y grupo</th>
                    <th className="px-3 py-2 font-semibold">Horario</th>
                    <th className="px-3 py-2 text-right font-semibold">Créditos</th>
                    <th className="px-5 py-2 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6ED]">
                  {selectedCourses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 text-[#BF2626] font-medium">
                        No hay asignaturas seleccionadas.
                      </td>
                    </tr>
                  )}
                  {selectedCourses.map((c) => (
                    <tr key={c.id}>
                      <td className="px-5 py-2.5 font-mono text-xs font-semibold text-[#0F1E36]">{c.code}</td>
                      <td className="px-3 py-2.5 text-[#0F1E36]">
                        {c.name} <span className="text-[#64748B]">· {c.section}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[#475569]">{formatScheduleSummary(c.schedule)}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{c.credits}</td>
                      <td className="px-5 py-2.5 text-right font-mono">{formatCurrencyUSD(c.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            title="3. Datos que ingresa el estudiante"
            hint="Los campos con * son obligatorios."
          >
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block">
                  <Label text="Celular de contacto" dd="ESTUDIANTE.telefono_contacto" required />
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby="phone-help phone-error"
                  placeholder="0991234567"
                  className={`${inputBase} sm:max-w-xs font-mono ${errors.phone ? 'border-[#BF2626]' : 'border-[#CBD5E1]'}`}
                />
                <p id="phone-help" className="text-xs text-[#64748B]">
                  10 dígitos, empieza con 09. Solo se aceptan números. Se usa para avisarte si cambia tu matrícula.
                </p>
                <FieldError id="phone-error" message={errors.phone} />
              </div>

              <fieldset className="space-y-2" aria-describedby="pay-error">
                <legend className="mb-1">
                  <Label text="Método de pago" dd="MATRICULA.metodo_pago" required />
                </legend>
                {([
                  ['contado', 'Pago con tarjeta', 'En línea. El comprobante se genera al aprobarse el pago.'],
                  ['cuotas', 'Pago en ventanilla', `Se emite una orden de ${formatCurrencyUSD(fees.totalAmount)} reservada por 24 horas.`],
                ] as Array<[PaymentModality, string, string]>).map(([value, title, desc]) => (
                  <label
                    key={value}
                    className={`flex items-start gap-2.5 border rounded-lg p-3 cursor-pointer transition-colors ${
                      paymentMethod === value
                        ? 'border-[#1D4ED8] bg-[#EFF6FF]/40'
                        : errors.paymentMethod
                          ? 'border-[#BF2626]'
                          : 'border-[#E2E6ED] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === value}
                      onChange={() => {
                        setPaymentMethod(value);
                        setErrors((p) => ({ ...p, paymentMethod: undefined }));
                      }}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[#0F1E36]">{title}</span>
                      <span className="block text-xs text-[#64748B] mt-0.5">{desc}</span>
                    </span>
                  </label>
                ))}
                <FieldError id="pay-error" message={errors.paymentMethod} />
              </fieldset>

              <div className="space-y-1.5">
                <label htmlFor="notes" className="block">
                  <Label text="Observaciones (opcional)" dd="MATRICULA.observaciones" />
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setErrors((p) => ({ ...p, notes: undefined }));
                  }}
                  aria-invalid={Boolean(errors.notes)}
                  aria-describedby="notes-count notes-error"
                  placeholder="Ej. Solicito revisar mi horario del jueves."
                  className={`${inputBase} ${errors.notes ? 'border-[#BF2626]' : 'border-[#CBD5E1]'}`}
                />
                <p
                  id="notes-count"
                  className={`text-xs tabular-nums ${notes.length > NOTES_MAX ? 'text-[#BF2626] font-semibold' : 'text-[#64748B]'}`}
                >
                  {notes.length} / {NOTES_MAX} caracteres
                </p>
                <FieldError id="notes-error" message={errors.notes} />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="flex items-start gap-2.5 text-sm text-[#334155] leading-relaxed cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked);
                      setErrors((p) => ({ ...p, accepted: undefined }));
                    }}
                    aria-invalid={Boolean(errors.accepted)}
                    aria-describedby="accepted-error"
                    className="mt-1 w-4 h-4 rounded border-[#CBD5E1]"
                  />
                  <span>
                    Declaro haber revisado mis asignaturas y horarios, y acepto el Reglamento
                    de Matrícula {student.period}.{' '}
                    <span className="text-[#BF2626]">*</span>
                    <code className="ml-2 text-[10px] font-mono text-[#64748B]">MATRICULA.acepta_reglamento</code>
                  </span>
                </label>
                <FieldError id="accepted-error" message={errors.accepted} />
              </div>
            </div>
          </Section>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <section className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC]">
              <h2 className="text-sm font-bold text-[#0F1E36]">Totales de la solicitud</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-[#475569]">Créditos</span>
                  <span className="font-mono font-bold text-[#0F1E36]">
                    {validation.totalCredits} <span className="text-[#64748B] font-normal">/ {student.maxCredits} máx.</span>
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E2E8F0]" aria-hidden="true">
                  <div
                    className={`h-2 rounded-full ${validation.totalCredits > student.maxCredits ? 'bg-[#BF2626]' : 'bg-[#15803D]'}`}
                    style={{ width: `${creditPercent}%` }}
                  />
                </div>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-[#475569]">
                  <dt>Materias ({selectedCourses.length})</dt>
                  <dd className="font-mono text-[#0F1E36]">{formatCurrencyUSD(fees.creditCostTotal)}</dd>
                </div>
                <div className="flex justify-between text-[#475569]">
                  <dt>Derechos de matrícula</dt>
                  <dd className="font-mono text-[#0F1E36]">{formatCurrencyUSD(fees.baseFee)}</dd>
                </div>
                <div className="flex items-baseline justify-between pt-3 border-t border-[#E2E6ED]">
                  <dt className="font-bold text-[#0F1E36]">Total</dt>
                  <dd className="text-xl font-bold font-mono text-[#1D4ED8]">{formatCurrencyUSD(fees.totalAmount)}</dd>
                </div>
              </dl>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full px-5 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Enviar solicitud
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" aria-hidden="true" />
                  Guardar borrador
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('selection')}
                  className="w-full px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Modificar selección
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full px-4 py-2.5 text-[#BF2626] hover:bg-[#FDE8E8] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

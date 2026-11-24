import {
  CheckCircle2,
  Download,
  Home,
  Printer,
  SearchCheck,
} from 'lucide-react';
import qrcode from 'qrcode-generator';
import { EnrollmentReceipt, ScreenId } from '../types/enrollment';
import {
  downloadReceiptFile,
  formatCurrencyUSD,
  formatScheduleSummary,
} from '../utils/enrollmentLogic';

interface ConfirmationReceiptScreenProps {
  receipt: EnrollmentReceipt | null;
  onNavigate: (screen: ScreenId) => void;
}

function buildQrSvg(receipt: EnrollmentReceipt): string {
  const qr = qrcode(0, 'M');
  qr.addData(
    `PUCE|${receipt.receiptCode}|${receipt.verificationHash}|${receipt.studentCode}|${receipt.period}|${receipt.totalAmount.toFixed(2)}`
  );
  qr.make();
  return qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true });
}

export function ConfirmationReceiptScreen({
  receipt,
  onNavigate,
}: ConfirmationReceiptScreenProps) {
  if (!receipt) {
    return (
      <section className="bg-white border border-[#E2E6ED] rounded-xl p-8 sm:p-10 text-center space-y-4">
        <h1 className="text-xl font-bold text-[#0F1E36]">
          Aún no se ha generado un comprobante de matrícula
        </h1>
        <p className="text-sm text-[#475569] max-w-lg mx-auto leading-relaxed">
          Para obtener tu constancia oficial de matrícula, primero selecciona
          tus asignaturas, valida la carga académica y confirma el registro en el
          Resumen de matrícula.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('selection')}
            className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            Ir a Selección de asignaturas
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F1E36] text-sm font-semibold rounded-lg cursor-pointer"
          >
            Volver al Menú principal
          </button>
        </div>
      </section>
    );
  }

  const isPaid = receipt.paymentModality === 'contado';
  const statusLabel = isPaid ? 'Matriculado' : 'Pendiente de pago';

  return (
    <div className="space-y-6">
      {/* Confirmation Success Header (hidden on print) */}
      <section className="no-print bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <CheckCircle2 className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#15803D]">
              Matrícula registrada exitosamente
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-[#14532D] mt-0.5">
              Comprobante Oficial de Matrícula {receipt.period}
            </h1>
            <p className="text-sm text-[#166534] mt-1">
              Operación{' '}
              <strong className="font-mono tabular-nums">
                {receipt.receiptCode}
              </strong>{' '}
              confirmada el {receipt.confirmedAt}. Tus cupos quedaron
              registrados.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#BBF7D0] hover:bg-[#DCFCE7] text-[#14532D] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => downloadReceiptFile(receipt)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar comprobante</span>
          </button>
        </div>
      </section>

      {/* Official Printable Receipt Document */}
      <article
        aria-label="Constancia oficial de matrícula"
        className="print-only-container bg-white border border-[#E2E6ED] rounded-xl p-6 sm:p-10 space-y-8"
      >
        {/* Institutional Document Header */}
        <header className="pb-6 border-b border-[#E2E6ED] flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-[#1D4ED8]">
              Pontificia Universidad Católica del Ecuador · Secretaría Académica
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F1E36] mt-1">
              Constancia de Matrícula Académica
            </h2>
            <p className="text-sm text-[#475569] mt-1">
              Periodo Académico {receipt.period} · Matrícula ordinaria
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Elemento de autenticidad: QR real con código de comprobante y verificación */}
            <div
              role="img"
              aria-label={`Código QR de verificación ${receipt.verificationHash}`}
              className="w-20 h-20 border border-[#CBD5E1] rounded-lg p-1.5 bg-white shrink-0 [&_svg]:w-full [&_svg]:h-full"
              dangerouslySetInnerHTML={{ __html: buildQrSvg(receipt) }}
            />

            <div className="text-left sm:text-right">
              <p className="text-xs text-[#64748B]">N.° de Comprobante</p>
              <p className="font-mono text-sm font-bold text-[#0F1E36] tabular-nums">
                {receipt.receiptCode}
              </p>
              <p className="text-xs text-[#64748B] mt-1">Código de verificación</p>
              <p className="font-mono text-xs font-semibold text-[#1D4ED8] tabular-nums">
                {receipt.verificationHash}
              </p>
            </div>
          </div>
        </header>

        {/* Datos del estudiante y estado */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ['Estudiante', receipt.studentName],
            ['Código de estudiante', receipt.studentCode],
            ['Cédula', receipt.idNumber ?? '—'],
            ['Correo institucional', receipt.email ?? '—'],
            ['Carrera', receipt.career],
            ['Nivel', `${receipt.cycle}°`],
            ['Periodo académico', receipt.period],
            ['Fecha y hora de emisión', receipt.confirmedAt],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-[#64748B]">{label}</p>
              <p className="font-semibold text-[#0F1E36] mt-0.5 break-words">{value}</p>
            </div>
          ))}
        </section>

        <section
          className={`rounded-lg border px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${
            isPaid ? 'bg-[#E6F6EC] border-[#BBF7D0] text-[#14532D]' : 'bg-[#FFF5D9] border-[#F4D78A] text-[#6B4A06]'
          }`}
        >
          <span className="text-xs font-semibold">Estado de la matrícula</span>
          <span className="font-bold">{statusLabel}</span>
          <span className="text-xs">
            {isPaid
              ? 'Pago con tarjeta aprobado. Tus cupos están asegurados.'
              : 'Paga la orden en ventanilla dentro de 24 horas desde la emisión; si no, los cupos reservados se liberan.'}
          </span>
        </section>

        {/* Enrolled Courses Table */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#0F1E36]">
            Asignaturas matriculadas ({receipt.courses.length})
          </h3>
          <div className="overflow-x-auto border border-[#E2E6ED] rounded-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E6ED] text-xs text-[#475569]">
                  <th className="py-2.5 px-4 font-semibold">Código</th>
                  <th className="py-2.5 px-4 font-semibold">Asignatura</th>
                  <th className="py-2.5 px-4 font-semibold">Sección y docente</th>
                  <th className="py-2.5 px-4 font-semibold">Horario y aula</th>
                  <th className="py-2.5 px-4 text-right font-semibold">
                    Créditos
                  </th>
                  <th className="py-2.5 px-4 text-right font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6ED]">
                {receipt.courses.map((course) => (
                  <tr key={course.id}>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#0F1E36] tabular-nums whitespace-nowrap">
                      {course.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#0F1E36]">
                      {course.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#475569]">
                      {course.section} · {course.professor}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#475569]">
                      <span className="font-mono text-[11px] block text-[#0F1E36]">
                        {formatScheduleSummary(course.schedule)}
                      </span>
                      <span className="text-[#64748B]">
                        {course.schedule.map((s) => s.room).join(' / ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#0F1E36] tabular-nums">
                      {course.credits}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#0F1E36] tabular-nums">
                      {formatCurrencyUSD(course.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F8FAFC] border-t border-[#E2E6ED] font-semibold text-sm">
                  <td colSpan={4} className="py-3 px-4 text-right text-[#0F1E36]">
                    Total de créditos matriculados ({receipt.totalHours} hrs/sem)
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#1D4ED8] tabular-nums">
                    {receipt.totalCredits}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#1D4ED8] tabular-nums">
                    {formatCurrencyUSD(receipt.creditCostTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Financial & Validation Footer */}
        <section className="pt-4 border-t border-[#E2E6ED] grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#64748B]">
              Información de pago registrada
            </p>
            <p className="font-medium text-[#0F1E36]">
              {receipt.paymentModality === 'contado'
                ? 'Método de pago: tarjeta (en línea)'
                : 'Método de pago: ventanilla (orden reservada 24 horas)'}
            </p>
            <p className="text-xs text-[#475569] tabular-nums">
              Derechos de matrícula: {formatCurrencyUSD(receipt.baseFee)} · Valor de
              materias: {formatCurrencyUSD(receipt.creditCostTotal)}
            </p>
            <p className="text-base font-bold font-mono text-[#0F1E36] pt-1 tabular-nums">
              Importe total: {formatCurrencyUSD(receipt.totalAmount)}
            </p>
          </div>

          <div className="md:text-right flex flex-col justify-end space-y-1 text-xs text-[#64748B]">
            <p className="font-semibold text-[#0F1E36]">
              Secretaría General y Registros Académicos
            </p>
            <p>
              Para verificar este documento escanea el QR o usa el código{' '}
              <span className="font-mono text-[#0F1E36]">
                {receipt.verificationHash}
              </span>
            </p>
          </div>
        </section>
      </article>

      {/* Bottom Action Navigation */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F1E36] text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Volver al Menú principal</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('status')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <SearchCheck className="w-4 h-4" />
          <span>Consultar estado de matrícula</span>
        </button>
      </div>
    </div>
  );
}

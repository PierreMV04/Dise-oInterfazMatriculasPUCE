import { StudentProfile } from '../types/enrollment';

interface StudentHeaderCardProps {
  student: StudentProfile;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export function StudentHeaderCard({
  student,
  subtitle,
  rightSlot,
}: StudentHeaderCardProps) {
  return (
    <section
      aria-label="Datos del estudiante"
      className="bg-white border border-[#E2E6ED] rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div
            aria-hidden="true"
            className="w-14 h-14 rounded-xl bg-[#143F7A] text-white shrink-0 flex items-center justify-center text-lg font-bold tracking-tight"
          >
            {student.fullName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </div>

          <div className="min-w-0">
            {subtitle && (
              <p className="text-xs font-medium text-[#64748B] mb-1">
                {subtitle}
              </p>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-[#0F1E36] tracking-tight truncate">
              {student.fullName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#475569]">
              <span>
                Código:{' '}
                <strong className="font-mono font-semibold text-[#0F1E36] tabular-nums">
                  {student.code}
                </strong>
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <span>
                Carrera:{' '}
                <strong className="font-medium text-[#0F1E36]">
                  {student.career}
                </strong>
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <span>
                Periodo:{' '}
                <strong className="font-mono font-semibold text-[#1D4ED8] tabular-nums">
                  {student.period}
                </strong>
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">
                ·
              </span>
              <span className="tabular-nums">
                Nivel {student.cycle}° · Máx. {student.maxCredits} cr.
              </span>
            </div>
          </div>
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>
    </section>
  );
}

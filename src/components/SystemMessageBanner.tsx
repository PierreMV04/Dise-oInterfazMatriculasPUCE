import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import { SystemMessage } from '../types/enrollment';

interface SystemMessageBannerProps {
  message: SystemMessage | null;
  onDismiss?: () => void;
}

const STYLE_MAP = {
  success: {
    container: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]',
    iconColor: 'text-[#15803D]',
    prefix: 'Éxito',
    Icon: CheckCircle2,
  },
  error: {
    container: 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]',
    iconColor: 'text-[#B91C1C]',
    prefix: 'Error',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]',
    iconColor: 'text-[#B45309]',
    prefix: 'Advertencia',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]',
    iconColor: 'text-[#1D4ED8]',
    prefix: 'Información',
    Icon: Info,
  },
};

export function SystemMessageBanner({
  message,
  onDismiss,
}: SystemMessageBannerProps) {
  if (!message) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-white border border-[#E2E6ED] rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-[#64748B]"
      >
        <Info className="w-4 h-4 text-[#64748B] shrink-0" />
        <span>
          <strong className="font-semibold text-[#334155]">Mensajes del sistema:</strong>{' '}
          Selecciona tus asignaturas del catálogo disponible y utiliza «Validar» antes de continuar con tu matrícula.
        </span>
      </div>
    );
  }

  const config = STYLE_MAP[message.type];
  const Icon = config.Icon;

  return (
    <div
      role={message.type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`border rounded-xl px-4 py-3.5 transition-all duration-150 ${config.container}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug">
              <span>{config.prefix}:</span> {message.title}
            </p>
            <p className="text-sm opacity-90 mt-0.5 leading-relaxed">
              {message.description}
            </p>
            {message.details && message.details.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs sm:text-sm list-disc list-inside opacity-95">
                {message.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar mensaje del sistema"
            className="p-1 rounded-md hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

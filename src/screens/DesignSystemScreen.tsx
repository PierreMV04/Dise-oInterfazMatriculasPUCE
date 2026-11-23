import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { ScreenId } from '../types/enrollment';

interface DesignSystemScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

const COLOR_TOKENS = [
  {
    name: 'Azul Institucional (Acento Primario)',
    hex: '#1D4ED8',
    hoverHex: '#1E40AF',
    usage: 'Botones primarios (Continuar, Agregar, Iniciar sesión), estados activos y enlaces clave.',
    swatchClass: 'bg-[#1D4ED8]',
  },
  {
    name: 'Tinta Académica (Texto Principal)',
    hex: '#0F1E36',
    usage: 'Titulares, nombres de asignaturas, encabezados de tablas y texto de alta jerarquía.',
    swatchClass: 'bg-[#0F1E36]',
  },
  {
    name: 'Lienzo Neutro (Fondo General)',
    hex: '#F7F8FA',
    usage: 'Fondo base de la aplicación (60% del área visual) para descanso ocular.',
    swatchClass: 'bg-[#F7F8FA] border border-[#CBD5E1]',
  },
  {
    name: 'Superficie Estructural y Bordes',
    hex: '#FFFFFF / #E2E6ED',
    usage: 'Contenedores, tarjetas, tablas y divisores finos de 1px (30% del área visual).',
    swatchClass: 'bg-white border border-[#CBD5E1]',
  },
  {
    name: 'Éxito Académico',
    hex: '#15803D',
    usage: 'Validación aprobada, matrícula confirmada y disponibilidad de cupos.',
    swatchClass: 'bg-[#15803D]',
  },
  {
    name: 'Advertencia',
    hex: '#B45309',
    usage: 'Pocos cupos disponibles, carga académica ligera o confirmaciones pendientes.',
    swatchClass: 'bg-[#B45309]',
  },
  {
    name: 'Error / Bloqueo',
    hex: '#B91C1C',
    usage: 'Cruce horario, límite de créditos excedido, sin cupos o acción Quitar.',
    swatchClass: 'bg-[#B91C1C]',
  },
];

export function DesignSystemScreen({ onNavigate }: DesignSystemScreenProps) {
  return (
    <div className="space-y-8">
      <header className="bg-white border border-[#E2E6ED] rounded-xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#1D4ED8]">
            Sistema de Diseño de Interfaz (UI) · Sistema de Matrícula PUCE
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1E36] mt-1">
            Guía Visual: Colores, Tipografías, Botones y Jerarquía
          </h1>
          <p className="text-sm text-[#475569] mt-1.5 max-w-2xl">
            Especificación visual de los componentes y tokens aplicados en las 6
            pantallas del proceso de matrícula universitaria.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('selection')}
          className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Ver en Selección de asignaturas
        </button>
      </header>

      {/* 1. Paleta de Colores */}
      <section className="bg-white border border-[#E2E6ED] rounded-xl p-6 space-y-5">
        <div className="border-b border-[#E2E6ED] pb-3">
          <h2 className="text-base font-bold text-[#0F1E36]">
            01. Paleta de Colores y Proporción 60-30-10
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            60% lienzo neutro · 30% superficies blancas y tipografía oscura · 10%
            acento institucional y estados semánticos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLOR_TOKENS.map((token) => (
            <div
              key={token.name}
              className="border border-[#E2E6ED] rounded-lg p-4 space-y-3"
            >
              <div className={`w-full h-14 rounded-md ${token.swatchClass}`} />
              <div>
                <p className="text-sm font-semibold text-[#0F1E36]">
                  {token.name}
                </p>
                <p className="font-mono text-xs font-medium text-[#1D4ED8] mt-0.5">
                  {token.hex}
                </p>
                <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                  {token.usage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Tipografía y Jerarquía */}
      <section className="bg-white border border-[#E2E6ED] rounded-xl p-6 space-y-5">
        <div className="border-b border-[#E2E6ED] pb-3">
          <h2 className="text-base font-bold text-[#0F1E36]">
            02. Tipografías y Jerarquía Visual
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Plus Jakarta Sans para encabezados · DM Sans para lectura de interfaz ·
            JetBrains Mono para códigos, créditos y horarios
          </p>
        </div>

        <div className="divide-y divide-[#E2E6ED]">
          <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-baseline">
            <div className="md:col-span-4 text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F1E36]">
                Display / Título de Pantalla
              </p>
              <p className="font-mono mt-0.5">
                Plus Jakarta Sans · 24px / Bold (700)
              </p>
            </div>
            <div className="md:col-span-8">
              <p className="text-2xl font-bold text-[#0F1E36] tracking-tight">
                Selección de Asignaturas · Periodo 2026-02
              </p>
            </div>
          </div>

          <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-baseline">
            <div className="md:col-span-4 text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F1E36]">
                Encabezado de Sección / Bloque
              </p>
              <p className="font-mono mt-0.5">
                Plus Jakarta Sans · 16px / SemiBold (600)
              </p>
            </div>
            <div className="md:col-span-8">
              <p className="text-base font-semibold text-[#0F1E36]">
                Listado de asignaturas disponibles y validación académica
              </p>
            </div>
          </div>

          <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-baseline">
            <div className="md:col-span-4 text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F1E36]">
                Texto de Cuerpo y Metadatos
              </p>
              <p className="font-mono mt-0.5">DM Sans · 14px / Regular (400)</p>
            </div>
            <div className="md:col-span-8">
              <p className="text-sm text-[#475569] leading-relaxed">
                Ingeniería de Sistemas e Informática · Facultad de Ingeniería y
                Tecnología · Ventana Regular Habilitada
              </p>
            </div>
          </div>

          <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-baseline">
            <div className="md:col-span-4 text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F1E36]">
                Datos Tabulares y Códigos
              </p>
              <p className="font-mono mt-0.5">
                JetBrains Mono · 13px / tabular-nums
              </p>
            </div>
            <div className="md:col-span-8 flex flex-wrap items-center gap-4 font-mono text-sm text-[#0F1E36] tabular-nums">
              <span>SIS-601</span>
              <span>202310482</span>
              <span>12 / 22 créditos</span>
              <span>Lun 08:00–10:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Botones, Inputs y Mensajes del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-white border border-[#E2E6ED] rounded-xl p-6 space-y-5">
          <div className="border-b border-[#E2E6ED] pb-3">
            <h2 className="text-base font-bold text-[#0F1E36]">
              03. Botones y Controles de Acción
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Jerarquía de acciones primarias, secundarias, destructivas y filtros
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('summary')}
                className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continuar (Primario)
              </button>

              <button
                type="button"
                onClick={() => onNavigate('selection')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>

              <button
                type="button"
                onClick={() => onNavigate('selection')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:border-[#0F1E36] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                Validar (Secundario)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('selection')}
                className="px-3.5 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Quitar (Acción negativa)
              </button>

              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar (Neutro)
              </button>

              <button
                type="button"
                onClick={() => onNavigate('confirmation')}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Confirmar matrícula
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#0F1E36] mb-1.5">
                Campo de búsqueda estándar
              </label>
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value="SIS601 · Diseño de Sistemas"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-6 bg-white border border-[#E2E6ED] rounded-xl p-6 space-y-4">
          <div className="border-b border-[#E2E6ED] pb-3">
            <h2 className="text-base font-bold text-[#0F1E36]">
              04. Estados de Mensajes del Sistema
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Icono + etiqueta textual explícita + contraste AA (nunca solo color)
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#14532D] rounded-lg px-4 py-3 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold">
                  Éxito: Asignatura agregada y validada
                </p>
                <p className="opacity-90 mt-0.5">
                  SIS601 se incorporó sin cruces horarios en tu carga 2026-02.
                </p>
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#78350F] rounded-lg px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold">
                  Advertencia: Cupos limitados en SIS-604
                </p>
                <p className="opacity-90 mt-0.5">
                  Quedan solo 6 vacantes disponibles. Confirma tu matrícula pronto.
                </p>
              </div>
            </div>

            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#7F1D1D] rounded-lg px-4 py-3 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold">
                  Error: Cruce horario detectado con IND-503
                </p>
                <p className="opacity-90 mt-0.5">
                  El horario Lun 09:00–11:00 se superpone con SIS-601 (08:00–10:00).
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import { Database, Menu, Palette, Route, X } from 'lucide-react';
import { useState } from 'react';
import { ScreenId } from '../types/enrollment';

interface TopNavBarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const PORTAL_NAV_ITEMS: Array<{ id: ScreenId; label: string }> = [
  { id: 'dashboard', label: 'Menú principal' },
  { id: 'selection', label: 'Selección de asignaturas' },
  { id: 'summary', label: 'Resumen' },
  { id: 'confirmation', label: 'Comprobante' },
  { id: 'status', label: 'Estado de matrícula' },
];

const UI_SCREEN_SELECTOR: Array<{ id: ScreenId; code: string; label: string }> = [
  { id: 'login', code: '01', label: 'Inicio de sesión' },
  { id: 'dashboard', code: '02', label: 'Menú del estudiante' },
  { id: 'selection', code: '03', label: 'Selección de asignaturas' },
  { id: 'summary', code: '04', label: 'Resumen de matrícula' },
  { id: 'confirmation', code: '05', label: 'Confirmación y comprobante' },
  { id: 'status', code: '06', label: 'Consulta de estado' },
];

export function TopNavBar({ currentScreen, onNavigate }: TopNavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (screen: ScreenId) => {
    setMobileOpen(false);
    onNavigate(screen);
  };

  return (
    <div className="no-print sticky top-0 z-30 bg-white border-b border-[#E2E6ED]">
      {/* Primary 3-Zone Top Bar */}
      <header className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="text-base sm:text-lg font-bold tracking-tight text-[#0F1E36] hover:text-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] rounded"
        >
          Sistema de Matrícula PUCE
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Navegación académica"
          className="hidden lg:flex items-center gap-6"
        >
          {PORTAL_NAV_ITEMS.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                  isActive
                    ? 'text-[#1D4ED8]'
                    : 'text-[#475569] hover:text-[#0F1E36]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1D4ED8]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('navigation-map')}
            className={`hidden xl:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
              currentScreen === 'navigation-map'
                ? 'bg-[#1D4ED8] text-white'
                : 'bg-[#F1F5F9] text-[#0F1E36] hover:bg-[#E2E8F0]'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Mapa y reglas</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('data-dictionary')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
              currentScreen === 'data-dictionary'
                ? 'bg-[#1D4ED8] text-white'
                : 'bg-[#F1F5F9] text-[#0F1E36] hover:bg-[#E2E8F0]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Diccionario de datos</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('design-system')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
              currentScreen === 'design-system'
                ? 'bg-[#1D4ED8] text-white'
                : 'bg-[#F1F5F9] text-[#0F1E36] hover:bg-[#E2E8F0]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Guía Visual UI</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E2E6ED] text-[#0F1E36] hover:bg-[#F8FAFC] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Screen Gallery Bar for quick switching between all 6 UI screens */}
      <div className="hidden lg:block bg-[#F8FAFC] border-t border-[#E2E6ED]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-[#64748B] whitespace-nowrap shrink-0">
            Pantallas de interfaz:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {UI_SCREEN_SELECTOR.map((screen) => {
              const isActive = currentScreen === screen.id;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => handleNavClick(screen.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0F1E36] text-white'
                      : 'text-[#475569] hover:text-[#0F1E36] hover:bg-[#E2E8F0]/70'
                  }`}
                >
                  <span className="font-mono opacity-75 mr-1">{screen.code}.</span>
                  {screen.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E2E6ED] bg-white px-4 py-3 space-y-1">
          {UI_SCREEN_SELECTOR.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <span className="font-mono text-xs mr-1.5 opacity-70">
                  {item.code}.
                </span>
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#E2E6ED]">
            <button
              type="button"
              onClick={() => handleNavClick('navigation-map')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                currentScreen === 'navigation-map'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'text-[#1D4ED8] hover:bg-[#EFF6FF]'
              }`}
            >
              Mapa de navegación y reglas
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('data-dictionary')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                currentScreen === 'data-dictionary'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'text-[#1D4ED8] hover:bg-[#EFF6FF]'
              }`}
            >
              Diccionario de datos y procesos
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('design-system')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${
                currentScreen === 'design-system'
                  ? 'bg-[#1D4ED8] text-white'
                  : 'text-[#1D4ED8] hover:bg-[#EFF6FF]'
              }`}
            >
              Guía Visual UI (Colores, Tipografías y Botones)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

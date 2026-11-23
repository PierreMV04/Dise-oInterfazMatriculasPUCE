import { ArrowRight, Eye, EyeOff, KeyRound, Lock, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { CAMPUS_HERO_URL, STUDENTS_DATA } from '../data/mockAcademicData';
import { StudentProfile } from '../types/enrollment';

interface LoginScreenProps {
  onLoginSuccess: (student: StudentProfile, selectedPeriod: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [identifier, setIdentifier] = useState('L00412398');
  const [password, setPassword] = useState('puce2026');
  const [period, setPeriod] = useState('2026-02');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  // Inline password recovery state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = identifier.trim().toLowerCase();

    if (!trimmed || !password.trim()) {
      setError('Ingresa tu código de estudiante o correo y tu contraseña para continuar.');
      return;
    }

    const matched = STUDENTS_DATA.find(
      (s) =>
        s.code.toLowerCase() === trimmed || s.email.toLowerCase() === trimmed
    );

    if (!matched || matched.password !== password) {
      setError(
        'Credenciales incorrectas. Verifica tu código/correo institucional o usa un perfil de acceso rápido.'
      );
      return;
    }

    setError(null);
    onLoginSuccess(matched, period);
  };

  const handleQuickLogin = (student: StudentProfile) => {
    setIdentifier(student.code);
    setPassword(student.password);
    setError(null);
    onLoginSuccess(student, period);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoverySent(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col lg:grid lg:grid-cols-12 items-stretch">
      {/* Left Institutional Visual Panel */}
      <div className="relative lg:col-span-6 min-h-[260px] lg:min-h-screen bg-[#0F1E36] overflow-hidden flex flex-col justify-between p-8 sm:p-12">
        {!imgFailed && (
          <img
            src={CAMPUS_HERO_URL}
            alt="Campus universitario de la Pontificia Universidad Católica del Ecuador"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0B1526]/95 via-[#0F1E36]/60 to-[#0F1E36]/35"
        />

        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-tight text-white/95">
            Pontificia Universidad Católica del Ecuador
          </p>
        </div>

        <div className="relative z-10 max-w-lg mt-12 lg:mt-0">
          <p className="text-xs font-medium text-[#93C5FD] mb-2">
            Secretaría Académica · Periodo {period}
          </p>
          <h1
            className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Sistema de Matrícula y Gestión Académica
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed">
            Selecciona tus asignaturas, verifica la disponibilidad de vacantes y
            cruces horarios en tiempo real, y genera tu comprobante oficial de
            matrícula.
          </p>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-white">
            <div>
              <p className="text-xs text-slate-300">Periodo activo</p>
              <p className="text-sm font-mono font-semibold mt-0.5 tabular-nums">
                2026-02
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-300">Modalidad</p>
              <p className="text-sm font-semibold mt-0.5">Regular en línea</p>
            </div>
            <div>
              <p className="text-xs text-slate-300">Emisión</p>
              <p className="text-sm font-semibold mt-0.5">Constancia digital</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F1E36] tracking-tight">
              Inicio de sesión
            </h2>
            <p className="mt-1.5 text-sm text-[#475569]">
              Ingresa con tu código universitario o correo institucional para
              acceder al portal del estudiante.
            </p>
          </div>

          {!showRecovery ? (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="student-identifier"
                  className="block text-sm font-medium text-[#0F1E36] mb-1.5"
                >
                  Código de estudiante o correo institucional
                </label>
                <input
                  id="student-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ej. L00412398 o aandino@puce.edu.ec"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="student-password"
                    className="block text-sm font-medium text-[#0F1E36]"
                  >
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(true);
                      setRecoverySent(false);
                    }}
                    className="text-xs font-medium text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="student-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-3.5 pr-11 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-[#64748B] hover:text-[#0F1E36] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="academic-period"
                  className="block text-sm font-medium text-[#0F1E36] mb-1.5"
                >
                  Periodo académico
                </label>
                <select
                  id="academic-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                >
                  <option value="2026-02">2026-02 · Matrícula ordinaria (2 al 13 de febrero)</option>
                </select>
              </div>

              {error && (
                <div
                  role="alert"
                  className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded-lg px-3.5 py-2.5 text-sm"
                >
                  <strong className="font-semibold">Error de acceso:</strong> {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                <span>Iniciar sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleRecoverySubmit}
              className="bg-white border border-[#E2E6ED] rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-[#0F1E36]">
                <KeyRound className="w-4 h-4 text-[#1D4ED8]" />
                <h3 className="text-sm font-semibold">
                  Recuperación de contraseña institucional
                </h3>
              </div>

              {!recoverySent ? (
                <>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Ingresa tu correo institucional para recibir un enlace de
                    restablecimiento.
                  </p>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="usuario@puce.edu.ec"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Enviar instrucciones
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRecovery(false)}
                      className="px-4 py-2 text-xs font-medium text-[#475569] hover:text-[#0F1E36] cursor-pointer"
                    >
                      Volver al acceso
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3">
                    Se enviaron las instrucciones de recuperación a{' '}
                    <strong>{recoveryEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    Regresar al inicio de sesión
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-[#E2E6ED]">
            <p className="text-xs font-semibold text-[#475569] mb-3">
              Perfiles estudiantiles habilitados para prueba rápida (clave:{' '}
              <span className="font-mono text-[#0F1E36]">puce2026</span>)
            </p>
            <div className="space-y-2.5">
              {STUDENTS_DATA.map((student) => (
                <button
                  key={student.code}
                  type="button"
                  onClick={() => handleQuickLogin(student)}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white border border-[#E2E6ED] hover:border-[#1D4ED8] rounded-lg text-left transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F1E36] group-hover:text-[#1D4ED8] truncate">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      <span className="font-mono tabular-nums">{student.code}</span>{' '}
                      · {student.career} · Nivel {student.cycle}°
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] whitespace-nowrap shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                    Acceder
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

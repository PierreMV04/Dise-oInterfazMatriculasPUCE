import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  FilterX,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { StudentHeaderCard } from '../components/StudentHeaderCard';
import { SystemMessageBanner } from '../components/SystemMessageBanner';
import { WeeklyScheduleGrid } from '../components/WeeklyScheduleGrid';
import {
  Course,
  CourseModality,
  ScreenId,
  StudentProfile,
  SystemMessage,
} from '../types/enrollment';
import {
  findConflictsWithSelection,
  formatScheduleSummary,
  hasApprovedPrerequisite,
  validateEnrollmentSelection,
} from '../utils/enrollmentLogic';

interface CourseSelectionScreenProps {
  student: StudentProfile;
  catalog: Course[];
  selectedCourses: Course[];
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (courseId: string) => void;
  onClearSelection: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export function CourseSelectionScreen({
  student,
  catalog,
  selectedCourses,
  onAddCourse,
  onRemoveCourse,
  onClearSelection,
  onNavigate,
}: CourseSelectionScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [hideConflicts, setHideConflicts] = useState(false);

  const [showSchedulePreview, setShowSchedulePreview] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  // Toggle between showing all 3 visual states (Éxito, Advertencia, Error) or single live action message
  const [messageViewMode, setMessageViewMode] = useState<'all-states' | 'live'>(
    'all-states'
  );
  const [systemMessage, setSystemMessage] = useState<SystemMessage>({
    id: 'initial-success',
    type: 'success',
    title: 'Carga académica inicial validada',
    description:
      'Las asignaturas preseleccionadas cumplen el mínimo de créditos y no presentan cruces horarios.',
  });

  const selectedIds = useMemo(
    () => new Set(selectedCourses.map((c) => c.id)),
    [selectedCourses]
  );

  const totalCredits = useMemo(
    () => selectedCourses.reduce((sum, c) => sum + c.credits, 0),
    [selectedCourses]
  );

  const totalHours = useMemo(
    () => selectedCourses.reduce((sum, c) => sum + c.weeklyHours, 0),
    [selectedCourses]
  );

  const filteredCatalog = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return catalog.filter((course) => {
      if (query) {
        const matchCode = course.code.toLowerCase().includes(query);
        const matchName = course.name.toLowerCase().includes(query);
        const matchProf = course.professor.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchProf) return false;
      }

      if (cycleFilter !== 'all') {
        if (cycleFilter === 'electivo' && course.cycle !== 0) return false;
        if (cycleFilter !== 'electivo' && course.cycle !== Number(cycleFilter))
          return false;
      }

      if (
        modalityFilter !== 'all' &&
        course.modality !== (modalityFilter as CourseModality)
      ) {
        return false;
      }

      if (onlyAvailable && course.seatsAvailable <= 0) {
        return false;
      }

      if (hideConflicts && !selectedIds.has(course.id)) {
        const conflicts = findConflictsWithSelection(course, selectedCourses);
        if (conflicts.length > 0) return false;
      }

      return true;
    });
  }, [
    catalog,
    searchQuery,
    cycleFilter,
    modalityFilter,
    onlyAvailable,
    hideConflicts,
    selectedIds,
    selectedCourses,
  ]);

  const hasActiveFilters =
    searchQuery !== '' ||
    cycleFilter !== 'all' ||
    modalityFilter !== 'all' ||
    onlyAvailable ||
    hideConflicts;

  const triggerLiveMessage = (msg: SystemMessage) => {
    setMessageViewMode('live');
    setSystemMessage(msg);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCycleFilter('all');
    setModalityFilter('all');
    setOnlyAvailable(false);
    setHideConflicts(false);
    triggerLiveMessage({
      id: String(Date.now()),
      type: 'info',
      title: 'Filtros restablecidos',
      description: `Se muestran las ${catalog.length} asignaturas disponibles del catálogo ${student.period}.`,
    });
  };

  const handleAttemptAdd = (course: Course) => {
    if (selectedIds.has(course.id)) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'info',
        title: 'Asignatura ya seleccionada',
        description: `${course.code} — ${course.name} ya forma parte de tu selección actual.`,
      });
      return;
    }

    if (course.seatsAvailable <= 0) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'error',
        title: `Sin cupos disponibles en ${course.code}`,
        description: `La asignatura "${course.name}" (${course.section}) tiene ${course.seatsTotal} cupos ocupados y 0 disponibles.`,
      });
      return;
    }

    if (!hasApprovedPrerequisite(course, student)) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'error',
        title: `Prerrequisito no cumplido para ${course.code}`,
        description: `Para cursar "${course.name}" debes haber aprobado previamente ${course.prerequisiteCode} (${course.prerequisiteName}).`,
      });
      return;
    }

    const duplicateBase = selectedCourses.find(
      (c) =>
        c.name.replace(' (Grupo B)', '') === course.name.replace(' (Grupo B)', '')
    );
    if (duplicateBase) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'Asignatura duplicada',
        description: `Ya tienes seleccionada otra sección de "${duplicateBase.name}" (${duplicateBase.code}). Quítala primero si deseas cambiar de grupo.`,
      });
      return;
    }

    const projectedCredits = totalCredits + course.credits;
    if (projectedCredits > student.maxCredits) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'Límite máximo de créditos excedido',
        description: `Agregar ${course.code} (${course.credits} cr.) elevaría tu carga a ${projectedCredits} créditos, superando tu máximo permitido de ${student.maxCredits} créditos.`,
      });
      return;
    }

    const conflicts = findConflictsWithSelection(course, selectedCourses);
    if (conflicts.length > 0) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'error',
        title: `Cruce de horario detectado al intentar agregar ${course.code}`,
        description: `El horario de "${course.name}" se superpone con asignaturas ya seleccionadas:`,
        details: conflicts.map((c) => c.reason),
      });
      return;
    }

    onAddCourse(course);

    if (course.seatsAvailable <= 6) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'warning',
        title: `${course.code} agregada con cupos reducidos`,
        description: `Se añadió "${course.name}" (${course.credits} créditos). Quedan únicamente ${course.seatsAvailable} vacantes disponibles.`,
      });
    } else {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'success',
        title: `${course.code} agregada a tu selección`,
        description: `"${course.name}" (${course.credits} créditos) fue añadida sin cruces horarios. Total actual: ${projectedCredits} créditos.`,
      });
    }
  };

  const handleRemove = (course: Course) => {
    onRemoveCourse(course.id);
    const remaining = totalCredits - course.credits;
    triggerLiveMessage({
      id: String(Date.now()),
      type: 'info',
      title: `${course.code} retirada de la selección`,
      description: `Se quitó "${course.name}". Tu carga académica actual es de ${remaining} créditos.`,
    });
  };

  const handleValidate = () => {
    const result = validateEnrollmentSelection(selectedCourses, student);

    if (!result.isValid) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'Validación académica con observaciones bloqueantes',
        description:
          'Corrige los siguientes puntos antes de continuar al resumen de matrícula:',
        details: result.errors,
      });
      return false;
    }

    if (result.hasWarnings) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'warning',
        title: `Selección válida con advertencias (${result.totalCredits} créditos)`,
        description:
          'Cumples los requisitos académicos para continuar, ten en cuenta estas recomendaciones:',
        details: result.warnings,
      });
      return true;
    }

    triggerLiveMessage({
      id: String(Date.now()),
      type: 'success',
      title: 'Validación académica exitosa',
      description: `Tus ${selectedCourses.length} asignaturas (${result.totalCredits} créditos · ${result.totalHours} hrs/sem) cumplen todos los prerrequisitos, cupos y no presentan cruces horarios.`,
    });
    return true;
  };

  const handleContinue = () => {
    const result = validateEnrollmentSelection(selectedCourses, student);
    if (!result.isValid) {
      triggerLiveMessage({
        id: String(Date.now()),
        type: 'error',
        title: 'No se puede continuar al Resumen de matrícula',
        description:
          'La selección actual debe aprobar la validación académica para avanzar:',
        details: result.errors,
      });
      return;
    }
    onNavigate('summary');
  };

  const handleConfirmCancel = (discardChanges: boolean) => {
    if (discardChanges) {
      onClearSelection();
    }
    setConfirmingCancel(false);
    onNavigate('dashboard');
  };

  const creditPercent = Math.min(
    100,
    Math.round((totalCredits / student.maxCredits) * 100)
  );

  return (
    <div className="space-y-5">
      {/* 1. Encabezado con datos del estudiante (nombre, código, carrera, periodo) */}
      <StudentHeaderCard
        student={student}
        subtitle="Selección de asignaturas · Diseño de interfaz"
        rightSlot={
          <button
            type="button"
            onClick={() => setShowSchedulePreview((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-[#1D4ED8]" />
            <span>
              {showSchedulePreview
                ? 'Ocultar horario semanal'
                : 'Ver horario semanal'}
            </span>
          </button>
        }
      />

      {/* 2. Espacio para mensajes del sistema (éxito, error, advertencia) */}
      <section
        aria-label="Espacio para mensajes del sistema"
        className="bg-white border border-[#E2E6ED] rounded-xl p-4 sm:p-5 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0F1E36]">
              Mensajes del sistema
            </h2>
            <p className="text-xs text-[#64748B]">
              Jerarquía visual de estados de retroalimentación (éxito, advertencia y error)
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-[#F1F5F9] rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMessageViewMode('all-states')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                messageViewMode === 'all-states'
                  ? 'bg-white text-[#0F1E36] shadow-xs'
                  : 'text-[#475569] hover:text-[#0F1E36]'
              }`}
            >
              Ver 3 estados UI
            </button>
            <button
              type="button"
              onClick={() => setMessageViewMode('live')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                messageViewMode === 'live'
                  ? 'bg-white text-[#0F1E36] shadow-xs'
                  : 'text-[#475569] hover:text-[#0F1E36]'
              }`}
            >
              Mensaje activo
            </button>
          </div>
        </div>

        {messageViewMode === 'all-states' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#14532D] rounded-lg px-3.5 py-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold">Éxito: Selección validada</p>
                <p className="opacity-90 mt-0.5">
                  SIS601, SIS602 y SIS603 cumplen requisitos y no tienen cruce de horario.
                </p>
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#78350F] rounded-lg px-3.5 py-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold">Advertencia: Pocos cupos</p>
                <p className="opacity-90 mt-0.5">
                  SIS601 G1 dispone solo de 3 cupos. Confirma pronto para asegurar tu lugar.
                </p>
              </div>
            </div>

            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#7F1D1D] rounded-lg px-3.5 py-3 flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold">Error: Cruce o sin cupos</p>
                <p className="opacity-90 mt-0.5">
                  SIS607 G1 se cruza con SIS603 G1 el Vie 09:00–10:00 y SIS604 G1 tiene 0 cupos.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <SystemMessageBanner
            message={systemMessage}
            onDismiss={() => setMessageViewMode('all-states')}
          />
        )}
      </section>

      {/* Collapsible weekly schedule preview */}
      {showSchedulePreview && (
        <section aria-label="Vista previa de horario semanal" className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F1E36]">
              Vista previa del horario semanal ({selectedCourses.length} asignaturas)
            </h2>
            <button
              type="button"
              onClick={() => setShowSchedulePreview(false)}
              className="text-xs font-medium text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Cerrar vista de horario
            </button>
          </div>
          <WeeklyScheduleGrid courses={selectedCourses} />
        </section>
      )}

      {/* Cancel confirmation bar */}
      {confirmingCancel && (
        <div
          role="dialog"
          aria-label="Confirmar cancelación"
          className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <p className="text-sm font-semibold text-[#78350F]">
              ¿Deseas cancelar el proceso de selección actual?
            </p>
            <p className="text-xs text-[#92400E] mt-0.5">
              Puedes regresar al menú principal conservando tu borrador o
              descartar todas las asignaturas seleccionadas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmingCancel(false)}
              className="px-3.5 py-2 bg-white border border-[#CBD5E1] text-xs font-semibold text-[#0F1E36] rounded-lg hover:bg-[#F8FAFC] cursor-pointer whitespace-nowrap"
            >
              Seguir editando
            </button>
            <button
              type="button"
              onClick={() => handleConfirmCancel(false)}
              className="px-3.5 py-2 bg-[#0F1E36] text-white text-xs font-semibold rounded-lg hover:bg-[#1E293B] cursor-pointer whitespace-nowrap"
            >
              Guardar borrador y salir
            </button>
            <button
              type="button"
              onClick={() => handleConfirmCancel(true)}
              className="px-3.5 py-2 bg-[#B91C1C] text-white text-xs font-semibold rounded-lg hover:bg-[#991B1B] cursor-pointer whitespace-nowrap"
            >
              Descartar todo y salir
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Search/Filters + Available Courses */}
        <div className="lg:col-span-7 space-y-4">
          {/* 3. Zona de búsqueda / filtros de asignaturas */}
          <section
            aria-label="Zona de búsqueda y filtros de asignaturas"
            className="bg-white border border-[#E2E6ED] rounded-xl p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#0F1E36]">
                Búsqueda y filtros de asignaturas
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer whitespace-nowrap"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por código, nombre o docente..."
                  aria-label="Buscar asignatura por código, nombre o docente"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  aria-label="Filtrar por nivel"
                  value={cycleFilter}
                  onChange={(e) => setCycleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36] focus:outline-none focus:border-[#1D4ED8]"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="5">Nivel 5°</option>
                  <option value="6">Nivel 6°</option>
                  <option value="7"></option>
                  <option value="electivo">Electivos</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  aria-label="Filtrar por modalidad"
                  value={modalityFilter}
                  onChange={(e) => setModalityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#0F1E36] focus:outline-none focus:border-[#1D4ED8]"
                >
                  <option value="all">Toda modalidad</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Híbrida">Híbrida</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-[#334155]">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <span>Solo con cupos disponibles</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideConflicts}
                  onChange={(e) => setHideConflicts(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <span>Ocultar asignaturas con cruce horario</span>
              </label>
            </div>
          </section>

          {/* 4. Listado de asignaturas disponibles (código, nombre, créditos, cupos, horario) */}
          <section
            aria-label="Listado de asignaturas disponibles"
            className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden"
          >
            <div className="px-4 sm:px-5 py-3.5 border-b border-[#E2E6ED] flex items-center justify-between gap-3 bg-[#F8FAFC]">
              <h2 className="text-sm font-bold text-[#0F1E36]">
                Listado de asignaturas disponibles ({filteredCatalog.length})
              </h2>
              <span className="text-xs text-[#64748B]">
                Catálogo oficial {student.period}
              </span>
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#475569]">
                  No se encontraron asignaturas que coincidan con los filtros
                  aplicados.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-semibold text-[#0F1E36] rounded-lg cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E6ED] text-xs text-[#64748B] bg-white">
                      <th className="py-3 pl-4 sm:pl-5 pr-3 font-semibold">
                        Código
                      </th>
                      <th className="py-3 px-3 font-semibold">Nombre</th>
                      <th className="py-3 px-3 font-semibold text-center">
                        Créditos
                      </th>
                      <th className="py-3 px-3 font-semibold text-center">
                        Cupos
                      </th>
                      <th className="py-3 px-3 font-semibold">Horario</th>
                      <th className="py-3 pl-3 pr-4 sm:pr-5 text-right font-semibold">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E6ED]">
                    {filteredCatalog.map((course) => {
                      const isSelected = selectedIds.has(course.id);
                      const noSeats = course.seatsAvailable <= 0;
                      const prereqMet = hasApprovedPrerequisite(course, student);
                      const conflicts = !isSelected
                        ? findConflictsWithSelection(course, selectedCourses)
                        : [];
                      const hasConflict = conflicts.length > 0;

                      return (
                        <tr
                          key={course.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-[#EFF6FF]/45'
                              : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td className="py-3.5 pl-4 sm:pl-5 pr-3 font-mono text-xs font-semibold text-[#1D4ED8] tabular-nums whitespace-nowrap align-top">
                            {course.code}
                          </td>

                          <td className="py-3.5 px-3 align-top min-w-[200px]">
                            <p className="font-semibold text-[#0F1E36] leading-snug">
                              {course.name}
                            </p>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {course.section} · {course.modality} ·{' '}
                              {course.professor}
                            </p>
                            {course.prerequisiteCode && (
                              <p
                                className={`text-[11px] mt-0.5 ${
                                  prereqMet
                                    ? 'text-[#64748B]'
                                    : 'text-[#B91C1C] font-medium'
                                }`}
                              >
                                Prerreq.: {course.prerequisiteCode}
                                {!prereqMet ? ' (Pendiente)' : ''}
                              </p>
                            )}
                            {hasConflict && (
                              <p className="text-[11px] font-medium text-[#B91C1C] mt-0.5">
                                {conflicts[0].reason}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-semibold text-[#0F1E36] tabular-nums align-top">
                            {course.credits}
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono text-xs tabular-nums whitespace-nowrap align-top">
                            <span
                              className={
                                noSeats
                                  ? 'text-[#B91C1C] font-semibold'
                                  : course.seatsAvailable <= 6
                                    ? 'text-[#B45309] font-semibold'
                                    : 'text-[#15803D] font-semibold'
                              }
                            >
                              {course.seatsAvailable}/{course.seatsTotal}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[11px] text-[#334155] align-top min-w-[145px]">
                            {formatScheduleSummary(course.schedule)}
                          </td>

                          <td className="py-3.5 pl-3 pr-4 sm:pr-5 text-right align-top">
                            {isSelected ? (
                              <div className="inline-flex flex-col items-end gap-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] whitespace-nowrap">
                                  <Check className="w-3.5 h-3.5" />
                                  Agregada
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemove(course)}
                                  className="px-2.5 py-1 text-xs font-semibold text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                                >
                                  Quitar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAttemptAdd(course)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  noSeats || !prereqMet || hasConflict
                                    ? 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
                                    : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Agregar</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Selected Courses Zone + Credit Totals + Action Buttons */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
          <section
            aria-label="Zona de asignaturas seleccionadas y totales de créditos"
            className="bg-white border border-[#E2E6ED] rounded-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#E2E6ED] bg-[#F8FAFC] flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#0F1E36]">
                  Asignaturas seleccionadas ({selectedCourses.length})
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Carga académica armada para {student.period}
                </p>
              </div>
              {selectedCourses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClearSelection();
                    triggerLiveMessage({
                      id: String(Date.now()),
                      type: 'info',
                      title: 'Selección vaciada',
                      description:
                        'Se retiraron todas las asignaturas de tu bandeja de selección.',
                    });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#B91C1C] hover:underline cursor-pointer whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vaciar
                </button>
              )}
            </div>

            {/* Totales de créditos seleccionados */}
            <div className="p-5 border-b border-[#E2E6ED] space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-[#475569]">
                  Total de créditos seleccionados
                </span>
                <span className="text-xl font-bold font-mono text-[#0F1E36] tabular-nums">
                  {totalCredits}{' '}
                  <span className="text-xs font-normal text-[#64748B]">
                    / {student.maxCredits} máx.
                  </span>
                </span>
              </div>

              <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    totalCredits > student.maxCredits
                      ? 'bg-[#B91C1C]'
                      : totalCredits >= student.minCredits
                        ? 'bg-[#15803D]'
                        : 'bg-[#1D4ED8]'
                  }`}
                  style={{ width: `${creditPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748B] tabular-nums">
                <span>Mínimo permitido: {student.minCredits} cr.</span>
                <span>Total horas: {totalHours} hrs/sem</span>
              </div>
            </div>

            {/* Selected Courses List */}
            {selectedCourses.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#64748B]">
                No has agregado asignaturas todavía. Haz clic en{' '}
                <strong className="text-[#0F1E36]">«Agregar»</strong> en el
                listado disponible.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E6ED] max-h-[360px] overflow-y-auto">
                {selectedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="px-5 py-3.5 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs font-semibold text-[#1D4ED8] tabular-nums">
                          {course.code}
                        </span>
                        <p className="text-sm font-semibold text-[#0F1E36] truncate">
                          {course.name}
                        </p>
                      </div>
                      <p className="font-mono text-[11px] text-[#475569] mt-0.5">
                        {formatScheduleSummary(course.schedule)}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 tabular-nums">
                        {course.credits} créditos · {course.section} · Cupos:{' '}
                        {course.seatsAvailable}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(course)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botones de acción (Validar, Continuar, Cancelar) */}
            <div className="p-5 bg-[#F8FAFC] border-t border-[#E2E6ED] space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleValidate}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:border-[#0F1E36] text-[#0F1E36] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Validar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmingCancel(true)}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-[#CBD5E1] hover:bg-[#FEF2F2] hover:text-[#B91C1C] hover:border-[#FECACA] text-[#475569] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Continuar</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

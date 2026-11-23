/**
 * Sistema de Matrícula PUCE · Diseño de interfaz (caso de uso Realizar Matrícula)
 * Basado en el portal creado por el equipo, adaptado a PUCE.
 */

import { useEffect, useState } from 'react';
import { TopNavBar } from './components/TopNavBar';
import {
  DEFAULT_SELECTION_BY_STUDENT,
  DEMO_DATE_INSIDE,
  DEMO_DATE_OUTSIDE,
  INITIAL_COURSES_CATALOG,
  PERIOD_CONFIG,
  STUDENTS_DATA,
} from './data/mockAcademicData';
import { ConfirmationReceiptScreen } from './screens/ConfirmationReceiptScreen';
import { CourseSelectionScreen } from './screens/CourseSelectionScreen';
import { NavigationMapScreen } from './screens/NavigationMapScreen';
import { DataDictionaryScreen } from './screens/DataDictionaryScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { DesignSystemScreen } from './screens/DesignSystemScreen';
import { EnrollmentStatusScreen } from './screens/EnrollmentStatusScreen';
import { EnrollmentSummaryScreen } from './screens/EnrollmentSummaryScreen';
import { LoginScreen } from './screens/LoginScreen';
import {
  Course,
  EnrollmentReceipt,
  PaymentModality,
  ScreenId,
  StudentProfile,
} from './types/enrollment';
import {
  buildEnrollmentReceipt,
  checkEnrollmentEligibility,
  formatIsoDate,
} from './utils/enrollmentLogic';

const STORAGE_KEY = 'puce_matricula_ui_v1';

/** Enlaces directos: ?pantalla=seleccion&usuario=L00412398 */
const URL_PARAMS = new URLSearchParams(window.location.search);
const SCREEN_PARAM: Record<string, ScreenId> = {
  login: 'login',
  menu: 'dashboard',
  seleccion: 'selection',
  resumen: 'summary',
  comprobante: 'confirmation',
  estado: 'status',
  diccionario: 'data-dictionary',
  mapa: 'navigation-map',
  guia: 'design-system',
};
const URL_SCREEN = SCREEN_PARAM[URL_PARAMS.get('pantalla') ?? ''];
const URL_STUDENT = STUDENTS_DATA.find((s) => s.code === URL_PARAMS.get('usuario'));

const DEFAULT_STUDENT = STUDENTS_DATA[0];

/** Dario Franco ya tiene una matrícula registrada (comprobante MAT-2026-09823). */
const DARIO = STUDENTS_DATA[1];
const DARIO_COURSE_IDS = ['SIS601-G1', 'SIS602-G1', 'SIS603-G1', 'SIS604-G2'];
const DARIO_COURSES = DARIO_COURSE_IDS.map((id) =>
  INITIAL_COURSES_CATALOG.find((c) => c.id === id)
).filter((c): c is Course => Boolean(c));
const DARIO_RECEIPT: EnrollmentReceipt = {
  ...buildEnrollmentReceipt(DARIO, DARIO_COURSES, 'contado'),
  receiptCode: 'MAT-2026-09823',
  verificationHash: 'VER-PUCE-0399-0982',
  confirmedAt: '03/02/2026, 10:42',
};

interface PersistedState {
  studentCode: string;
  currentScreen: ScreenId;
  systemDate: string;
  selectedCourseIdsByStudent: Record<string, string[]>;
  receiptsByStudent: Record<string, EnrollmentReceipt>;
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export default function App() {
  const saved = loadPersistedState();

  const [catalog, setCatalog] = useState<Course[]>(INITIAL_COURSES_CATALOG);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile>(() => {
    const found = STUDENTS_DATA.find((s) => s.code === saved?.studentCode);
    return URL_STUDENT ?? found ?? DEFAULT_STUDENT;
  });
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(
    URL_SCREEN ?? saved?.currentScreen ?? 'login'
  );
  const [systemDate, setSystemDate] = useState<string>(
    saved?.systemDate ?? DEMO_DATE_INSIDE
  );
  const [selectedCourseIdsByStudent, setSelectedCourseIdsByStudent] = useState<
    Record<string, string[]>
  >(saved?.selectedCourseIdsByStudent ?? DEFAULT_SELECTION_BY_STUDENT);
  const [receiptsByStudent, setReceiptsByStudent] = useState<
    Record<string, EnrollmentReceipt>
  >(saved?.receiptsByStudent ?? { [DARIO.code]: DARIO_RECEIPT });

  useEffect(() => {
    try {
      const payload: PersistedState = {
        studentCode: currentStudent.code,
        currentScreen,
        systemDate,
        selectedCourseIdsByStudent,
        receiptsByStudent,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [
    currentStudent,
    currentScreen,
    systemDate,
    selectedCourseIdsByStudent,
    receiptsByStudent,
  ]);

  const handleLoginSuccess = (student: StudentProfile, period: string) => {
    setCurrentStudent({ ...student, period });
    setCurrentScreen('dashboard');
  };

  const activeSelectedIds =
    selectedCourseIdsByStudent[currentStudent.code] ?? [];

  const selectedCourses = activeSelectedIds
    .map((id) => catalog.find((c) => c.id === id))
    .filter((c): c is Course => Boolean(c));

  const activeReceipt: EnrollmentReceipt | null =
    receiptsByStudent[currentStudent.code] ?? null;

  // P2 Verificar habilitación (A1 periodo cerrado, A2 deuda pendiente)
  const eligibility = checkEnrollmentEligibility(currentStudent, systemDate);

  // Guardias de navegación: sin habilitación no se llega a Selección ni Resumen;
  // sin matrícula registrada no hay comprobante.
  let screen: ScreenId = currentScreen;
  if (
    !eligibility.canEnroll &&
    (screen === 'selection' || screen === 'summary')
  ) {
    screen = 'dashboard';
  }
  if (screen === 'confirmation' && !activeReceipt) {
    screen = 'dashboard';
  }

  const handleAddCourse = (course: Course) => {
    setSelectedCourseIdsByStudent((prev) => {
      const current = prev[currentStudent.code] ?? [];
      if (current.includes(course.id)) return prev;
      return { ...prev, [currentStudent.code]: [...current, course.id] };
    });
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourseIdsByStudent((prev) => {
      const current = prev[currentStudent.code] ?? [];
      return {
        ...prev,
        [currentStudent.code]: current.filter((id) => id !== courseId),
      };
    });
  };

  const handleClearSelection = () => {
    setSelectedCourseIdsByStudent((prev) => ({
      ...prev,
      [currentStudent.code]: [],
    }));
  };

  const handleConfirmEnrollment = (paymentModality: PaymentModality) => {
    if (selectedCourses.length === 0) return;

    const receipt = buildEnrollmentReceipt(
      currentStudent,
      selectedCourses,
      paymentModality
    );

    const enrolledIds = new Set(selectedCourses.map((c) => c.id));
    setCatalog((prev) =>
      prev.map((course) =>
        enrolledIds.has(course.id)
          ? { ...course, seatsAvailable: Math.max(0, course.seatsAvailable - 1) }
          : course
      )
    );

    setReceiptsByStudent((prev) => ({
      ...prev,
      [currentStudent.code]: receipt,
    }));

    setCurrentScreen('confirmation');
  };

  const insidePeriod = systemDate === DEMO_DATE_INSIDE;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <TopNavBar currentScreen={screen} onNavigate={setCurrentScreen} />

      {screen === 'login' ? (
        <main className="flex-1">
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </main>
      ) : (
        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {screen === 'dashboard' && (
            <DashboardScreen
              student={currentStudent}
              selectedCourses={selectedCourses}
              confirmedReceipt={activeReceipt}
              eligibility={eligibility}
              onNavigate={setCurrentScreen}
            />
          )}

          {screen === 'selection' && (
            <CourseSelectionScreen
              student={currentStudent}
              catalog={catalog}
              selectedCourses={selectedCourses}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              onClearSelection={handleClearSelection}
              onNavigate={setCurrentScreen}
            />
          )}

          {screen === 'summary' && (
            <EnrollmentSummaryScreen
              student={currentStudent}
              selectedCourses={selectedCourses}
              onConfirmEnrollment={handleConfirmEnrollment}
              onCancelEnrollment={() => {
                handleClearSelection();
                setCurrentScreen('dashboard');
              }}
              onNavigate={setCurrentScreen}
            />
          )}

          {screen === 'confirmation' && activeReceipt && (
            <ConfirmationReceiptScreen
              receipt={activeReceipt}
              onNavigate={setCurrentScreen}
            />
          )}

          {screen === 'status' && (
            <EnrollmentStatusScreen
              student={currentStudent}
              selectedCourses={selectedCourses}
              confirmedReceipt={activeReceipt}
              onNavigate={setCurrentScreen}
            />
          )}

          {screen === 'data-dictionary' && <DataDictionaryScreen />}
          {screen === 'navigation-map' && <NavigationMapScreen />}

          {screen === 'design-system' && (
            <DesignSystemScreen onNavigate={setCurrentScreen} />
          )}
        </main>
      )}

      <footer className="no-print border-t border-[#E2E6ED] bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#64748B]">
          <span>
            Pontificia Universidad Católica del Ecuador · Diseño de Interfaz de
            Matrícula · Periodo {PERIOD_CONFIG.code}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#0F1E36]">Modo demostración</span>
            <span>
              Fecha del sistema: {formatIsoDate(systemDate)} (
              {insidePeriod ? 'dentro' : 'fuera'} del periodo ordinario)
            </span>
            <button
              type="button"
              onClick={() =>
                setSystemDate(insidePeriod ? DEMO_DATE_OUTSIDE : DEMO_DATE_INSIDE)
              }
              className="font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Cambiar a {insidePeriod ? 'fuera' : 'dentro'} del periodo
            </button>
          </span>
        </div>
      </footer>
    </div>
  );
}

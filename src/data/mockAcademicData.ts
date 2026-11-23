/**
 * Datos simulados del sistema. Hacen el papel de la base de datos y siguen el
 * Diccionario de Datos del proyecto (ESTUDIANTE, PERIODO, ASIGNATURA, GRUPO...).
 */
import campusHero from '../assets/images/campus_university_hero_1795463328262.jpg';
import { Course, StudentProfile } from '../types/enrollment';

export const CAMPUS_HERO_URL = campusHero;

/** PERIODO */
export const PERIOD_CONFIG = {
  code: '2026-02',
  ordinaryStart: '2026-02-02',
  ordinaryEnd: '2026-02-13',
  maxCredits: 20,
  enrollmentRights: 50, // PERIODO.derechos_matricula (USD)
  inactivityMinutes: 15,
};

/** Fechas que el modo demostración permite elegir para el reloj del sistema. */
export const DEMO_DATE_INSIDE = '2026-02-05';
export const DEMO_DATE_OUTSIDE = '2026-03-02';

const PERIOD_ACADEMIC = {
  period: PERIOD_CONFIG.code,
  cycle: 6,
  minCredits: 1,
  maxCredits: PERIOD_CONFIG.maxCredits,
  gpa: 82.4,
  enrollmentTurn: 'Matrícula ordinaria',
  approvedCourseCodes: ['SIS401', 'SIS402', 'SIS501', 'MAT301'],
  career: 'Ingeniería de Sistemas',
  faculty: 'Facultad de Ingeniería',
  documentsComplete: true,
  academicStanding: 'Regular' as const,
};

export const STUDENTS_DATA: StudentProfile[] = [
  {
    ...PERIOD_ACADEMIC,
    code: 'L00412398',
    email: 'aandino@puce.edu.ec',
    password: 'puce2026',
    fullName: 'Alex Andino',
    financialClearance: true,
    debtAmount: 0,
    history: [
      { period: '2025-02', status: 'Concluido', credits: 19, gpa: '81.20', receiptCode: 'MAT-2025-07410', coursesCount: 5 },
      { period: '2025-01', status: 'Concluido', credits: 18, gpa: '83.05', receiptCode: 'MAT-2025-03122', coursesCount: 5 },
    ],
  },
  {
    ...PERIOD_ACADEMIC,
    code: 'L00412399',
    email: 'dfranco@puce.edu.ec',
    password: 'puce2026',
    fullName: 'Dario Franco',
    financialClearance: true,
    debtAmount: 0,
    history: [
      { period: '2025-02', status: 'Concluido', credits: 18, gpa: '84.10', receiptCode: 'MAT-2025-07411', coursesCount: 5 },
      { period: '2025-01', status: 'Concluido', credits: 17, gpa: '82.60', receiptCode: 'MAT-2025-03123', coursesCount: 5 },
    ],
  },
  {
    ...PERIOD_ACADEMIC,
    code: 'L00412400',
    email: 'pmontenegro@puce.edu.ec',
    password: 'puce2026',
    fullName: 'Pierre Montenegro',
    financialClearance: false,
    debtAmount: 85.5,
    history: [
      { period: '2025-02', status: 'Concluido', credits: 16, gpa: '79.80', receiptCode: 'MAT-2025-07412', coursesCount: 4 },
    ],
  },
];

/** Aprobadas por estudiante: Estadística II (SIS502) está reprobada, por eso IA queda con requisito pendiente. */

/** Catálogo de GRUPOS del periodo 2026-02 (ASIGNATURA + GRUPO + HORARIO_GRUPO). */
export const INITIAL_COURSES_CATALOG: Course[] = [
  {
    id: 'SIS502-G1', code: 'SIS502', name: 'Estadística II', section: 'G1', cycle: 5,
    credits: 4, price: 120, weeklyHours: 4, seatsAvailable: 9, seatsTotal: 30,
    professor: 'Ing. Carlos Mena', modality: 'Presencial', department: 'Ciencias Básicas',
    schedule: [
      { day: 'Lun', startHour: 16, endHour: 18, room: 'Aula 205' },
      { day: 'Mié', startHour: 16, endHour: 18, room: 'Aula 205' },
    ],
  },
  {
    id: 'SIS601-G1', code: 'SIS601', name: 'Diseño de Sistemas', section: 'G1', cycle: 6,
    credits: 4, price: 120, weeklyHours: 4, seatsAvailable: 3, seatsTotal: 30,
    professor: 'Ing. Yolanda García', modality: 'Presencial', department: 'Sistemas',
    schedule: [
      { day: 'Lun', startHour: 7, endHour: 9, room: 'Aula 301' },
      { day: 'Mié', startHour: 7, endHour: 9, room: 'Aula 301' },
    ],
  },
  {
    id: 'SIS601-G2', code: 'SIS601', name: 'Diseño de Sistemas', section: 'G2', cycle: 6,
    credits: 4, price: 120, weeklyHours: 4, seatsAvailable: 12, seatsTotal: 30,
    professor: 'Ing. Yolanda García', modality: 'Presencial', department: 'Sistemas',
    schedule: [
      { day: 'Mar', startHour: 7, endHour: 9, room: 'Aula 301' },
      { day: 'Jue', startHour: 7, endHour: 9, room: 'Aula 301' },
    ],
  },
  {
    id: 'SIS602-G1', code: 'SIS602', name: 'Base de Datos Avanzada', section: 'G1', cycle: 6,
    credits: 4, price: 120, weeklyHours: 4, seatsAvailable: 4, seatsTotal: 30,
    professor: 'Ing. Marco Paredes', modality: 'Presencial', department: 'Sistemas',
    schedule: [
      { day: 'Lun', startHour: 9, endHour: 11, room: 'Lab. 2' },
      { day: 'Mié', startHour: 9, endHour: 11, room: 'Lab. 2' },
    ],
  },
  {
    id: 'SIS603-G1', code: 'SIS603', name: 'Redes', section: 'G1', cycle: 6,
    credits: 3, price: 100, weeklyHours: 3, seatsAvailable: 10, seatsTotal: 30,
    professor: 'Ing. Lucía Torres', modality: 'Presencial', department: 'Infraestructura TI',
    schedule: [{ day: 'Vie', startHour: 7, endHour: 10, room: 'Lab. Redes' }],
  },
  {
    id: 'SIS603-G2', code: 'SIS603', name: 'Redes', section: 'G2', cycle: 6,
    credits: 3, price: 100, weeklyHours: 3, seatsAvailable: 6, seatsTotal: 30,
    professor: 'Ing. Lucía Torres', modality: 'Presencial', department: 'Infraestructura TI',
    schedule: [{ day: 'Vie', startHour: 10, endHour: 13, room: 'Lab. Redes' }],
  },
  {
    id: 'SIS604-G1', code: 'SIS604', name: 'Sistemas Operativos', section: 'G1', cycle: 6,
    credits: 4, price: 120, weeklyHours: 3, seatsAvailable: 0, seatsTotal: 30,
    professor: 'Ing. Diego Ruiz', modality: 'Presencial', department: 'Infraestructura TI',
    schedule: [{ day: 'Vie', startHour: 14, endHour: 17, room: 'Aula 402' }],
  },
  {
    id: 'SIS604-G2', code: 'SIS604', name: 'Sistemas Operativos', section: 'G2', cycle: 6,
    credits: 4, price: 120, weeklyHours: 2, seatsAvailable: 8, seatsTotal: 30,
    professor: 'Ing. Diego Ruiz', modality: 'Presencial', department: 'Infraestructura TI',
    schedule: [{ day: 'Mar', startHour: 14, endHour: 16, room: 'Aula 402' }],
  },
  {
    id: 'SIS605-G1', code: 'SIS605', name: 'Ingeniería de Software II', section: 'G1', cycle: 6,
    credits: 5, price: 140, weeklyHours: 4, seatsAvailable: 15, seatsTotal: 30,
    professor: 'Ing. Paola Reyes', modality: 'Presencial', department: 'Sistemas',
    prerequisiteCode: 'SIS501', prerequisiteName: 'Ingeniería de Software I',
    schedule: [
      { day: 'Mar', startHour: 16, endHour: 18, room: 'Aula 304' },
      { day: 'Jue', startHour: 16, endHour: 18, room: 'Aula 304' },
    ],
  },
  {
    id: 'SIS606-G1', code: 'SIS606', name: 'Inteligencia Artificial', section: 'G1', cycle: 6,
    credits: 4, price: 120, weeklyHours: 4, seatsAvailable: 20, seatsTotal: 30,
    professor: 'Ing. Andrés Salas', modality: 'Presencial', department: 'Ciencia de Datos',
    prerequisiteCode: 'SIS502', prerequisiteName: 'Estadística II',
    schedule: [
      { day: 'Lun', startHour: 14, endHour: 16, room: 'Lab. IA' },
      { day: 'Mié', startHour: 14, endHour: 16, room: 'Lab. IA' },
    ],
  },
  {
    id: 'SIS607-G1', code: 'SIS607', name: 'Laboratorio de Redes', section: 'G1', cycle: 6,
    credits: 1, price: 40, weeklyHours: 1, seatsAvailable: 10, seatsTotal: 20,
    professor: 'Ing. Lucía Torres', modality: 'Presencial', department: 'Infraestructura TI',
    corequisiteCode: 'SIS603', corequisiteName: 'Redes',
    schedule: [{ day: 'Vie', startHour: 9, endHour: 10, room: 'Lab. Redes' }],
  },
  {
    id: 'SIS607-G2', code: 'SIS607', name: 'Laboratorio de Redes', section: 'G2', cycle: 6,
    credits: 1, price: 40, weeklyHours: 1, seatsAvailable: 5, seatsTotal: 20,
    professor: 'Ing. Lucía Torres', modality: 'Presencial', department: 'Infraestructura TI',
    corequisiteCode: 'SIS603', corequisiteName: 'Redes',
    schedule: [{ day: 'Vie', startHour: 13, endHour: 14, room: 'Lab. Redes' }],
  },
];

/** Selección inicial por estudiante (borrador guardado). */
export const DEFAULT_SELECTION_BY_STUDENT: Record<string, string[]> = {
  L00412398: ['SIS601-G1', 'SIS602-G1', 'SIS603-G1', 'SIS604-G2'],
  L00412399: [],
  L00412400: [],
};

export const FEE_SCHEDULE = {
  /** PERIODO.derechos_matricula (USD) */
  baseEnrollmentFee: PERIOD_CONFIG.enrollmentRights,
};

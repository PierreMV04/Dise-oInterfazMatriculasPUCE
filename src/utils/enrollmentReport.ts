import { Course, EnrollmentReceipt } from '../types/enrollment';

/**
 * Datos del reporte "Estudiantes matriculados por asignatura" (Secretaría Académica).
 * Los estudiantes de relleno son SIMULADOS y deterministas; los estudiantes reales del
 * sistema (comprobantes generados) se suman a ellos. La suma de matriculados de cada
 * grupo coincide con GRUPO.cupo_total - GRUPO.cupo_disponible.
 */

export type EnrollmentState = 'Matriculado' | 'Pendiente de pago';

export interface RosterRow {
  studentCode: string;   // ESTUDIANTE.codigo_estudiante
  fullName: string;      // ESTUDIANTE.apellidos + nombres
  groupId: string;       // GRUPO.codigo_grupo
  section: string;       // GRUPO.numero_grupo
  state: EnrollmentState; // MATRICULA.estado_matricula
  registeredAt: string;  // MATRICULA.fecha_registro
}

export interface SubjectReport {
  code: string;          // ASIGNATURA.codigo_asignatura
  name: string;          // ASIGNATURA.nombre_asignatura
  credits: number;
  professors: string;
  rows: RosterRow[];
  groups: Array<{ section: string; occupied: number; total: number }>;
  seatsTotal: number;
  occupied: number;
  available: number;
}

export interface EnrollmentReport {
  subjects: SubjectReport[];
  totalEnrollments: number;
  distinctStudents: number;
  seatsTotal: number;
  occupied: number;
  available: number;
}

const FIRST = ['Camila', 'Andrés', 'Valeria', 'Mateo', 'Daniela', 'Sebastián', 'Paula', 'Joel', 'Michelle', 'Kevin', 'Karla', 'Bryan', 'Nicole', 'Esteban', 'Lucía', 'Diego', 'Jessica', 'Fernando', 'Gabriela', 'Santiago', 'Mónica', 'Adrián', 'Elena', 'Marco', 'Sofía', 'Patricio', 'Andrea', 'Cristian', 'Verónica', 'Israel'];
const LAST = ['Aguirre', 'Barrera', 'Cevallos', 'Dávila', 'Espinoza', 'Freire', 'Guerrero', 'Herrera', 'Iturralde', 'Jaramillo', 'Landázuri', 'Montalvo', 'Naranjo', 'Ortiz', 'Pazmiño', 'Quishpe', 'Ramos', 'Salazar', 'Tapia', 'Unda', 'Vásconez', 'Yánez', 'Zambrano', 'Bastidas', 'Carrillo', 'Játiva', 'Mejía', 'Proaño', 'Rivadeneira', 'Villacís'];

function seed(text: string): number {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 100003;
  return h;
}

function pad(n: number, size = 2) {
  return String(n).padStart(size, '0');
}

function simulatedRow(course: Course, k: number): RosterRow {
  const base = seed(course.id);
  const n = (base + k * 13) % 1000; // 13 y 1000 son coprimos: sin repetidos en el grupo
  const last1 = LAST[(n * 3 + base) % LAST.length];
  const last2 = LAST[(n * 5 + 1) % LAST.length];
  const first = FIRST[(n * 7) % FIRST.length];
  return {
    studentCode: `L00410${pad(n, 3)}`,
    fullName: `${last1} ${last2} ${first}`,
    groupId: course.id,
    section: course.section,
    state: n % 7 === 0 ? 'Pendiente de pago' : 'Matriculado',
    registeredAt: `${pad(2 + (n % 4))}/02/2026 ${pad(8 + (n % 9))}:${pad((n * 7) % 60)}`,
  };
}

function realRow(receipt: EnrollmentReceipt, course: Course): RosterRow {
  const [first, ...rest] = receipt.studentName.split(' ');
  return {
    studentCode: receipt.studentCode,
    fullName: `${rest.join(' ')} ${first}`.trim(),
    groupId: course.id,
    section: course.section,
    state: receipt.paymentModality === 'contado' ? 'Matriculado' : 'Pendiente de pago',
    registeredAt: receipt.confirmedAt.replace(',', ''),
  };
}

export interface ReportFilters {
  period: string;
  career: string; // 'all' o nombre de carrera
  subject: string; // 'all' o ASIGNATURA.codigo_asignatura
}

export const REPORT_PERIODS = ['2026-02', '2025-02'];
export const REPORT_CAREERS = ['Ingeniería de Sistemas'];

/**
 * @param initialCatalog catálogo con los cupos de partida (antes de matrículas nuevas)
 * @param catalog        catálogo actual (cupos descontados por matrículas nuevas)
 * @param receipts       comprobantes generados en el sistema (estudiantes reales)
 * @param baselineStudents códigos de estudiantes cuya matrícula ya está contada en los cupos de partida
 */
export function buildEnrollmentReport(
  initialCatalog: Course[],
  catalog: Course[],
  receipts: EnrollmentReceipt[],
  baselineStudents: string[],
  filters: ReportFilters
): EnrollmentReport {
  const empty: EnrollmentReport = {
    subjects: [], totalEnrollments: 0, distinctStudents: 0, seatsTotal: 0, occupied: 0, available: 0,
  };
  if (filters.period !== '2026-02') return empty;

  const bySubject = new Map<string, SubjectReport>();
  const students = new Set<string>();

  for (const course of catalog) {
    if (filters.subject !== 'all' && course.code !== filters.subject) continue;
    const initial = initialCatalog.find((c) => c.id === course.id) ?? course;
    const baseOccupied = initial.seatsTotal - initial.seatsAvailable;

    const realReceipts = receipts.filter((r) => r.courses.some((c) => c.id === course.id));
    const baselineReal = realReceipts.filter((r) => baselineStudents.includes(r.studentCode)).length;
    const simulatedCount = Math.max(0, baseOccupied - baselineReal);

    const rows: RosterRow[] = [
      ...Array.from({ length: simulatedCount }, (_, k) => simulatedRow(course, k)),
      ...realReceipts.map((r) => realRow(r, course)),
    ];

    let subject = bySubject.get(course.code);
    if (!subject) {
      subject = {
        code: course.code, name: course.name, credits: course.credits, professors: '',
        rows: [], groups: [], seatsTotal: 0, occupied: 0, available: 0,
      };
      bySubject.set(course.code, subject);
    }
    subject.rows.push(...rows);
    subject.groups.push({ section: course.section, occupied: rows.length, total: course.seatsTotal });
    subject.seatsTotal += course.seatsTotal;
    subject.professors = subject.professors
      ? `${subject.professors} / ${course.professor}`
      : course.professor;
    rows.forEach((r) => students.add(r.studentCode));
  }

  const subjects = [...bySubject.values()]
    .map((s) => {
      s.rows.sort((a, b) => a.fullName.localeCompare(b.fullName, 'es'));
      s.occupied = s.rows.length;
      s.available = s.seatsTotal - s.occupied;
      s.professors = [...new Set(s.professors.split(' / '))].join(' / ');
      return s;
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  const seatsTotal = subjects.reduce((n, s) => n + s.seatsTotal, 0);
  const occupied = subjects.reduce((n, s) => n + s.occupied, 0);
  return {
    subjects,
    totalEnrollments: occupied,
    distinctStudents: students.size,
    seatsTotal,
    occupied,
    available: seatsTotal - occupied,
  };
}

export function reportToCsv(report: EnrollmentReport, filters: ReportFilters): string {
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    ['Periodo', 'Carrera', 'Código asignatura', 'Asignatura', 'Grupo', 'Código estudiante', 'Apellidos y nombres', 'Estado de matrícula', 'Fecha de registro']
      .map(q).join(','),
  ];
  for (const s of report.subjects) {
    for (const r of s.rows) {
      lines.push(
        [filters.period, filters.career === 'all' ? REPORT_CAREERS[0] : filters.career, s.code, s.name, r.section, r.studentCode, r.fullName, r.state, r.registeredAt]
          .map(q).join(',')
      );
    }
  }
  return lines.join('\n');
}

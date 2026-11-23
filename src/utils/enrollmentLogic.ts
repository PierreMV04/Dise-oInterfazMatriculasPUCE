import { FEE_SCHEDULE, PERIOD_CONFIG } from '../data/mockAcademicData';
import {
  Course,
  Eligibility,
  EnrollmentReceipt,
  PaymentModality,
  ScheduleSlot,
  StudentProfile,
  ValidationResult,
} from '../types/enrollment';

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function formatScheduleSummary(schedule: ScheduleSlot[]): string {
  return schedule
    .map((s) => `${s.day} ${formatHour(s.startHour)}–${formatHour(s.endHour)}`)
    .join(' · ');
}

export function slotsOverlap(a: ScheduleSlot, b: ScheduleSlot): boolean {
  if (a.day !== b.day) return false;
  return a.startHour < b.endHour && b.startHour < a.endHour;
}

export function detectCoursePairOverlap(
  courseA: Course,
  courseB: Course
): string | null {
  for (const slotA of courseA.schedule) {
    for (const slotB of courseB.schedule) {
      if (slotsOverlap(slotA, slotB)) {
        const overlapStart = Math.max(slotA.startHour, slotB.startHour);
        const overlapEnd = Math.min(slotA.endHour, slotB.endHour);
        return `${slotA.day} ${formatHour(overlapStart)}–${formatHour(overlapEnd)}`;
      }
    }
  }
  return null;
}

export function findConflictsWithSelection(
  candidate: Course,
  selectedCourses: Course[]
): Array<{ conflictingCourse: Course; reason: string }> {
  const conflicts: Array<{ conflictingCourse: Course; reason: string }> = [];
  for (const existing of selectedCourses) {
    if (existing.id === candidate.id) continue;
    const overlap = detectCoursePairOverlap(candidate, existing);
    if (overlap) {
      conflicts.push({
        conflictingCourse: existing,
        reason: `Cruce con ${existing.code} (${existing.name}) el ${overlap}`,
      });
    }
  }
  return conflicts;
}

export function hasApprovedPrerequisite(
  course: Course,
  student: StudentProfile
): boolean {
  if (!course.prerequisiteCode) return true;
  return student.approvedCourseCodes.includes(course.prerequisiteCode);
}

export function validateEnrollmentSelection(
  selectedCourses: Course[],
  student: StudentProfile
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const conflicts: Array<{ courseA: Course; courseB: Course; reason: string }> = [];

  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalHours = selectedCourses.reduce((sum, c) => sum + c.weeklyHours, 0);

  if (selectedCourses.length === 0) {
    errors.push(
      'No has seleccionado ninguna asignatura. Agrega al menos una materia para validar.'
    );
  } else if (totalCredits < student.minCredits) {
    errors.push(
      `Carga académica insuficiente: tienes ${totalCredits} créditos seleccionados y el mínimo reglamentario es de ${student.minCredits} créditos.`
    );
  }

  if (totalCredits > student.maxCredits) {
    errors.push(
      `Límite de créditos excedido: has acumulado ${totalCredits} créditos y tu máximo permitido es ${student.maxCredits} créditos.`
    );
  }

  // Check pairwise schedule conflicts
  for (let i = 0; i < selectedCourses.length; i++) {
    for (let j = i + 1; j < selectedCourses.length; j++) {
      const a = selectedCourses[i];
      const b = selectedCourses[j];
      const overlap = detectCoursePairOverlap(a, b);
      if (overlap) {
        const reason = `Cruce horario el ${overlap} entre ${a.code} y ${b.code}`;
        conflicts.push({ courseA: a, courseB: b, reason });
        errors.push(reason);
      }
    }
  }

  // Check seat availability & prerequisites
  for (const course of selectedCourses) {
    if (course.seatsAvailable <= 0) {
      errors.push(
        `La asignatura ${course.code} (${course.name}) ya no cuenta con cupos disponibles.`
      );
    } else if (course.seatsAvailable <= 6) {
      warnings.push(
        `Cupos limitados en ${course.code} (${course.seatsAvailable} disponibles). Confirma tu matrícula pronto para asegurar vacante.`
      );
    }

    if (!hasApprovedPrerequisite(course, student)) {
      errors.push(
        `Falta prerrequisito para ${course.code}: requiere haber aprobado ${course.prerequisiteCode} (${course.prerequisiteName}).`
      );
    }
  }

  if (
    errors.length === 0 &&
    totalCredits >= student.minCredits &&
    totalCredits < 15
  ) {
    warnings.push(
      `Carga académica moderada (${totalCredits} créditos). Puedes agregar hasta ${
        student.maxCredits - totalCredits
      } créditos adicionales si lo deseas.`
    );
  }

  return {
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    errors,
    warnings,
    totalCredits,
    totalHours,
    conflicts,
  };
}

export function formatCurrencyUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** MATRICULA.valor_total = valor de las materias + derechos de matrícula (USD). */
export function calculateEnrollmentFees(courses: Course[]) {
  const baseFee = FEE_SCHEDULE.baseEnrollmentFee;
  const creditCostTotal = courses.reduce((sum, c) => sum + c.price, 0);
  const insuranceFee = 0;
  const totalAmount = baseFee + creditCostTotal + insuranceFee;
  return { baseFee, creditCostTotal, insuranceFee, totalAmount };
}

/** "2026-02-13" -> "13/02/2026" */
export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Proceso P2 Verificar habilitación.
 * A2: deuda pendiente. A1: fecha fuera del periodo de matrícula ordinaria.
 */
export function checkEnrollmentEligibility(
  student: StudentProfile,
  systemDate: string
): Eligibility {
  if (!student.financialClearance) {
    return {
      status: 'debt',
      canEnroll: false,
      messageCode: 'MSG-002',
      title: 'Matrícula bloqueada por deuda pendiente',
      description: `Tienes valores pendientes (${formatCurrencyUSD(student.debtAmount)}). Regularízalos en Tesorería para habilitar tu matrícula.`,
    };
  }
  if (
    systemDate < PERIOD_CONFIG.ordinaryStart ||
    systemDate > PERIOD_CONFIG.ordinaryEnd
  ) {
    return {
      status: 'closed',
      canEnroll: false,
      messageCode: 'MSG-003',
      title: 'Periodo de matrícula cerrado',
      description: `El periodo de matrícula ordinaria está cerrado. Corresponde del ${formatIsoDate(PERIOD_CONFIG.ordinaryStart)} al ${formatIsoDate(PERIOD_CONFIG.ordinaryEnd)}.`,
    };
  }
  if (student.academicStanding !== 'Regular') {
    return {
      status: 'academic',
      canEnroll: false,
      messageCode: 'MSG-020',
      title: 'Situación académica observada',
      description: 'Tu situación académica no está habilitada. Comunícate con Secretaría Académica.',
    };
  }
  return {
    status: 'ok',
    canEnroll: true,
    messageCode: 'MSG-000',
    title: 'Habilitado para matrícula',
    description: 'Estás habilitado académica y financieramente.',
  };
}

export function buildEnrollmentReceipt(
  student: StudentProfile,
  courses: Course[],
  paymentModality: PaymentModality
): EnrollmentReceipt {
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
  const totalHours = courses.reduce((s, c) => s + c.weeklyHours, 0);
  const fees = calculateEnrollmentFees(courses);
  const randomSuffix = String(Math.floor(100000 + Math.random() * 899999));
  const receiptCode = `MAT-${student.period.slice(0, 4)}-${randomSuffix.slice(0, 5)}`;
  const verificationHash = `VER-PUCE-${student.code.slice(-4)}-${randomSuffix.slice(0, 4)}`;

  const now = new Date();
  const formattedDate = now.toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    receiptCode,
    verificationHash,
    confirmedAt: formattedDate,
    period: student.period,
    studentCode: student.code,
    studentName: student.fullName,
    career: student.career,
    cycle: student.cycle,
    courses,
    totalCredits,
    totalHours,
    ...fees,
    paymentModality,
  };
}

export function downloadReceiptFile(receipt: EnrollmentReceipt): void {
  const lines = [
    '====================================================================',
    '        PONTIFICIA UNIVERSIDAD CATÓLICA DEL ECUADOR — PUCE         ',
    '               COMPROBANTE DE MATRÍCULA 2026-02                  ',
    '====================================================================',
    '',
    `N° de Comprobante   : ${receipt.receiptCode}`,
    `Código Verificación : ${receipt.verificationHash}`,
    `Fecha de Registro   : ${receipt.confirmedAt}`,
    `Periodo Académico   : ${receipt.period}`,
    '',
    'DATOS DEL ESTUDIANTE',
    '--------------------------------------------------------------------',
    `Nombre Completo     : ${receipt.studentName}`,
    `Código de estudiante: ${receipt.studentCode}`,
    `Carrera Profesional : ${receipt.career}`,
    `Nivel               : ${receipt.cycle}° nivel`,
    '',
    'ASIGNATURAS MATRICULADAS',
    '--------------------------------------------------------------------',
    ...receipt.courses.map(
      (c, idx) =>
        `${String(idx + 1).padStart(2, '0')}. [${c.code}] ${c.name} (${c.section}) | ${c.credits} cr. | ${formatScheduleSummary(c.schedule)} | ${c.professor}`
    ),
    '',
    'RESUMEN ACADÉMICO Y ECONÓMICO',
    '--------------------------------------------------------------------',
    `Total Asignaturas   : ${receipt.courses.length}`,
    `Total Créditos      : ${receipt.totalCredits} créditos`,
    `Carga Horaria       : ${receipt.totalHours} horas semanales`,
    `Modalidad de Pago   : ${
      receipt.paymentModality === 'contado'
        ? 'Pago con tarjeta o en ventanilla'
        : 'Pago diferido'
    }`,
    `Derecho Matrícula   : ${formatCurrencyUSD(receipt.baseFee)}`,
    `Valor de materias  : ${formatCurrencyUSD(receipt.creditCostTotal)}`,
    `TOTAL GENERAL       : ${formatCurrencyUSD(receipt.totalAmount)}`,
    '====================================================================',
    'Documento generado electrónicamente por el Sistema de Matrícula PUCE.',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Comprobante_Matricula_${receipt.studentCode}_${receipt.period}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

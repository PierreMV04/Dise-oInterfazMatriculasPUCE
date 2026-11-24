export type ScreenId =
  | 'login'
  | 'dashboard'
  | 'selection'
  | 'request'
  | 'summary'
  | 'confirmation'
  | 'status'
  | 'design-system'
  | 'data-dictionary'
  | 'navigation-map'
  | 'report';

export type DayOfWeek = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb';

export interface ScheduleSlot {
  day: DayOfWeek;
  startHour: number; // e.g., 8 for 08:00
  endHour: number;   // e.g., 10 for 10:00
  room: string;
}

export type CourseModality = 'Presencial' | 'Híbrida' | 'Virtual';

/** Un registro del catálogo corresponde a un GRUPO de una ASIGNATURA (Diccionario de Datos). */
export interface Course {
  id: string;            // GRUPO.codigo_grupo, ej. SIS601-G1
  code: string;          // ASIGNATURA.codigo_asignatura
  name: string;          // ASIGNATURA.nombre_asignatura
  section: string;       // GRUPO.numero_grupo (G1, G2)
  cycle: number;         // ASIGNATURA.nivel
  credits: number;       // ASIGNATURA.creditos
  price: number;         // ASIGNATURA.valor_asignatura (USD)
  weeklyHours: number;
  seatsAvailable: number; // GRUPO.cupo_disponible
  seatsTotal: number;     // GRUPO.cupo_total
  professor: string;     // DOCENTE.nombre_docente
  modality: CourseModality;
  prerequisiteCode?: string;
  prerequisiteName?: string;
  corequisiteCode?: string;
  corequisiteName?: string;
  schedule: ScheduleSlot[];
  department: string;
}

export interface StudentAcademicHistory {
  period: string;
  status: 'Concluido' | 'En curso' | 'Pendiente';
  credits: number;
  gpa: string;
  receiptCode: string;
  coursesCount: number;
}

export interface StudentProfile {
  code: string;
  email: string;
  password: string;
  fullName: string;
  idNumber: string;      // ESTUDIANTE.cedula
  phone: string;         // ESTUDIANTE.telefono_contacto
  career: string;
  faculty: string;
  period: string;
  cycle: number;
  minCredits: number;
  maxCredits: number;
  gpa: number;
  enrollmentTurn: string;
  approvedCourseCodes: string[];
  financialClearance: boolean; // ESTUDIANTE.estado_financiero = "Al día"
  debtAmount: number;          // ESTUDIANTE.valor_deuda
  documentsComplete: boolean;
  academicStanding: 'Regular' | 'Observado';
  history: StudentAcademicHistory[];
}

export type SystemMessageType = 'success' | 'error' | 'warning' | 'info';

export interface SystemMessage {
  id: string;
  type: SystemMessageType;
  title: string;
  description: string;
  details?: string[];
}

export type PaymentModality = 'contado' | 'cuotas';

/** Formulario de Solicitud de Matrícula (datos que ingresa el estudiante). */
export interface EnrollmentRequest {
  phone: string;                      // ESTUDIANTE.telefono_contacto
  paymentMethod: PaymentModality | ''; // MATRICULA.metodo_pago
  notes: string;                      // MATRICULA.observaciones
  acceptedRegulation: boolean;        // MATRICULA.acepta_reglamento
  submitted: boolean;                 // true tras Enviar solicitud
}

export interface EnrollmentReceipt {
  receiptCode: string;
  verificationHash: string;
  confirmedAt: string;
  period: string;
  studentCode: string;
  studentName: string;
  idNumber?: string;   // ESTUDIANTE.cedula
  email?: string;      // ESTUDIANTE.correo_institucional
  career: string;
  cycle: number;
  courses: Course[];
  totalCredits: number;
  totalHours: number;
  baseFee: number;
  creditCostTotal: number;
  insuranceFee: number;
  totalAmount: number;
  paymentModality: PaymentModality;
}

export interface ValidationResult {
  isValid: boolean;
  hasWarnings: boolean;
  errors: string[];
  warnings: string[];
  totalCredits: number;
  totalHours: number;
  conflicts: Array<{ courseA: Course; courseB: Course; reason: string }>;
}

export type EligibilityStatus = 'ok' | 'debt' | 'closed' | 'academic';

/** Resultado del proceso P2 Verificar habilitación. */
export interface Eligibility {
  status: EligibilityStatus;
  canEnroll: boolean;
  messageCode: string;
  title: string;
  description: string;
}

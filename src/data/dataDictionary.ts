/**
 * Diccionario de Datos y especificación de procesos del caso de uso
 * "Realizar Matrícula". Es la misma información del archivo
 * docs/Diccionario_Datos_y_Procesos.txt, estructurada para mostrarla en el sistema.
 */

export interface DDField {
  name: string;
  type: string;
  format: string;
  required: boolean;
  description: string;
  key?: 'PK' | 'FK';
}

export interface DDEntity {
  name: string;
  description: string;
  fields: DDField[];
}

const f = (
  name: string,
  type: string,
  format: string,
  required: boolean,
  description: string,
  key?: 'PK' | 'FK'
): DDField => ({ name, type, format, required, description, key });

export const DATA_DICTIONARY: DDEntity[] = [
  {
    name: 'ESTUDIANTE',
    description: 'Persona que realiza la matrícula (actor del caso de uso).',
    fields: [
      f('codigo_estudiante', 'texto', 'L + 8 dígitos (L00412398)', true, 'Identifica al estudiante.', 'PK'),
      f('cedula', 'texto', '10 dígitos', true, 'Documento de identidad.'),
      f('nombres', 'texto', 'máx. 60', true, 'Nombres del estudiante.'),
      f('apellidos', 'texto', 'máx. 60', true, 'Apellidos del estudiante.'),
      f('correo_institucional', 'texto', 'máx. 80, formato correo', true, 'Usuario de acceso al sistema.'),
      f('clave_cifrada', 'texto', 'hash', true, 'Nunca se muestra en pantalla.'),
      f('codigo_carrera', 'texto', '6', true, 'Carrera del estudiante.', 'FK'),
      f('nivel_actual', 'entero', '1 a 10', true, 'Nivel de la malla (ej. 6).'),
      f('estado_academico', 'texto', 'Habilitado / No habilitado', true, 'Resultado de la verificación académica.'),
      f('estado_financiero', 'texto', 'Al día / Con deuda', true, '"Con deuda" bloquea la matrícula (A2).'),
      f('valor_deuda', 'decimal', '8,2 USD', false, 'Monto pendiente si estado_financiero = Con deuda.'),
    ],
  },
  {
    name: 'CARRERA',
    description: 'Carrera a la que pertenece el estudiante y sus asignaturas.',
    fields: [
      f('codigo_carrera', 'texto', '6', true, 'Identifica la carrera.', 'PK'),
      f('nombre_carrera', 'texto', 'máx. 80', true, 'Ej. "Ingeniería de Sistemas".'),
      f('creditos_malla', 'entero', '1 a 400', true, 'Total de créditos de la malla.'),
    ],
  },
  {
    name: 'PERIODO',
    description: 'Periodo académico y reglas de la matrícula ordinaria.',
    fields: [
      f('codigo_periodo', 'texto', 'AAAA-NN (2026-02)', true, 'Identifica el periodo.', 'PK'),
      f('fecha_inicio_ordinaria', 'fecha', 'AAAA-MM-DD', true, '2026-02-02.'),
      f('fecha_fin_ordinaria', 'fecha', 'AAAA-MM-DD', true, '2026-02-13.'),
      f('creditos_maximos', 'entero', '1 a 30', true, 'Valor 20. Regla E4.'),
      f('derechos_matricula', 'decimal', '6,2 USD', true, 'Valor 50.00.'),
      f('minutos_inactividad', 'entero', '1 a 60', true, 'Valor 15. Regla E6.'),
    ],
  },
  {
    name: 'ASIGNATURA',
    description: 'Materia de la malla que se puede matricular.',
    fields: [
      f('codigo_asignatura', 'texto', 'SIS + 3 dígitos', true, 'Ej. SIS601.', 'PK'),
      f('nombre_asignatura', 'texto', 'máx. 80', true, 'Ej. "Diseño de Sistemas".'),
      f('creditos', 'entero', '1 a 5', true, 'Créditos de la asignatura.'),
      f('valor_asignatura', 'decimal', '6,2 USD', true, 'Ej. 4 créditos = 120.00.'),
      f('nivel', 'entero', '1 a 10', true, 'Nivel dentro de la malla.'),
      f('codigo_carrera', 'texto', '6', true, 'Carrera de la asignatura.', 'FK'),
    ],
  },
  {
    name: 'REQUISITO_ASIGNATURA',
    description: 'Prerrequisitos y correquisitos de cada asignatura.',
    fields: [
      f('codigo_asignatura', 'texto', 'SIS + 3 dígitos', true, 'Asignatura que exige el requisito.', 'FK'),
      f('codigo_requisito', 'texto', 'SIS + 3 dígitos', true, 'Asignatura requerida.', 'FK'),
      f('tipo_requisito', 'texto', 'Prerrequisito / Correquisito', true, 'El prerrequisito se valida contra el historial (E2).'),
    ],
  },
  {
    name: 'HISTORIAL_ACADEMICO',
    description: 'Asignaturas cursadas por el estudiante en periodos anteriores.',
    fields: [
      f('codigo_estudiante', 'texto', 'L + 8 dígitos', true, 'Estudiante.', 'FK'),
      f('codigo_asignatura', 'texto', 'SIS + 3 dígitos', true, 'Asignatura cursada.', 'FK'),
      f('codigo_periodo', 'texto', 'AAAA-NN', true, 'Periodo en que se cursó.'),
      f('nota_final', 'decimal', '4,2 (0 a 100)', false, 'Nota obtenida.'),
      f('estado_asignatura', 'texto', 'Aprobada / Reprobada / Cursando', true, 'Solo "Aprobada" cumple un prerrequisito.'),
    ],
  },
  {
    name: 'DOCENTE',
    description: 'Profesor que dicta un grupo.',
    fields: [
      f('codigo_docente', 'texto', '6', true, 'Identifica al docente.', 'PK'),
      f('nombre_docente', 'texto', 'máx. 80', true, 'Ej. "Ing. Yolanda García".'),
    ],
  },
  {
    name: 'GRUPO',
    description: 'Paralelo de una asignatura en un periodo, con su cupo.',
    fields: [
      f('codigo_grupo', 'texto', 'máx. 12 (SIS601-G1)', true, 'Identifica el grupo.', 'PK'),
      f('codigo_asignatura', 'texto', 'SIS + 3 dígitos', true, 'Asignatura del grupo.', 'FK'),
      f('codigo_periodo', 'texto', 'AAAA-NN', true, 'Periodo del grupo.', 'FK'),
      f('numero_grupo', 'texto', 'G1, G2, ...', true, 'Etiqueta visible del grupo.'),
      f('codigo_docente', 'texto', '6', true, 'Docente del grupo.', 'FK'),
      f('cupo_total', 'entero', '1 a 60', true, 'Capacidad del grupo.'),
      f('cupo_disponible', 'entero', '0 a cupo_total', true, 'Si es 0 aplican E1 y E5.'),
    ],
  },
  {
    name: 'HORARIO_GRUPO',
    description: 'Días y horas de clase de cada grupo (un registro por día).',
    fields: [
      f('codigo_grupo', 'texto', 'máx. 12', true, 'Grupo al que pertenece el horario.', 'FK'),
      f('dia_clase', 'texto', 'Lun, Mar, Mié, Jue, Vie, Sáb', true, 'Día de la clase.'),
      f('hora_inicio', 'hora', 'HH:MM', true, 'Ej. 07:00.'),
      f('hora_fin', 'hora', 'HH:MM', true, 'Debe ser mayor que hora_inicio. Dos grupos se cruzan si comparten día y horas (E3).'),
    ],
  },
  {
    name: 'MATRICULA',
    description: 'Matrícula del estudiante en un periodo; su número es el del comprobante.',
    fields: [
      f('numero_matricula', 'texto', 'MAT-AAAA-NNNNN', true, 'Ej. MAT-2026-09823.', 'PK'),
      f('codigo_estudiante', 'texto', 'L + 8 dígitos', true, 'Estudiante.', 'FK'),
      f('codigo_periodo', 'texto', 'AAAA-NN', true, 'Periodo.', 'FK'),
      f('fecha_registro', 'fecha-hora', 'AAAA-MM-DD HH:MM', true, 'Momento de confirmación.'),
      f('total_creditos', 'entero', '0 a creditos_maximos', true, 'Suma de créditos del detalle.'),
      f('valor_materias', 'decimal', '8,2 USD', true, 'Suma de valores del detalle.'),
      f('derechos_matricula', 'decimal', '6,2 USD', true, 'Se copia desde PERIODO.'),
      f('valor_total', 'decimal', '8,2 USD', true, 'valor_materias + derechos_matricula.'),
      f('acepta_reglamento', 'lógico', 'Sí / No', true, 'Debe ser Sí para confirmar.'),
      f('estado_matricula', 'texto', 'Borrador / Pendiente de pago / Matriculado / Anulada', true, 'Ciclo de vida de la matrícula.'),
    ],
  },
  {
    name: 'DETALLE_MATRICULA',
    description: 'Grupos incluidos en una matrícula.',
    fields: [
      f('numero_matricula', 'texto', 'MAT-AAAA-NNNNN', true, 'Matrícula.', 'FK'),
      f('codigo_grupo', 'texto', 'máx. 12', true, 'Grupo elegido. Una asignatura por matrícula.', 'FK'),
      f('creditos', 'entero', '1 a 5', true, 'Copia de ASIGNATURA.creditos.'),
      f('valor', 'decimal', '6,2 USD', true, 'Copia de ASIGNATURA.valor_asignatura.'),
      f('estado_detalle', 'texto', 'Agregada / Confirmada / Retirada', true, 'Estado visible en la tabla.'),
    ],
  },
  {
    name: 'LISTA_ESPERA',
    description: 'Estudiantes en espera de cupo en un grupo sin cupo (E1).',
    fields: [
      f('codigo_estudiante', 'texto', 'L + 8 dígitos', true, 'Estudiante.', 'FK'),
      f('codigo_grupo', 'texto', 'máx. 12', true, 'Grupo.', 'FK'),
      f('fecha_solicitud', 'fecha-hora', 'AAAA-MM-DD HH:MM', true, 'Define el orden de la cola.'),
      f('posicion', 'entero', '1 a 99', true, 'Lugar en la lista.'),
    ],
  },
  {
    name: 'ORDEN_PAGO',
    description: 'Orden generada al confirmar la matrícula; reserva los cupos 24 horas.',
    fields: [
      f('numero_orden', 'texto', 'ORD- + 8 dígitos', true, 'Identifica la orden.', 'PK'),
      f('numero_matricula', 'texto', 'MAT-AAAA-NNNNN', true, 'Matrícula pagada.', 'FK'),
      f('monto', 'decimal', '8,2 USD', true, 'Igual a MATRICULA.valor_total.'),
      f('metodo_pago', 'texto', 'Tarjeta / Ventanilla', true, 'Elegido en la pantalla de pago.'),
      f('fecha_emision', 'fecha-hora', 'AAAA-MM-DD HH:MM', true, 'Momento de generación.'),
      f('fecha_vencimiento', 'fecha-hora', 'AAAA-MM-DD HH:MM', true, 'fecha_emision + 24 horas.'),
      f('estado_orden', 'texto', 'Vigente / Pagada / Vencida', true, 'Si vence, se liberan los cupos.'),
    ],
  },
  {
    name: 'PAGO',
    description: 'Intento de pago de una orden.',
    fields: [
      f('codigo_transaccion', 'texto', '12', true, 'Identifica la transacción.', 'PK'),
      f('numero_orden', 'texto', 'ORD- + 8 dígitos', true, 'Orden pagada.', 'FK'),
      f('estado_pago', 'texto', 'Aprobado / Rechazado', true, 'Resultado de la pasarela o del banco.'),
      f('motivo_rechazo', 'texto', 'máx. 120', false, 'Obligatorio si estado_pago = Rechazado.'),
      f('fecha_pago', 'fecha-hora', 'AAAA-MM-DD HH:MM', true, 'Momento del intento.'),
    ],
  },
  {
    name: 'SESION',
    description: 'Sesión del estudiante; controla la inactividad (E6).',
    fields: [
      f('codigo_sesion', 'texto', '32', true, 'Identifica la sesión.', 'PK'),
      f('codigo_estudiante', 'texto', 'L + 8 dígitos', true, 'Estudiante.', 'FK'),
      f('hora_inicio_sesion', 'fecha-hora', 'AAAA-MM-DD HH:MM', true, 'Momento de ingreso.'),
      f('ultima_actividad', 'fecha-hora', 'AAAA-MM-DD HH:MM', true, 'Si pasan 15 min sin actividad expira.'),
      f('seleccion_guardada', 'texto', 'lista de codigo_grupo', false, 'Se restaura al volver a ingresar.'),
    ],
  },
  {
    name: 'MENSAJE_SISTEMA',
    description: 'Catálogo de mensajes que muestra la interfaz.',
    fields: [
      f('codigo_mensaje', 'texto', 'MSG- + 3 dígitos', true, 'Identifica el mensaje.', 'PK'),
      f('tipo_mensaje', 'texto', 'Éxito / Advertencia / Error', true, 'Define el color del aviso.'),
      f('texto_mensaje', 'texto', 'máx. 200', true, 'Texto mostrado al usuario.'),
    ],
  },
];

export interface DDMessage {
  code: string;
  type: 'Éxito' | 'Advertencia' | 'Error';
  text: string;
  rule?: string;
}

export const SYSTEM_MESSAGES: DDMessage[] = [
  { code: 'MSG-001', type: 'Error', text: 'Usuario o contraseña incorrectos.' },
  { code: 'MSG-002', type: 'Error', text: 'Tienes valores pendientes. Regularízalos en Tesorería para habilitar tu matrícula.', rule: 'A2' },
  { code: 'MSG-003', type: 'Error', text: 'El periodo de matrícula ordinaria está cerrado.', rule: 'A1' },
  { code: 'MSG-004', type: 'Error', text: 'Requiere haber aprobado {requisito}.', rule: 'E2' },
  { code: 'MSG-005', type: 'Advertencia', text: 'Debes agregar también el correquisito {asignatura}.' },
  { code: 'MSG-006', type: 'Error', text: 'No puedes superar 20 créditos.', rule: 'E4' },
  { code: 'MSG-007', type: 'Advertencia', text: 'El grupo {grupo} no tiene cupos. Elige otro grupo o ingresa a la lista de espera.', rule: 'E1' },
  { code: 'MSG-008', type: 'Advertencia', text: 'El grupo coincide en horario con {asignatura}. Te sugerimos el grupo {grupo}.', rule: 'E3' },
  { code: 'MSG-009', type: 'Error', text: 'Selecciona al menos una materia para continuar.' },
  { code: 'MSG-010', type: 'Éxito', text: 'Materia agregada a tu selección.' },
  { code: 'MSG-011', type: 'Éxito', text: 'Validación exitosa. Puedes continuar.' },
  { code: 'MSG-012', type: 'Error', text: 'El cupo de {asignatura} se agotó mientras confirmabas.', rule: 'E5' },
  { code: 'MSG-013', type: 'Error', text: 'Debes aceptar el Reglamento de Matrícula para continuar.' },
  { code: 'MSG-014', type: 'Error', text: 'Pago rechazado: {motivo}.' },
  { code: 'MSG-015', type: 'Advertencia', text: 'Tu sesión expiró por inactividad. Tu selección se guardó.', rule: 'E6' },
  { code: 'MSG-016', type: 'Éxito', text: 'Matrícula exitosa. Comprobante {numero_matricula}.' },
];

export interface DDProcess {
  id: string;
  name: string;
  screens: string;
  inputs: string;
  outputs: string;
  logic: string;
}

export const PROCESSES: DDProcess[] = [
  { id: 'P1', name: 'Autenticar acceso', screens: '01, 02', inputs: 'correo_institucional o código, clave', outputs: 'Sesión iniciada; o MSG-001', logic: 'Si coinciden con ESTUDIANTE, crea la SESION y va al menú principal. Si no, muestra el error y no avanza.' },
  { id: 'P2', name: 'Verificar habilitación', screens: '03, 04, 05', inputs: 'codigo_estudiante, fecha del sistema', outputs: 'Estado de habilitación; MSG-002 o MSG-003', logic: 'Si estado_financiero = Con deuda, bloquea (A2). Si la fecha está fuera de 2026-02-02 a 2026-02-13, bloquea (A1). Si no, habilita Realizar matrícula.' },
  { id: 'P3', name: 'Consultar oferta de asignaturas', screens: '06', inputs: 'texto de búsqueda, filtros', outputs: 'ASIGNATURA y GRUPO con cupo, horario y estado', logic: 'Solo asignaturas de la carrera y nivel del estudiante; calcula el estado de cada una con el historial y la selección.' },
  { id: 'P4', name: 'Validar selección', screens: '06, 07 a 11', inputs: 'grupos seleccionados', outputs: 'Resultado de validación; MSG-004 a MSG-011', logic: 'Reglas: cupo > 0 (E1); prerrequisitos aprobados (E2); correquisitos seleccionados; créditos ≤ 20 (E4); sin cruce de horario (E3); al menos una asignatura.' },
  { id: 'P5', name: 'Gestionar lista de espera', screens: '10', inputs: 'codigo_estudiante, codigo_grupo', outputs: 'Posición en la lista', logic: 'Agrega al estudiante a LISTA_ESPERA con la fecha de solicitud; no suma créditos ni valor.' },
  { id: 'P6', name: 'Registrar matrícula', screens: '12, 13', inputs: 'selección validada, acepta_reglamento', outputs: 'MATRICULA en estado Pendiente de pago; MSG-012 o MSG-013', logic: 'Exige el reglamento aceptado, revalida todo, descuenta cupos y crea MATRICULA y DETALLE. Si un cupo se agotó (E5), no cobra y regresa a Selección.' },
  { id: 'P7', name: 'Generar orden de pago', screens: '14', inputs: 'MATRICULA.valor_total', outputs: 'ORDEN_PAGO con vencimiento a 24 horas', logic: 'Reserva los cupos 24 horas. Si la orden vence sin pago, la matrícula pasa a Anulada y se devuelven los cupos.' },
  { id: 'P8', name: 'Procesar pago', screens: '14, 15', inputs: 'metodo_pago, datos de tarjeta (solo van a la pasarela)', outputs: 'PAGO Aprobado o Rechazado; MSG-014', logic: 'Tarjeta aprobada: genera el comprobante. Rechazada: pantalla 15 y vuelve a 14. Ventanilla: la orden queda Vigente.' },
  { id: 'P9', name: 'Generar comprobante', screens: '16', inputs: 'MATRICULA, PAGO aprobado', outputs: 'estado_matricula = Matriculado; comprobante MAT-2026-09823; MSG-016', logic: 'Solo con pago aprobado u orden de ventanilla emitida.' },
  { id: 'P10', name: 'Consultar estado de matrícula', screens: '18', inputs: 'codigo_estudiante, codigo_periodo', outputs: 'Estado, materias, estado de la orden y del pago', logic: 'Solo lectura. Desde aquí el estudiante vuelve al menú o descarga el comprobante.' },
  { id: 'P11', name: 'Gestionar sesión', screens: '17', inputs: 'ultima_actividad', outputs: 'Cierre de sesión; seleccion_guardada', logic: 'A los 15 minutos sin actividad (E6) en 06, 12 o 14, guarda la selección, cierra la sesión y muestra la pantalla 17. Al volver a ingresar la restaura.' },
];

export const SCREEN_MATRIX: Array<{ screen: string; processes: string; entities: string }> = [
  { screen: '01 Inicio de sesión', processes: 'P1', entities: 'ESTUDIANTE, SESION' },
  { screen: '02 Error de credenciales', processes: 'P1', entities: 'MENSAJE_SISTEMA' },
  { screen: '03 Panel del estudiante', processes: 'P2', entities: 'ESTUDIANTE, PERIODO' },
  { screen: '04 Bloqueo financiero (A2)', processes: 'P2', entities: 'ESTUDIANTE (estado_financiero)' },
  { screen: '05 Periodo cerrado (A1)', processes: 'P2', entities: 'PERIODO' },
  { screen: '06 Oferta de materias', processes: 'P3, P4', entities: 'ASIGNATURA, GRUPO, HORARIO_GRUPO, REQUISITO_ASIGNATURA, DETALLE_MATRICULA' },
  { screen: '07 Prerrequisito (E2)', processes: 'P4', entities: 'HISTORIAL_ACADEMICO, REQUISITO_ASIGNATURA' },
  { screen: '08 Correquisito pendiente', processes: 'P4', entities: 'REQUISITO_ASIGNATURA' },
  { screen: '09 Excede créditos (E4)', processes: 'P4', entities: 'PERIODO (creditos_maximos)' },
  { screen: '10 Sin cupo / espera (E1)', processes: 'P4, P5', entities: 'GRUPO, LISTA_ESPERA' },
  { screen: '11 Cruce de horario (E3)', processes: 'P4', entities: 'GRUPO, HORARIO_GRUPO' },
  { screen: '12 Resumen de matrícula', processes: 'P6', entities: 'MATRICULA, DETALLE_MATRICULA' },
  { screen: '13 Cupo agotado (E5)', processes: 'P6', entities: 'GRUPO' },
  { screen: '14 Pago de matrícula', processes: 'P7, P8', entities: 'ORDEN_PAGO, PAGO' },
  { screen: '15 Pago rechazado', processes: 'P8', entities: 'PAGO' },
  { screen: '16 Matrícula exitosa', processes: 'P9', entities: 'MATRICULA' },
  { screen: '17 Sesión expirada (E6)', processes: 'P11', entities: 'SESION' },
  { screen: '18 Consulta de estado', processes: 'P10', entities: 'MATRICULA, ORDEN_PAGO, PAGO' },
];

/** Paso 1: mapa de navegación y Paso 3: reglas de interfaz del caso de uso Realizar Matrícula. */

export interface NavConnection {
  from: string;
  to: string;
  condition: string;
  /** Pantalla del sistema donde se puede probar (si ya está implementada). */
  kind: 'principal' | 'excepcion';
}

export const MAIN_FLOW = [
  '01 Inicio de sesión',
  '03 Menú principal',
  '06 Selección de asignaturas',
  '12 Resumen de matrícula',
  '14 Pago',
  '16 Comprobante',
];

export const NAV_CONNECTIONS: NavConnection[] = [
  { from: '01 Inicio de sesión', to: '03 Menú principal', condition: 'Si el usuario y la contraseña son válidos, entonces ir al menú principal', kind: 'principal' },
  { from: '01 Inicio de sesión', to: '02 Error de credenciales', condition: 'Si las credenciales son incorrectas, entonces mostrar error y no avanzar', kind: 'excepcion' },
  { from: '02 Error de credenciales', to: '01 Inicio de sesión', condition: 'Clic en Reintentar', kind: 'excepcion' },
  { from: '03 Menú principal', to: '04 Bloqueo financiero', condition: 'Si el estudiante tiene deuda pendiente (A2), entonces mostrar mensaje de rechazo y no avanzar', kind: 'excepcion' },
  { from: '03 Menú principal', to: '05 Periodo cerrado', condition: 'Si la fecha está fuera del 2 al 13 de febrero de 2026 (A1), entonces mostrar aviso y no avanzar', kind: 'excepcion' },
  { from: '03 Menú principal', to: '06 Selección de asignaturas', condition: 'Si está habilitado y el periodo está abierto, clic en Realizar matrícula', kind: 'principal' },
  { from: '03 Menú principal', to: '18 Consulta de estado de matrícula', condition: 'Clic en Consultar estado de matrícula', kind: 'principal' },
  { from: '06 Selección de asignaturas', to: '07 Prerrequisito no cumplido', condition: 'Si la materia tiene un prerrequisito no aprobado (E2), entonces avisar y no agregarla', kind: 'excepcion' },
  { from: '06 Selección de asignaturas', to: '08 Correquisito pendiente', condition: 'Si falta el correquisito de la materia agregada, entonces advertir y pedir agregarlo', kind: 'excepcion' },
  { from: '06 Selección de asignaturas', to: '09 Excede créditos', condition: 'Si la suma de créditos supera 20 (E4), entonces rechazar y no agregar', kind: 'excepcion' },
  { from: '06 Selección de asignaturas', to: '10 Grupo sin cupo', condition: 'Si el grupo no tiene cupo (E1), entonces ofrecer otro grupo o lista de espera', kind: 'excepcion' },
  { from: '06 Selección de asignaturas', to: '11 Cruce de horario', condition: 'Si el grupo choca con otra materia seleccionada (E3), entonces sugerir otro grupo', kind: 'excepcion' },
  { from: '07, 08, 09, 10, 11', to: '06 Selección de asignaturas', condition: 'Aceptar, agregar correquisito, quitar materia o elegir otro grupo: vuelve conservando la selección', kind: 'excepcion' },
  { from: '06 Selección de asignaturas', to: '12 Resumen de matrícula', condition: 'Si la validación de cupos, prerrequisitos, créditos y horarios es exitosa y hay al menos una materia, clic en Continuar', kind: 'principal' },
  { from: '06 Selección de asignaturas', to: '03 Menú principal', condition: 'Clic en Cancelar y confirmar el descarte de la selección', kind: 'principal' },
  { from: '12 Resumen de matrícula', to: '06 Selección de asignaturas', condition: 'Clic en Modificar selección', kind: 'principal' },
  { from: '12 Resumen de matrícula', to: '13 Cupo agotado', condition: 'Si al confirmar el sistema revalida y un cupo se agotó (E5), entonces avisar y no avanzar', kind: 'excepcion' },
  { from: '13 Cupo agotado', to: '06 Selección de asignaturas', condition: 'Clic en Elegir otro grupo', kind: 'excepcion' },
  { from: '12 Resumen de matrícula', to: '14 Pago', condition: 'Si el reglamento está aceptado y los cupos siguen vigentes, clic en Confirmar matrícula', kind: 'principal' },
  { from: '12 Resumen de matrícula', to: '03 Menú principal', condition: 'Clic en Cancelar y confirmar el descarte de la selección', kind: 'principal' },
  { from: '14 Pago', to: '15 Pago rechazado', condition: 'Si la tarjeta es rechazada, entonces mostrar el motivo y no avanzar', kind: 'excepcion' },
  { from: '15 Pago rechazado', to: '14 Pago', condition: 'Clic en Reintentar o Usar otro método', kind: 'excepcion' },
  { from: '14 Pago', to: '16 Comprobante', condition: 'Si el pago con tarjeta es aprobado, o se genera la orden de ventanilla (reservada 24 h), entonces generar el comprobante', kind: 'principal' },
  { from: '16 Comprobante', to: '18 Consulta de estado de matrícula', condition: 'Clic en Ver estado de mi matrícula', kind: 'principal' },
  { from: '18 Consulta de estado de matrícula', to: '03 Menú principal', condition: 'Clic en Volver al panel', kind: 'principal' },
  { from: '06, 12 o 14', to: '17 Sesión expirada', condition: 'Si pasan 15 minutos sin actividad (E6), entonces cerrar sesión conservando la selección', kind: 'excepcion' },
  { from: '17 Sesión expirada', to: '01 Inicio de sesión', condition: 'Clic en Iniciar sesión; al entrar se restaura la selección guardada', kind: 'excepcion' },
];

export interface InterfaceRule {
  id: number;
  rule: string;
  screen: string;
  message: string;
  action: string;
}

export const INTERFACE_RULES: InterfaceRule[] = [
  { id: 1, rule: 'El estudiante no puede matricular más créditos de los permitidos (máx. 20)', screen: 'Selección de asignaturas', message: 'No puedes superar 20 créditos. Llevas 18 y esta materia suma 4. Quita una materia para continuar.', action: 'No agrega la materia, conserva la selección y pone la barra de créditos en rojo' },
  { id: 2, rule: 'No se puede seleccionar una asignatura sin cupo', screen: 'Selección de asignaturas; Resumen al confirmar', message: 'El grupo G1 no tiene cupos disponibles. Elige otro grupo o ingresa a la lista de espera.', action: 'Deshabilita Agregar para ese grupo y ofrece otros grupos y lista de espera' },
  { id: 3, rule: 'No se puede matricular si tiene deuda pendiente', screen: 'Menú principal', message: 'Tienes valores pendientes. Regularízalos en Tesorería para habilitar tu matrícula.', action: 'Bloquea Realizar matrícula y no avanza a Selección' },
  { id: 4, rule: 'Debe seleccionarse al menos una asignatura', screen: 'Selección de asignaturas', message: 'Selecciona al menos una materia para continuar.', action: 'Deshabilita Continuar al resumen y mantiene al usuario en la pantalla' },
  { id: 5, rule: 'No se puede matricular una materia con prerrequisito no aprobado (E2)', screen: 'Selección de asignaturas', message: 'Inteligencia Artificial requiere haber aprobado Estadística II.', action: 'Deshabilita Agregar y muestra el requisito pendiente' },
  { id: 6, rule: 'Dos materias no pueden tener horarios cruzados (E3)', screen: 'Selección de asignaturas', message: 'Laboratorio de Redes G1 coincide con Redes G1. Te sugerimos el grupo G2.', action: 'No agrega el grupo y sugiere uno sin cruce' },
  { id: 7, rule: 'La matrícula solo procede del 2 al 13 de febrero de 2026 (A1)', screen: 'Menú principal', message: 'El periodo de matrícula ordinaria está cerrado.', action: 'Bloquea Realizar matrícula' },
  { id: 8, rule: 'La sesión expira a los 15 minutos de inactividad (E6)', screen: 'Selección, Resumen y Pago', message: 'Tu sesión expiró por inactividad. Tu selección se guardó.', action: 'Cierra la sesión y restaura la selección al volver a ingresar' },
];

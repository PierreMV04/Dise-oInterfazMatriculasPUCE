# Sistema de Matrícula PUCE — Diseño de interfaz

Caso de uso **Realizar Matrícula** (Diseño de Sistemas, PUCE). Equipo: Pierre Montenegro, Dario Franco, Alex Andino.

Interfaz en React + TypeScript + Tailwind. Los datos son simulados (`src/data/mockAcademicData.ts`) y siguen el Diccionario de Datos del proyecto. No usa servidor, base de datos ni claves de API.

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera dist/ (sitio estático)
```

## Usuarios de prueba (clave `puce2026`)

| Código | Estudiante | Situación |
| --- | --- | --- |
| L00412398 | Alex Andino | Habilitado, sin matrícula |
| L00412399 | Dario Franco | Ya matriculado (MAT-2026-09823) |
| L00412400 | Pierre Montenegro | Con deuda pendiente (bloqueo A2) |

La barra inferior permite cambiar la fecha del sistema para ver el periodo cerrado (A1).

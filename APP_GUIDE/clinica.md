# Especificaciones del Dashboard: Sistema de Gestión de Clínica Médica (HMS)

Este documento detalla el **"Centro de Control Médico"** diseñado para que la dirección médica, administración y personal asistencial puedan interpretar la salud operativa de la clínica en menos de 30 segundos.

---

## 1. Indicadores en Tiempo Real (Métricas Clave)

Ubicados en la parte superior como tarjetas visuales (Scorecards).

| Indicador | Descripción |
|-----------|-------------|
| **Ocupación de Agenda (%)** | Porcentaje de turnos ocupados sobre el total disponible del día. |
| **Pacientes en Espera** | Cantidad de pacientes aguardando atención con tiempo promedio de espera. |
| **Turnos del Día** | Total de citas programadas: Completadas / Pendientes / Canceladas. |
| **Índice de Ausentismo** | Porcentaje de pacientes que no asistieron a su turno (No-Shows). |
| **Ingresos del Día** | Facturación total del día actual vs. meta diaria. |

### Gráfico de Estado de Consultorios
Visualización circular (Pie Chart) que segmenta:
- 🟢 **Disponibles**: Listos para atención.
- 🔴 **Ocupados**: En consulta activa.
- 🟡 **En Preparación**: Limpieza/desinfección entre pacientes.
- ⚫ **Fuera de Servicio**: Mantenimiento o equipamiento averiado.

---

## 2. Accesos Rápidos (Links Imprescindibles)

Menú lateral o barra de herramientas de acceso inmediato.

| Módulo | Función |
|--------|---------|
| **📅 Agenda de Turnos** | Calendario interactivo con vista diaria, semanal y mensual por médico/especialidad. |
| **🏥 Admisión de Pacientes** | Registro rápido de ingreso y verificación de datos del paciente. |
| **📋 Historia Clínica** | Acceso directo al expediente médico electrónico (EMR). |
| **💊 Recetas y Prescripciones** | Módulo de receta electrónica con control de interacciones medicamentosas. |
| **🧪 Órdenes de Laboratorio** | Solicitud y seguimiento de análisis clínicos e imágenes. |
| **💰 Facturación / Caja** | Cobros, liquidaciones a obras sociales y emisión de comprobantes. |
| **📊 Tablero de Guardia** | Estado de urgencias y camas disponibles (si aplica internación). |

---

## 3. Reportes Estratégicos

Informes automatizados exportables (PDF/Excel).

| Reporte | Objetivo |
|---------|----------|
| **Productividad Médica** | Análisis de pacientes atendidos por profesional, tiempos de consulta y facturación generada. |
| **Turnos y Ausentismo** | Tendencias de cancelaciones, reprogramaciones y no-shows por especialidad. |
| **Demografía de Pacientes** | Segmentación por edad, sexo, obra social y motivos de consulta frecuentes. |
| **Cobertura y Facturación** | Liquidaciones a obras sociales, tiempos de cobro y rechazos. |
| **Inventario de Insumos** | Stock crítico de medicamentos, materiales descartables y equipamiento. |
| **Auditoría de Historias Clínicas** | Verificación de completitud y cumplimiento normativo de registros. |
| **Indicadores de Calidad** | Métricas de satisfacción del paciente, tiempos de espera y resolución. |

---

## 4. Layout Sugerido del Dashboard

Estructura visual recomendada para la interfaz de usuario:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔔 ZONA SUPERIOR (Alertas Críticas)                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • "Dr. Martínez: 3 pacientes en espera (+15 min)"                          │
│  • "Stock crítico: Amoxicilina 500mg (quedan 12 unidades)"                  │
│  • "5 resultados de laboratorio pendientes de revisión"                     │
├─────────────────────────────────┬───────────────────────────────────────────┤
│  📊 ZONA CENTRAL IZQUIERDA      │  📋 ZONA CENTRAL DERECHA                  │
│  (Gráficos de Rendimiento)      │  (Feed de Actividad en Vivo)              │
│  ─────────────────────────────  │  ─────────────────────────────────────    │
│  • Ocupación semanal de agenda  │  • 10:32 - Check-in: María González       │
│    (Histórico vs. Proyectado)   │  • 10:28 - Turno cancelado: Juan Pérez    │
│  • Distribución de consultas    │  • 10:25 - Receta emitida: Dr. López      │
│    por especialidad             │  • 10:20 - Pago recibido: $15,000         │
│  • Tiempos de espera promedio   │  • 10:15 - Lab: Resultados cargados       │
├─────────────────────────────────┴───────────────────────────────────────────┤
│  💰 ZONA INFERIOR (Panel Financiero)                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Facturación mes actual vs. anterior  │  • Deuda de Obras Sociales        │
│  • Cobros del día por forma de pago     │  • Proyección de ingresos         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Integraciones Externas (Servicios Externos)

Conectividad para potenciar la automatización.

| Integración | Descripción |
|-------------|-------------|
| **Obras Sociales / Prepagas** | API de validación de afiliados y autorización de prácticas en tiempo real. |
| **Laboratorios Externos** | Recepción automática de resultados vía HL7/FHIR. |
| **Farmacias** | Envío de recetas electrónicas y validación de cobertura de medicamentos. |
| **ANMAT / AFIP** | Trazabilidad de medicamentos y facturación electrónica obligatoria. |
| **WhatsApp Business API** | Recordatorios automáticos de turnos y confirmaciones. |
| **Pasarelas de Pago** | Mercado Pago / Stripe para cobros online y pagos con tarjeta. |
| **Google Calendar / Outlook** | Sincronización de agenda del médico con su calendario personal. |
| **Sistemas de Imágenes (PACS)** | Integración con equipos de diagnóstico por imagen. |

---

## 6. Módulos de Gestión Interna (ABMs)

Administración de datos maestros del sistema.

### 6.1 ABM Pacientes (CRM Médico)
- **Datos Personales**: DNI, nombre, fecha de nacimiento, contacto, domicilio.
- **Cobertura Médica**: Obra social/prepaga, número de afiliado, plan.
- **Historial de Turnos**: Registro completo de visitas y ausentismo.
- **Alertas Médicas**: Alergias, condiciones crónicas, medicación habitual.
- **Consentimientos**: Documentos firmados digitalmente.

### 6.2 ABM Profesionales Médicos
- **Datos Profesionales**: Matrícula, especialidades, CV.
- **Configuración de Agenda**: Días y horarios de atención, duración de turnos.
- **Honorarios**: Tarifas por práctica y convenios con obras sociales.
- **Ausencias**: Vacaciones, licencias, congresos.

### 6.3 ABM Especialidades y Prácticas
- **Nomenclador**: Códigos de prácticas (PMO, nomenclador nacional).
- **Valores**: Costos por obra social y particulares.
- **Requisitos**: Preparación previa del paciente, documentación necesaria.

### 6.4 ABM Consultorios / Infraestructura
- **Numeración y Ubicación**: Piso, sector, equipamiento disponible.
- **Asignación**: Relación consultorio-médico-especialidad.
- **Mantenimiento**: Programación de limpieza y reparaciones.

### 6.5 ABM Usuarios y Permisos
| Rol | Permisos |
|-----|----------|
| **Médico** | Historia clínica completa, recetas, órdenes, agenda propia. |
| **Recepcionista** | Turnos, admisión, datos básicos paciente, cobros. |
| **Enfermería** | Signos vitales, notas de enfermería, preparación. |
| **Administrador** | Facturación, reportes financieros, liquidaciones. |
| **Gerencia** | Dashboards, reportes estratégicos, configuración global. |
| **Auditor** | Lectura de historias clínicas, reportes de calidad. |

### 6.6 ABM Obras Sociales y Convenios
- **Datos de la Entidad**: Razón social, CUIT, contacto.
- **Planes y Coberturas**: Porcentajes de cobertura por práctica.
- **Valores Convenidos**: Tarifas acordadas y vigencia.
- **Requisitos de Facturación**: Formatos, plazos, documentación.

### 6.7 ABM Insumos y Farmacia Interna
- **Medicamentos**: Droga, presentación, lote, vencimiento.
- **Descartables**: Stock mínimo, punto de reposición.
- **Equipamiento**: Inventario de activos fijos y estado.

---

## 7. Módulo de Historia Clínica Electrónica (HCE)

### 7.1 Estructura del Expediente

```
📁 HISTORIA CLÍNICA - Paciente #12345
├── 📄 Datos Filiatorios
│   ├── Información personal y de contacto
│   ├── Cobertura médica vigente
│   └── Responsable legal (si aplica)
│
├── 📋 Antecedentes
│   ├── Personales (patológicos, quirúrgicos, traumáticos)
│   ├── Familiares
│   ├── Alergias y reacciones adversas ⚠️
│   ├── Hábitos (tabaco, alcohol, drogas, ejercicio)
│   └── Gineco-obstétricos (si aplica)
│
├── 💊 Medicación Habitual
│   └── Listado actualizado con dosis y frecuencia
│
├── 📅 Evoluciones (por fecha descendente)
│   ├── [2024-01-15] Consulta - Dr. García (Cardiología)
│   │   ├── Motivo de consulta
│   │   ├── Examen físico
│   │   ├── Diagnóstico (CIE-10)
│   │   ├── Plan de tratamiento
│   │   └── Firma digital del profesional
│   └── [2024-01-02] Consulta - Dra. López (Clínica Médica)
│
├── 🧪 Estudios Complementarios
│   ├── Laboratorio (con gráficos de tendencia)
│   ├── Imágenes (links a PACS)
│   └── Otros estudios
│
├── 📝 Recetas Emitidas
│   └── Historial completo con duplicados digitales
│
├── 📎 Documentos Adjuntos
│   ├── Consentimientos informados
│   ├── Estudios externos
│   └── Informes de interconsulta
│
└── 🔒 Auditoría
    └── Log de accesos y modificaciones
```

### 7.2 Funcionalidades Clave de la HCE

| Función | Descripción |
|---------|-------------|
| **Plantillas por Especialidad** | Formularios predefinidos según tipo de consulta. |
| **Alertas Automáticas** | Interacciones medicamentosas, alergias, contraindicaciones. |
| **CIE-10 / SNOMED** | Codificación estandarizada de diagnósticos. |
| **Firma Digital** | Validación legal del profesional actuante. |
| **Versionado** | Historial de modificaciones sin pérdida de información. |
| **Compartir con Paciente** | Portal de paciente para acceso a su expediente. |

---

## 8. Flujo de Proceso: Atención de Paciente

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  RESERVA    │───▶│  ADMISIÓN   │───▶│  ESPERA     │───▶│  CONSULTA   │
│  DE TURNO   │    │  (Check-in) │    │             │    │  MÉDICA     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
 • Online/Tel/Pres  • Validar datos    • Llamado por     • Historia clínica
 • Selección médico • Verificar OS       pantalla        • Examen físico
 • Selección fecha  • Cobro copago    • Control de      • Diagnóstico
 • Confirmación     • Entrega número    tiempos         • Prescripciones
   automática         de atención                       • Órdenes de estudio
                                                        
                    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                    │  ESTUDIOS   │◀───│  POST-      │◀───│  CIERRE     │
                    │  (si req.)  │    │  CONSULTA   │    │  CONSULTA   │
                    └─────────────┘    └─────────────┘    └─────────────┘
                          │                  │                  │
                          ▼                  ▼                  ▼
                    • Lab interno/ext  • Entrega receta   • Firma digital
                    • Imágenes         • Próximo turno    • Facturación
                    • Derivaciones     • Encuesta sat.    • Actualización
                                                            de agenda
```

---

## 9. Módulo de Turnos (Scheduling)

### 9.1 Vistas de Agenda

| Vista | Uso |
|-------|-----|
| **Por Médico** | Agenda individual del profesional, día/semana/mes. |
| **Por Consultorio** | Ocupación física del espacio, útil para asignación. |
| **Por Especialidad** | Vista consolidada de todos los médicos de una especialidad. |
| **General (Rack)** | Matriz completa de disponibilidad de la clínica. |

### 9.2 Tipos de Turno

| Tipo | Características |
|------|-----------------|
| **Programado** | Reserva anticipada con horario fijo. |
| **Sobreturno** | Asignación extra fuera del cupo normal (autorizado). |
| **Urgencia** | Sin turno previo, ingreso por guardia/demanda espontánea. |
| **Bloqueo** | Reserva de tiempo para actividades no asistenciales. |
| **Recurrente** | Tratamientos con múltiples sesiones programadas. |

### 9.3 Estados del Turno

```
[DISPONIBLE] → [RESERVADO] → [CONFIRMADO] → [EN ESPERA] → [EN ATENCIÓN] → [COMPLETADO]
                    │              │              │
                    ▼              ▼              ▼
              [CANCELADO]    [NO ASISTIÓ]   [ABANDONÓ]
```

---

## 10. Portal del Paciente (Autogestión)

Funcionalidades disponibles para el paciente vía web/app.

| Función | Descripción |
|---------|-------------|
| **Reserva Online** | Selección de especialidad, médico, fecha y hora. |
| **Mis Turnos** | Visualización, confirmación y cancelación. |
| **Historia Clínica** | Acceso a evoluciones, estudios y recetas propias. |
| **Resultados** | Descarga de análisis de laboratorio e imágenes. |
| **Recetas Digitales** | Acceso a prescripciones para presentar en farmacia. |
| **Pagos Online** | Abono de copagos, deudas y prácticas particulares. |
| **Mensajería** | Comunicación asíncrona con el equipo médico. |
| **Encuestas** | Feedback post-atención para mejora continua. |

---

## 11. Consideraciones Técnicas

### 11.1 Seguridad y Compliance

| Requisito | Implementación |
|-----------|----------------|
| **Ley de Protección de Datos** | Encriptación, consentimiento, derecho al olvido. |
| **Ley de Historia Clínica Digital** | Firma digital, conservación 15 años, auditoría. |
| **Acceso Basado en Roles (RBAC)** | Permisos granulares por módulo y acción. |
| **Auditoría Completa** | Log de todas las acciones con usuario, fecha y IP. |
| **Backup Automatizado** | Respaldos diarios con retención configurable. |

### 11.2 Estándares de Interoperabilidad

| Estándar | Uso |
|----------|-----|
| **HL7 FHIR** | Intercambio de información clínica entre sistemas. |
| **CIE-10** | Codificación de diagnósticos. |
| **LOINC** | Codificación de resultados de laboratorio. |
| **SNOMED CT** | Terminología clínica estandarizada. |
| **DICOM** | Imágenes médicas y comunicación con PACS. |

---

## 12. Esquema de Base de Datos (Entidades Principales)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    PACIENTES    │       │    MÉDICOS      │       │ ESPECIALIDADES  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ dni             │       │ matrícula       │       │ nombre          │
│ nombre          │       │ nombre          │       │ descripción     │
│ apellido        │       │ apellido        │       │ color (UI)      │
│ fecha_nac       │       │ email           │       └────────┬────────┘
│ sexo            │       │ teléfono        │                │
│ teléfono        │       │ especialidad_id │◀───────────────┘
│ email           │       │ honorarios      │
│ dirección       │       │ activo          │
│ obra_social_id  │       └────────┬────────┘
│ nro_afiliado    │                │
│ alergias        │                │
│ created_at      │                │
└────────┬────────┘                │
         │                         │
         │    ┌─────────────────┐  │
         │    │     TURNOS      │  │
         │    ├─────────────────┤  │
         └───▶│ paciente_id     │◀─┘
              │ médico_id       │
              │ consultorio_id  │◀──┐
              │ fecha           │   │
              │ hora_inicio     │   │
              │ hora_fin        │   │    ┌─────────────────┐
              │ estado          │   │    │  CONSULTORIOS   │
              │ motivo          │   │    ├─────────────────┤
              │ notas           │   └────│ id              │
              │ created_at      │        │ número          │
              └────────┬────────┘        │ piso            │
                       │                 │ equipamiento    │
                       ▼                 │ activo          │
         ┌─────────────────┐             └─────────────────┘
         │   EVOLUCIONES   │
         ├─────────────────┤
         │ id              │
         │ paciente_id     │        ┌─────────────────┐
         │ médico_id       │        │  OBRAS_SOCIALES │
         │ turno_id        │        ├─────────────────┤
         │ fecha           │        │ id              │
         │ motivo_consulta │        │ nombre          │
         │ examen_fisico   │        │ cuit            │
         │ diagnóstico     │        │ teléfono        │
         │ diagnóstico_cie │        │ email           │
         │ tratamiento     │        │ cobertura_%     │
         │ indicaciones    │        │ activo          │
         │ firma_digital   │        └─────────────────┘
         │ created_at      │
         └────────┬────────┘
                  │
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌─────────────────┐    ┌─────────────────┐
│    RECETAS      │    │    ÓRDENES      │
├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │
│ evolución_id    │    │ evolución_id    │
│ medicamento     │    │ tipo            │
│ dosis           │    │ práctica        │
│ frecuencia      │    │ código          │
│ duración        │    │ indicaciones    │
│ indicaciones    │    │ urgente         │
│ duplicado       │    │ estado          │
│ created_at      │    │ resultado       │
└─────────────────┘    │ created_at      │
                       └─────────────────┘
```

---

## 13. Roadmap de Implementación Sugerido

### Fase 1: Core (Meses 1-3)
- [ ] ABM de Pacientes, Médicos, Especialidades
- [ ] Sistema de Turnos básico
- [ ] Agenda por médico
- [ ] Check-in de pacientes

### Fase 2: Historia Clínica (Meses 4-6)
- [ ] Módulo de evoluciones
- [ ] Recetas electrónicas
- [ ] Órdenes de estudio
- [ ] Antecedentes y alertas

### Fase 3: Facturación (Meses 7-8)
- [ ] Cobro de copagos
- [ ] Facturación a obras sociales
- [ ] Integración con AFIP
- [ ] Reportes financieros

### Fase 4: Integraciones (Meses 9-10)
- [ ] Portal del paciente
- [ ] WhatsApp reminders
- [ ] Integración laboratorios
- [ ] Pasarelas de pago

### Fase 5: Analytics (Meses 11-12)
- [ ] Dashboard ejecutivo
- [ ] Reportes de productividad
- [ ] Indicadores de calidad
- [ ] Business Intelligence

---

## 14. Preguntas para Definición de Alcance

Antes de iniciar el desarrollo, es importante definir:

1. **¿La clínica tiene internación o es solo ambulatoria?**
   - Si hay internación: módulo de camas, enfermería 24hs, indicaciones.

2. **¿Manejan quirófano/procedimientos?**
   - Si aplica: programación quirúrgica, anestesia, materiales.

3. **¿Tienen farmacia interna?**
   - Si aplica: dispensación, stock, trazabilidad.

4. **¿Qué obras sociales/prepagas manejan?**
   - Definir integraciones prioritarias.

5. **¿Requieren telemedicina?**
   - Videoconsulta, receta digital a distancia.

6. **¿Cantidad de médicos y especialidades?**
   - Dimensionar infraestructura y licencias.

7. **¿Tienen múltiples sedes?**
   - Arquitectura multi-tenant vs. single-tenant.

---

*Documento preparado para presentación a equipo de desarrollo.*
*Última actualización: Enero 2026*

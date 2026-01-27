/**
 * Entity Registry - Generado automáticamente por sync.ts
 * NO EDITAR MANUALMENTE - se regenera con: npx tsx cli/sync.ts
 */

// ============ TYPES ============
export interface FieldConfig {
  name: string;
  type: 'string' | 'text' | 'email' | 'int' | 'integer' | 'decimal' | 'float' | 'bool' | 'boolean' | 'date' | 'datetime' | 'json' | 'enum' | 'fk';
  required: boolean;
  fkEntity?: string;
  fkTable?: string;
  enumValues?: string[];
}

export interface EntityConfig {
  name: string;
  plural: string;
  table: string;
  fields: FieldConfig[];
  fieldsRaw: string;
  icon: string;
  order: number;
  displayField?: string;
  masterDetail?: boolean;
  isDetail?: boolean;
  masterEntity?: string;
}

export interface ModuleConfig {
  name: string;
  path: string;
  folder: string;
  icon: string;
  description: string;
  requiredRole: string;
  containerStyle: string;
}

// ============ FIELD PARSER ============
function parseFields(fieldsStr: string): FieldConfig[] {
  return fieldsStr.split(' ').filter(Boolean).map(fieldDef => {
    const parts = fieldDef.split(':');
    const name = parts[0];
    const type = parts[1];
    const isRequired = parts.includes('req');

    if (type === 'fk') {
      return {
        name,
        type: 'fk' as const,
        required: isRequired,
        fkEntity: parts[2],
        fkTable: parts[3] || parts[2]?.toLowerCase() + 's'
      };
    }

    const enumMatch = type?.match(/^enum\((.+)\)$/);
    if (enumMatch) {
      return {
        name,
        type: 'enum' as const,
        required: isRequired,
        enumValues: enumMatch[1].split(',')
      };
    }

    return {
      name,
      type: (type || 'string') as FieldConfig['type'],
      required: isRequired
    };
  });
}

// ============ RAW DATA ============
const modulesData: ModuleConfig[] = [
  {
    "name": "Auditoria",
    "description": "Administración y seguridad del sistema",
    "icon": "Settings",
    "path": "auditoria",
    "folder": "auditoria",
    "requiredRole": "admin",
    "containerStyle": "tabs"
  },
  {
    "name": "Clinica",
    "description": "Sistema completo de gestión de clínica médica - Pacientes, Turnos, Historia Clínica y Operaciones",
    "icon": "Hospital",
    "path": "clinica",
    "folder": "clinica",
    "requiredRole": "usuario",
    "containerStyle": "dashboard"
  }
];

const entitiesData: Omit<EntityConfig, 'fields'>[] = [
  {
    "name": "Organizacion",
    "plural": "organizaciones",
    "table": "organizaciones",
    "fieldsRaw": "nombre:string:req codigo:string:req titulo:string eslogan:string descripcion:text logo_url:string color_primario:string color_secundario:string direccion:string telefono:string email:email sitio_web:string",
    "icon": "Building2",
    "order": 1
  },
  {
    "name": "Usuario",
    "plural": "usuarios",
    "table": "usuarios",
    "fieldsRaw": "email:email:req password_hash:string:req nombre:string:req apellido:string:req telefono:string rol:enum(usuario,supervisor,admin):req organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Users",
    "order": 2
  },
  {
    "name": "Rol",
    "plural": "roles",
    "table": "roles",
    "fieldsRaw": "nombre:string:req codigo:string:req descripcion:text organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Shield",
    "order": 3
  },
  {
    "name": "Permiso",
    "plural": "permisos",
    "table": "permisos",
    "fieldsRaw": "nombre:string:req codigo:string:req modulo:string:req descripcion:text organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Key",
    "order": 4
  },
  {
    "name": "Rolpermiso",
    "plural": "rol_permisos",
    "table": "rol_permisos",
    "fieldsRaw": "rol_id:fk:Rol:roles:req permiso_id:fk:Permiso:permisos:req organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Link",
    "order": 5
  },
  {
    "name": "Menu",
    "plural": "menus",
    "table": "menus",
    "fieldsRaw": "nombre:string:req path:string:req icono:string orden:int parent_id:fk:Menu:menus organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Menu",
    "order": 6
  },
  {
    "name": "Menurol",
    "plural": "menu_roles",
    "table": "menu_roles",
    "fieldsRaw": "menu_id:fk:Menu:menus:req rol_id:fk:Rol:roles:req organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Link",
    "order": 7
  },
  {
    "name": "Logauditoria",
    "plural": "logs_auditoria",
    "table": "logs_auditoria",
    "fieldsRaw": "usuario_id:fk:Usuario:usuarios accion:string:req entidad:string entidad_id:int datos_anteriores:json datos_nuevos:json ip:string user_agent:string organizacion_id:fk:Organizacion:organizaciones",
    "icon": "FileText",
    "order": 8
  },
  {
    "name": "Sesion",
    "plural": "sesiones",
    "table": "sesiones",
    "fieldsRaw": "usuario_id:fk:Usuario:usuarios:req token:string:req ip:string user_agent:string expires_at:datetime organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Clock",
    "order": 9
  },
  {
    "name": "Parametro",
    "plural": "parametros",
    "table": "parametros",
    "fieldsRaw": "clave:string:req valor:text:req tipo:enum(string,number,boolean,json):req descripcion:text editable:bool organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Sliders",
    "order": 10
  },
  {
    "name": "Notificacion",
    "plural": "notificaciones",
    "table": "notificaciones",
    "fieldsRaw": "usuario_id:fk:Usuario:usuarios:req titulo:string:req mensaje:text tipo:enum(info,success,warning,error) leida:bool organizacion_id:fk:Organizacion:organizaciones",
    "icon": "Bell",
    "order": 11
  },
  {
    "name": "Especialidad",
    "plural": "especialidades",
    "table": "especialidades",
    "fieldsRaw": "nombre:string:req codigo:string:req descripcion:text duracion_turno_default:int:req color:string icono:string activo:bool orden:int",
    "icon": "Stethoscope",
    "order": 1
  },
  {
    "name": "Consultorio",
    "plural": "consultorios",
    "table": "consultorios",
    "fieldsRaw": "numero:string:req piso:int sector:string especialidad_id:fk:Especialidad:especialidades estado:enum(disponible,ocupado,mantenimiento,limpieza):req equipamiento:text activo:bool observaciones:text",
    "icon": "DoorOpen",
    "order": 2
  },
  {
    "name": "ObraSocial",
    "plural": "obras_sociales",
    "table": "obras_sociales",
    "fieldsRaw": "nombre:string:req codigo:string:req cuit:string tipo:enum(obra_social,prepaga,particular,convenio):req telefono:string email:email direccion:string cobertura_porcentaje:decimal requiere_autorizacion:bool dias_pago:int activo:bool observaciones:text",
    "icon": "Shield",
    "order": 3
  },
  {
    "name": "PlanObraSocial",
    "plural": "planes_obra_social",
    "table": "planes_obra_social",
    "fieldsRaw": "obra_social_id:fk:ObraSocial:obras_sociales:req nombre:string:req codigo:string cobertura_consulta:decimal cobertura_practicas:decimal cobertura_estudios:decimal copago_consulta:decimal requiere_derivacion:bool activo:bool",
    "icon": "FileStack",
    "order": 3.1
  },
  {
    "name": "Paciente",
    "plural": "pacientes",
    "table": "pacientes",
    "fieldsRaw": "nombre:string:req apellido:string:req tipo_documento:enum(dni,pasaporte,cedula,lc,le):req documento:string:req fecha_nacimiento:date:req sexo:enum(masculino,femenino,otro):req estado_civil:enum(soltero,casado,divorciado,viudo,union_libre) nacionalidad:string email:email telefono:string celular:string:req direccion:string ciudad:string provincia:string codigo_postal:string obra_social_id:fk:ObraSocial:obras_sociales nro_afiliado:string plan_id:fk:PlanObraSocial:planes_obra_social grupo_sanguineo:enum(a_positivo,a_negativo,b_positivo,b_negativo,ab_positivo,ab_negativo,o_positivo,o_negativo) factor_rh:enum(positivo,negativo) ocupacion:string contacto_emergencia:string telefono_emergencia:string activo:bool observaciones:text",
    "icon": "Users",
    "order": 4
  },
  {
    "name": "AntecedentePaciente",
    "plural": "antecedentes_paciente",
    "table": "antecedentes_paciente",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req tipo:enum(personal,familiar,quirurgico,alergico,farmacologico,traumatico,gineco_obstetrico,habito):req descripcion:text:req fecha_desde:date gravedad:enum(leve,moderado,severo) activo:bool observaciones:text",
    "icon": "FileHeart",
    "order": 4.1
  },
  {
    "name": "AlertaMedica",
    "plural": "alertas_medicas",
    "table": "alertas_medicas",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req tipo:enum(alergia,contraindicacion,interaccion,condicion_critica,otro):req descripcion:string:req severidad:enum(baja,media,alta,critica):req activo:bool fecha_registro:date observaciones:text",
    "icon": "AlertTriangle",
    "order": 4.2
  },
  {
    "name": "Medico",
    "plural": "medicos",
    "table": "medicos",
    "fieldsRaw": "nombre:string:req apellido:string:req documento:string:req matricula_nacional:string matricula_provincial:string:req especialidad_id:fk:Especialidad:especialidades:req email:email:req telefono:string celular:string direccion:string fecha_nacimiento:date fecha_ingreso:date:req honorarios_consulta:decimal duracion_turno:int:req atiende_particular:bool activo:bool firma_digital:text observaciones:text",
    "icon": "UserRound",
    "order": 5
  },
  {
    "name": "AgendaMedico",
    "plural": "agendas_medico",
    "table": "agendas_medico",
    "fieldsRaw": "medico_id:fk:Medico:medicos:req consultorio_id:fk:Consultorio:consultorios:req dia_semana:enum(lunes,martes,miercoles,jueves,viernes,sabado,domingo):req hora_inicio:string:req hora_fin:string:req intervalo_minutos:int:req sobreturnos_max:int fecha_desde:date fecha_hasta:date activo:bool",
    "icon": "CalendarClock",
    "order": 5.1
  },
  {
    "name": "AusenciaMedico",
    "plural": "ausencias_medico",
    "table": "ausencias_medico",
    "fieldsRaw": "medico_id:fk:Medico:medicos:req fecha_desde:date:req fecha_hasta:date:req motivo:enum(vacaciones,enfermedad,congreso,licencia,otro):req descripcion:text reprogramar_turnos:bool notificar_pacientes:bool",
    "icon": "CalendarX",
    "order": 5.2
  },
  {
    "name": "Turno",
    "plural": "turnos",
    "table": "turnos",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req medico_id:fk:Medico:medicos:req consultorio_id:fk:Consultorio:consultorios especialidad_id:fk:Especialidad:especialidades:req fecha:date:req hora:string:req duracion_minutos:int estado:enum(disponible,reservado,confirmado,sala_espera,en_atencion,atendido,cancelado,ausente):req tipo:enum(primera_vez,control,urgencia,procedimiento,interconsulta):req motivo_consulta:text obra_social_id:fk:ObraSocial:obras_sociales nro_autorizacion:string es_sobreturno:bool fecha_reserva:date canal_reserva:enum(presencial,telefono,web,app):req observaciones:text",
    "icon": "Calendar",
    "order": 6
  },
  {
    "name": "ListaEspera",
    "plural": "lista_espera",
    "table": "lista_espera",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req medico_id:fk:Medico:medicos especialidad_id:fk:Especialidad:especialidades:req fecha_solicitud:date:req urgencia:enum(normal,urgente,muy_urgente):req horario_preferido:enum(manana,tarde,cualquiera) dias_preferidos:string contactado:bool fecha_contacto:date estado:enum(pendiente,ofrecido,aceptado,rechazado,vencido):req observaciones:text",
    "icon": "ClipboardList",
    "order": 6.1
  },
  {
    "name": "HistoriaClinica",
    "plural": "historias_clinicas",
    "table": "historias_clinicas",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req numero:string:req fecha_apertura:date:req estado:enum(activa,inactiva,archivada):req ubicacion_fisica:string digitalizada:bool observaciones:text",
    "icon": "FolderHeart",
    "order": 7
  },
  {
    "name": "Evolucion",
    "plural": "evoluciones",
    "table": "evoluciones",
    "fieldsRaw": "historia_clinica_id:fk:HistoriaClinica:historias_clinicas:req turno_id:fk:Turno:turnos medico_id:fk:Medico:medicos:req fecha:date:req hora:string motivo_consulta:text:req enfermedad_actual:text antecedentes_relevantes:text examen_fisico:text diagnostico_presuntivo:text diagnostico_cie10:string plan_tratamiento:text indicaciones:text proxima_cita:text firma_digital:text estado:enum(borrador,firmado,corregido):req",
    "icon": "FileText",
    "order": 8
  },
  {
    "name": "SignosVitales",
    "plural": "signos_vitales",
    "table": "signos_vitales",
    "fieldsRaw": "evolucion_id:fk:Evolucion:evoluciones:req fecha:date:req hora:string peso_kg:decimal talla_cm:decimal imc:decimal temperatura:decimal presion_sistolica:int presion_diastolica:int frecuencia_cardiaca:int frecuencia_respiratoria:int saturacion_o2:int glucemia:decimal observaciones:text registrado_por:string",
    "icon": "HeartPulse",
    "order": 8.1
  },
  {
    "name": "CategoriaEstudio",
    "plural": "categorias_estudio",
    "table": "categorias_estudio",
    "fieldsRaw": "nombre:string:req codigo:string descripcion:text tipo:enum(laboratorio,imagen,otro):req icono:string orden:int",
    "icon": "FolderTree",
    "order": 9
  },
  {
    "name": "TipoEstudio",
    "plural": "tipos_estudio",
    "table": "tipos_estudio",
    "fieldsRaw": "nombre:string:req codigo:string:req categoria_id:fk:CategoriaEstudio:categorias_estudio:req codigo_nomenclador:string preparacion:text duracion_estimada:int precio_particular:decimal requiere_autorizacion:bool activo:bool",
    "icon": "TestTube",
    "order": 9.1
  },
  {
    "name": "OrdenEstudio",
    "plural": "ordenes_estudio",
    "table": "ordenes_estudio",
    "fieldsRaw": "evolucion_id:fk:Evolucion:evoluciones:req paciente_id:fk:Paciente:pacientes:req medico_id:fk:Medico:medicos:req tipo_estudio_id:fk:TipoEstudio:tipos_estudio:req fecha_orden:date:req diagnostico_presuntivo:string urgente:bool indicaciones:text estado:enum(pendiente,en_proceso,completado,cancelado):req fecha_realizacion:date resultado:text archivo_resultado:string laboratorio_externo:string observaciones:text",
    "icon": "FileSearch",
    "order": 10
  },
  {
    "name": "Medicamento",
    "plural": "medicamentos",
    "table": "medicamentos",
    "fieldsRaw": "nombre_comercial:string:req nombre_generico:string:req laboratorio:string presentacion:string:req concentracion:string forma_farmaceutica:enum(comprimido,capsula,jarabe,inyectable,crema,gotas,inhalador,supositorio,parche,otro):req via_administracion:enum(oral,sublingual,intramuscular,intravenosa,topica,inhalatoria,rectal,otra):req requiere_receta:bool refrigeracion:bool activo:bool observaciones:text",
    "icon": "Pill",
    "order": 11
  },
  {
    "name": "Receta",
    "plural": "recetas",
    "table": "recetas",
    "fieldsRaw": "evolucion_id:fk:Evolucion:evoluciones:req paciente_id:fk:Paciente:pacientes:req medico_id:fk:Medico:medicos:req fecha:date:req tipo:enum(simple,duplicado,triplicado):req diagnostico:string estado:enum(emitida,dispensada,vencida,anulada):req fecha_vencimiento:date observaciones:text",
    "icon": "ScrollText",
    "order": 12,
    "masterDetail": true
  },
  {
    "name": "DetalleReceta",
    "plural": "detalles_receta",
    "table": "detalles_receta",
    "fieldsRaw": "receta_id:fk:Receta:recetas:req medicamento_id:fk:Medicamento:medicamentos:req dosis:string:req frecuencia:string:req duracion:string:req cantidad:int via_administracion:string indicaciones:text",
    "icon": "ListOrdered",
    "order": 12.1,
    "isDetail": true,
    "masterEntity": "Receta"
  },
  {
    "name": "Diagnostico",
    "plural": "diagnosticos",
    "table": "diagnosticos",
    "fieldsRaw": "codigo_cie10:string:req nombre:string:req descripcion:text categoria:string capitulo:string activo:bool",
    "icon": "FileHeart",
    "order": 13
  },
  {
    "name": "DiagnosticoPaciente",
    "plural": "diagnosticos_paciente",
    "table": "diagnosticos_paciente",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req evolucion_id:fk:Evolucion:evoluciones diagnostico_id:fk:Diagnostico:diagnosticos:req medico_id:fk:Medico:medicos:req fecha_diagnostico:date:req tipo:enum(presuntivo,confirmado):req estado:enum(activo,resuelto,cronico):req fecha_resolucion:date observaciones:text",
    "icon": "Clipboard",
    "order": 13.1
  },
  {
    "name": "Departamento",
    "plural": "departamentos",
    "table": "departamentos",
    "fieldsRaw": "nombre:string:req codigo:string:req descripcion:text responsable:string activo:bool",
    "icon": "Building",
    "order": 14
  },
  {
    "name": "Empleado",
    "plural": "empleados",
    "table": "empleados",
    "fieldsRaw": "nombre:string:req apellido:string:req documento:string:req email:email telefono:string departamento_id:fk:Departamento:departamentos:req cargo:enum(recepcionista,enfermero,administrativo,tecnico,limpieza,seguridad,gerente,otro):req fecha_ingreso:date:req salario:decimal activo:bool turno:enum(manana,tarde,noche,rotativo)",
    "icon": "UserCog",
    "order": 15
  },
  {
    "name": "CategoriaPractica",
    "plural": "categorias_practica",
    "table": "categorias_practica",
    "fieldsRaw": "nombre:string:req codigo:string descripcion:text icono:string",
    "icon": "FolderTree",
    "order": 16
  },
  {
    "name": "Practica",
    "plural": "practicas",
    "table": "practicas",
    "fieldsRaw": "nombre:string:req codigo_nomenclador:string:req descripcion:text categoria_id:fk:CategoriaPractica:categorias_practica:req precio_particular:decimal:req duracion_minutos:int requiere_turno:bool requiere_autorizacion:bool preparacion:text activo:bool",
    "icon": "Activity",
    "order": 17
  },
  {
    "name": "PracticaRealizada",
    "plural": "practicas_realizadas",
    "table": "practicas_realizadas",
    "fieldsRaw": "evolucion_id:fk:Evolucion:evoluciones:req practica_id:fk:Practica:practicas:req medico_id:fk:Medico:medicos:req fecha:date:req cantidad:int:req precio_unitario:decimal subtotal:decimal nro_autorizacion:string estado:enum(realizada,facturada,rechazada):req observaciones:text",
    "icon": "ClipboardCheck",
    "order": 18
  },
  {
    "name": "ConceptoFacturacion",
    "plural": "conceptos_facturacion",
    "table": "conceptos_facturacion",
    "fieldsRaw": "nombre:string:req codigo:string tipo:enum(consulta,practica,estudio,material,otro):req precio_default:decimal impuesto_porcentaje:decimal activo:bool",
    "icon": "Tags",
    "order": 19
  },
  {
    "name": "Factura",
    "plural": "facturas",
    "table": "facturas",
    "fieldsRaw": "numero:string:req paciente_id:fk:Paciente:pacientes:req obra_social_id:fk:ObraSocial:obras_sociales fecha:date:req tipo_comprobante:enum(factura_a,factura_b,factura_c,recibo_x,nota_credito):req subtotal:decimal impuestos:decimal descuento:decimal total:decimal:req estado:enum(pendiente,pagada,parcial,anulada):req fecha_vencimiento:date observaciones:text",
    "icon": "FileText",
    "order": 20,
    "masterDetail": true
  },
  {
    "name": "DetalleFactura",
    "plural": "detalles_factura",
    "table": "detalles_factura",
    "fieldsRaw": "factura_id:fk:Factura:facturas:req concepto_id:fk:ConceptoFacturacion:conceptos_facturacion descripcion:string:req cantidad:int:req precio_unitario:decimal:req descuento:decimal subtotal:decimal:req evolucion_id:fk:Evolucion:evoluciones practica_id:fk:Practica:practicas",
    "icon": "ListOrdered",
    "order": 20.1,
    "isDetail": true,
    "masterEntity": "Factura"
  },
  {
    "name": "Pago",
    "plural": "pagos",
    "table": "pagos",
    "fieldsRaw": "factura_id:fk:Factura:facturas:req fecha:date:req monto:decimal:req metodo:enum(efectivo,tarjeta_credito,tarjeta_debito,transferencia,mercadopago,cheque):req comprobante:string estado:enum(pendiente,aprobado,rechazado):req empleado_id:fk:Empleado:empleados observaciones:text",
    "icon": "DollarSign",
    "order": 21
  },
  {
    "name": "LiquidacionObraSocial",
    "plural": "liquidaciones_obra_social",
    "table": "liquidaciones_obra_social",
    "fieldsRaw": "obra_social_id:fk:ObraSocial:obras_sociales:req periodo_mes:int:req periodo_anio:int:req fecha_presentacion:date total_facturado:decimal:req cantidad_prestaciones:int:req estado:enum(en_proceso,presentada,aceptada,rechazada,cobrada):req fecha_respuesta:date monto_aceptado:decimal monto_rechazado:decimal fecha_cobro:date observaciones:text",
    "icon": "FileSpreadsheet",
    "order": 22
  },
  {
    "name": "CategoriaInsumo",
    "plural": "categorias_insumo",
    "table": "categorias_insumo",
    "fieldsRaw": "nombre:string:req descripcion:text",
    "icon": "FolderTree",
    "order": 23
  },
  {
    "name": "Proveedor",
    "plural": "proveedores",
    "table": "proveedores",
    "fieldsRaw": "razon_social:string:req cuit:string rubro:string contacto:string email:email telefono:string direccion:string activo:bool calificacion:int observaciones:text",
    "icon": "Truck",
    "order": 24
  },
  {
    "name": "Insumo",
    "plural": "insumos",
    "table": "insumos",
    "fieldsRaw": "nombre:string:req codigo:string categoria_id:fk:CategoriaInsumo:categorias_insumo:req unidad:enum(unidad,caja,paquete,litro,ml,kg,gramo):req stock_actual:int:req stock_minimo:int proveedor_id:fk:Proveedor:proveedores costo_unitario:decimal ubicacion:string lote:string fecha_vencimiento:date requiere_refrigeracion:bool",
    "icon": "Package",
    "order": 25
  },
  {
    "name": "MovimientoInsumo",
    "plural": "movimientos_insumo",
    "table": "movimientos_insumo",
    "fieldsRaw": "insumo_id:fk:Insumo:insumos:req tipo:enum(entrada,salida,ajuste,vencimiento):req cantidad:int:req fecha:date:req empleado_id:fk:Empleado:empleados motivo:string destino:string costo_total:decimal",
    "icon": "ArrowLeftRight",
    "order": 26
  },
  {
    "name": "Consentimiento",
    "plural": "consentimientos",
    "table": "consentimientos",
    "fieldsRaw": "nombre:string:req tipo:enum(general,procedimiento,quirurgico,anestesia,investigacion,datos_personales):req contenido:text:req version:string activo:bool obligatorio:bool",
    "icon": "FileSignature",
    "order": 27
  },
  {
    "name": "ConsentimientoFirmado",
    "plural": "consentimientos_firmados",
    "table": "consentimientos_firmados",
    "fieldsRaw": "consentimiento_id:fk:Consentimiento:consentimientos:req paciente_id:fk:Paciente:pacientes:req medico_id:fk:Medico:medicos fecha_firma:date:req firma_paciente:text firma_testigo:string nombre_testigo:string documento_testigo:string revocado:bool fecha_revocacion:date motivo_revocacion:text",
    "icon": "FileCheck",
    "order": 27.1
  },
  {
    "name": "Turnoausente",
    "plural": "turnos_ausentes",
    "table": "turnos_ausentes",
    "fieldsRaw": "turno_id:fk:Turno:turnos:req fecha:date:req motivo:text contactado:bool fecha_contacto:date reprogramado:bool nuevo_turno_id:fk:Turno:turnos empleado_registro_id:fk:Empleado:empleados observaciones:text",
    "icon": "UserX",
    "order": 28
  },
  {
    "name": "CancelacionTurno",
    "plural": "cancelaciones_turno",
    "table": "cancelaciones_turno",
    "fieldsRaw": "turno_id:fk:Turno:turnos:req fecha:date:req motivo:enum(paciente,medico,clinica,fuerza_mayor,otro):req detalle:text con_anticipacion:bool horas_anticipacion:int empleado_registro_id:fk:Empleado:empleados notificado:bool",
    "icon": "XCircle",
    "order": 29
  },
  {
    "name": "EncuestaSatisfaccion",
    "plural": "encuestas_satisfaccion",
    "table": "encuestas_satisfaccion",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req turno_id:fk:Turno:turnos fecha:date:req puntuacion_general:int:req puntuacion_atencion:int puntuacion_tiempo_espera:int puntuacion_instalaciones:int recomendaria:bool comentarios:text",
    "icon": "Star",
    "order": 30
  },
  {
    "name": "Queja",
    "plural": "quejas",
    "table": "quejas",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req turno_id:fk:Turno:turnos fecha:date:req categoria:enum(atencion_medica,tiempo_espera,administrativo,instalaciones,facturacion,otro):req descripcion:text:req prioridad:enum(baja,media,alta):req estado:enum(recibida,en_proceso,resuelta,cerrada):req empleado_asignado_id:fk:Empleado:empleados fecha_resolucion:date accion_tomada:text compensacion:string",
    "icon": "MessageSquareWarning",
    "order": 31
  },
  {
    "name": "Incidente",
    "plural": "incidentes",
    "table": "incidentes",
    "fieldsRaw": "tipo:enum(caida,infeccion,medicacion,equipamiento,seguridad,otro):req fecha:date:req hora:string:req ubicacion:string descripcion:text:req gravedad:enum(leve,moderado,grave,critico):req estado:enum(reportado,investigando,resuelto,cerrado):req empleado_reporta_id:fk:Empleado:empleados empleado_responsable_id:fk:Empleado:empleados paciente_id:fk:Paciente:pacientes accion_inmediata:text accion_correctiva:text autoridades_notificadas:bool fecha_resolucion:date",
    "icon": "AlertTriangle",
    "order": 32
  },
  {
    "name": "AuditoriaMedica",
    "plural": "auditorias_medicas",
    "table": "auditorias_medicas",
    "fieldsRaw": "fecha:date:req empleado_id:fk:Empleado:empleados:req tipo:enum(historia_clinica,prescripcion,consentimiento,general):req periodo_desde:date periodo_hasta:date historias_revisadas:int hallazgos:text recomendaciones:text estado:enum(en_proceso,finalizada):req",
    "icon": "ClipboardCheck",
    "order": 33
  },
  {
    "name": "Recordatorio",
    "plural": "recordatorios",
    "table": "recordatorios",
    "fieldsRaw": "paciente_id:fk:Paciente:pacientes:req turno_id:fk:Turno:turnos tipo:enum(turno,control_periodico,vacuna,estudio,medicacion):req fecha_envio:date:req canal:enum(sms,whatsapp,email,llamada):req mensaje:text estado:enum(pendiente,enviado,fallido,confirmado):req respuesta:text",
    "icon": "Bell",
    "order": 34
  },
  {
    "name": "FeriadoHorarioEspecial",
    "plural": "feriados_horarios_especiales",
    "table": "feriados_horarios_especiales",
    "fieldsRaw": "fecha:date:req nombre:string:req tipo:enum(feriado,horario_especial):req cerrado:bool hora_inicio:string hora_fin:string observaciones:text",
    "icon": "CalendarOff",
    "order": 35
  },
  {
    "name": "ConfiguracionClinica",
    "plural": "configuraciones_clinica",
    "table": "configuraciones_clinica",
    "fieldsRaw": "clave:string:req valor:text:req tipo:enum(texto,numero,booleano,json):req descripcion:text categoria:string modificable:bool",
    "icon": "Settings",
    "order": 36
  }
];

// ============ PARSED REGISTRY ============
export const entities: Record<string, EntityConfig> = {};
export const entitiesByPlural: Record<string, EntityConfig> = {};
export const modules: ModuleConfig[] = modulesData;

// Inicializar
for (const raw of entitiesData) {
  const entity: EntityConfig = {
    ...raw,
    fields: parseFields(raw.fieldsRaw)
  };
  entities[entity.name] = entity;
  entitiesByPlural[entity.plural] = entity;
}

// ============ HELPERS ============
export function getEntity(name: string): EntityConfig | undefined {
  return entities[name];
}

export function getEntityByPlural(plural: string): EntityConfig | undefined {
  return entitiesByPlural[plural];
}

export function getEntitiesForModule(modulePath: string): EntityConfig[] {
  return Object.values(entities).filter(e => !e.isDetail).sort((a, b) => a.order - b.order);
}

export function getDetailEntity(masterName: string): EntityConfig | undefined {
  return Object.values(entities).find(e => e.isDetail && e.masterEntity === masterName);
}

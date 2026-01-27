"""API Router - Generado automáticamente"""
from fastapi import APIRouter
from .auth import router as auth_router
from .ws import router as ws_router

from .organizaciones import router as organizaciones_router
from .usuarios import router as usuarios_router
from .roles import router as roles_router
from .permisos import router as permisos_router
from .rol_permisos import router as rol_permisos_router
from .menus import router as menus_router
from .menu_roles import router as menu_roles_router
from .logs_auditoria import router as logs_auditoria_router
from .sesiones import router as sesiones_router
from .parametros import router as parametros_router
from .notificaciones import router as notificaciones_router
from .especialidades import router as especialidades_router
from .consultorios import router as consultorios_router
from .obras_sociales import router as obras_sociales_router
from .planes_obra_social import router as planes_obra_social_router
from .pacientes import router as pacientes_router
from .antecedentes_paciente import router as antecedentes_paciente_router
from .alertas_medicas import router as alertas_medicas_router
from .medicos import router as medicos_router
from .agendas_medico import router as agendas_medico_router
from .ausencias_medico import router as ausencias_medico_router
from .turnos import router as turnos_router
from .lista_espera import router as lista_espera_router
from .historias_clinicas import router as historias_clinicas_router
from .evoluciones import router as evoluciones_router
from .signos_vitales import router as signos_vitales_router
from .categorias_estudio import router as categorias_estudio_router
from .tipos_estudio import router as tipos_estudio_router
from .ordenes_estudio import router as ordenes_estudio_router
from .medicamentos import router as medicamentos_router
from .recetas import router as recetas_router
from .detalles_receta import router as detalles_receta_router
from .diagnosticos import router as diagnosticos_router
from .diagnosticos_paciente import router as diagnosticos_paciente_router
from .departamentos import router as departamentos_router
from .empleados import router as empleados_router
from .categorias_practica import router as categorias_practica_router
from .practicas import router as practicas_router
from .practicas_realizadas import router as practicas_realizadas_router
from .conceptos_facturacion import router as conceptos_facturacion_router
from .facturas import router as facturas_router
from .detalles_factura import router as detalles_factura_router
from .pagos import router as pagos_router
from .liquidaciones_obra_social import router as liquidaciones_obra_social_router
from .categorias_insumo import router as categorias_insumo_router
from .proveedores import router as proveedores_router
from .insumos import router as insumos_router
from .movimientos_insumo import router as movimientos_insumo_router
from .consentimientos import router as consentimientos_router
from .consentimientos_firmados import router as consentimientos_firmados_router
from .turnos_ausentes import router as turnos_ausentes_router
from .cancelaciones_turno import router as cancelaciones_turno_router
from .encuestas_satisfaccion import router as encuestas_satisfaccion_router
from .quejas import router as quejas_router
from .incidentes import router as incidentes_router
from .auditorias_medicas import router as auditorias_medicas_router
from .recordatorios import router as recordatorios_router
from .feriados_horarios_especiales import router as feriados_horarios_especiales_router
from .configuraciones_clinica import router as configuraciones_clinica_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(ws_router, tags=["WebSocket"])

api_router.include_router(organizaciones_router, tags=["Organizacion"])
api_router.include_router(usuarios_router, tags=["Usuario"])
api_router.include_router(roles_router, tags=["Rol"])
api_router.include_router(permisos_router, tags=["Permiso"])
api_router.include_router(rol_permisos_router, tags=["Rolpermiso"])
api_router.include_router(menus_router, tags=["Menu"])
api_router.include_router(menu_roles_router, tags=["Menurol"])
api_router.include_router(logs_auditoria_router, tags=["Logauditoria"])
api_router.include_router(sesiones_router, tags=["Sesion"])
api_router.include_router(parametros_router, tags=["Parametro"])
api_router.include_router(notificaciones_router, tags=["Notificacion"])
api_router.include_router(especialidades_router, tags=["Especialidad"])
api_router.include_router(consultorios_router, tags=["Consultorio"])
api_router.include_router(obras_sociales_router, tags=["ObraSocial"])
api_router.include_router(planes_obra_social_router, tags=["PlanObraSocial"])
api_router.include_router(pacientes_router, tags=["Paciente"])
api_router.include_router(antecedentes_paciente_router, tags=["AntecedentePaciente"])
api_router.include_router(alertas_medicas_router, tags=["AlertaMedica"])
api_router.include_router(medicos_router, tags=["Medico"])
api_router.include_router(agendas_medico_router, tags=["AgendaMedico"])
api_router.include_router(ausencias_medico_router, tags=["AusenciaMedico"])
api_router.include_router(turnos_router, tags=["Turno"])
api_router.include_router(lista_espera_router, tags=["ListaEspera"])
api_router.include_router(historias_clinicas_router, tags=["HistoriaClinica"])
api_router.include_router(evoluciones_router, tags=["Evolucion"])
api_router.include_router(signos_vitales_router, tags=["SignosVitales"])
api_router.include_router(categorias_estudio_router, tags=["CategoriaEstudio"])
api_router.include_router(tipos_estudio_router, tags=["TipoEstudio"])
api_router.include_router(ordenes_estudio_router, tags=["OrdenEstudio"])
api_router.include_router(medicamentos_router, tags=["Medicamento"])
api_router.include_router(recetas_router, tags=["Receta"])
api_router.include_router(detalles_receta_router, tags=["DetalleReceta"])
api_router.include_router(diagnosticos_router, tags=["Diagnostico"])
api_router.include_router(diagnosticos_paciente_router, tags=["DiagnosticoPaciente"])
api_router.include_router(departamentos_router, tags=["Departamento"])
api_router.include_router(empleados_router, tags=["Empleado"])
api_router.include_router(categorias_practica_router, tags=["CategoriaPractica"])
api_router.include_router(practicas_router, tags=["Practica"])
api_router.include_router(practicas_realizadas_router, tags=["PracticaRealizada"])
api_router.include_router(conceptos_facturacion_router, tags=["ConceptoFacturacion"])
api_router.include_router(facturas_router, tags=["Factura"])
api_router.include_router(detalles_factura_router, tags=["DetalleFactura"])
api_router.include_router(pagos_router, tags=["Pago"])
api_router.include_router(liquidaciones_obra_social_router, tags=["LiquidacionObraSocial"])
api_router.include_router(categorias_insumo_router, tags=["CategoriaInsumo"])
api_router.include_router(proveedores_router, tags=["Proveedor"])
api_router.include_router(insumos_router, tags=["Insumo"])
api_router.include_router(movimientos_insumo_router, tags=["MovimientoInsumo"])
api_router.include_router(consentimientos_router, tags=["Consentimiento"])
api_router.include_router(consentimientos_firmados_router, tags=["ConsentimientoFirmado"])
api_router.include_router(turnos_ausentes_router, tags=["Turnoausente"])
api_router.include_router(cancelaciones_turno_router, tags=["CancelacionTurno"])
api_router.include_router(encuestas_satisfaccion_router, tags=["EncuestaSatisfaccion"])
api_router.include_router(quejas_router, tags=["Queja"])
api_router.include_router(incidentes_router, tags=["Incidente"])
api_router.include_router(auditorias_medicas_router, tags=["AuditoriaMedica"])
api_router.include_router(recordatorios_router, tags=["Recordatorio"])
api_router.include_router(feriados_horarios_especiales_router, tags=["FeriadoHorarioEspecial"])
api_router.include_router(configuraciones_clinica_router, tags=["ConfiguracionClinica"])

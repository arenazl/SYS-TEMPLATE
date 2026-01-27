"""Modelos SQLModel - Generado automáticamente"""
from .enums import RolUsuario

from .organizacion import Organizacion, OrganizacionCreate, OrganizacionUpdate, OrganizacionResponse
from .usuario import Usuario, UsuarioCreate, UsuarioUpdate, UsuarioResponse
from .rol import Rol, RolCreate, RolUpdate, RolResponse
from .permiso import Permiso, PermisoCreate, PermisoUpdate, PermisoResponse
from .rolpermiso import Rolpermiso, RolpermisoCreate, RolpermisoUpdate, RolpermisoResponse
from .menu import Menu, MenuCreate, MenuUpdate, MenuResponse
from .menurol import Menurol, MenurolCreate, MenurolUpdate, MenurolResponse
from .logauditoria import Logauditoria, LogauditoriaCreate, LogauditoriaUpdate, LogauditoriaResponse
from .sesion import Sesion, SesionCreate, SesionUpdate, SesionResponse
from .parametro import Parametro, ParametroCreate, ParametroUpdate, ParametroResponse
from .notificacion import Notificacion, NotificacionCreate, NotificacionUpdate, NotificacionResponse
from .especialidad import Especialidad, EspecialidadCreate, EspecialidadUpdate, EspecialidadResponse
from .consultorio import Consultorio, ConsultorioCreate, ConsultorioUpdate, ConsultorioResponse
from .obrasocial import ObraSocial, ObraSocialCreate, ObraSocialUpdate, ObraSocialResponse
from .planobrasocial import PlanObraSocial, PlanObraSocialCreate, PlanObraSocialUpdate, PlanObraSocialResponse
from .paciente import Paciente, PacienteCreate, PacienteUpdate, PacienteResponse
from .antecedentepaciente import AntecedentePaciente, AntecedentePacienteCreate, AntecedentePacienteUpdate, AntecedentePacienteResponse
from .alertamedica import AlertaMedica, AlertaMedicaCreate, AlertaMedicaUpdate, AlertaMedicaResponse
from .medico import Medico, MedicoCreate, MedicoUpdate, MedicoResponse
from .agendamedico import AgendaMedico, AgendaMedicoCreate, AgendaMedicoUpdate, AgendaMedicoResponse
from .ausenciamedico import AusenciaMedico, AusenciaMedicoCreate, AusenciaMedicoUpdate, AusenciaMedicoResponse
from .turno import Turno, TurnoCreate, TurnoUpdate, TurnoResponse
from .listaespera import ListaEspera, ListaEsperaCreate, ListaEsperaUpdate, ListaEsperaResponse
from .historiaclinica import HistoriaClinica, HistoriaClinicaCreate, HistoriaClinicaUpdate, HistoriaClinicaResponse
from .evolucion import Evolucion, EvolucionCreate, EvolucionUpdate, EvolucionResponse
from .signosvitales import SignosVitales, SignosVitalesCreate, SignosVitalesUpdate, SignosVitalesResponse
from .categoriaestudio import CategoriaEstudio, CategoriaEstudioCreate, CategoriaEstudioUpdate, CategoriaEstudioResponse
from .tipoestudio import TipoEstudio, TipoEstudioCreate, TipoEstudioUpdate, TipoEstudioResponse
from .ordenestudio import OrdenEstudio, OrdenEstudioCreate, OrdenEstudioUpdate, OrdenEstudioResponse
from .medicamento import Medicamento, MedicamentoCreate, MedicamentoUpdate, MedicamentoResponse
from .receta import Receta, RecetaCreate, RecetaUpdate, RecetaResponse
from .detallereceta import DetalleReceta, DetalleRecetaCreate, DetalleRecetaUpdate, DetalleRecetaResponse
from .diagnostico import Diagnostico, DiagnosticoCreate, DiagnosticoUpdate, DiagnosticoResponse
from .diagnosticopaciente import DiagnosticoPaciente, DiagnosticoPacienteCreate, DiagnosticoPacienteUpdate, DiagnosticoPacienteResponse
from .departamento import Departamento, DepartamentoCreate, DepartamentoUpdate, DepartamentoResponse
from .empleado import Empleado, EmpleadoCreate, EmpleadoUpdate, EmpleadoResponse
from .categoriapractica import CategoriaPractica, CategoriaPracticaCreate, CategoriaPracticaUpdate, CategoriaPracticaResponse
from .practica import Practica, PracticaCreate, PracticaUpdate, PracticaResponse
from .practicarealizada import PracticaRealizada, PracticaRealizadaCreate, PracticaRealizadaUpdate, PracticaRealizadaResponse
from .conceptofacturacion import ConceptoFacturacion, ConceptoFacturacionCreate, ConceptoFacturacionUpdate, ConceptoFacturacionResponse
from .factura import Factura, FacturaCreate, FacturaUpdate, FacturaResponse
from .detallefactura import DetalleFactura, DetalleFacturaCreate, DetalleFacturaUpdate, DetalleFacturaResponse
from .pago import Pago, PagoCreate, PagoUpdate, PagoResponse
from .liquidacionobrasocial import LiquidacionObraSocial, LiquidacionObraSocialCreate, LiquidacionObraSocialUpdate, LiquidacionObraSocialResponse
from .categoriainsumo import CategoriaInsumo, CategoriaInsumoCreate, CategoriaInsumoUpdate, CategoriaInsumoResponse
from .proveedor import Proveedor, ProveedorCreate, ProveedorUpdate, ProveedorResponse
from .insumo import Insumo, InsumoCreate, InsumoUpdate, InsumoResponse
from .movimientoinsumo import MovimientoInsumo, MovimientoInsumoCreate, MovimientoInsumoUpdate, MovimientoInsumoResponse
from .consentimiento import Consentimiento, ConsentimientoCreate, ConsentimientoUpdate, ConsentimientoResponse
from .consentimientofirmado import ConsentimientoFirmado, ConsentimientoFirmadoCreate, ConsentimientoFirmadoUpdate, ConsentimientoFirmadoResponse
from .turnoausente import Turnoausente, TurnoausenteCreate, TurnoausenteUpdate, TurnoausenteResponse
from .cancelacionturno import CancelacionTurno, CancelacionTurnoCreate, CancelacionTurnoUpdate, CancelacionTurnoResponse
from .encuestasatisfaccion import EncuestaSatisfaccion, EncuestaSatisfaccionCreate, EncuestaSatisfaccionUpdate, EncuestaSatisfaccionResponse
from .queja import Queja, QuejaCreate, QuejaUpdate, QuejaResponse
from .incidente import Incidente, IncidenteCreate, IncidenteUpdate, IncidenteResponse
from .auditoriamedica import AuditoriaMedica, AuditoriaMedicaCreate, AuditoriaMedicaUpdate, AuditoriaMedicaResponse
from .recordatorio import Recordatorio, RecordatorioCreate, RecordatorioUpdate, RecordatorioResponse
from .feriadohorarioespecial import FeriadoHorarioEspecial, FeriadoHorarioEspecialCreate, FeriadoHorarioEspecialUpdate, FeriadoHorarioEspecialResponse
from .configuracionclinica import ConfiguracionClinica, ConfiguracionClinicaCreate, ConfiguracionClinicaUpdate, ConfiguracionClinicaResponse

__all__ = [
    "RolUsuario",
    "Organizacion",
    "OrganizacionCreate",
    "OrganizacionUpdate",
    "OrganizacionResponse",
    "Usuario",
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioResponse",
    "Rol",
    "RolCreate",
    "RolUpdate",
    "RolResponse",
    "Permiso",
    "PermisoCreate",
    "PermisoUpdate",
    "PermisoResponse",
    "Rolpermiso",
    "RolpermisoCreate",
    "RolpermisoUpdate",
    "RolpermisoResponse",
    "Menu",
    "MenuCreate",
    "MenuUpdate",
    "MenuResponse",
    "Menurol",
    "MenurolCreate",
    "MenurolUpdate",
    "MenurolResponse",
    "Logauditoria",
    "LogauditoriaCreate",
    "LogauditoriaUpdate",
    "LogauditoriaResponse",
    "Sesion",
    "SesionCreate",
    "SesionUpdate",
    "SesionResponse",
    "Parametro",
    "ParametroCreate",
    "ParametroUpdate",
    "ParametroResponse",
    "Notificacion",
    "NotificacionCreate",
    "NotificacionUpdate",
    "NotificacionResponse",
    "Especialidad",
    "EspecialidadCreate",
    "EspecialidadUpdate",
    "EspecialidadResponse",
    "Consultorio",
    "ConsultorioCreate",
    "ConsultorioUpdate",
    "ConsultorioResponse",
    "ObraSocial",
    "ObraSocialCreate",
    "ObraSocialUpdate",
    "ObraSocialResponse",
    "PlanObraSocial",
    "PlanObraSocialCreate",
    "PlanObraSocialUpdate",
    "PlanObraSocialResponse",
    "Paciente",
    "PacienteCreate",
    "PacienteUpdate",
    "PacienteResponse",
    "AntecedentePaciente",
    "AntecedentePacienteCreate",
    "AntecedentePacienteUpdate",
    "AntecedentePacienteResponse",
    "AlertaMedica",
    "AlertaMedicaCreate",
    "AlertaMedicaUpdate",
    "AlertaMedicaResponse",
    "Medico",
    "MedicoCreate",
    "MedicoUpdate",
    "MedicoResponse",
    "AgendaMedico",
    "AgendaMedicoCreate",
    "AgendaMedicoUpdate",
    "AgendaMedicoResponse",
    "AusenciaMedico",
    "AusenciaMedicoCreate",
    "AusenciaMedicoUpdate",
    "AusenciaMedicoResponse",
    "Turno",
    "TurnoCreate",
    "TurnoUpdate",
    "TurnoResponse",
    "ListaEspera",
    "ListaEsperaCreate",
    "ListaEsperaUpdate",
    "ListaEsperaResponse",
    "HistoriaClinica",
    "HistoriaClinicaCreate",
    "HistoriaClinicaUpdate",
    "HistoriaClinicaResponse",
    "Evolucion",
    "EvolucionCreate",
    "EvolucionUpdate",
    "EvolucionResponse",
    "SignosVitales",
    "SignosVitalesCreate",
    "SignosVitalesUpdate",
    "SignosVitalesResponse",
    "CategoriaEstudio",
    "CategoriaEstudioCreate",
    "CategoriaEstudioUpdate",
    "CategoriaEstudioResponse",
    "TipoEstudio",
    "TipoEstudioCreate",
    "TipoEstudioUpdate",
    "TipoEstudioResponse",
    "OrdenEstudio",
    "OrdenEstudioCreate",
    "OrdenEstudioUpdate",
    "OrdenEstudioResponse",
    "Medicamento",
    "MedicamentoCreate",
    "MedicamentoUpdate",
    "MedicamentoResponse",
    "Receta",
    "RecetaCreate",
    "RecetaUpdate",
    "RecetaResponse",
    "DetalleReceta",
    "DetalleRecetaCreate",
    "DetalleRecetaUpdate",
    "DetalleRecetaResponse",
    "Diagnostico",
    "DiagnosticoCreate",
    "DiagnosticoUpdate",
    "DiagnosticoResponse",
    "DiagnosticoPaciente",
    "DiagnosticoPacienteCreate",
    "DiagnosticoPacienteUpdate",
    "DiagnosticoPacienteResponse",
    "Departamento",
    "DepartamentoCreate",
    "DepartamentoUpdate",
    "DepartamentoResponse",
    "Empleado",
    "EmpleadoCreate",
    "EmpleadoUpdate",
    "EmpleadoResponse",
    "CategoriaPractica",
    "CategoriaPracticaCreate",
    "CategoriaPracticaUpdate",
    "CategoriaPracticaResponse",
    "Practica",
    "PracticaCreate",
    "PracticaUpdate",
    "PracticaResponse",
    "PracticaRealizada",
    "PracticaRealizadaCreate",
    "PracticaRealizadaUpdate",
    "PracticaRealizadaResponse",
    "ConceptoFacturacion",
    "ConceptoFacturacionCreate",
    "ConceptoFacturacionUpdate",
    "ConceptoFacturacionResponse",
    "Factura",
    "FacturaCreate",
    "FacturaUpdate",
    "FacturaResponse",
    "DetalleFactura",
    "DetalleFacturaCreate",
    "DetalleFacturaUpdate",
    "DetalleFacturaResponse",
    "Pago",
    "PagoCreate",
    "PagoUpdate",
    "PagoResponse",
    "LiquidacionObraSocial",
    "LiquidacionObraSocialCreate",
    "LiquidacionObraSocialUpdate",
    "LiquidacionObraSocialResponse",
    "CategoriaInsumo",
    "CategoriaInsumoCreate",
    "CategoriaInsumoUpdate",
    "CategoriaInsumoResponse",
    "Proveedor",
    "ProveedorCreate",
    "ProveedorUpdate",
    "ProveedorResponse",
    "Insumo",
    "InsumoCreate",
    "InsumoUpdate",
    "InsumoResponse",
    "MovimientoInsumo",
    "MovimientoInsumoCreate",
    "MovimientoInsumoUpdate",
    "MovimientoInsumoResponse",
    "Consentimiento",
    "ConsentimientoCreate",
    "ConsentimientoUpdate",
    "ConsentimientoResponse",
    "ConsentimientoFirmado",
    "ConsentimientoFirmadoCreate",
    "ConsentimientoFirmadoUpdate",
    "ConsentimientoFirmadoResponse",
    "Turnoausente",
    "TurnoausenteCreate",
    "TurnoausenteUpdate",
    "TurnoausenteResponse",
    "CancelacionTurno",
    "CancelacionTurnoCreate",
    "CancelacionTurnoUpdate",
    "CancelacionTurnoResponse",
    "EncuestaSatisfaccion",
    "EncuestaSatisfaccionCreate",
    "EncuestaSatisfaccionUpdate",
    "EncuestaSatisfaccionResponse",
    "Queja",
    "QuejaCreate",
    "QuejaUpdate",
    "QuejaResponse",
    "Incidente",
    "IncidenteCreate",
    "IncidenteUpdate",
    "IncidenteResponse",
    "AuditoriaMedica",
    "AuditoriaMedicaCreate",
    "AuditoriaMedicaUpdate",
    "AuditoriaMedicaResponse",
    "Recordatorio",
    "RecordatorioCreate",
    "RecordatorioUpdate",
    "RecordatorioResponse",
    "FeriadoHorarioEspecial",
    "FeriadoHorarioEspecialCreate",
    "FeriadoHorarioEspecialUpdate",
    "FeriadoHorarioEspecialResponse",
    "ConfiguracionClinica",
    "ConfiguracionClinicaCreate",
    "ConfiguracionClinicaUpdate",
    "ConfiguracionClinicaResponse",
]

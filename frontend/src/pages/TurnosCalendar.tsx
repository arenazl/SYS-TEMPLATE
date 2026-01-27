import { useState, useEffect, useMemo } from 'react';
import { Calendar, Filter, User, Stethoscope, Plus, X, Clock, Building2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import CalendarView from '../components/CalendarView';
import { Sheet } from '../components/ui/Sheet';
import api from '../lib/api';

interface Turno {
  id: number;
  paciente_id: number;
  medico_id: number;
  consultorio_id: number | null;
  especialidad_id: number;
  fecha: string;
  hora: string;
  duracion_minutos: number | null;
  estado: string;
  tipo: string;
  motivo_consulta: string | null;
  obra_social_id: number | null;
  canal_reserva: string;
  observaciones: string | null;
  paciente?: { id: number; nombre: string; apellido: string };
  medico?: { id: number; nombre: string; apellido: string };
  consultorio?: { id: number; numero: string };
  especialidad?: { id: number; nombre: string };
}

interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad_id: number;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
}

interface Especialidad {
  id: number;
  nombre: string;
}

interface Consultorio {
  id: number;
  numero: string;
}

// Colores por estado
const estadoColors: Record<string, string> = {
  pendiente: '#f59e0b',
  confirmado: '#3b82f6',
  en_espera: '#8b5cf6',
  en_atencion: '#06b6d4',
  atendido: '#22c55e',
  cancelado: '#ef4444',
  ausente: '#6b7280',
};

const tiposTurno = ['consulta', 'control', 'urgencia', 'estudios', 'procedimiento'];
const canalesReserva = ['presencial', 'telefono', 'web', 'app'];

export default function TurnosCalendar() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedMedicoId, setSelectedMedicoId] = useState<number | null>(null);
  const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Sheet para ver turno
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);

  // Sheet para crear turno
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [newTurno, setNewTurno] = useState({
    paciente_id: '',
    medico_id: '',
    consultorio_id: '',
    especialidad_id: '',
    fecha: '',
    hora: '09:00',
    duracion_minutos: 30,
    estado: 'pendiente',
    tipo: 'consulta',
    motivo_consulta: '',
    canal_reserva: 'presencial',
    observaciones: '',
  });
  const [saving, setSaving] = useState(false);

  // Detectar si el usuario es médico (buscar por email)
  const [currentMedico, setCurrentMedico] = useState<Medico | null>(null);

  const isAdmin = user?.rol === 'admin';

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Cargar médicos
        const medicosRes = await api.get('/medicos?activo=true&limit=500');
        const medicosData = medicosRes.data.items || [];
        setMedicos(medicosData);

        // Buscar si el usuario actual es un médico (por email)
        if (user && !isAdmin) {
          const medicoMatch = medicosData.find((m: Medico) =>
            m.email.toLowerCase() === user.email.toLowerCase()
          );
          if (medicoMatch) {
            setCurrentMedico(medicoMatch);
            setSelectedMedicoId(medicoMatch.id);
          }
        }

        // Cargar pacientes
        const pacientesRes = await api.get('/pacientes?activo=true&limit=500');
        setPacientes(pacientesRes.data.items || []);

        // Cargar especialidades
        const especialidadesRes = await api.get('/especialidades?activo=true&limit=100');
        setEspecialidades(especialidadesRes.data.items || []);

        // Cargar consultorios
        const consultoriosRes = await api.get('/consultorios?activo=true&limit=100');
        setConsultorios(consultoriosRes.data.items || []);

        // Cargar turnos
        await loadTurnos();

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAdmin]);

  // Cargar turnos con filtros
  const loadTurnos = async () => {
    try {
      let url = '/turnos?activo=true&limit=500';

      // Si no es admin y es médico, filtrar por su ID
      if (!isAdmin && currentMedico) {
        url += `&medico_id=${currentMedico.id}`;
      } else if (selectedMedicoId) {
        url += `&medico_id=${selectedMedicoId}`;
      }

      if (selectedPacienteId) {
        url += `&paciente_id=${selectedPacienteId}`;
      }

      if (selectedEstado) {
        url += `&estado=${selectedEstado}`;
      }

      const res = await api.get(url);
      setTurnos(res.data.items || []);
    } catch (error) {
      console.error('Error cargando turnos:', error);
    }
  };

  // Recargar cuando cambian los filtros
  useEffect(() => {
    if (!loading) {
      loadTurnos();
    }
  }, [selectedMedicoId, selectedPacienteId, selectedEstado, currentMedico]);

  // Convertir turnos a eventos del calendario
  const calendarEvents = useMemo(() => {
    return turnos.map(turno => {
      const [hours, minutes] = turno.hora.split(':').map(Number);
      const startDate = new Date(turno.fecha + 'T00:00:00');
      startDate.setHours(hours, minutes, 0, 0);

      const duracion = turno.duracion_minutos || 30;
      const endDate = new Date(startDate.getTime() + duracion * 60000);

      const pacienteNombre = turno.paciente
        ? `${turno.paciente.nombre} ${turno.paciente.apellido}`
        : 'Sin paciente';

      const medicoNombre = turno.medico
        ? `Dr. ${turno.medico.apellido}`
        : '';

      return {
        id: turno.id,
        title: `${turno.hora} - ${pacienteNombre}${medicoNombre ? ` (${medicoNombre})` : ''}`,
        startDate,
        endDate,
        color: estadoColors[turno.estado] || theme.primary,
        data: { ...turno } as Record<string, unknown>,
      };
    });
  }, [turnos, theme.primary]);

  const handleEventClick = (event: { id: number; data?: Record<string, unknown> }) => {
    if (event.data) {
      setSelectedTurno(event.data as unknown as Turno);
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setNewTurno(prev => ({
      ...prev,
      fecha: dateStr,
      medico_id: currentMedico ? String(currentMedico.id) : '',
      especialidad_id: currentMedico ? String(currentMedico.especialidad_id) : '',
    }));
    setShowCreateSheet(true);
  };

  const handleCreateTurno = async () => {
    try {
      setSaving(true);

      const payload = {
        paciente_id: Number(newTurno.paciente_id),
        medico_id: Number(newTurno.medico_id),
        consultorio_id: newTurno.consultorio_id ? Number(newTurno.consultorio_id) : null,
        especialidad_id: Number(newTurno.especialidad_id),
        fecha: newTurno.fecha,
        hora: newTurno.hora,
        duracion_minutos: newTurno.duracion_minutos,
        estado: newTurno.estado,
        tipo: newTurno.tipo,
        motivo_consulta: newTurno.motivo_consulta || null,
        canal_reserva: newTurno.canal_reserva,
        observaciones: newTurno.observaciones || null,
      };

      await api.post('/turnos', payload);

      // Resetear form y cerrar sheet
      setNewTurno({
        paciente_id: '',
        medico_id: '',
        consultorio_id: '',
        especialidad_id: '',
        fecha: '',
        hora: '09:00',
        duracion_minutos: 30,
        estado: 'pendiente',
        tipo: 'consulta',
        motivo_consulta: '',
        canal_reserva: 'presencial',
        observaciones: '',
      });
      setShowCreateSheet(false);

      // Recargar turnos
      await loadTurnos();

    } catch (error) {
      console.error('Error creando turno:', error);
      alert('Error al crear el turno');
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    if (isAdmin) {
      setSelectedMedicoId(null);
    }
    setSelectedPacienteId(null);
    setSelectedEstado(null);
  };

  const hasActiveFilters = (isAdmin && selectedMedicoId) || selectedPacienteId || selectedEstado;

  const openCreateSheet = () => {
    const today = new Date().toISOString().split('T')[0];
    setNewTurno(prev => ({
      ...prev,
      fecha: today,
      medico_id: currentMedico ? String(currentMedico.id) : '',
      especialidad_id: currentMedico ? String(currentMedico.especialidad_id) : '',
    }));
    setShowCreateSheet(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6" style={{ color: theme.primary }} />
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            {currentMedico && !isAdmin ? 'Mis Turnos' : 'Agenda de Turnos'}
          </h1>
          {currentMedico && !isAdmin && (
            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
            >
              Dr. {currentMedico.nombre} {currentMedico.apellido}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: showFilters ? `${theme.primary}15` : theme.card,
              color: showFilters ? theme.primary : theme.text,
              border: `1px solid ${showFilters ? theme.primary : theme.border}`,
            }}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.primary }}
              />
            )}
          </button>

          <button
            onClick={openCreateSheet}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.primary,
              color: 'white',
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo Turno
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div
          className="p-4 rounded-lg space-y-4"
          style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium" style={{ color: theme.text }}>Filtros</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: theme.primary }}
              >
                <X className="h-3 w-3" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(isAdmin || !currentMedico) && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                  <Stethoscope className="h-4 w-4 inline mr-1" />
                  Médico
                </label>
                <select
                  value={selectedMedicoId || ''}
                  onChange={(e) => setSelectedMedicoId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                >
                  <option value="">Todos los médicos</option>
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>
                      Dr. {m.nombre} {m.apellido}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                  <User className="h-4 w-4 inline mr-1" />
                  Paciente
                </label>
                <select
                  value={selectedPacienteId || ''}
                  onChange={(e) => setSelectedPacienteId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                >
                  <option value="">Todos los pacientes</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>
                Estado
              </label>
              <select
                value={selectedEstado || ''}
                onChange={(e) => setSelectedEstado(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="en_espera">En Espera</option>
                <option value="en_atencion">En Atención</option>
                <option value="atendido">Atendido</option>
                <option value="cancelado">Cancelado</option>
                <option value="ausente">Ausente</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2" style={{ borderTop: `1px solid ${theme.border}` }}>
            {Object.entries(estadoColors).map(([estado, color]) => (
              <div key={estado} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                <span style={{ color: theme.textSecondary }} className="capitalize">
                  {estado.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendario */}
      <CalendarView
        events={calendarEvents}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
      />

      {/* Sheet detalle turno */}
      <Sheet
        open={!!selectedTurno}
        onClose={() => setSelectedTurno(null)}
        title="Detalle del Turno"
        description={selectedTurno ? `${selectedTurno.fecha} - ${selectedTurno.hora}` : ''}
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTurno(null)}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
            >
              Cerrar
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: theme.primary, color: 'white' }}
            >
              Editar
            </button>
          </div>
        }
      >
        {selectedTurno && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded text-xs font-medium capitalize"
                style={{
                  backgroundColor: estadoColors[selectedTurno.estado] || theme.primary,
                  color: 'white'
                }}
              >
                {selectedTurno.estado.replace('_', ' ')}
              </span>
              <span
                className="px-2 py-1 rounded text-xs"
                style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
              >
                {selectedTurno.tipo}
              </span>
            </div>

            <div>
              <label className="text-xs" style={{ color: theme.textSecondary }}>Fecha y Hora</label>
              <p className="font-medium" style={{ color: theme.text }}>
                {new Date(selectedTurno.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} - {selectedTurno.hora}
              </p>
            </div>

            {selectedTurno.paciente && (
              <div>
                <label className="text-xs" style={{ color: theme.textSecondary }}>Paciente</label>
                <p className="font-medium" style={{ color: theme.text }}>
                  {selectedTurno.paciente.nombre} {selectedTurno.paciente.apellido}
                </p>
              </div>
            )}

            {selectedTurno.medico && (
              <div>
                <label className="text-xs" style={{ color: theme.textSecondary }}>Médico</label>
                <p className="font-medium" style={{ color: theme.text }}>
                  Dr. {selectedTurno.medico.nombre} {selectedTurno.medico.apellido}
                </p>
              </div>
            )}

            {selectedTurno.consultorio && (
              <div>
                <label className="text-xs" style={{ color: theme.textSecondary }}>Consultorio</label>
                <p className="font-medium" style={{ color: theme.text }}>
                  {selectedTurno.consultorio.numero}
                </p>
              </div>
            )}

            {selectedTurno.motivo_consulta && (
              <div>
                <label className="text-xs" style={{ color: theme.textSecondary }}>Motivo</label>
                <p style={{ color: theme.text }}>{selectedTurno.motivo_consulta}</p>
              </div>
            )}

            {selectedTurno.observaciones && (
              <div>
                <label className="text-xs" style={{ color: theme.textSecondary }}>Observaciones</label>
                <p style={{ color: theme.text }}>{selectedTurno.observaciones}</p>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Sheet crear turno */}
      <Sheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        title="Nuevo Turno"
        description="Complete los datos del turno"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateSheet(false)}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateTurno}
              disabled={saving || !newTurno.paciente_id || !newTurno.medico_id || !newTurno.especialidad_id || !newTurno.fecha || !newTurno.hora}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: theme.primary, color: 'white' }}
            >
              {saving ? 'Guardando...' : 'Crear Turno'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
              <User className="h-4 w-4 inline mr-1" />
              Paciente *
            </label>
            <select
              value={newTurno.paciente_id}
              onChange={(e) => setNewTurno(prev => ({ ...prev, paciente_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              required
            >
              <option value="">Seleccionar paciente...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Médico */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
              <Stethoscope className="h-4 w-4 inline mr-1" />
              Médico *
            </label>
            <select
              value={newTurno.medico_id}
              onChange={(e) => {
                const medicoId = e.target.value;
                const medico = medicos.find(m => m.id === Number(medicoId));
                setNewTurno(prev => ({
                  ...prev,
                  medico_id: medicoId,
                  especialidad_id: medico ? String(medico.especialidad_id) : prev.especialidad_id,
                }));
              }}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              disabled={!isAdmin && !!currentMedico}
              required
            >
              <option value="">Seleccionar médico...</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>
                  Dr. {m.nombre} {m.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
              Especialidad *
            </label>
            <select
              value={newTurno.especialidad_id}
              onChange={(e) => setNewTurno(prev => ({ ...prev, especialidad_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              required
            >
              <option value="">Seleccionar especialidad...</option>
              {especialidades.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha *
              </label>
              <input
                type="date"
                value={newTurno.fecha}
                onChange={(e) => setNewTurno(prev => ({ ...prev, fecha: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                <Clock className="h-4 w-4 inline mr-1" />
                Hora *
              </label>
              <input
                type="time"
                value={newTurno.hora}
                onChange={(e) => setNewTurno(prev => ({ ...prev, hora: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
                required
              />
            </div>
          </div>

          {/* Consultorio y Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                <Building2 className="h-4 w-4 inline mr-1" />
                Consultorio
              </label>
              <select
                value={newTurno.consultorio_id}
                onChange={(e) => setNewTurno(prev => ({ ...prev, consultorio_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                <option value="">Sin asignar</option>
                {consultorios.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.numero}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                Duración (min)
              </label>
              <input
                type="number"
                value={newTurno.duracion_minutos}
                onChange={(e) => setNewTurno(prev => ({ ...prev, duracion_minutos: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
                min={5}
                max={120}
              />
            </div>
          </div>

          {/* Tipo y Canal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                Tipo
              </label>
              <select
                value={newTurno.tipo}
                onChange={(e) => setNewTurno(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                {tiposTurno.map(t => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                Canal
              </label>
              <select
                value={newTurno.canal_reserva}
                onChange={(e) => setNewTurno(prev => ({ ...prev, canal_reserva: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                {canalesReserva.map(c => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
              Motivo de consulta
            </label>
            <input
              type="text"
              value={newTurno.motivo_consulta}
              onChange={(e) => setNewTurno(prev => ({ ...prev, motivo_consulta: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              placeholder="Opcional..."
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
              Observaciones
            </label>
            <textarea
              value={newTurno.observaciones}
              onChange={(e) => setNewTurno(prev => ({ ...prev, observaciones: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: theme.background,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              rows={2}
              placeholder="Opcional..."
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}

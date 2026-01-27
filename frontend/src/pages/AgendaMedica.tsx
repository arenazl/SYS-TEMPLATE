import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Calendar as CalendarIcon,
  Clock,
  X,
  GripVertical,
  Phone,
  FileText,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import api from '../lib/api';

// Types
interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidad?: { id: number; nombre: string; color?: string };
  duracion_turno: number;
  activo: boolean;
}

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  celular: string;
  obra_social?: { id: number; nombre: string };
}

interface Turno {
  id: number;
  paciente_id: number;
  medico_id: number;
  fecha: string;
  hora: string;
  duracion_minutos: number;
  estado: string;
  tipo: string;
  motivo_consulta?: string;
  paciente?: Paciente;
  medico?: Medico;
}

interface AgendaMedico {
  id: number;
  medico_id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  intervalo_minutos: number;
}

type ViewMode = 'day' | 'week' | 'month';

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const DIAS_SEMANA_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_SEMANA_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ESTADO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  disponible: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  reservado: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  confirmado: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  sala_espera: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
  en_atencion: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  atendido: { bg: '#d1d5db', text: '#374151', border: '#9ca3af' },
  cancelado: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  ausente: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

export default function AgendaMedica() {
  const { theme, isNeumorphic } = useTheme();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [agendas, setAgendas] = useState<AgendaMedico[]>([]);
  const [loading, setLoading] = useState(true);

  // Patient search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paciente[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Drag & Drop
  const [draggedPatient, setDraggedPatient] = useState<Paciente | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  // Modal for new turno
  const [showTurnoModal, setShowTurnoModal] = useState(false);
  const [newTurnoData, setNewTurnoData] = useState<{
    paciente: Paciente | null;
    medico: Medico | null;
    fecha: string;
    hora: string;
  } | null>(null);
  const [creatingTurno, setCreatingTurno] = useState(false);

  // Fetch médicos on mount
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const res = await api.get('/medicos?limit=100&activo=true');
        const medicosList = res.data.items || res.data || [];
        setMedicos(medicosList);
        if (medicosList.length > 0) {
          setSelectedMedico(medicosList[0]);
        }
      } catch (err) {
        console.error('Error fetching medicos:', err);
      }
    };
    fetchMedicos();
  }, []);

  // Fetch agendas when medico changes
  useEffect(() => {
    if (!selectedMedico) return;
    const fetchAgendas = async () => {
      try {
        const res = await api.get(`/agendas_medico?medico_id=${selectedMedico.id}&activo=true&limit=100`);
        setAgendas(res.data.items || res.data || []);
      } catch (err) {
        console.error('Error fetching agendas:', err);
      }
    };
    fetchAgendas();
  }, [selectedMedico]);

  // Fetch turnos when date or medico changes
  useEffect(() => {
    if (!selectedMedico) return;

    const fetchTurnos = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = getDateRange();
        const startStr = formatDateForAPI(startDate);
        const endStr = formatDateForAPI(endDate);

        // Fetch turnos for the selected medico and date range using API filters
        const res = await api.get(
          `/turnos?medico_id=${selectedMedico.id}&fecha_desde=${startStr}&fecha_hasta=${endStr}&limit=500&activo=true`
        );
        const turnosList = res.data.items || res.data || [];
        setTurnos(turnosList);
      } catch (err) {
        console.error('Error fetching turnos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTurnos();
  }, [selectedMedico, currentDate, viewMode]);

  // Search patients
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchPatients = async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/pacientes?search=${encodeURIComponent(searchQuery)}&limit=10&activo=true`);
        const results = res.data.items || res.data || [];
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Error searching patients:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper functions
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'day') {
      // Single day
    } else if (viewMode === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return { startDate: start, endDate: end };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const days: Date[] = [];
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getTimeSlots = (date: Date) => {
    const dayName = DIAS_SEMANA[date.getDay()];
    const agenda = agendas.find(a => a.dia_semana === dayName);

    if (!agenda) {
      // Default hours if no agenda defined
      return generateTimeSlots('08:00', '18:00', selectedMedico?.duracion_turno || 30);
    }

    return generateTimeSlots(agenda.hora_inicio, agenda.hora_fin, agenda.intervalo_minutos);
  };

  const generateTimeSlots = (start: string, end: string, interval: number) => {
    const slots: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      currentMinutes += interval;
    }

    return slots;
  };

  const getTurnoForSlot = (date: Date, hora: string) => {
    const dateStr = formatDateForAPI(date);
    return turnos.find(t => t.fecha === dateStr && t.hora === hora);
  };

  const getSlotKey = (date: Date, hora: string) => {
    return `${formatDateForAPI(date)}-${hora}`;
  };

  // Drag & Drop handlers
  const handleDragStart = (paciente: Paciente) => {
    setDraggedPatient(paciente);
  };

  const handleDragEnd = () => {
    setDraggedPatient(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotKey: string) => {
    e.preventDefault();
    setDragOverSlot(slotKey);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date, hora: string) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!draggedPatient || !selectedMedico) return;

    // Check if slot is already taken
    const existingTurno = getTurnoForSlot(date, hora);
    if (existingTurno) {
      alert('Este horario ya está ocupado');
      return;
    }

    // Open modal to confirm new turno
    setNewTurnoData({
      paciente: draggedPatient,
      medico: selectedMedico,
      fecha: formatDateForAPI(date),
      hora: hora,
    });
    setShowTurnoModal(true);
    setDraggedPatient(null);
  };

  const createTurno = async () => {
    if (!newTurnoData || !newTurnoData.paciente || !newTurnoData.medico) return;

    setCreatingTurno(true);
    try {
      const turnoData = {
        paciente_id: newTurnoData.paciente.id,
        medico_id: newTurnoData.medico.id,
        especialidad_id: newTurnoData.medico.especialidad?.id || 1,
        fecha: newTurnoData.fecha,
        hora: newTurnoData.hora,
        duracion_minutos: newTurnoData.medico.duracion_turno || 30,
        estado: 'reservado',
        tipo: 'primera_vez',
        canal_reserva: 'presencial',
      };

      await api.post('/turnos', turnoData);

      // Refresh turnos
      const { startDate, endDate } = getDateRange();
      const startStr = formatDateForAPI(startDate);
      const endStr = formatDateForAPI(endDate);
      const res = await api.get(
        `/turnos?medico_id=${selectedMedico?.id}&fecha_desde=${startStr}&fecha_hasta=${endStr}&limit=500&activo=true`
      );
      const turnosList = res.data.items || res.data || [];
      setTurnos(turnosList);

      setShowTurnoModal(false);
      setNewTurnoData(null);
    } catch (err) {
      console.error('Error creating turno:', err);
      alert('Error al crear el turno');
    } finally {
      setCreatingTurno(false);
    }
  };

  // Format helpers
  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('es-AR', { ...options, day: 'numeric', weekday: 'long' });
    } else if (viewMode === 'week') {
      const { startDate, endDate } = getDateRange();
      const startStr = startDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
      const endStr = endDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
    return currentDate.toLocaleDateString('es-AR', options);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Render time slot cell
  const renderTimeSlot = (date: Date, hora: string) => {
    const turno = getTurnoForSlot(date, hora);
    const slotKey = getSlotKey(date, hora);
    const isDragOver = dragOverSlot === slotKey;
    const isPast = new Date(`${formatDateForAPI(date)}T${hora}`) < new Date();

    if (turno) {
      const colors = ESTADO_COLORS[turno.estado] || ESTADO_COLORS.reservado;
      return (
        <div
          className="h-full min-h-[60px] p-1 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: colors.bg,
            borderLeft: `3px solid ${colors.border}`
          }}
          title={`${turno.paciente?.nombre} ${turno.paciente?.apellido} - ${turno.estado}`}
        >
          <div className="text-xs font-medium truncate" style={{ color: colors.text }}>
            {turno.paciente?.apellido}, {turno.paciente?.nombre}
          </div>
          <div className="text-[10px] opacity-75" style={{ color: colors.text }}>
            {turno.tipo} • {turno.estado}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`h-full min-h-[60px] rounded-lg border-2 border-dashed transition-all ${
          isDragOver ? 'border-green-500 bg-green-50' : 'border-transparent hover:border-gray-300'
        } ${isPast ? 'opacity-50' : ''}`}
        onDragOver={(e) => !isPast && handleDragOver(e, slotKey)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => !isPast && handleDrop(e, date, hora)}
      />
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div
        className={`flex-shrink-0 p-4 flex items-center justify-between gap-4 ${isNeumorphic ? 'neu-raised' : ''}`}
        style={{
          backgroundColor: theme.card,
          borderBottom: isNeumorphic ? 'none' : `1px solid ${theme.border}`
        }}
      >
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: theme.textSecondary }} />
            <input
              type="text"
              placeholder="Buscar paciente por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl outline-none ${isNeumorphic ? 'neu-input' : ''}`}
              style={{
                backgroundColor: isNeumorphic ? theme.card : theme.backgroundSecondary,
                border: isNeumorphic ? 'none' : `1px solid ${theme.border}`,
                color: theme.text,
              }}
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" style={{ color: theme.primary }} />
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div
              className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto ${isNeumorphic ? 'neu-raised' : ''}`}
              style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
            >
              <div className="p-2 text-xs font-medium" style={{ color: theme.textSecondary }}>
                Arrastrá un paciente al calendario
              </div>
              {searchResults.map((paciente) => (
                <div
                  key={paciente.id}
                  draggable
                  onDragStart={() => handleDragStart(paciente)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-3 p-3 cursor-grab hover:bg-opacity-50 transition-colors"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  <GripVertical className="h-4 w-4 flex-shrink-0" style={{ color: theme.textSecondary }} />
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: theme.text }}>
                      {paciente.apellido}, {paciente.nombre}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>
                      DNI: {paciente.documento} • {paciente.obra_social?.nombre || 'Particular'}
                    </div>
                  </div>
                  <Phone className="h-4 w-4 flex-shrink-0" style={{ color: theme.textSecondary }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div
          className={`flex rounded-xl p-1 ${isNeumorphic ? 'neu-pressed' : ''}`}
          style={{ backgroundColor: isNeumorphic ? theme.card : theme.backgroundSecondary }}
        >
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${isNeumorphic && viewMode === mode ? 'neu-button' : ''}`}
              style={{
                backgroundColor: viewMode === mode ? (isNeumorphic ? theme.card : theme.primary) : 'transparent',
                color: viewMode === mode ? (isNeumorphic ? theme.primary : 'white') : theme.textSecondary,
              }}
            >
              {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isNeumorphic ? 'neu-button' : ''}`}
            style={{
              backgroundColor: isNeumorphic ? theme.card : theme.backgroundSecondary,
              color: theme.text,
              border: isNeumorphic ? 'none' : `1px solid ${theme.border}`
            }}
          >
            Hoy
          </button>
          <div className="flex items-center">
            <button
              onClick={() => navigateDate('prev')}
              className={`p-2 rounded-lg transition-all ${isNeumorphic ? 'neu-button' : ''}`}
              style={{ color: theme.textSecondary }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 font-semibold min-w-[200px] text-center" style={{ color: theme.text }}>
              {formatDateHeader()}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className={`p-2 rounded-lg transition-all ${isNeumorphic ? 'neu-button' : ''}`}
              style={{ color: theme.textSecondary }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Médicos */}
        <div
          className={`flex-shrink-0 w-64 flex flex-col ${isNeumorphic ? 'neu-raised' : ''}`}
          style={{
            backgroundColor: theme.card,
            borderRight: isNeumorphic ? 'none' : `1px solid ${theme.border}`
          }}
        >
          <div className="p-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <h2 className="font-semibold flex items-center gap-2" style={{ color: theme.text }}>
              <User className="h-4 w-4" />
              Médicos
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {medicos.map((medico) => (
              <button
                key={medico.id}
                onClick={() => setSelectedMedico(medico)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedMedico?.id === medico.id
                    ? isNeumorphic ? 'neu-pressed' : ''
                    : isNeumorphic ? 'hover:neu-subtle' : ''
                }`}
                style={{
                  backgroundColor: selectedMedico?.id === medico.id
                    ? (isNeumorphic ? theme.card : `${theme.primary}15`)
                    : 'transparent',
                  color: selectedMedico?.id === medico.id ? theme.primary : theme.text,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      backgroundColor: medico.especialidad?.color || theme.primary
                    }}
                  >
                    {medico.nombre[0]}{medico.apellido[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      Dr. {medico.apellido}
                    </div>
                    <div className="text-xs truncate" style={{ color: theme.textSecondary }}>
                      {medico.especialidad?.nombre || 'General'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.primary }} />
            </div>
          ) : viewMode === 'week' ? (
            // Week View
            <div className="flex-1 flex flex-col min-h-0">
              {/* Week Header */}
              <div
                className="flex-shrink-0 grid grid-cols-8 gap-px"
                style={{ backgroundColor: theme.border }}
              >
                <div
                  className="p-2 text-center text-xs font-medium"
                  style={{ backgroundColor: theme.backgroundSecondary, color: theme.textSecondary }}
                >
                  <Clock className="h-4 w-4 mx-auto" />
                </div>
                {getWeekDays().map((day, i) => (
                  <div
                    key={i}
                    className={`p-2 text-center ${isToday(day) ? 'font-bold' : ''}`}
                    style={{
                      backgroundColor: isToday(day) ? `${theme.primary}10` : theme.backgroundSecondary,
                      color: isToday(day) ? theme.primary : theme.text
                    }}
                  >
                    <div className="text-xs font-medium">{DIAS_SEMANA_LABEL[i]}</div>
                    <div className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>{day.getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Week Grid */}
              <div className="flex-1 overflow-y-auto" style={{ backgroundColor: theme.border }}>
                <div className="grid grid-cols-8 gap-px">
                  {/* Get all unique time slots across the week */}
                  {(() => {
                    const weekDays = getWeekDays();
                    const allSlots = new Set<string>();
                    weekDays.forEach(day => {
                      getTimeSlots(day).forEach(slot => allSlots.add(slot));
                    });
                    const sortedSlots = Array.from(allSlots).sort();

                    return sortedSlots.map((hora) => (
                      <>
                        {/* Time Label */}
                        <div
                          key={`time-${hora}`}
                          className="p-2 text-xs font-medium text-center"
                          style={{ backgroundColor: theme.backgroundSecondary, color: theme.textSecondary }}
                        >
                          {hora}
                        </div>
                        {/* Day Cells */}
                        {weekDays.map((day, dayIndex) => (
                          <div
                            key={`${dayIndex}-${hora}`}
                            className="p-1"
                            style={{ backgroundColor: theme.card }}
                          >
                            {renderTimeSlot(day, hora)}
                          </div>
                        ))}
                      </>
                    ));
                  })()}
                </div>
              </div>
            </div>
          ) : viewMode === 'day' ? (
            // Day View
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto space-y-2">
                {getTimeSlots(currentDate).map((hora) => (
                  <div
                    key={hora}
                    className={`flex gap-4 p-2 rounded-xl ${isNeumorphic ? 'neu-subtle' : ''}`}
                    style={{ backgroundColor: theme.card }}
                  >
                    <div
                      className="w-16 text-sm font-medium flex-shrink-0 pt-2"
                      style={{ color: theme.textSecondary }}
                    >
                      {hora}
                    </div>
                    <div className="flex-1">
                      {renderTimeSlot(currentDate, hora)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Month View
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {DIAS_SEMANA_LABEL.map((dia) => (
                  <div
                    key={dia}
                    className="p-2 text-center text-xs font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    {dia}
                  </div>
                ))}

                {/* Calendar Days */}
                {(() => {
                  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                  const startPadding = firstDay.getDay();
                  const days: (Date | null)[] = [];

                  // Add padding for days before the first day of month
                  for (let i = 0; i < startPadding; i++) {
                    days.push(null);
                  }

                  // Add all days of the month
                  for (let d = 1; d <= lastDay.getDate(); d++) {
                    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
                  }

                  return days.map((day, i) => {
                    if (!day) {
                      return <div key={`empty-${i}`} className="p-2" />;
                    }

                    const dayTurnos = turnos.filter(t => t.fecha === formatDateForAPI(day));

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => {
                          setCurrentDate(day);
                          setViewMode('day');
                        }}
                        className={`p-2 min-h-[80px] rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                          isToday(day) ? (isNeumorphic ? 'neu-pressed' : '') : (isNeumorphic ? 'neu-subtle' : '')
                        }`}
                        style={{
                          backgroundColor: isToday(day) ? `${theme.primary}15` : theme.card,
                          border: isToday(day) ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`,
                        }}
                      >
                        <div
                          className={`text-sm font-medium ${isToday(day) ? 'font-bold' : ''}`}
                          style={{ color: isToday(day) ? theme.primary : theme.text }}
                        >
                          {day.getDate()}
                        </div>
                        {dayTurnos.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {dayTurnos.slice(0, 3).map((turno) => {
                              const colors = ESTADO_COLORS[turno.estado] || ESTADO_COLORS.reservado;
                              return (
                                <div
                                  key={turno.id}
                                  className="text-[10px] px-1 py-0.5 rounded truncate"
                                  style={{ backgroundColor: colors.bg, color: colors.text }}
                                >
                                  {turno.hora} {turno.paciente?.apellido}
                                </div>
                              );
                            })}
                            {dayTurnos.length > 3 && (
                              <div className="text-[10px]" style={{ color: theme.textSecondary }}>
                                +{dayTurnos.length - 3} más
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Turno Modal */}
      {showTurnoModal && newTurnoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-md rounded-2xl p-6 ${isNeumorphic ? 'neu-raised' : ''}`}
            style={{ backgroundColor: theme.card }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                Confirmar Turno
              </h3>
              <button
                onClick={() => {
                  setShowTurnoModal(false);
                  setNewTurnoData(null);
                }}
                className="p-1 rounded-lg hover:bg-opacity-50 transition-colors"
                style={{ color: theme.textSecondary }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: theme.backgroundSecondary }}>
                <User className="h-5 w-5" style={{ color: theme.primary }} />
                <div>
                  <div className="font-medium" style={{ color: theme.text }}>
                    {newTurnoData.paciente?.apellido}, {newTurnoData.paciente?.nombre}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    DNI: {newTurnoData.paciente?.documento}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: theme.backgroundSecondary }}>
                <CalendarIcon className="h-5 w-5" style={{ color: theme.primary }} />
                <div>
                  <div className="font-medium" style={{ color: theme.text }}>
                    {new Date(newTurnoData.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                    {newTurnoData.hora} hs - Dr. {newTurnoData.medico?.apellido}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTurnoModal(false);
                  setNewTurnoData(null);
                }}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${isNeumorphic ? 'neu-button' : ''}`}
                style={{
                  backgroundColor: isNeumorphic ? theme.card : theme.backgroundSecondary,
                  color: theme.text,
                  border: isNeumorphic ? 'none' : `1px solid ${theme.border}`
                }}
              >
                Cancelar
              </button>
              <button
                onClick={createTurno}
                disabled={creatingTurno}
                className={`flex-1 py-2.5 rounded-xl font-medium text-white transition-all disabled:opacity-50 ${isNeumorphic ? 'neu-gradient-primary' : ''}`}
                style={{ backgroundColor: isNeumorphic ? undefined : theme.primary }}
              >
                {creatingTurno ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    Confirmar
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag indicator */}
      {draggedPatient && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg z-50"
          style={{ backgroundColor: theme.primary, color: 'white' }}
        >
          <span className="flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            Arrastrando: {draggedPatient.apellido}, {draggedPatient.nombre}
          </span>
        </div>
      )}
    </div>
  );
}

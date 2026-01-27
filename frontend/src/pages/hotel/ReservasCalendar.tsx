import { useState, useEffect, useMemo } from 'react';
import { Calendar, List, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import CalendarView from '../../components/CalendarView';
import DynamicABM from '../../components/DynamicABM';
import { DynamicForm } from '../../components/DynamicABM/DynamicForm';
import { getEntityByPlural } from '../../config/entityRegistry';
import { ABMSheetFooter } from '../../components/ui/ABMPage';

interface Reserva {
  id: number;
  codigo: string;
  huesped_id: number;
  habitacion_id: number;
  fecha_entrada: string;
  fecha_salida: string;
  estado: string;
  precio_total: number;
  huesped?: {
    nombre: string;
    apellido: string;
  };
  habitacion?: {
    numero: string;
  };
  activo: boolean;
}

export default function ReservasCalendar() {
  const { theme } = useTheme();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showNewReservaForm, setShowNewReservaForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [fkOptions, setFkOptions] = useState<Record<string, { id: number; [key: string]: unknown }[]>>({});

  // Configuración de la entidad
  const entityConfig = useMemo(() => getEntityByPlural('reservas'), []);

  // Cargar reservas
  const fetchReservas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservas?limit=500&activo=true');
      setReservas(res.data.items || []);
    } catch (err) {
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar opciones de FK
  const loadFkOptions = async () => {
    if (!entityConfig) return;

    const fkFields = entityConfig.fields.filter(f => f.type === 'fk' && f.fkEntity);
    const options: Record<string, { id: number; [key: string]: unknown }[]> = {};

    await Promise.all(
      fkFields.map(async (field) => {
        try {
          const table = field.fkTable || field.fkEntity!.toLowerCase() + 's';
          const res = await api.get(`/${table}?limit=500&activo=true`);
          options[field.name] = res.data.items || [];
        } catch {
          options[field.name] = [];
        }
      })
    );

    setFkOptions(options);
  };

  useEffect(() => {
    fetchReservas();
    loadFkOptions();
  }, []);

  // Convertir reservas a eventos de calendario
  const calendarEvents = reservas.map(reserva => ({
    id: reserva.id,
    title: `${reserva.codigo} - ${reserva.huesped?.nombre || 'Sin huésped'}`,
    startDate: new Date(reserva.fecha_entrada),
    endDate: new Date(reserva.fecha_salida),
    color: getEstadoColor(reserva.estado),
    data: reserva,
  }));

  const handleEventClick = (event: any) => {
    setSelectedReserva(event.data as Reserva);
  };

  const handleDateClick = (date: Date) => {
    console.log('Fecha seleccionada:', date);
    setShowNewReservaForm(true);
  };

  const handleNewReserva = () => {
    setFormData({ fecha_reserva: new Date().toISOString().split('T')[0] });
    setShowNewReservaForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/reservas', formData);
      toast.success('Reserva creada');
      setShowNewReservaForm(false);
      setFormData({});
      fetchReservas();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error al crear reserva');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.primary }} />
      </div>
    );
  }

  // Si está en vista de lista, usar el DynamicABM
  if (view === 'list') {
    return (
      <div>
        {/* Header con toggle */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Reservas
          </h1>
          <div
            className="flex rounded-lg p-1"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
          >
            <button
              onClick={() => setView('calendar')}
              className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: view === 'calendar' ? theme.primary : 'transparent',
                color: view === 'calendar' ? 'white' : theme.textSecondary,
              }}
            >
              <Calendar className="h-4 w-4" />
              Calendario
            </button>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: view === 'list' ? theme.primary : 'transparent',
                color: view === 'list' ? 'white' : theme.textSecondary,
              }}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
          </div>
        </div>

        {/* DynamicABM */}
        <DynamicABM entityOverride="reservas" />
      </div>
    );
  }

  // Vista de calendario
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          Reservas
        </h1>

        <div className="flex items-center gap-3">
          {/* Toggle de vista */}
          <div
            className="flex rounded-lg p-1"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
          >
            <button
              onClick={() => setView('calendar')}
              className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: view === 'calendar' ? theme.primary : 'transparent',
                color: view === 'calendar' ? 'white' : theme.textSecondary,
              }}
            >
              <Calendar className="h-4 w-4" />
              Calendario
            </button>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: view === 'list' ? theme.primary : 'transparent',
                color: view === 'list' ? 'white' : theme.textSecondary,
              }}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
          </div>

          {/* Botón nueva reserva */}
          <button
            onClick={handleNewReserva}
            className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: theme.primary,
              color: 'white',
            }}
          >
            <Plus className="h-4 w-4" />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Calendario */}
      <CalendarView
        events={calendarEvents}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
      />

      {/* Panel de detalles de reserva seleccionada */}
      {selectedReserva && (
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: theme.text }}>
              Reserva {selectedReserva.codigo}
            </h3>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: getEstadoColor(selectedReserva.estado) }}
            >
              {selectedReserva.estado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Huésped
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {selectedReserva.huesped?.nombre} {selectedReserva.huesped?.apellido}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Habitación
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {selectedReserva.habitacion?.numero}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Entrada
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {new Date(selectedReserva.fecha_entrada).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Salida
              </p>
              <p className="text-base" style={{ color: theme.text }}>
                {new Date(selectedReserva.fecha_salida).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                Precio Total
              </p>
              <p className="text-base font-bold" style={{ color: theme.primary }}>
                ${selectedReserva.precio_total?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal/Sheet para nueva reserva */}
      {showNewReservaForm && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowNewReservaForm(false)}
          />

          {/* Sheet */}
          <div
            className="fixed right-0 top-0 h-full w-full sm:w-[600px] z-50 overflow-y-auto"
            style={{
              backgroundColor: theme.background,
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-6"
              style={{
                backgroundColor: theme.card,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                Nueva Reserva
              </h2>
              <button
                onClick={() => setShowNewReservaForm(false)}
                className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
                style={{ backgroundColor: `${theme.border}50` }}
              >
                <X className="h-5 w-5" style={{ color: theme.text }} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              {entityConfig && (
                <DynamicForm
                  fields={entityConfig.fields}
                  formData={formData}
                  onChange={setFormData}
                  fkOptions={fkOptions}
                />
              )}
            </div>

            {/* Footer */}
            <div
              className="sticky bottom-0 p-6"
              style={{
                backgroundColor: theme.card,
                borderTop: `1px solid ${theme.border}`,
              }}
            >
              <ABMSheetFooter
                onCancel={() => setShowNewReservaForm(false)}
                onSave={handleSubmit}
                saving={saving}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getEstadoColor(estado: string): string {
  const colors: Record<string, string> = {
    pendiente: '#f59e0b',
    confirmada: '#3b82f6',
    checkin: '#8b5cf6',
    checkout: '#06b6d4',
    cancelada: '#ef4444',
    noshow: '#6b7280',
  };
  return colors[estado.toLowerCase()] || '#6b7280';
}

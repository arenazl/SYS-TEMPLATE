import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CalendarEvent {
  id: number;
  title: string;
  startDate: Date;
  endDate: Date;
  color?: string;
  data?: Record<string, unknown>;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export default function CalendarView({ events, onEventClick, onDateClick }: CalendarViewProps) {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  // Obtener días del mes actual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Verificar si una fecha tiene eventos
  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return [];

    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Normalizar fechas para comparación (solo día, mes, año)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startOnly = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const endOnly = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());

      return dateOnly >= startOnly && dateOnly <= endOnly;
    });
  };

  // Navegación
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold capitalize" style={{ color: theme.text }}>
            {monthName}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: `${theme.primary}15`,
              color: theme.primary,
            }}
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-lg p-1"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
          >
            <button
              onClick={() => setView('month')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: view === 'month' ? theme.primary : 'transparent',
                color: view === 'month' ? 'white' : theme.textSecondary,
              }}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: view === 'week' ? theme.primary : 'transparent',
                color: view === 'week' ? 'white' : theme.textSecondary,
              }}
            >
              Semana
            </button>
          </div>

          {/* Navigation */}
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
      >
        {/* Week days header */}
        <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${theme.border}` }}>
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-bold"
              style={{ color: theme.textSecondary }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const today = isToday(date);

            return (
              <div
                key={index}
                onClick={() => date && onDateClick?.(date)}
                className="min-h-[120px] p-2 transition-colors cursor-pointer"
                style={{
                  borderRight: (index + 1) % 7 !== 0 ? `1px solid ${theme.border}` : 'none',
                  borderBottom: index < days.length - 7 ? `1px solid ${theme.border}` : 'none',
                  backgroundColor: !date ? `${theme.background}50` : today ? `${theme.primary}08` : 'transparent',
                }}
              >
                {date && (
                  <>
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-semibold ${today ? 'w-7 h-7 flex items-center justify-center rounded-full' : ''}`}
                        style={{
                          color: today ? 'white' : theme.text,
                          backgroundColor: today ? theme.primary : 'transparent',
                        }}
                      >
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${theme.primary}20`,
                            color: theme.primary,
                          }}
                        >
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          className="text-xs p-1.5 rounded truncate cursor-pointer transition-all hover:scale-[1.02]"
                          style={{
                            backgroundColor: event.color || theme.primary,
                            color: 'white',
                          }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div
                          className="text-xs p-1 text-center rounded"
                          style={{
                            color: theme.textSecondary,
                            backgroundColor: `${theme.border}50`,
                          }}
                        >
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm" style={{ color: theme.textSecondary }}>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: theme.primary }}
          />
          <span>Reservas</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{events.length} total</span>
        </div>
      </div>
    </div>
  );
}

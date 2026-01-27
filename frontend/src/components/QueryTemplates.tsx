import { useTheme } from '../contexts/ThemeContext';
import {
  Sparkles, BarChart2, Clock, MapPin, Users, TrendingUp,
  Calendar, DollarSign, CheckCircle2, AlertCircle
} from 'lucide-react';

interface Template {
  id: string;
  label: string;
  icon: React.ReactNode;
  query: string;
  formato?: string;
  color: string;
}

interface QueryTemplatesProps {
  onExecute: (query: string, formato?: string) => void;
  loading: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: 'reservas_estado',
    label: 'Reservas por estado',
    icon: <Calendar className="h-4 w-4" />,
    query: '¿Cuántas reservas tenemos por estado?',
    formato: 'cards',
    color: '#3b82f6',
  },
  {
    id: 'habitaciones_estado',
    label: 'Estado de habitaciones',
    icon: <BarChart2 className="h-4 w-4" />,
    query: '¿Cuál es el estado actual de las habitaciones?',
    formato: 'dashboard',
    color: '#10b981',
  },
  {
    id: 'huespedes_top',
    label: 'Top huéspedes',
    icon: <Users className="h-4 w-4" />,
    query: '¿Cuáles son los huéspedes con más reservas?',
    formato: 'ranking',
    color: '#f59e0b',
  },
  {
    id: 'servicios_consumidos',
    label: 'Servicios más consumidos',
    icon: <TrendingUp className="h-4 w-4" />,
    query: '¿Cuáles son los servicios más consumidos?',
    formato: 'ranking',
    color: '#8b5cf6',
  },
  {
    id: 'empleados_ranking',
    label: 'Ranking empleados',
    icon: <CheckCircle2 className="h-4 w-4" />,
    query: '¿Cuál es el ranking de empleados por tareas completadas?',
    formato: 'ranking',
    color: '#ec4899',
  },
  {
    id: 'tipos_habitacion',
    label: 'Tipos más reservados',
    icon: <MapPin className="h-4 w-4" />,
    query: '¿Cuáles son los tipos de habitación más reservados?',
    formato: 'cards',
    color: '#06b6d4',
  },
  {
    id: 'facturacion',
    label: 'Facturación del mes',
    icon: <DollarSign className="h-4 w-4" />,
    query: '¿Cuál es la facturación del último mes?',
    formato: 'dashboard',
    color: '#059669',
  },
  {
    id: 'checkins_hoy',
    label: 'Check-ins de hoy',
    icon: <Clock className="h-4 w-4" />,
    query: '¿Cuáles son los check-ins programados para hoy?',
    formato: 'timeline',
    color: '#f59e0b',
  },
  {
    id: 'quejas_abiertas',
    label: 'Quejas abiertas',
    icon: <AlertCircle className="h-4 w-4" />,
    query: '¿Cuáles son las quejas que están abiertas?',
    formato: 'table',
    color: '#ef4444',
  },
];

export default function QueryTemplates({ onExecute, loading }: QueryTemplatesProps) {
  const { theme } = useTheme();

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: theme.border }}>
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: theme.text }}>
          <Sparkles className="h-4 w-4" style={{ color: theme.primary }} />
          Consultas Rápidas
        </h3>
        <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
          Análisis predefinidos para el hotel
        </p>
      </div>

      {/* Lista de templates */}
      <div className="p-2 space-y-1.5 max-h-[600px] overflow-y-auto">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onExecute(template.query, template.formato)}
            disabled={loading}
            className="w-full flex items-center gap-2 p-2.5 rounded-lg text-sm text-left transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.backgroundSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${template.color}20` }}
            >
              <span style={{ color: template.color }}>{template.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate" style={{ color: theme.text }}>
                {template.label}
              </div>
              {template.formato && (
                <div className="text-xs mt-0.5 opacity-60" style={{ color: theme.textSecondary }}>
                  Vista: {template.formato}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

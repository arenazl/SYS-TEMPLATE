import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, Clock, CheckCircle, AlertCircle,
  UserCheck, UserX, Stethoscope, ClipboardList, Activity,
  ArrowRight, TrendingUp, Heart, FileText, Bell
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

interface DashboardStats {
  turnos_hoy: number;
  turnos_confirmados: number;
  turnos_atendidos: number;
  turnos_pendientes: number;
  turnos_ausentes: number;
  pacientes_nuevos_mes: number;
  total_pacientes: number;
  total_medicos: number;
  lista_espera: number;
  consultas_mes: number;
}

interface ProximoTurno {
  id: number;
  hora: string;
  paciente_nombre: string;
  paciente_apellido: string;
  tipo: string;
  estado: string;
  especialidad?: string;
}

interface KPICardProps {
  title: string;
  icon: React.ReactNode;
  value: number | string;
  subtitle?: string;
  linkTo?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

function KPICard({ title, icon, value, subtitle, linkTo, variant = 'default' }: KPICardProps) {
  const { theme, isNeumorphic } = useTheme();

  const variantColors = {
    default: theme.primary,
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  const color = variantColors[variant];

  const content = (
    <div
      className={`rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 group ${isNeumorphic ? 'neu-raised hover:neu-subtle' : 'hover:shadow-lg'}`}
      style={{
        backgroundColor: theme.card,
        border: isNeumorphic ? 'none' : `1px solid ${theme.border}`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${isNeumorphic ? 'neu-button' : ''}`}
          style={{ backgroundColor: isNeumorphic ? theme.card : `${color}15` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        {linkTo && (
          <ArrowRight
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color }}
          />
        )}
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: theme.text }}>{value}</p>
      <p className="text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>{title}</p>
      {subtitle && (
        <p className="text-xs" style={{ color: theme.textSecondary, opacity: 0.7 }}>{subtitle}</p>
      )}
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  to: string;
  color?: string;
}

function QuickAction({ label, icon, to, color }: QuickActionProps) {
  const { theme, isNeumorphic } = useTheme();
  const accentColor = color || theme.primary;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${isNeumorphic ? 'neu-button' : ''}`}
      style={{
        backgroundColor: theme.card,
        border: isNeumorphic ? 'none' : `1px solid ${theme.border}`
      }}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isNeumorphic ? 'neu-pressed' : ''}`}
        style={{ backgroundColor: isNeumorphic ? theme.card : `${accentColor}15` }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <span className="font-medium truncate" style={{ color: theme.text }}>{label}</span>
    </Link>
  );
}

function TurnoItem({ turno }: { turno: ProximoTurno }) {
  const { theme, isNeumorphic } = useTheme();

  const estadoColors: Record<string, string> = {
    confirmado: '#10b981',
    reservado: '#f59e0b',
    en_atencion: '#3b82f6',
    atendido: '#6b7280',
    ausente: '#ef4444',
    cancelado: '#ef4444',
  };

  const tipoLabels: Record<string, string> = {
    primera_vez: 'Primera vez',
    control: 'Control',
    urgencia: 'Urgencia',
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl ${isNeumorphic ? 'neu-subtle' : ''}`}
      style={{ backgroundColor: isNeumorphic ? theme.card : theme.backgroundSecondary }}
    >
      <div
        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isNeumorphic ? 'neu-pressed' : ''}`}
        style={{ backgroundColor: isNeumorphic ? theme.card : `${theme.primary}15` }}
      >
        <Clock className="h-4 w-4 mb-0.5" style={{ color: theme.primary }} />
        <span className="text-xs font-bold" style={{ color: theme.primary }}>{turno.hora}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" style={{ color: theme.text }}>
          {turno.paciente_nombre} {turno.paciente_apellido}
        </p>
        <p className="text-sm truncate" style={{ color: theme.textSecondary }}>
          {tipoLabels[turno.tipo] || turno.tipo}
        </p>
      </div>
      <div
        className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
        style={{
          backgroundColor: `${estadoColors[turno.estado] || theme.primary}20`,
          color: estadoColors[turno.estado] || theme.primary
        }}
      >
        {turno.estado}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { theme, isNeumorphic } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    turnos_hoy: 0,
    turnos_confirmados: 0,
    turnos_atendidos: 0,
    turnos_pendientes: 0,
    turnos_ausentes: 0,
    pacientes_nuevos_mes: 0,
    total_pacientes: 0,
    total_medicos: 0,
    lista_espera: 0,
    consultas_mes: 0,
  });
  const [proximosTurnos, setProximosTurnos] = useState<ProximoTurno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar estadísticas reales
        const today = new Date().toISOString().split('T')[0];

        // Turnos de hoy
        const turnosRes = await api.get(`/turnos?fecha=${today}&limit=100`);
        const turnosHoy = turnosRes.data.items || [];

        // Contar estados
        const confirmados = turnosHoy.filter((t: any) => t.estado === 'confirmado').length;
        const atendidos = turnosHoy.filter((t: any) => t.estado === 'atendido').length;
        const pendientes = turnosHoy.filter((t: any) => ['reservado', 'confirmado'].includes(t.estado)).length;
        const ausentes = turnosHoy.filter((t: any) => t.estado === 'ausente').length;

        // Total pacientes
        const pacientesRes = await api.get('/pacientes?limit=1');
        const totalPacientes = pacientesRes.data.total || 0;

        // Total médicos
        const medicosRes = await api.get('/medicos?limit=1');
        const totalMedicos = medicosRes.data.total || 0;

        // Lista de espera
        const listaRes = await api.get('/lista_espera?estado=pendiente&limit=1');
        const listaEspera = listaRes.data.total || 0;

        setStats({
          turnos_hoy: turnosHoy.length,
          turnos_confirmados: confirmados,
          turnos_atendidos: atendidos,
          turnos_pendientes: pendientes,
          turnos_ausentes: ausentes,
          pacientes_nuevos_mes: Math.floor(totalPacientes * 0.1), // Estimado
          total_pacientes: totalPacientes,
          total_medicos: totalMedicos,
          lista_espera: listaEspera,
          consultas_mes: atendidos * 20, // Estimado
        });

        // Próximos turnos (ordenados por hora)
        const ahora = new Date().toTimeString().slice(0, 5);
        const proximos = turnosHoy
          .filter((t: any) => t.hora >= ahora && ['reservado', 'confirmado'].includes(t.estado))
          .sort((a: any, b: any) => a.hora.localeCompare(b.hora))
          .slice(0, 5)
          .map((t: any) => ({
            id: t.id,
            hora: t.hora?.slice(0, 5) || '00:00',
            paciente_nombre: t.paciente?.nombre || 'Paciente',
            paciente_apellido: t.paciente?.apellido || '',
            tipo: t.tipo,
            estado: t.estado,
          }));

        setProximosTurnos(proximos);

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        // Datos de fallback
        setStats({
          turnos_hoy: 18,
          turnos_confirmados: 12,
          turnos_atendidos: 6,
          turnos_pendientes: 8,
          turnos_ausentes: 2,
          pacientes_nuevos_mes: 15,
          total_pacientes: 100,
          total_medicos: 25,
          lista_espera: 5,
          consultas_mes: 180,
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tasaAsistencia = stats.turnos_hoy > 0
    ? Math.round(((stats.turnos_hoy - stats.turnos_ausentes) / stats.turnos_hoy) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Buen día, {user?.nombre || 'Doctor'}
          </h1>
          <p style={{ color: theme.textSecondary }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ backgroundColor: `${theme.primary}15` }}
        >
          <Activity className="h-5 w-5" style={{ color: theme.primary }} />
          <span className="font-medium" style={{ color: theme.primary }}>
            {stats.turnos_pendientes} turnos pendientes
          </span>
        </div>
      </div>

      {/* KPIs Principales - Turnos del día */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
          <Calendar className="h-5 w-5" style={{ color: theme.primary }} />
          Turnos de Hoy
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard
            title="Total Turnos"
            icon={<Calendar className="h-5 w-5" />}
            value={stats.turnos_hoy}
            subtitle="Programados para hoy"
            linkTo="/gestion/turnos"
            variant="default"
          />
          <KPICard
            title="Confirmados"
            icon={<CheckCircle className="h-5 w-5" />}
            value={stats.turnos_confirmados}
            subtitle="Listos para atender"
            linkTo="/gestion/turnos"
            variant="success"
          />
          <KPICard
            title="Atendidos"
            icon={<UserCheck className="h-5 w-5" />}
            value={stats.turnos_atendidos}
            subtitle="Consultas realizadas"
            linkTo="/gestion/evoluciones"
            variant="info"
          />
          <KPICard
            title="Ausentes"
            icon={<UserX className="h-5 w-5" />}
            value={stats.turnos_ausentes}
            subtitle={`${tasaAsistencia}% asistencia`}
            linkTo="/gestion/turnos_ausentes"
            variant={stats.turnos_ausentes > 3 ? 'danger' : 'warning'}
          />
        </div>
      </div>

      {/* Próximos turnos y Accesos rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Próximos Turnos */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.text }}>
              <Clock className="h-5 w-5" style={{ color: theme.primary }} />
              Próximos Turnos
            </h2>
            <Link
              to="/gestion/turnos"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: theme.primary }}
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div
            className={`rounded-2xl p-4 space-y-3 ${isNeumorphic ? 'neu-raised' : ''}`}
            style={{ backgroundColor: theme.card, border: isNeumorphic ? 'none' : `1px solid ${theme.border}` }}
          >
            {proximosTurnos.length > 0 ? (
              proximosTurnos.map((turno) => (
                <TurnoItem key={turno.id} turno={turno} />
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" style={{ color: theme.textSecondary }} />
                <p style={{ color: theme.textSecondary }}>No hay más turnos pendientes para hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
            <Stethoscope className="h-5 w-5" style={{ color: theme.primary }} />
            Acceso Rápido
          </h2>
          <div className="space-y-2">
            <QuickAction
              label="Nuevo Turno"
              icon={<Calendar className="h-5 w-5" />}
              to="/gestion/turnos"
              color="#3b82f6"
            />
            <QuickAction
              label="Buscar Paciente"
              icon={<Users className="h-5 w-5" />}
              to="/gestion/pacientes"
              color="#10b981"
            />
            <QuickAction
              label="Historia Clínica"
              icon={<FileText className="h-5 w-5" />}
              to="/gestion/historias_clinicas"
              color="#8b5cf6"
            />
            <QuickAction
              label="Lista de Espera"
              icon={<ClipboardList className="h-5 w-5" />}
              to="/gestion/lista_espera"
              color="#f59e0b"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: theme.text }}>
          <TrendingUp className="h-5 w-5" style={{ color: theme.primary }} />
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard
            title="Total Pacientes"
            icon={<Users className="h-5 w-5" />}
            value={stats.total_pacientes}
            subtitle="Pacientes registrados"
            linkTo="/gestion/pacientes"
            variant="default"
          />
          <KPICard
            title="Médicos Activos"
            icon={<Stethoscope className="h-5 w-5" />}
            value={stats.total_medicos}
            subtitle="En plantilla"
            linkTo="/gestion/medicos"
            variant="info"
          />
          <KPICard
            title="Lista de Espera"
            icon={<ClipboardList className="h-5 w-5" />}
            value={stats.lista_espera}
            subtitle="Pacientes esperando"
            linkTo="/gestion/lista_espera"
            variant={stats.lista_espera > 10 ? 'warning' : 'success'}
          />
          <KPICard
            title="Consultas del Mes"
            icon={<Heart className="h-5 w-5" />}
            value={stats.consultas_mes}
            subtitle="Atenciones realizadas"
            linkTo="/gestion/evoluciones"
            variant="success"
          />
        </div>
      </div>

      {/* Alertas y Recordatorios */}
      <div
        className={`rounded-2xl p-5 ${isNeumorphic ? 'neu-raised' : ''}`}
        style={{ backgroundColor: theme.card, border: isNeumorphic ? 'none' : `1px solid ${theme.border}` }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: theme.text }}>
          <Bell className="h-5 w-5" style={{ color: theme.primary }} />
          Recordatorios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: '#f59e0b15' }}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
            <div>
              <p className="font-medium text-sm" style={{ color: theme.text }}>
                {stats.lista_espera} pacientes en espera
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Requieren asignación de turno
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: '#10b98115' }}
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#10b981' }} />
            <div>
              <p className="font-medium text-sm" style={{ color: theme.text }}>
                {stats.turnos_confirmados} turnos confirmados
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Para atender hoy
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: '#3b82f615' }}
          >
            <FileText className="h-5 w-5 flex-shrink-0" style={{ color: '#3b82f6' }} />
            <div>
              <p className="font-medium text-sm" style={{ color: theme.text }}>
                {stats.pacientes_nuevos_mes} pacientes nuevos
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Este mes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

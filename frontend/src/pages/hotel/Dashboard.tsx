import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { chatApi } from '../../lib/api';
import { Bed, Calendar, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface DashboardKPIs {
  ocupacion_porcentaje: number;
  habitaciones_disponibles: number;
  checkins_hoy: number;
  revpar: number;
  // Tendencias
  ocupacion_cambio: number;
  disponibles_cambio: number;
  checkins_cambio: number;
  revpar_cambio: number;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const { org } = useOrganization();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getKPIs();

      // Mapear datos del backend
      setKpis({
        ocupacion_porcentaje: data.habitaciones.ocupacion_porcentaje || 0,
        habitaciones_disponibles: data.habitaciones.disponibles || 0,
        checkins_hoy: data.reservas.checkin_hoy || 0,
        revpar: data.financiero.revpar || 0,
        // Tendencias (simuladas por ahora)
        ocupacion_cambio: data.tendencias?.ocupacion_cambio_semanal || 0,
        disponibles_cambio: 0,
        checkins_cambio: 0,
        revpar_cambio: 0,
      });
    } catch (error) {
      console.error('Error loading KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const kpiCards = [
    {
      title: 'OCUPACIÓN',
      value: kpis ? `${kpis.ocupacion_porcentaje}%` : '—',
      change: kpis?.ocupacion_cambio || 0,
      icon: Bed,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
    },
    {
      title: 'DISPONIBLES',
      value: kpis ? kpis.habitaciones_disponibles.toString() : '—',
      change: kpis?.disponibles_cambio || 0,
      icon: Bed,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
    },
    {
      title: 'CHECK-INS HOY',
      value: kpis ? kpis.checkins_hoy.toString() : '—',
      change: kpis?.checkins_cambio || 0,
      icon: Calendar,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
    },
    {
      title: 'REVPAR',
      value: kpis ? formatCurrency(kpis.revpar) : '—',
      change: kpis?.revpar_cambio || 0,
      icon: DollarSign,
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          height: '200px',
          background: theme.primary,
        }}
      >
        {/* Imagen de fondo */}
        {org?.logo_url && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${org.logo_url})`,
              filter: 'blur(8px) brightness(0.7)',
              transform: 'scale(1.1)',
            }}
          />
        )}

        {/* Overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}dd 0%, ${theme.primary}99 100%)`,
          }}
        />

        {/* Contenido */}
        <div className="relative h-full flex flex-col justify-center px-8">
          <div className="flex items-center gap-3 mb-2">
            {org?.icono && (
              <span className="text-4xl">{org.icono}</span>
            )}
            <h1 className="text-3xl font-bold text-white">
              {org?.nombre || 'Hotel Las Margaritas'}
            </h1>
          </div>
          <p className="text-white/90 text-lg">
            {org?.eslogan || 'Monitoreo en tiempo real de gestión hotelera'}
          </p>

          {/* Stats rápidos */}
          <div className="flex items-center gap-6 mt-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              <span>50 habitaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{kpis?.ocupacion_porcentaje || 0}% ocupación</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{org?.nombre || 'Hotel 5 estrellas'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-4 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.primary }} />
          </div>
        ) : (
          kpiCards.map((card, idx) => {
            const Icon = card.icon;
            const isPositive = card.change >= 0;

            return (
              <div
                key={idx}
                className="rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer relative overflow-hidden group"
                style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Filtro overlay - se ve más en hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}08 0%, transparent 60%)`,
                    zIndex: 5,
                  }}
                />

                {/* Icono de fondo grande con opacidad */}
                <div
                  className="absolute -right-4 -bottom-4 opacity-5 transition-all duration-300 group-hover:opacity-10 group-hover:scale-110"
                  style={{ transform: 'rotate(-15deg)' }}
                >
                  <Icon className="h-32 w-32" style={{ color: card.color }} />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span
                    className="text-xs font-bold tracking-wider uppercase"
                    style={{ color: '#9ca3af' }}
                  >
                    {card.title}
                  </span>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{
                      backgroundColor: `${card.color}15`,
                      border: `1px solid ${card.color}30`,
                      boxShadow: `0 0 0 0 ${card.color}00`,
                    }}
                  >
                    <Icon className="h-6 w-6 transition-all duration-300" style={{ color: card.color }} />
                  </div>
                </div>

                {/* Valor principal */}
                <div className="text-4xl font-bold mb-3 relative z-10" style={{ color: '#ffffff' }}>
                  {card.value}
                </div>

                {/* Tendencia */}
                <div className="flex items-center gap-2 text-sm relative z-10">
                  <span
                    className="flex items-center gap-1 font-semibold px-2 py-1 rounded"
                    style={{
                      color: isPositive ? '#10b981' : '#ef4444',
                      backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    }}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {isPositive ? '+' : ''}
                    {card.change}%
                  </span>
                  <span style={{ color: '#6b7280' }}>vs mes ant.</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Widgets inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Estados de Habitaciones */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>
            Por Estado
          </h3>
          <div className="flex items-center justify-center py-8">
            <div className="text-center" style={{ color: theme.textSecondary }}>
              <Bed className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Gráfico de estados</p>
              <p className="text-xs">(En desarrollo)</p>
            </div>
          </div>
        </div>

        {/* Widget 2: Mapa de ocupación */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-orange-500">📍</span>
            <h3 className="text-lg font-bold" style={{ color: theme.text }}>
              Mapa de Ocupación - Por Piso
            </h3>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-center" style={{ color: theme.textSecondary }}>
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Mapa interactivo</p>
              <p className="text-xs">(En desarrollo)</p>
            </div>
          </div>
        </div>

        {/* Widget 3: Top Servicios */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: theme.text }}>
              Top Servicios
            </h3>
            <span className="text-yellow-500">⚠️</span>
          </div>
          <div className="space-y-3">
            {['Desayuno Buffet', 'Room Service', 'Spa', 'Transfer', 'Lavandería'].map(
              (servicio, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: theme.text }}>
                      {servicio}
                    </span>
                    <span className="text-xs" style={{ color: theme.textSecondary }}>
                      {Math.floor(Math.random() * 10)} (8%)
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme.backgroundSecondary }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.random() * 60 + 20}%`,
                        backgroundColor: [
                          '#ef4444',
                          '#10b981',
                          '#8b5cf6',
                          '#06b6d4',
                          '#f59e0b',
                        ][idx],
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

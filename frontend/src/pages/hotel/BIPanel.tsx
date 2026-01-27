import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, DollarSign, Users, Bed } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import { toast } from 'sonner';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BIData {
  ocupacionMensual: ChartData[];
  ingresosPorMes: ChartData[];
  reservasPorCanal: ChartData[];
  ocupacionPorTipo: ChartData[];
  topHuespedes: ChartData[];
}

export default function BIPanel() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BIData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadBIData();
  }, [selectedPeriod]);

  const loadBIData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bi/dashboard?periodo=${selectedPeriod}`);
      const datos = res.data;

      setData({
        ocupacionMensual: datos.ocupacion_mensual || [],
        ingresosPorMes: datos.ingresos_por_mes || [],
        reservasPorCanal: datos.reservas_por_canal || [],
        ocupacionPorTipo: datos.ocupacion_por_tipo || [],
        topHuespedes: datos.top_huespedes || [],
      });
    } catch (error) {
      console.error('Error cargando BI:', error);
      toast.error('Error al cargar datos BI');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.primary }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" style={{ color: theme.primary }} />
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Panel BI
          </h1>
        </div>

        {/* Period selector */}
        <div
          className="flex rounded-lg p-1"
          style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
        >
          {(['month', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: selectedPeriod === period ? theme.primary : 'transparent',
                color: selectedPeriod === period ? 'white' : theme.textSecondary,
              }}
            >
              {period === 'month' ? 'Mes' : period === 'quarter' ? 'Trimestre' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickKPI
          title="Ocupación Promedio"
          value="82%"
          trend="+5.2%"
          icon={Bed}
          color="#8b5cf6"
          theme={theme}
        />
        <QuickKPI
          title="Ingresos del Mes"
          value="$550K"
          trend="+12.3%"
          icon={DollarSign}
          color="#10b981"
          theme={theme}
        />
        <QuickKPI
          title="Total Reservas"
          value="342"
          trend="+8.1%"
          icon={Calendar}
          color="#f59e0b"
          theme={theme}
        />
        <QuickKPI
          title="Huéspedes Únicos"
          value="189"
          trend="+15.7%"
          icon={Users}
          color="#3b82f6"
          theme={theme}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Ocupación Mensual */}
        <ChartCard title="Ocupación Mensual (%)" theme={theme}>
          <BarChart data={data?.ocupacionMensual || []} color={theme.primary} maxValue={100} />
        </ChartCard>

        {/* Line Chart - Ingresos */}
        <ChartCard title="Ingresos por Mes" theme={theme}>
          <LineChart
            data={data?.ingresosPorMes || []}
            color="#10b981"
            formatValue={(v) => `$${(v / 1000).toFixed(0)}K`}
          />
        </ChartCard>

        {/* Pie Chart - Reservas por Canal */}
        <ChartCard title="Reservas por Canal" theme={theme}>
          <PieChartCustom data={data?.reservasPorCanal || []} theme={theme} />
        </ChartCard>

        {/* Horizontal Bar - Top Huéspedes */}
        <ChartCard title="Top Huéspedes" theme={theme}>
          <HorizontalBarChart data={data?.topHuespedes || []} color="#f59e0b" />
        </ChartCard>
      </div>

      {/* Tabla de Ocupación por Tipo */}
      <ChartCard title="Ocupación por Tipo de Habitación" theme={theme}>
        <div className="space-y-3">
          {data?.ocupacionPorTipo.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: theme.text }}>
                  {item.label}
                </span>
                <span className="text-sm font-bold" style={{ color: theme.primary }}>
                  {item.value}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${theme.border}50` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: theme.primary,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

// ============ COMPONENTES ============

function QuickKPI({ title, value, trend, icon: Icon, color, theme }: any) {
  const isPositive = trend.startsWith('+');

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase font-bold" style={{ color: theme.textSecondary }}>
          {title}
        </span>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: theme.text }}>
        {value}
      </div>
      <div
        className="text-xs font-semibold"
        style={{ color: isPositive ? '#10b981' : '#ef4444' }}
      >
        {trend} vs anterior
      </div>
    </div>
  );
}

function ChartCard({ title, children, theme }: any) {
  return (
    <div
      className="rounded-lg p-6"
      style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function BarChart({ data, color, maxValue }: { data: ChartData[]; color: string; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
          <div className="flex-1 w-full flex items-end">
            <div
              className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
              style={{
                height: `${(item.value / max) * 100}%`,
                backgroundColor: color,
              }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
          <span className="text-xs font-medium text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, color, formatValue }: { data: ChartData[]; color: string; formatValue?: (v: number) => string }) {
  const max = Math.max(...data.map(d => d.value));
  const points = data.map((item, idx) => ({
    x: (idx / (data.length - 1)) * 100,
    y: 100 - (item.value / max) * 100,
  }));

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#374151" strokeWidth="0.2" />
        ))}

        {/* Line */}
        <path d={pathData} fill="none" stroke={color} strokeWidth="2" />

        {/* Points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={color}
            className="hover:r-3 transition-all cursor-pointer"
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, idx) => (
          <span key={idx} className="text-xs text-gray-400">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function PieChartCustom({ data, theme }: { data: ChartData[]; theme: any }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      {/* Pie */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {data.map((item, idx) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            return (
              <PieSlice
                key={idx}
                percentage={percentage}
                startAngle={startAngle}
                color={item.color || theme.primary}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || theme.primary }}
              />
              <span className="text-sm" style={{ color: theme.text }}>
                {item.label}
              </span>
            </div>
            <span className="text-sm font-bold" style={{ color: theme.primary }}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieSlice({ percentage, startAngle, color }: { percentage: number; startAngle: number; color: string }) {
  const angle = percentage * 360;
  const endAngle = startAngle + angle;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = 50 + 40 * Math.cos(startRad);
  const y1 = 50 + 40 * Math.sin(startRad);
  const x2 = 50 + 40 * Math.cos(endRad);
  const y2 = 50 + 40 * Math.sin(endRad);

  const largeArc = angle > 180 ? 1 : 0;

  const pathData = [
    `M 50 50`,
    `L ${x1} ${y1}`,
    `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
    `Z`,
  ].join(' ');

  return <path d={pathData} fill={color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
}

function HorizontalBarChart({ data, color }: { data: ChartData[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-300">{item.label}</span>
            <span className="text-sm font-bold" style={{ color }}>{item.value}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-gray-700">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

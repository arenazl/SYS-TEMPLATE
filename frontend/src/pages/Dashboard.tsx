import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Box, Users, Truck, ShoppingCart, Receipt, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface DashboardWidgetProps {
  title: string;
  icon: React.ReactNode;
  value: number;
  linkTo: string;
}

function DashboardWidget({ title, icon, value, linkTo }: DashboardWidgetProps) {
  const { theme } = useTheme();

  return (
    <Link
      to={linkTo}
      className="rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
      style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${theme.primary}15` }}
        >
          <span style={{ color: theme.primary }}>{icon}</span>
        </div>
        <ArrowRight
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: theme.primary }}
        />
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: theme.text }}>{value}</p>
      <p className="text-sm" style={{ color: theme.textSecondary }}>{title}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({ categoria: 0, producto: 0, cliente: 0, proveedor: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar estadísticas
    const loadStats = async () => {
      setLoading(false);
      // TODO: Implementar carga de estadísticas desde el backend
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          Hola, {user?.nombre || 'Usuario'}
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Bienvenido al sistema de gestión
        </p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <DashboardWidget
          title="Categoria"
          icon={<Tag className="h-5 w-5" />}
          value={stats.categoria || 0}
          linkTo="/gestion/categorias"
        />
        <DashboardWidget
          title="Producto"
          icon={<Box className="h-5 w-5" />}
          value={stats.producto || 0}
          linkTo="/gestion/productos"
        />
        <DashboardWidget
          title="Cliente"
          icon={<Users className="h-5 w-5" />}
          value={stats.cliente || 0}
          linkTo="/gestion/clientes"
        />
        <DashboardWidget
          title="Proveedor"
          icon={<Truck className="h-5 w-5" />}
          value={stats.proveedor || 0}
          linkTo="/gestion/proveedores"
        />
      </div>

      {/* Quick actions or recent activity could go here */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <Link
            to="/gestion/categorias"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <Tag className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>Categoria</span>
          </Link>
          <Link
            to="/gestion/productos"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <Box className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>Producto</span>
          </Link>
          <Link
            to="/gestion/clientes"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <Users className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>Cliente</span>
          </Link>
          <Link
            to="/gestion/proveedores"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <Truck className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>Proveedor</span>
          </Link>
          <Link
            to="/gestion/pedidos"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <ShoppingCart className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>Pedido</span>
          </Link>
          <Link
            to="/gestion/compras"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <Receipt className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>Compra</span>
          </Link>
          <Link
            to="/gestion/movimientos"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <ArrowLeftRight className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>Movimiento</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

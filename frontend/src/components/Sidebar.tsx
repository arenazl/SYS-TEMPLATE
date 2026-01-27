import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Tag, Box, Users, Truck, ShoppingCart, Receipt, ArrowLeftRight, Settings, Home, Menu, X, ChevronDown, LogOut, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/gestion', icon: Home },
    { name: 'Tutorial', path: '/gestion/getting-started', icon: BookOpen },
    { name: 'Categoria', path: '/gestion/categorias', icon: Tag },
    { name: 'Producto', path: '/gestion/productos', icon: Box },
    { name: 'Cliente', path: '/gestion/clientes', icon: Users },
    { name: 'Proveedor', path: '/gestion/proveedores', icon: Truck },
    { name: 'Pedido', path: '/gestion/pedidos', icon: ShoppingCart },
    { name: 'Compra', path: '/gestion/compras', icon: Receipt },
    { name: 'Movimiento', path: '/gestion/movimientos', icon: ArrowLeftRight },
];

const configItems = [
  { name: 'Auditoria', path: '/gestion/auditoria', icon: Settings },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/gestion') return location.pathname === '/gestion';
    return location.pathname.startsWith(path);
  };

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          ${active ? 'font-semibold' : 'hover:translate-x-1'}
        `}
        style={{
          backgroundColor: active ? `${theme.primary}15` : 'transparent',
          color: active ? theme.primary : theme.textSecondary,
        }}
      >
        <Icon className="h-5 w-5" />
        <span>{item.name}</span>
        {active && (
          <div
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ backgroundColor: theme.card, color: theme.text }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          backgroundColor: theme.card,
          borderRight: `1px solid ${theme.border}`,
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <h1 className="text-xl font-bold" style={{ color: theme.primary }}>
            Sistema
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Main menu */}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </div>

          {/* Config section */}
          <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg"
              style={{ color: theme.textSecondary }}
            >
              <span>Configuración</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${configOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {configOpen && (
              <div className="mt-1 space-y-1">
                {configItems.map((item) => (
                  <MenuItem key={item.path} item={item} />
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* User section */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: theme.primary }}
            >
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs truncate" style={{ color: theme.textSecondary }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ color: theme.textSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

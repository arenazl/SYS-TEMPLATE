#!/usr/bin/env npx tsx
/**
 * Generador de Layout
 *
 * Genera la estructura de la aplicación:
 * - Layout principal (topbar, sidebar, container, footer)
 * - Dashboard (contenedor para módulos de negocio)
 * - SettingsPage (contenedor con tabs para configuración)
 * - Rutas
 *
 * Soporta todas las entidades con cualquier tipo de campo incluyendo:
 * - FK (ComboBox), Enum/Radio (Select/RadioGroup)
 * - DatePicker (date input), RichText (WYSIWYG)
 * - File (upload), Tags (chips input)
 * - Master-Detail (inline forms)
 *
 * Uso: npx tsx generate-layout.ts negocio.json auditoria.json
 */

import * as fs from 'fs';
import * as path from 'path';

interface ModuleConfig {
  module: {
    name: string;
    description: string;
    icon: string;
    path: string;
    folder: string;
    requiredRole: string;
    containerStyle: 'tabs' | 'dashboard';
  };
  entities: EntityConfig[];
}

interface EntityConfig {
  name: string;
  plural: string;
  table: string;
  fields: string;
  icon: string;
  order: number;
}

// Paths
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend', 'src');

// Helper: Sanitiza paths para rutas anidadas (quita slash inicial)
function sanitizePath(p: string): string {
  return p.startsWith('/') ? p.slice(1) : p;
}

// ==================== LAYOUT GENERATOR ====================

function generateLayout(): string {
  return `import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme.background }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pt-20">
          <Outlet />
        </main>

        {/* Footer */}
        <footer
          className="py-4 px-6 text-center text-sm"
          style={{ color: theme.textSecondary, borderTop: \`1px solid \${theme.border}\` }}
        >
          © {new Date().getFullYear()} - Sistema de Gestión
        </footer>
      </div>
    </div>
  );
}
`;
}

function generateSidebar(negocioConfig: ModuleConfig | null, auditoriaConfig: ModuleConfig | null): string {
  // Menu items del negocio
  const negocioItems = negocioConfig?.entities
    .sort((a, b) => a.order - b.order)
    .map(e => `    { name: '${e.name}', path: '/gestion/${e.plural}', icon: ${e.icon} },`)
    .join('\n') || '';

  // Icons del negocio
  const negocioIcons = negocioConfig?.entities.map(e => e.icon) || [];

  // Auditoria icon
  const auditoriaIcon = auditoriaConfig?.module.icon || 'Settings';

  const allIcons = [...new Set([...negocioIcons, auditoriaIcon, 'Home', 'Menu', 'X', 'ChevronDown', 'LogOut'])];

  return `import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ${allIcons.join(', ')} } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/gestion', icon: Home },
${negocioItems}
];

const configItems = [
  { name: '${auditoriaConfig?.module.name || 'Configuración'}', path: '/gestion/${sanitizePath(auditoriaConfig?.module.path || 'settings')}', icon: ${auditoriaIcon} },
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
        className={\`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
          \${active ? 'font-semibold' : 'hover:translate-x-1'}
        \`}
        style={{
          backgroundColor: active ? \`\${theme.primary}15\` : 'transparent',
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
        className={\`
          fixed top-0 left-0 h-full z-40 w-64
          transform transition-transform duration-300 ease-in-out
          \${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        \`}
        style={{
          backgroundColor: theme.card,
          borderRight: \`1px solid \${theme.border}\`,
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6" style={{ borderBottom: \`1px solid \${theme.border}\` }}>
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
          <div className="pt-4 mt-4" style={{ borderTop: \`1px solid \${theme.border}\` }}>
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg"
              style={{ color: theme.textSecondary }}
            >
              <span>Configuración</span>
              <ChevronDown
                className={\`h-4 w-4 transition-transform \${configOpen ? 'rotate-180' : ''}\`}
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
          style={{ borderTop: \`1px solid \${theme.border}\` }}
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
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = \`\${theme.primary}15\`}
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
`;
}

function generateTopbar(): string {
  return `import { Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Topbar() {
  const { theme } = useTheme();

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 flex items-center justify-between px-4 sm:px-6"
      style={{
        backgroundColor: theme.card,
        borderBottom: \`1px solid \${theme.border}\`,
      }}
    >
      {/* Spacer for mobile menu button */}
      <div className="w-10 lg:w-0" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="p-2 rounded-lg transition-colors relative"
          style={{ color: theme.textSecondary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = \`\${theme.primary}15\`}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
        </button>
      </div>
    </header>
  );
}
`;
}

// ==================== DASHBOARD GENERATOR ====================

function generateDashboard(config: ModuleConfig | null): string {
  if (!config) {
    return `import { useTheme } from '../contexts/ThemeContext';
import { BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Dashboard</h1>
        <p style={{ color: theme.textSecondary }}>Bienvenido al sistema</p>
      </div>

      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: theme.card, border: \`1px solid \${theme.border}\` }}
      >
        <BarChart3 className="h-12 w-12 mx-auto mb-4" style={{ color: theme.primary }} />
        <p style={{ color: theme.textSecondary }}>
          Los widgets del dashboard se generarán aquí
        </p>
      </div>
    </div>
  );
}
`;
  }

  const sortedEntities = [...config.entities].sort((a, b) => a.order - b.order);
  const icons = [...new Set(sortedEntities.map(e => e.icon))];

  const widgets = sortedEntities.slice(0, 4).map(e => `
        <DashboardWidget
          title="${e.name}"
          icon={<${e.icon} className="h-5 w-5" />}
          value={stats.${e.name.toLowerCase()} || 0}
          linkTo="/gestion/${e.plural}"
        />`
  ).join('');

  const statsInit = sortedEntities.slice(0, 4).map(e => `${e.name.toLowerCase()}: 0`).join(', ');

  return `import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ${icons.join(', ')}, ArrowRight } from 'lucide-react';
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
      style={{ backgroundColor: theme.card, border: \`1px solid \${theme.border}\` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: \`\${theme.primary}15\` }}
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
  const [stats, setStats] = useState({ ${statsInit} });
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
${widgets}
      </div>

      {/* Quick actions or recent activity could go here */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: theme.card, border: \`1px solid \${theme.border}\` }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${sortedEntities.map(e => `
          <Link
            to="/gestion/${e.plural}"
            className="flex items-center gap-2 p-3 rounded-lg transition-colors"
            style={{ backgroundColor: theme.backgroundSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = \`\${theme.primary}15\`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.backgroundSecondary}
          >
            <${e.icon} className="h-4 w-4" style={{ color: theme.primary }} />
            <span className="text-sm" style={{ color: theme.text }}>${e.name}</span>
          </Link>`).join('')}
        </div>
      </div>
    </div>
  );
}
`;
}

// ==================== SETTINGS PAGE GENERATOR (TABS) ====================

function generateSettingsPage(config: ModuleConfig): string {
  const sortedEntities = [...config.entities].sort((a, b) => a.order - b.order);
  const icons = [...new Set(sortedEntities.map(e => e.icon))];

  const imports = sortedEntities.map(e =>
    `import ${e.name}ABM from './${e.name}ABM';`
  ).join('\n');

  const tabButtons = sortedEntities.map(e => `
            <button
              onClick={() => setActiveTab('${e.name.toLowerCase()}')}
              className={\`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                \${activeTab === '${e.name.toLowerCase()}'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              \`}
              style={{
                backgroundColor: activeTab === '${e.name.toLowerCase()}' ? \`\${theme.primary}15\` : 'transparent',
                color: activeTab === '${e.name.toLowerCase()}' ? theme.primary : theme.textSecondary,
              }}
            >
              <${e.icon} className="h-4 w-4" />
              <span className="hidden sm:inline">${e.name}</span>
            </button>`
  ).join('');

  const tabContents = sortedEntities.map(e => `
          {activeTab === '${e.name.toLowerCase()}' && <${e.name}ABM />}`
  ).join('');

  return `import { useState } from 'react';
import { ${icons.join(', ')} } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
${imports}

export default function ${config.module.name}Page() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('${sortedEntities[0]?.name.toLowerCase() || 'tab'}');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          ${config.module.name}
        </h1>
        <p style={{ color: theme.textSecondary }}>
          ${config.module.description}
        </p>
      </div>

      {/* Tabs */}
      <div
        className="rounded-xl p-2 flex gap-1 overflow-x-auto"
        style={{ backgroundColor: theme.card, border: \`1px solid \${theme.border}\` }}
      >
        ${tabButtons}
      </div>

      {/* Content */}
      <div>
        ${tabContents}
      </div>
    </div>
  );
}
`;
}

// ==================== LOGIN PAGE GENERATOR ====================

function generateLogin(): string {
  return `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/gestion');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  // Demo users (deben coincidir con seed.py)
  const demoUsers = [
    { email: 'admin@admin.com', password: 'admin123', label: 'Admin', color: 'from-red-500 to-rose-600' },
    { email: 'usuario@demo.com', password: '123456', label: 'Usuario', color: 'from-blue-500 to-indigo-600' },
  ];

  const quickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setLoading(true);

    try {
      await login(userEmail, userPassword);
      navigate('/gestion');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 shadow-xl"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: \`\${theme.primary}20\` }}
          >
            <LogIn className="h-8 w-8" style={{ color: theme.primary }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Sistema de Gestión
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
            Ingresá con tus credenciales
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1" style={{ color: theme.textSecondary }}>
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: theme.backgroundSecondary,
                  border: \`1px solid \${theme.border}\`,
                  color: theme.text,
                }}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: theme.textSecondary }}>
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: theme.backgroundSecondary,
                  border: \`1px solid \${theme.border}\`,
                  color: theme.text,
                }}
                placeholder="Tu contraseña"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Demo users */}
        <div className="mt-6">
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
            <span className="text-xs" style={{ color: theme.textSecondary }}>
              ACCESO DEMO
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {demoUsers.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => quickLogin(user.email, user.password)}
                disabled={loading}
                className={\`bg-gradient-to-r \${user.color} text-white py-2 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]\`}
              >
                {user.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

// ==================== ROUTES GENERATOR ====================

function generateRoutes(negocioConfig: ModuleConfig | null, auditoriaConfig: ModuleConfig | null): string {
  // ABM imports para negocio
  const negocioImports = negocioConfig?.entities.map(e =>
    `import ${e.name}ABM from './pages/${negocioConfig.module.folder}/${e.name}ABM';`
  ).join('\n') || '';

  // Rutas del negocio
  const negocioRoutes = negocioConfig?.entities.map(e =>
    `      { path: '${e.plural}', element: <${e.name}ABM /> },`
  ).join('\n') || '';

  // Settings page import
  const settingsImport = auditoriaConfig
    ? `import ${auditoriaConfig.module.name}Page from './pages/${auditoriaConfig.module.folder}/${auditoriaConfig.module.name}Page';`
    : '';

  // Settings route (sanitizePath quita el / inicial para rutas anidadas)
  const settingsRoute = auditoriaConfig
    ? `      { path: '${sanitizePath(auditoriaConfig.module.path)}', element: <${auditoriaConfig.module.name}Page /> },`
    : '';

  return `import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
${negocioImports}
${settingsImport}

export const router = createBrowserRouter([
  // === RUTAS PÚBLICAS ===
  { path: '/login', element: <Login /> },

  // === RUTA RAÍZ - Redirige a login ===
  { path: '/', element: <Navigate to="/login" replace /> },

  // === RUTAS PROTEGIDAS ===
  {
    path: '/gestion',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      // Dashboard
      { index: true, element: <Dashboard /> },

      // Módulos de negocio
${negocioRoutes}

      // Configuración / Auditoría
${settingsRoute}
    ],
  },

  // Catch-all: redirigir a login
  { path: '*', element: <Navigate to="/login" replace /> },
]);
`;
}

// ==================== MAIN ====================

async function main() {
  const args = process.argv.slice(2);

  console.log('\n🏗️  Generador de Layout');
  console.log('========================\n');

  if (args.length === 0) {
    console.log('Uso: npx tsx generate-layout.ts [negocio.json] [auditoria.json]');
    console.log('');
    console.log('Genera:');
    console.log('  - Layout (topbar, sidebar, container, footer)');
    console.log('  - Dashboard (widgets para módulos de negocio)');
    console.log('  - SettingsPage (tabs para configuración/auditoría)');
    console.log('  - Rutas actualizadas');
    console.log('');
    console.log('Ejemplos:');
    console.log('  npx tsx generate-layout.ts negocio.json auditoria.json');
    console.log('  npx tsx generate-layout.ts auditoria.json  # Solo auditoria');
    process.exit(1);
  }

  // Parse configs
  let negocioConfig: ModuleConfig | null = null;
  let auditoriaConfig: ModuleConfig | null = null;

  for (const arg of args) {
    const configPath = path.join(__dirname, arg);
    if (!fs.existsSync(configPath)) {
      console.error(`⚠ Archivo no encontrado: ${configPath}`);
      continue;
    }

    const config: ModuleConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (config.module.containerStyle === 'dashboard') {
      negocioConfig = config;
      console.log(`📊 Negocio: ${config.module.name} (${config.entities.length} entidades)`);
    } else {
      auditoriaConfig = config;
      console.log(`⚙️  Auditoría: ${config.module.name} (${config.entities.length} entidades)`);
    }
  }

  console.log('');

  // Ensure directories exist
  fs.mkdirSync(path.join(FRONTEND_PATH, 'components'), { recursive: true });
  fs.mkdirSync(path.join(FRONTEND_PATH, 'pages'), { recursive: true });

  // Generate Layout components
  console.log('📐 Generando Layout...');

  const layoutPath = path.join(FRONTEND_PATH, 'components', 'Layout.tsx');
  fs.writeFileSync(layoutPath, generateLayout());
  console.log('  ✓ Layout.tsx');

  const sidebarPath = path.join(FRONTEND_PATH, 'components', 'Sidebar.tsx');
  fs.writeFileSync(sidebarPath, generateSidebar(negocioConfig, auditoriaConfig));
  console.log('  ✓ Sidebar.tsx');

  const topbarPath = path.join(FRONTEND_PATH, 'components', 'Topbar.tsx');
  fs.writeFileSync(topbarPath, generateTopbar());
  console.log('  ✓ Topbar.tsx');

  // Generate Login
  console.log('\n🔐 Generando Login...');
  const loginPath = path.join(FRONTEND_PATH, 'pages', 'Login.tsx');
  fs.writeFileSync(loginPath, generateLogin());
  console.log('  ✓ Login.tsx');

  // Generate Dashboard
  console.log('\n📊 Generando Dashboard...');
  const dashboardPath = path.join(FRONTEND_PATH, 'pages', 'Dashboard.tsx');
  fs.writeFileSync(dashboardPath, generateDashboard(negocioConfig));
  console.log('  ✓ Dashboard.tsx');

  // Generate Settings Page (if auditoria config exists)
  if (auditoriaConfig) {
    console.log('\n⚙️  Generando Settings Page...');
    const settingsDir = path.join(FRONTEND_PATH, 'pages', auditoriaConfig.module.folder);
    fs.mkdirSync(settingsDir, { recursive: true });

    const settingsPath = path.join(settingsDir, `${auditoriaConfig.module.name}Page.tsx`);
    fs.writeFileSync(settingsPath, generateSettingsPage(auditoriaConfig));
    console.log(`  ✓ ${auditoriaConfig.module.name}Page.tsx`);
  }

  // Generate Routes
  console.log('\n🛤️  Generando Rutas...');
  const routesPath = path.join(FRONTEND_PATH, 'routes.tsx');
  fs.writeFileSync(routesPath, generateRoutes(negocioConfig, auditoriaConfig));
  console.log('  ✓ routes.tsx');

  console.log('\n✅ Layout generado exitosamente!');
  console.log('\nResumen:');
  console.log('  - Login: generado');
  console.log('  - Layout: topbar, sidebar, container, footer');
  console.log('  - Dashboard: ' + (negocioConfig ? `${negocioConfig.entities.length} widgets` : 'básico'));
  console.log('  - Settings: ' + (auditoriaConfig ? `${auditoriaConfig.entities.length} tabs` : 'no generado'));
  console.log('  - Rutas actualizadas');
}

main().catch(console.error);

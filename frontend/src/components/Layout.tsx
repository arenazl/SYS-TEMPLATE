import { Outlet } from 'react-router-dom';
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
          style={{ color: theme.textSecondary, borderTop: `1px solid ${theme.border}` }}
        >
          © {new Date().getFullYear()} - Sistema de Gestión
        </footer>
      </div>
    </div>
  );
}

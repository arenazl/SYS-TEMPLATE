import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { theme, backgrounds } = useTheme();

  const getBackgroundStyle = (bgUrl?: string, opacity?: number) => {
    if (!bgUrl) return {};
    return {
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: (opacity || 0) / 100,
    };
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Fondo general */}
      {backgrounds.generalBg && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            ...getBackgroundStyle(backgrounds.generalBg, backgrounds.generalBgOpacity),
            zIndex: 0,
          }}
        />
      )}

      {/* Fondo de color base */}
      <div
        className="fixed inset-0"
        style={{
          backgroundColor: theme.background,
          zIndex: 0,
        }}
      />

      {/* Sidebar con fondo personalizado */}
      <div className="relative z-10">
        <div className="fixed top-0 left-0 h-full w-64 -translate-x-full lg:translate-x-0">
          {backgrounds.sidebarBg && (
            <>
              {/* Imagen de fondo */}
              <div
                className="absolute inset-0"
                style={{
                  ...getBackgroundStyle(backgrounds.sidebarBg, backgrounds.sidebarBgOpacity),
                }}
              />
              {/* Filtro de color de acento */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: theme.primary,
                  opacity: 0.15,
                  mixBlendMode: 'multiply',
                }}
              />
            </>
          )}
        </div>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300 relative z-10">
        {/* Topbar con fondo personalizado */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30">
          {backgrounds.topbarBg && (
            <>
              {/* Imagen de fondo */}
              <div
                className="absolute inset-0"
                style={{
                  ...getBackgroundStyle(backgrounds.topbarBg, backgrounds.topbarBgOpacity),
                }}
              />
              {/* Filtro de color de acento */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: theme.primary,
                  opacity: 0.15,
                  mixBlendMode: 'multiply',
                }}
              />
            </>
          )}
        </div>
        <Topbar />

        {/* Page content */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-3 sm:pb-6 lg:pb-8 pt-24 relative">
          <Outlet />
        </main>

        {/* Footer */}
        <footer
          className="py-4 px-6 text-center text-sm relative"
          style={{ color: theme.textSecondary, borderTop: `1px solid ${theme.border}` }}
        >
          © {new Date().getFullYear()} - Sistema de Gestión
        </footer>
      </div>
    </div>
  );
}

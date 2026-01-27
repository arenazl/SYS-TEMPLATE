import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Palette, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Topbar() {
  const { theme, setTheme, presets } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.rol === 'admin';

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setPaletteOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 flex items-center justify-between px-4 sm:px-6"
      style={{
        backgroundColor: theme.card,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      {/* Spacer for mobile menu button */}
      <div className="w-10 lg:w-0" />

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button
          className="p-2 rounded-lg transition-colors relative"
          style={{ color: theme.textSecondary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
        </button>

        {/* Admin tools */}
        {isAdmin && (
          <>
            {/* Selector de tema */}
            <div className="relative" ref={paletteRef}>
              <button
                onClick={() => setPaletteOpen(!paletteOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.textSecondary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Cambiar tema"
              >
                <Palette className="h-5 w-5" />
              </button>
              {paletteOpen && (
                <div
                  className="absolute top-full right-0 mt-2 p-2 rounded-lg shadow-lg min-w-[160px]"
                  style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
                >
                  <p className="text-xs font-medium mb-2 px-2" style={{ color: theme.textSecondary }}>
                    Tema
                  </p>
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setTheme(preset.id);
                        setPaletteOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors"
                      style={{
                        color: theme.id === preset.id ? theme.primary : theme.text,
                        backgroundColor: theme.id === preset.id ? `${theme.primary}15` : 'transparent',
                      }}
                    >
                      <div className="flex gap-0.5">
                        {preset.palette.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Configuración */}
            <button
              onClick={() => navigate('/gestion/auditoria')}
              className="p-2 rounded-lg transition-colors"
              style={{ color: theme.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Configuración"
            >
              <Settings className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Separador */}
        <div className="w-px h-8 mx-2" style={{ backgroundColor: theme.border }} />

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-colors"
            style={{ color: theme.text }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}10`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: theme.primary }}
            >
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight" style={{ color: theme.text }}>
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs leading-tight" style={{ color: theme.textSecondary }}>
                {user?.email}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              style={{ color: theme.textSecondary }}
            />
          </button>

          {userMenuOpen && (
            <div
              className="absolute top-full right-0 mt-2 py-1 rounded-lg shadow-lg min-w-[180px]"
              style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
            >
              {/* User info en mobile */}
              <div className="sm:hidden px-3 py-2 border-b" style={{ borderColor: theme.border }}>
                <p className="text-sm font-medium" style={{ color: theme.text }}>
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {user?.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                style={{ color: theme.textSecondary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.primary}15`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Topbar() {
  const { theme } = useTheme();

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
      <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}

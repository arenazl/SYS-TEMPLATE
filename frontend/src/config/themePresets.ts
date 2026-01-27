/**
 * Sistema de Temas Avanzado - 12 paletas + fondos personalizados
 */

export type ThemeVariant = 'default';

export interface ThemePreset {
  id: string;
  name: string;
  palette: [string, string, string, string];
  colors: ThemeColors;
}

export interface ThemeColors {
  // Fondos
  background: string;
  backgroundSecondary: string;
  contentBackground: string;
  card: string;

  // Sidebar
  sidebar: string;
  sidebarText: string;
  sidebarTextSecondary: string;

  // Textos
  text: string;
  textSecondary: string;
  textPrimary: string;

  // Acento/Primary
  primary: string;
  primaryHover: string;
  primaryText: string;

  // Status colors
  success: string;
  warning: string;
  info: string;
  error: string;

  // Bordes
  border: string;
}

export interface ThemeBackgrounds {
  // Fondo general
  generalBg?: string;
  generalBgOpacity: number;
  generalBgBlur: number;

  // Sidebar background
  sidebarBg?: string;
  sidebarBgOpacity: number;
  sidebarBgBlur: number;

  // Topbar background
  topbarBg?: string;
  topbarBgOpacity: number;
  topbarBgBlur: number;
}

// 12 Temas expandidos
export const themePresets: ThemePreset[] = [
  // 1. Light - Claro profesional
  {
    id: 'light',
    name: 'Claro',
    palette: ['#ffffff', '#f1f5f9', '#3b82f6', '#1e40af'],
    colors: {
      background: '#f8fafc',
      backgroundSecondary: '#f1f5f9',
      contentBackground: '#ffffff',
      card: '#ffffff',
      sidebar: '#1e293b',
      sidebarText: '#ffffff',
      sidebarTextSecondary: '#94a3b8',
      text: '#1e293b',
      textSecondary: '#64748b',
      textPrimary: '#1e293b',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryText: '#ffffff',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#3b82f6',
      error: '#ef4444',
      border: '#e2e8f0',
    },
  },

  // 2. Dark - Oscuro elegante
  {
    id: 'dark',
    name: 'Oscuro',
    palette: ['#0f172a', '#1e293b', '#3b82f6', '#60a5fa'],
    colors: {
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      contentBackground: '#0f172a',
      card: '#1e293b',
      sidebar: '#1e293b',
      sidebarText: '#ffffff',
      sidebarTextSecondary: '#94a3b8',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textPrimary: '#f1f5f9',
      primary: '#3b82f6',
      primaryHover: '#60a5fa',
      primaryText: '#ffffff',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#3b82f6',
      error: '#ef4444',
      border: '#334155',
    },
  },

  // 3. Amber - Ámbar cálido
  {
    id: 'amber',
    name: 'Ámbar',
    palette: ['#1c1917', '#292524', '#f59e0b', '#fbbf24'],
    colors: {
      background: '#1c1917',
      backgroundSecondary: '#292524',
      contentBackground: '#1c1917',
      card: '#292524',
      sidebar: '#292524',
      sidebarText: '#fef3c7',
      sidebarTextSecondary: '#d97706',
      text: '#fef3c7',
      textSecondary: '#a8a29e',
      textPrimary: '#fef3c7',
      primary: '#f59e0b',
      primaryHover: '#fbbf24',
      primaryText: '#1c1917',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#44403c',
    },
  },

  // 4. Coffee - Marrón café
  {
    id: 'coffee',
    name: 'Café',
    palette: ['#1c1412', '#2d211a', '#a67c52', '#c9a87c'],
    colors: {
      background: '#1c1412',
      backgroundSecondary: '#2d211a',
      contentBackground: '#1c1412',
      card: '#2d211a',
      sidebar: '#2d211a',
      sidebarText: '#f5f0e8',
      sidebarTextSecondary: '#a67c52',
      text: '#f5f0e8',
      textSecondary: '#a8998a',
      textPrimary: '#f5f0e8',
      primary: '#a67c52',
      primaryHover: '#c9a87c',
      primaryText: '#1c1412',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#3d2e24',
    },
  },

  // 5. Ocean - Azul océano
  {
    id: 'ocean',
    name: 'Océano',
    palette: ['#0c1821', '#1a2332', '#06b6d4', '#22d3ee'],
    colors: {
      background: '#0c1821',
      backgroundSecondary: '#1a2332',
      contentBackground: '#0c1821',
      card: '#1a2332',
      sidebar: '#1a2332',
      sidebarText: '#e0f2fe',
      sidebarTextSecondary: '#67e8f9',
      text: '#e0f2fe',
      textSecondary: '#94a3b8',
      textPrimary: '#e0f2fe',
      primary: '#06b6d4',
      primaryHover: '#22d3ee',
      primaryText: '#0c1821',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#334155',
    },
  },

  // 6. Forest - Verde bosque
  {
    id: 'forest',
    name: 'Bosque',
    palette: ['#14181c', '#1f2b23', '#10b981', '#34d399'],
    colors: {
      background: '#14181c',
      backgroundSecondary: '#1f2b23',
      contentBackground: '#14181c',
      card: '#1f2b23',
      sidebar: '#1f2b23',
      sidebarText: '#d1fae5',
      sidebarTextSecondary: '#6ee7b7',
      text: '#d1fae5',
      textSecondary: '#94a3b8',
      textPrimary: '#d1fae5',
      primary: '#10b981',
      primaryHover: '#34d399',
      primaryText: '#14181c',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#334155',
    },
  },

  // 7. Purple - Púrpura vibrante
  {
    id: 'purple',
    name: 'Púrpura',
    palette: ['#1e1420', '#2d1f35', '#a855f7', '#c084fc'],
    colors: {
      background: '#1e1420',
      backgroundSecondary: '#2d1f35',
      contentBackground: '#1e1420',
      card: '#2d1f35',
      sidebar: '#2d1f35',
      sidebarText: '#f3e8ff',
      sidebarTextSecondary: '#d8b4fe',
      text: '#f3e8ff',
      textSecondary: '#a8a29e',
      textPrimary: '#f3e8ff',
      primary: '#a855f7',
      primaryHover: '#c084fc',
      primaryText: '#1e1420',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#44403c',
    },
  },

  // 8. Rose - Rosa elegante
  {
    id: 'rose',
    name: 'Rosa',
    palette: ['#1f1315', '#2d1a1f', '#f43f5e', '#fb7185'],
    colors: {
      background: '#1f1315',
      backgroundSecondary: '#2d1a1f',
      contentBackground: '#1f1315',
      card: '#2d1a1f',
      sidebar: '#2d1a1f',
      sidebarText: '#ffe4e6',
      sidebarTextSecondary: '#fda4af',
      text: '#ffe4e6',
      textSecondary: '#a8a29e',
      textPrimary: '#ffe4e6',
      primary: '#f43f5e',
      primaryHover: '#fb7185',
      primaryText: '#1f1315',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#44403c',
    },
  },

  // 9. Sunset - Atardecer
  {
    id: 'sunset',
    name: 'Atardecer',
    palette: ['#1c1410', '#2b1f18', '#fb923c', '#fdba74'],
    colors: {
      background: '#1c1410',
      backgroundSecondary: '#2b1f18',
      contentBackground: '#1c1410',
      card: '#2b1f18',
      sidebar: '#2b1f18',
      sidebarText: '#ffedd5',
      sidebarTextSecondary: '#fed7aa',
      text: '#ffedd5',
      textSecondary: '#a8a29e',
      textPrimary: '#ffedd5',
      primary: '#fb923c',
      primaryHover: '#fdba74',
      primaryText: '#1c1410',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#44403c',
    },
  },

  // 10. Midnight - Medianoche
  {
    id: 'midnight',
    name: 'Medianoche',
    palette: ['#0a0e1a', '#141829', '#6366f1', '#818cf8'],
    colors: {
      background: '#0a0e1a',
      backgroundSecondary: '#141829',
      contentBackground: '#0a0e1a',
      card: '#141829',
      sidebar: '#141829',
      sidebarText: '#e0e7ff',
      sidebarTextSecondary: '#a5b4fc',
      text: '#e0e7ff',
      textSecondary: '#94a3b8',
      textPrimary: '#e0e7ff',
      primary: '#6366f1',
      primaryHover: '#818cf8',
      primaryText: '#0a0e1a',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#6366f1',
      error: '#ef4444',
      border: '#334155',
    },
  },

  // 11. Emerald - Esmeralda
  {
    id: 'emerald',
    name: 'Esmeralda',
    palette: ['#0f1c16', '#1a2920', '#059669', '#10b981'],
    colors: {
      background: '#0f1c16',
      backgroundSecondary: '#1a2920',
      contentBackground: '#0f1c16',
      card: '#1a2920',
      sidebar: '#1a2920',
      sidebarText: '#d1fae5',
      sidebarTextSecondary: '#6ee7b7',
      text: '#d1fae5',
      textSecondary: '#94a3b8',
      textPrimary: '#d1fae5',
      primary: '#059669',
      primaryHover: '#10b981',
      primaryText: '#0f1c16',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#ef4444',
      border: '#334155',
    },
  },

  // 12. Crimson - Carmesí
  {
    id: 'crimson',
    name: 'Carmesí',
    palette: ['#1a0d0f', '#2a1517', '#dc2626', '#ef4444'],
    colors: {
      background: '#1a0d0f',
      backgroundSecondary: '#2a1517',
      contentBackground: '#1a0d0f',
      card: '#2a1517',
      sidebar: '#2a1517',
      sidebarText: '#fee2e2',
      sidebarTextSecondary: '#fca5a5',
      text: '#fee2e2',
      textSecondary: '#a8a29e',
      textPrimary: '#fee2e2',
      primary: '#dc2626',
      primaryHover: '#ef4444',
      primaryText: '#1a0d0f',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#06b6d4',
      error: '#dc2626',
      border: '#44403c',
    },
  },

  // 13. MindfulSpace - Neumorphic Pastel (Mental Health)
  {
    id: 'mindful',
    name: 'MindfulSpace',
    palette: ['#E8EEF5', '#ffffff', '#34d399', '#22d3ee'],
    colors: {
      background: '#E8EEF5',
      backgroundSecondary: '#dce4ed',
      contentBackground: '#E8EEF5',
      card: '#E8EEF5',
      sidebar: '#E8EEF5',
      sidebarText: '#334155',
      sidebarTextSecondary: '#64748b',
      text: '#1e293b',
      textSecondary: '#64748b',
      textPrimary: '#1e293b',
      primary: '#34d399',
      primaryHover: '#10b981',
      primaryText: '#ffffff',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#22d3ee',
      error: '#ef4444',
      border: '#c5ccd6',
    },
  },
];

// Helper para obtener un tema por ID
export function getThemeColors(presetId: string, _variant?: string): ThemeColors | null {
  const preset = themePresets.find(p => p.id === presetId);
  if (!preset) return null;
  return preset.colors;
}

// Helper para obtener todos los presets como opciones
export function getPresetOptions() {
  return themePresets.map(preset => ({
    id: preset.id,
    name: preset.name,
    palette: preset.palette,
  }));
}

// Configuración por defecto
export const defaultThemeConfig = {
  presetId: 'dark',
  variant: 'default' as ThemeVariant,
};

// Configuración por defecto de backgrounds
export const defaultBackgrounds: ThemeBackgrounds = {
  generalBgOpacity: 0.05,
  generalBgBlur: 0,
  sidebarBgOpacity: 0.15,
  sidebarBgBlur: 0,
  topbarBgOpacity: 0.1,
  topbarBgBlur: 0,
};

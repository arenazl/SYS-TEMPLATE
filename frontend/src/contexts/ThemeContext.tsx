import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themePresets, ThemePreset, ThemeColors, ThemeBackgrounds, defaultThemeConfig, defaultBackgrounds, getThemeColors } from '../config/themePresets';

export type { ThemePreset, ThemeColors, ThemeBackgrounds };
export { themePresets };

export interface Theme extends ThemeColors {
  id: string;
  name: string;
}

interface ThemeContextType {
  theme: Theme;
  currentThemeId: string;
  setTheme: (themeId: string) => void;
  presets: ThemePreset[];
  backgrounds: ThemeBackgrounds;
  isNeumorphic: boolean;
  updateGeneralBg: (url: string | undefined) => void;
  updateSidebarBg: (url: string | undefined) => void;
  updateTopbarBg: (url: string | undefined) => void;
  updateGeneralOpacity: (opacity: number) => void;
  updateSidebarOpacity: (opacity: number) => void;
  updateTopbarOpacity: (opacity: number) => void;
  updateGeneralBlur: (blur: number) => void;
  updateSidebarBlur: (blur: number) => void;
  updateTopbarBlur: (blur: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    const saved = localStorage.getItem('themeId');
    return saved || defaultThemeConfig.presetId;
  });

  const [backgrounds, setBackgrounds] = useState<ThemeBackgrounds>(() => {
    const saved = localStorage.getItem('themeBackgrounds');
    return saved ? JSON.parse(saved) : defaultBackgrounds;
  });

  const themeColors = getThemeColors(currentThemeId);
  const currentPreset = themePresets.find(p => p.id === currentThemeId);

  // Fallback a dark si no se encuentra
  const fallbackColors = getThemeColors('dark')!;
  const activeColors = themeColors || fallbackColors;

  const theme: Theme = {
    ...activeColors,
    id: currentThemeId,
    name: currentPreset?.name || 'Oscuro',
  };

  // Check if current theme is neumorphic (MindfulSpace)
  const isNeumorphic = currentThemeId === 'mindful';

  // Aplicar CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', activeColors.background);
    root.style.setProperty('--bg-secondary', activeColors.backgroundSecondary);
    root.style.setProperty('--text-primary', activeColors.text);
    root.style.setProperty('--text-secondary', activeColors.textSecondary);
    root.style.setProperty('--border-color', activeColors.border);
    root.style.setProperty('--color-primary', activeColors.primary);
    root.style.setProperty('--color-primary-hover', activeColors.primaryHover);
    root.style.setProperty('--bg-card', activeColors.card);
    root.style.setProperty('--bg-sidebar', activeColors.sidebar);

    document.body.style.backgroundColor = activeColors.background;
    document.body.style.color = activeColors.text;
  }, [currentThemeId, activeColors]);

  // Guardar themeId en localStorage
  useEffect(() => {
    localStorage.setItem('themeId', currentThemeId);
  }, [currentThemeId]);

  // Guardar backgrounds en localStorage
  useEffect(() => {
    localStorage.setItem('themeBackgrounds', JSON.stringify(backgrounds));
  }, [backgrounds]);

  const setTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
  };

  const updateGeneralBg = (url: string | undefined) => {
    setBackgrounds(prev => ({ ...prev, generalBg: url }));
  };

  const updateSidebarBg = (url: string | undefined) => {
    setBackgrounds(prev => ({ ...prev, sidebarBg: url }));
  };

  const updateTopbarBg = (url: string | undefined) => {
    setBackgrounds(prev => ({ ...prev, topbarBg: url }));
  };

  const updateGeneralOpacity = (opacity: number) => {
    setBackgrounds(prev => ({ ...prev, generalBgOpacity: opacity }));
  };

  const updateSidebarOpacity = (opacity: number) => {
    setBackgrounds(prev => ({ ...prev, sidebarBgOpacity: opacity }));
  };

  const updateTopbarOpacity = (opacity: number) => {
    setBackgrounds(prev => ({ ...prev, topbarBgOpacity: opacity }));
  };

  const updateGeneralBlur = (blur: number) => {
    setBackgrounds(prev => ({ ...prev, generalBgBlur: blur }));
  };

  const updateSidebarBlur = (blur: number) => {
    setBackgrounds(prev => ({ ...prev, sidebarBgBlur: blur }));
  };

  const updateTopbarBlur = (blur: number) => {
    setBackgrounds(prev => ({ ...prev, topbarBgBlur: blur }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentThemeId,
        setTheme,
        presets: themePresets,
        backgrounds,
        isNeumorphic,
        updateGeneralBg,
        updateSidebarBg,
        updateTopbarBg,
        updateGeneralOpacity,
        updateSidebarOpacity,
        updateTopbarOpacity,
        updateGeneralBlur,
        updateSidebarBlur,
        updateTopbarBlur,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

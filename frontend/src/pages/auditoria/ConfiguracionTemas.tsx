import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { imagenApi } from '../../lib/api';
import Card from '../../components/ui/Card';
import { Palette, Upload, X, Loader2 } from 'lucide-react';

export default function ConfiguracionTemas() {
  const {
    theme,
    currentThemeId,
    setTheme,
    presets,
    backgrounds,
    updateGeneralBg,
    updateSidebarBg,
    updateTopbarBg,
    updateGeneralOpacity,
    updateSidebarOpacity,
    updateTopbarOpacity,
    updateGeneralBlur,
    updateSidebarBlur,
    updateTopbarBlur,
  } = useTheme();

  const [uploading, setUploading] = useState<'general' | 'sidebar' | 'topbar' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generalInputRef = useRef<HTMLInputElement>(null);
  const sidebarInputRef = useRef<HTMLInputElement>(null);
  const topbarInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: 'general' | 'sidebar' | 'topbar') => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    setError(null);
    setUploading(type);

    try {
      const result = await imagenApi.upload(file, 'themes');

      switch (type) {
        case 'general':
          updateGeneralBg(result.url);
          break;
        case 'sidebar':
          updateSidebarBg(result.url);
          break;
        case 'topbar':
          updateTopbarBg(result.url);
          break;
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen. Por favor intenta nuevamente.');
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'general' | 'sidebar' | 'topbar') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const removeBackground = (type: 'general' | 'sidebar' | 'topbar') => {
    switch (type) {
      case 'general':
        updateGeneralBg(undefined);
        break;
      case 'sidebar':
        updateSidebarBg(undefined);
        break;
      case 'topbar':
        updateTopbarBg(undefined);
        break;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Palette size={32} style={{ color: theme.primary }} />
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            Configuración de Temas
          </h1>
        </div>
        <p style={{ color: theme.textSecondary }}>
          Personaliza la apariencia visual de tu aplicación con paletas de colores y fondos personalizados
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#dc262640',
            border: '1px solid #dc2626',
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      {/* Sección 1: Paletas de Colores */}
      <Card variant="glass">
        <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
          Paletas de Colores
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {presets.map((preset) => {
            const isSelected = currentThemeId === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => setTheme(preset.id)}
                className="group relative p-4 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: theme.card,
                  border: isSelected
                    ? `3px solid ${theme.primary}`
                    : `1px solid ${theme.border}`,
                  boxShadow: isSelected
                    ? `0 0 0 4px ${theme.primary}20`
                    : '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {/* Nombre del tema */}
                <div className="text-center mb-3">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: isSelected ? theme.primary : theme.text }}
                  >
                    {preset.name}
                  </span>
                </div>

                {/* Círculos de colores */}
                <div className="flex justify-center gap-2">
                  {preset.palette.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-full border-2"
                      style={{
                        backgroundColor: color,
                        borderColor: theme.border,
                      }}
                    />
                  ))}
                </div>

                {/* Indicador de selección */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Sección 2: Fondos Personalizados */}
      <Card variant="glass">
        <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
          Fondos Personalizados
        </h2>

        <div className="space-y-8">
          {/* Fondo General */}
          <BackgroundSection
            title="Fondo General"
            description="Imagen de fondo para toda la aplicación"
            currentBg={backgrounds.generalBg}
            opacity={backgrounds.generalBgOpacity}
            blur={backgrounds.generalBgBlur}
            onOpacityChange={updateGeneralOpacity}
            onBlurChange={updateGeneralBlur}
            onUploadClick={() => generalInputRef.current?.click()}
            onRemove={() => removeBackground('general')}
            uploading={uploading === 'general'}
            theme={theme}
          />

          <input
            ref={generalInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'general')}
          />

          {/* Divisor */}
          <div style={{ borderTop: `1px solid ${theme.border}` }} />

          {/* Fondo Sidebar */}
          <BackgroundSection
            title="Fondo Sidebar"
            description="Imagen de fondo para la barra lateral"
            note="La imagen tendrá un filtro del color de acento"
            currentBg={backgrounds.sidebarBg}
            opacity={backgrounds.sidebarBgOpacity}
            blur={backgrounds.sidebarBgBlur}
            onOpacityChange={updateSidebarOpacity}
            onBlurChange={updateSidebarBlur}
            onUploadClick={() => sidebarInputRef.current?.click()}
            onRemove={() => removeBackground('sidebar')}
            uploading={uploading === 'sidebar'}
            theme={theme}
          />

          <input
            ref={sidebarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'sidebar')}
          />

          {/* Divisor */}
          <div style={{ borderTop: `1px solid ${theme.border}` }} />

          {/* Fondo Topbar */}
          <BackgroundSection
            title="Fondo Topbar"
            description="Imagen de fondo para la barra superior"
            note="La imagen tendrá un filtro del color de acento"
            currentBg={backgrounds.topbarBg}
            opacity={backgrounds.topbarBgOpacity}
            blur={backgrounds.topbarBgBlur}
            onOpacityChange={updateTopbarOpacity}
            onBlurChange={updateTopbarBlur}
            onUploadClick={() => topbarInputRef.current?.click()}
            onRemove={() => removeBackground('topbar')}
            uploading={uploading === 'topbar'}
            theme={theme}
          />

          <input
            ref={topbarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, 'topbar')}
          />
        </div>
      </Card>
    </div>
  );
}

interface BackgroundSectionProps {
  title: string;
  description: string;
  note?: string;
  currentBg?: string;
  opacity: number;
  blur: number;
  onOpacityChange: (opacity: number) => void;
  onBlurChange: (blur: number) => void;
  onUploadClick: () => void;
  onRemove: () => void;
  uploading: boolean;
  theme: any;
}

function BackgroundSection({
  title,
  description,
  note,
  currentBg,
  opacity,
  blur,
  onOpacityChange,
  onBlurChange,
  onUploadClick,
  onRemove,
  uploading,
  theme,
}: BackgroundSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1" style={{ color: theme.text }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          {description}
        </p>
        {note && (
          <p className="text-xs mt-1" style={{ color: theme.primary }}>
            💡 {note}
          </p>
        )}
      </div>

      {/* Preview de la imagen */}
      {currentBg && (
        <div className="relative rounded-lg overflow-hidden" style={{ height: '200px' }}>
          <img
            src={currentBg}
            alt={title}
            className="w-full h-full object-cover"
            style={{
              opacity: opacity / 100,
              filter: `blur(${blur}px)`
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40"
            style={{ backdropFilter: 'blur(2px)' }}
          >
            <span className="text-white font-semibold">Vista previa</span>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Botón de upload */}
        <button
          onClick={onUploadClick}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.primary,
            color: theme.primaryText,
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload size={20} />
              {currentBg ? 'Cambiar Imagen' : 'Subir Imagen'}
            </>
          )}
        </button>

        {/* Botón de remover */}
        {currentBg && !uploading && (
          <button
            onClick={onRemove}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: '#dc262620',
              border: '1px solid #dc2626',
              color: '#dc2626',
            }}
          >
            <X size={20} />
            Remover
          </button>
        )}
      </div>

      {/* Sliders de opacidad y blur en una fila */}
      <div className="grid grid-cols-2 gap-4">
        {/* Slider de opacidad */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: theme.text }}>
              Opacidad
            </label>
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                backgroundColor: theme.primary + '20',
                color: theme.primary,
              }}
            >
              {Math.round(opacity)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${theme.primary} 0%, ${theme.primary} ${opacity}%, ${theme.border} ${opacity}%, ${theme.border} 100%)`,
            }}
          />
        </div>

        {/* Slider de blur */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" style={{ color: theme.text }}>
              Blur
            </label>
            <span
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                backgroundColor: theme.primary + '20',
                color: theme.primary,
              }}
            >
              {blur}px
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={(e) => onBlurChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${theme.primary} 0%, ${theme.primary} ${(blur / 20) * 100}%, ${theme.border} ${(blur / 20) * 100}%, ${theme.border} 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

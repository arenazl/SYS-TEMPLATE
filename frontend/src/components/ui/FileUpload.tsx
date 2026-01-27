import { useState, forwardRef, InputHTMLAttributes, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import type { ValidationResult } from '../../lib/validations';

interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  hint?: string;
  validate?: (file: File | null) => ValidationResult;
  onChange?: (file: File | null) => void;
  maxSize?: number;
  accept?: string;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      icon,
      error: externalError,
      success,
      hint,
      validate,
      onChange,
      className = '',
      required,
      maxSize = 5242880,
      accept = '*/*',
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const error = externalError || (touched ? internalError : undefined);
    const displayIcon = icon || <Upload className="h-5 w-5" />;

    const validateFile = (file: File | null) => {
      if (!file) return { isValid: true };

      if (file.size > maxSize) {
        const maxMB = (maxSize / 1024 / 1024).toFixed(1);
        return { isValid: false, error: `El archivo no puede exceder ${maxMB} MB` };
      }

      if (validate) {
        return validate(file);
      }

      return { isValid: true };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setTouched(true);

      const result = validateFile(file);
      if (!result.isValid) {
        setInternalError(result.error);
        setSelectedFile(null);
        onChange?.(null);
      } else {
        setInternalError(undefined);
        setSelectedFile(file);
        onChange?.(file);
      }
    };

    const handleClear = () => {
      setSelectedFile(null);
      setInternalError(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onChange?.(null);
    };

    const getBorderColor = () => {
      if (error) return '#ef4444';
      if (success && touched) return '#22c55e';
      return theme.border;
    };

    const getRingColor = () => {
      if (error) return 'rgba(239, 68, 68, 0.2)';
      if (success && touched) return 'rgba(34, 197, 94, 0.2)';
      return `${theme.primary}30`;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* File input trigger button */}
          <div
            className="cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div
              className="flex items-center justify-center gap-3 py-8 px-4 rounded-xl transition-all hover:opacity-80"
              style={{
                backgroundColor: theme.backgroundSecondary,
                border: `2px dashed ${getBorderColor()}`,
                borderStyle: selectedFile ? 'solid' : 'dashed',
                cursor: 'pointer',
              }}
            >
              <div
                style={{ color: error ? '#ef4444' : theme.textSecondary }}
              >
                {displayIcon}
              </div>
              <div className="flex flex-col items-start gap-1">
                <p className="text-sm font-medium" style={{ color: theme.text }}>
                  {selectedFile ? 'Archivo seleccionado' : 'Subir archivo'}
                </p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {selectedFile ? selectedFile.name : 'Click o arrastra un archivo'}
                </p>
                {selectedFile && (
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    {formatFileSize(selectedFile.size)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            {...props}
          />

          {/* Clear button */}
          {selectedFile && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 focus:outline-none"
              style={{
                backgroundColor: `${theme.primary}15`,
                color: theme.primary,
              }}
              title="Limpiar archivo"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Status icon */}
          {!selectedFile && error && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}

          {!selectedFile && success && touched && !error && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p className="mt-1.5 text-xs" style={{ color: theme.textSecondary }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

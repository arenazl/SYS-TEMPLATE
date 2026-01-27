import { useState, forwardRef, TextareaHTMLAttributes } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AlertCircle, CheckCircle2, Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import type { ValidationResult } from '../../lib/validations';

interface RichTextEditorProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  hint?: string;
  validate?: (value: string) => ValidationResult;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showToolbar?: boolean;
}

export const RichTextEditor = forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
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
      placeholder = 'Enter text...',
      minHeight = 120,
      showToolbar = true,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();

    const error = externalError || (touched ? internalError : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;

      if (validate) {
        const result = validate(value);
        setInternalError(result.error);
      }

      onChange?.(value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setTouched(true);

      if (validate) {
        const result = validate(e.target.value);
        setInternalError(result.error);
      }

      props.onBlur?.(e);
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

    const applyFormat = (format: string) => {
      if (ref && typeof ref !== 'function') {
        const textarea = ref.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selectedText = textarea.value.substring(start, end);
          const beforeText = textarea.value.substring(0, start);
          const afterText = textarea.value.substring(end);

          let formattedText = '';
          let newCursorPosition = start;

          switch (format) {
            case 'bold':
              formattedText = `${beforeText}**${selectedText}**${afterText}`;
              newCursorPosition = start + 2;
              break;
            case 'italic':
              formattedText = `${beforeText}*${selectedText}*${afterText}`;
              newCursorPosition = start + 1;
              break;
            case 'underline':
              formattedText = `${beforeText}<u>${selectedText}</u>${afterText}`;
              newCursorPosition = start + 3;
              break;
            case 'ul':
              formattedText = `${beforeText}\n- ${selectedText}${afterText}`;
              newCursorPosition = start + 3;
              break;
            case 'ol':
              formattedText = `${beforeText}\n1. ${selectedText}${afterText}`;
              newCursorPosition = start + 4;
              break;
            default:
              return;
          }

          textarea.value = formattedText;
          onChange?.(formattedText);

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
          }, 0);
        }
      }
    };

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {showToolbar && (
          <div
            className="flex gap-1 mb-2 p-2 rounded-lg flex-wrap"
            style={{
              backgroundColor: theme.backgroundSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <ToolbarButton
              icon={<Bold className="h-4 w-4" />}
              onClick={() => applyFormat('bold')}
              title="Bold"
              theme={theme}
            />
            <ToolbarButton
              icon={<Italic className="h-4 w-4" />}
              onClick={() => applyFormat('italic')}
              title="Italic"
              theme={theme}
            />
            <ToolbarButton
              icon={<Underline className="h-4 w-4" />}
              onClick={() => applyFormat('underline')}
              title="Underline"
              theme={theme}
            />
            <div
              className="w-px"
              style={{ backgroundColor: theme.border, margin: '0 2px' }}
            />
            <ToolbarButton
              icon={<List className="h-4 w-4" />}
              onClick={() => applyFormat('ul')}
              title="Bullet List"
              theme={theme}
            />
            <ToolbarButton
              icon={<ListOrdered className="h-4 w-4" />}
              onClick={() => applyFormat('ol')}
              title="Numbered List"
              theme={theme}
            />
          </div>
        )}

        <div className="relative">
          {icon && (
            <div
              className="absolute left-4 top-4 pointer-events-none"
              style={{ color: error ? '#ef4444' : theme.textSecondary }}
            >
              {icon}
            </div>
          )}

          <textarea
            ref={ref}
            className="w-full rounded-xl focus:ring-2 focus:outline-none transition-all resize-none p-4"
            style={{
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              border: `1px solid ${getBorderColor()}`,
              minHeight: `${minHeight}px`,
              paddingLeft: icon ? '3rem' : '1rem',
              paddingRight: error || (success && touched) ? '3rem' : '1rem',
              boxShadow: touched && (error || success) ? `0 0 0 3px ${getRingColor()}` : undefined,
              fontFamily: 'inherit',
            }}
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
          />

          {/* Status icon */}
          {error && (
            <div className="absolute right-4 top-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}

          {success && touched && !error && (
            <div className="absolute right-4 top-4">
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

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  theme: any;
}

function ToolbarButton({ icon, onClick, title, theme }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 focus:outline-none"
      style={{
        color: theme.text,
        backgroundColor: 'transparent',
        border: `1px solid ${theme.border}`,
      }}
      tabIndex={-1}
    >
      {icon}
    </button>
  );
}

RichTextEditor.displayName = 'RichTextEditor';

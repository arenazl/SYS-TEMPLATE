import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import type { ValidationResult } from '../../lib/validations';

interface TagsInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  hint?: string;
  validate?: (value: string) => ValidationResult;
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  tagSeparators?: string[];
}

export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
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
      placeholder = 'Type and press Enter to add tags...',
      maxTags = 10,
      tagSeparators = [',', ' ', 'Enter'],
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>();
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');

    const error = externalError || (touched ? internalError : undefined);

    const validateTag = (tag: string) => {
      if (!tag.trim()) return { isValid: false, error: 'Tag cannot be empty' };
      if (tags.includes(tag.trim())) return { isValid: false, error: 'Tag already exists' };

      if (validate) {
        return validate(tag.trim());
      }

      return { isValid: true };
    };

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim();

      if (!trimmedTag) {
        setInternalError('Tag cannot be empty');
        return;
      }

      const result = validateTag(trimmedTag);
      if (!result.isValid) {
        setInternalError(result.error);
        return;
      }

      if (tags.length >= maxTags) {
        setInternalError(`Maximum ${maxTags} tags allowed`);
        return;
      }

      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setInputValue('');
      setInternalError(undefined);
      onChange?.(newTags);
      setTouched(true);
    };

    const removeTag = (index: number) => {
      const newTags = tags.filter((_, i) => i !== index);
      setTags(newTags);
      setInternalError(undefined);
      onChange?.(newTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setInternalError(undefined);
    };

    const handleBlur = () => {
      setTouched(true);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const newTagsFromPaste = pastedText.split(/[,\n]/).map(t => t.trim()).filter(t => t);

      let addedCount = 0;
      for (const tag of newTagsFromPaste) {
        if (tags.length + addedCount >= maxTags) {
          setInternalError(`Maximum ${maxTags} tags allowed`);
          break;
        }
        const result = validateTag(tag);
        if (result.isValid && !tags.includes(tag)) {
          tags.push(tag);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        const newTags = [...tags];
        setTags(newTags);
        onChange?.(newTags);
        setInputValue('');
        setInternalError(undefined);
      }
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

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium mb-1.5" style={{ color: theme.text }}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <div
            className="w-full py-3 px-4 rounded-xl focus-within:ring-2 focus-within:outline-none transition-all flex flex-wrap items-center gap-2"
            style={{
              backgroundColor: theme.backgroundSecondary,
              border: `1px solid ${getBorderColor()}`,
              boxShadow: touched && (error || success) ? `0 0 0 3px ${getRingColor()}` : undefined,
              minHeight: '3.25rem',
            }}
            onClick={(e) => {
              const input = (e.currentTarget.querySelector('input') as HTMLInputElement);
              input?.focus();
            }}
          >
            {/* Icon */}
            {icon && (
              <div
                style={{ color: error ? '#ef4444' : theme.textSecondary }}
                className="flex-shrink-0"
              >
                {icon}
              </div>
            )}

            {/* Tags display */}
            {tags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0"
                style={{
                  backgroundColor: `${theme.primary}20`,
                  color: theme.primary,
                }}
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(index);
                  }}
                  className="hover:opacity-70 focus:outline-none transition-opacity"
                  title={`Remove ${tag}`}
                  tabIndex={-1}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Input field */}
            <input
              ref={ref}
              type="text"
              placeholder={tags.length === 0 ? placeholder : ''}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onPaste={handlePaste}
              className="flex-1 min-w-[100px] bg-transparent focus:outline-none text-sm"
              style={{
                color: theme.text,
              }}
              {...props}
            />

            {/* Status icon */}
            {error && (
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}

            {success && touched && !error && (
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
        </div>

        {/* Tag count helper text */}
        {tags.length > 0 && (
          <p className="mt-1.5 text-xs" style={{ color: theme.textSecondary }}>
            {tags.length} of {maxTags} tags
          </p>
        )}

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

TagsInput.displayName = 'TagsInput';

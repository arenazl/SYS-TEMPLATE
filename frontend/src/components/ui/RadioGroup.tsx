import { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface RadioOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  color?: string;
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: string;
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup({
  value,
  onChange,
  options,
  label,
  disabled = false,
  className = '',
  orientation = 'vertical',
}: RadioGroupProps) {
  const { theme } = useTheme();

  return (
    <div className={`${className}`}>
      {label && (
        <label
          className="block text-xs font-medium mb-3"
          style={{ color: theme.textSecondary }}
        >
          {label}
        </label>
      )}

      <div
        className={`space-y-2 ${
          orientation === 'horizontal' ? 'flex flex-wrap gap-3' : ''
        }`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 text-left
                ${orientation === 'horizontal' ? 'flex-1 min-w-max' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                backgroundColor: isSelected
                  ? `${option.color || theme.primary}15`
                  : theme.backgroundSecondary,
                border: `2px solid ${
                  isSelected
                    ? option.color || theme.primary
                    : theme.border
                }`,
                color: theme.text,
              }}
            >
              {/* Radio Circle */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: isSelected
                    ? option.color || theme.primary
                    : 'transparent',
                  border: `2px solid ${
                    isSelected
                      ? option.color || theme.primary
                      : theme.border
                  }`,
                }}
              >
                {isSelected && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.card }}
                  />
                )}
              </div>

              {/* Icon and Label */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {option.icon && (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: option.color
                        ? `${option.color}20`
                        : `${theme.primary}20`,
                      color: option.color || theme.primary,
                    }}
                  >
                    {option.icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span
                    className={`block truncate ${
                      isSelected ? 'font-semibold' : 'font-medium'
                    }`}
                    style={{
                      color: option.color || theme.text,
                    }}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span
                      className="block text-xs truncate"
                      style={{ color: theme.textSecondary }}
                    >
                      {option.description}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

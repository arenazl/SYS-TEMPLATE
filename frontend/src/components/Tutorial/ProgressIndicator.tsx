import { useTheme } from '../../contexts/ThemeContext';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  showLabels?: boolean;
  variant?: 'dots' | 'bar' | 'steps';
}

/**
 * Componente ProgressIndicator para mostrar el progreso en pasos del tutorial
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  className = '',
  showLabels = true,
  variant = 'steps',
}: ProgressIndicatorProps) {
  const { theme } = useTheme();

  if (variant === 'bar') {
    return (
      <div className={`w-full ${className}`}>
        {showLabels && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-xs" style={{ color: theme.textSecondary }}>
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
        )}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: `${theme.primary}20` }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              backgroundColor: theme.primary,
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="transition-all duration-300"
              style={{
                width: isCurrent ? '12px' : '8px',
                height: isCurrent ? '12px' : '8px',
                borderRadius: '50%',
                backgroundColor: isCompleted || isCurrent ? theme.primary : `${theme.textSecondary}30`,
                opacity: isCompleted || isCurrent ? 1 : 0.5,
              }}
            />
          );
        })}
        {showLabels && (
          <span className="ml-2 text-sm" style={{ color: theme.textSecondary }}>
            {currentStep} / {totalSteps}
          </span>
        )}
      </div>
    );
  }

  // Variant: 'steps' (default)
  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
            Paso {currentStep} de {totalSteps}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="relative flex items-center justify-center">
                <div
                  className="rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300"
                  style={{
                    width: isCurrent ? '40px' : '32px',
                    height: isCurrent ? '40px' : '32px',
                    backgroundColor: isCompleted || isCurrent ? theme.primary : theme.backgroundSecondary,
                    color: isCompleted || isCurrent ? '#FFFFFF' : theme.textSecondary,
                    border: isCurrent ? `2px solid ${theme.primary}` : `2px solid ${theme.border}`,
                    boxShadow: isCurrent ? `0 0 0 4px ${theme.primary}20` : 'none',
                  }}
                >
                  {isCompleted ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.3333 4L6 11.3333L2.66667 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div
                  className="h-0.5 flex-1 mx-2 transition-all duration-500"
                  style={{
                    backgroundColor: isCompleted ? theme.primary : `${theme.textSecondary}20`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ProgressIndicator compacto para espacios reducidos
 */
export function CompactProgressIndicator({
  currentStep,
  totalSteps,
  className = '',
}: {
  currentStep: number;
  totalSteps: number;
  className?: string;
}) {
  const { theme } = useTheme();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: `${theme.primary}20`,
          color: theme.primary,
        }}
      >
        {currentStep}/{totalSteps}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: index + 1 <= currentStep ? theme.primary : `${theme.textSecondary}30`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

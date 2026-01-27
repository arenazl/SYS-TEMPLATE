import { ReactNode } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface TutorialStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  icon?: ReactNode;
  actions?: ReactNode;
  estimatedTime?: string;
}

/**
 * TutorialStep component - Renders a single tutorial step with content
 * Displays step information, content, and optional actions
 */
export function TutorialStep({
  stepNumber,
  title,
  description,
  children,
  isActive = false,
  isCompleted = false,
  icon,
  actions,
  estimatedTime,
}: TutorialStepProps) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        borderRadius: '0.75rem',
        border: `2px solid ${isActive ? theme.primary : theme.border}`,
        backgroundColor: theme.card,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isActive
          ? `0 10px 25px -5px ${theme.primary}30, 0 0 0 3px ${theme.primary}15`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        opacity: isCompleted && !isActive ? 0.75 : 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: isActive
            ? `${theme.primary}10`
            : isCompleted
            ? `${theme.success}08`
            : theme.backgroundSecondary,
          borderBottom: `1px solid ${theme.border}`,
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {/* Step Icon/Number */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: isCompleted
                ? theme.success
                : isActive
                ? theme.primary
                : theme.backgroundSecondary,
              color: isCompleted || isActive ? '#FFFFFF' : theme.textSecondary,
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: isActive ? `2px solid ${theme.primary}` : 'none',
              boxShadow: isActive ? `0 0 0 3px ${theme.primary}20` : 'none',
            }}
          >
            {isCompleted ? (
              <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem' }} />
            ) : icon ? (
              icon
            ) : (
              stepNumber
            )}
          </div>

          {/* Title and Description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: isActive ? theme.primary : theme.text,
                  transition: 'color 0.3s ease',
                }}
              >
                {title}
              </h3>
              {estimatedTime && (
                <span
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: `${theme.textSecondary}15`,
                    color: theme.textSecondary,
                  }}
                >
                  ~{estimatedTime}
                </span>
              )}
              {isCompleted && (
                <span
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: `${theme.success}20`,
                    color: theme.success,
                  }}
                >
                  Completado
                </span>
              )}
            </div>
            {description && (
              <p
                style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: theme.textSecondary,
                  lineHeight: '1.5',
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: '1.5rem',
          color: theme.text,
          transition: 'all 0.3s ease',
        }}
      >
        {children}
      </div>

      {/* Actions Footer */}
      {actions && (
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: theme.backgroundSecondary,
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            justifyContent: 'flex-end',
            transition: 'all 0.3s ease',
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * TutorialStepSection - Helper component for organizing content within a step
 */
export function TutorialStepSection({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { theme } = useTheme();

  return (
    <div className={`mb-6 last:mb-0 ${className}`}>
      {title && (
        <h4
          style={{
            margin: '0 0 0.75rem 0',
            fontSize: '1rem',
            fontWeight: 600,
            color: theme.text,
          }}
        >
          {title}
        </h4>
      )}
      <div>{children}</div>
    </div>
  );
}

/**
 * TutorialStepList - Helper component for displaying lists within steps
 */
export function TutorialStepList({
  items,
  ordered = false,
  className = '',
}: {
  items: (string | ReactNode)[];
  ordered?: boolean;
  className?: string;
}) {
  const { theme } = useTheme();
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag
      className={className}
      style={{
        margin: 0,
        paddingLeft: '1.5rem',
        color: theme.text,
      }}
    >
      {items.map((item, index) => (
        <li
          key={index}
          style={{
            marginBottom: '0.5rem',
            lineHeight: '1.6',
            color: theme.text,
          }}
        >
          {typeof item === 'string' ? <span>{item}</span> : item}
        </li>
      ))}
    </ListTag>
  );
}

export default TutorialStep;

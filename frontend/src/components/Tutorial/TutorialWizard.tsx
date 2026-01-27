/**
 * TutorialWizard - Componente orquestador para guiar usuarios a través del tutorial interactivo
 *
 * Gestiona el flujo del tutorial, navegación entre pasos, y seguimiento de progreso.
 * Coordina los componentes TutorialStep, ProgressIndicator y CodeBlock para crear
 * una experiencia guiada completa.
 */

import { useState, useEffect, useMemo, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { TutorialStep } from './TutorialStep';
import { ProgressIndicator } from './ProgressIndicator';

// Tipos
export interface TutorialStepConfig {
  id: string;
  title: string;
  description?: string;
  estimatedTime?: string;
  icon?: ReactNode;
  content: ReactNode;
  actions?: ReactNode;
  canSkip?: boolean;
  validation?: () => boolean | Promise<boolean>;
}

export interface TutorialWizardProps {
  title: string;
  description?: string;
  steps: TutorialStepConfig[];
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
  persistProgress?: boolean;
  storageKey?: string;
  showProgressIndicator?: boolean;
  allowStepNavigation?: boolean;
  className?: string;
}

export function TutorialWizard({
  title,
  description,
  steps,
  onComplete,
  onStepChange,
  persistProgress = true,
  storageKey = 'tutorial-progress',
  showProgressIndicator = true,
  allowStepNavigation = false,
  className = '',
}: TutorialWizardProps) {
  const { theme } = useTheme();

  // Estados
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Cargar progreso desde localStorage
  useEffect(() => {
    if (persistProgress && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const { currentStep, completed, finished } = JSON.parse(saved);
          setCurrentStepIndex(currentStep || 0);
          setCompletedSteps(new Set(completed || []));
          setTutorialCompleted(finished || false);
        }
      } catch {
        // Error silencioso - usar valores por defecto
      }
    }
  }, [persistProgress, storageKey]);

  // Guardar progreso en localStorage
  useEffect(() => {
    if (persistProgress && storageKey) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            currentStep: currentStepIndex,
            completed: Array.from(completedSteps),
            finished: tutorialCompleted,
          })
        );
      } catch {
        // Error silencioso
      }
    }
  }, [currentStepIndex, completedSteps, tutorialCompleted, persistProgress, storageKey]);

  // Notificar cambio de paso
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex);
    }
  }, [currentStepIndex, onStepChange]);

  // Step actual
  const currentStep = useMemo(() => steps[currentStepIndex], [steps, currentStepIndex]);

  // Estado del paso
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isStepCompleted = completedSteps.has(currentStepIndex);

  // Handlers de navegación
  const handleNext = async () => {
    // Validar paso actual si tiene validación
    if (currentStep.validation) {
      setIsValidating(true);
      try {
        const isValid = await currentStep.validation();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      } catch {
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    // Marcar paso como completado
    setCompletedSteps((prev) => new Set([...prev, currentStepIndex]));

    // Si es el último paso, completar tutorial
    if (isLastStep) {
      setTutorialCompleted(true);
      if (onComplete) {
        onComplete();
      }
    } else {
      // Avanzar al siguiente paso
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleGoToStep = (stepIndex: number) => {
    if (!allowStepNavigation) return;
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setTutorialCompleted(false);
    if (persistProgress && storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  // Render del tutorial completado
  if (tutorialCompleted) {
    return (
      <div className={className}>
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem',
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: `${theme.success}20`,
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  color: theme.success,
                }}
              />
            </div>
            <h1
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '2rem',
                fontWeight: 700,
                color: theme.text,
              }}
            >
              ¡Tutorial Completado!
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '1.125rem',
                color: theme.textSecondary,
                lineHeight: '1.6',
              }}
            >
              Has completado todos los pasos del tutorial. ¡Excelente trabajo!
            </p>
          </div>

          {/* Completion Card */}
          <div
            style={{
              borderRadius: '0.75rem',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.card,
              padding: '2rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: theme.text,
              }}
            >
              Próximos Pasos
            </h3>
            <p
              style={{
                margin: '0 0 1.5rem 0',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6',
              }}
            >
              Ahora que has completado el tutorial, puedes explorar el resto de la aplicación
              y crear tus propias entidades personalizadas.
            </p>
            <button
              onClick={handleRestart}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
              }}
            >
              <RotateCcw style={{ width: '1rem', height: '1rem' }} />
              Reiniciar Tutorial
            </button>
          </div>

          {/* Progress Summary */}
          <div
            style={{
              borderRadius: '0.75rem',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.card,
              padding: '1.5rem',
            }}
          >
            <h4
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: 600,
                color: theme.text,
              }}
            >
              Resumen del Tutorial
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: theme.textSecondary, fontSize: '0.875rem' }}>
                  Pasos completados:
                </span>
                <span style={{ color: theme.text, fontWeight: 600, fontSize: '0.875rem' }}>
                  {steps.length} / {steps.length}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: `${theme.success}20`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.success,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render del tutorial en progreso
  return (
    <div className={className}>
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2rem 1rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '2rem',
              fontWeight: 700,
              color: theme.text,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                margin: 0,
                fontSize: '1rem',
                color: theme.textSecondary,
                lineHeight: '1.6',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        {showProgressIndicator && (
          <div style={{ marginBottom: '2rem' }}>
            <ProgressIndicator
              currentStep={currentStepIndex + 1}
              totalSteps={steps.length}
              variant="steps"
            />
          </div>
        )}

        {/* Current Step */}
        <div style={{ marginBottom: '2rem' }}>
          <TutorialStep
            stepNumber={currentStepIndex + 1}
            title={currentStep.title}
            description={currentStep.description}
            estimatedTime={currentStep.estimatedTime}
            icon={currentStep.icon}
            isActive={true}
            isCompleted={isStepCompleted}
            actions={
              currentStep.actions || (
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                  {/* Previous Button */}
                  {!isFirstStep && (
                    <button
                      onClick={handlePrevious}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.backgroundSecondary,
                        color: theme.text,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.border;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
                      }}
                    >
                      <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
                      Anterior
                    </button>
                  )}

                  <div style={{ flex: 1 }} />

                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    disabled={isValidating}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1.25rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: isValidating ? theme.textSecondary : theme.primary,
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isValidating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isValidating ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isValidating) {
                        e.currentTarget.style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isValidating) {
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  >
                    {isValidating ? (
                      'Validando...'
                    ) : isLastStep ? (
                      <>
                        <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                        Completar
                      </>
                    ) : (
                      <>
                        Siguiente
                        <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                      </>
                    )}
                  </button>
                </div>
              )
            }
          >
            {currentStep.content}
          </TutorialStep>
        </div>

        {/* Step Navigation (if enabled) */}
        {allowStepNavigation && steps.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: theme.backgroundSecondary,
            }}
          >
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleGoToStep(index)}
                disabled={index === currentStepIndex}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor:
                    index === currentStepIndex
                      ? theme.primary
                      : completedSteps.has(index)
                      ? `${theme.success}20`
                      : theme.card,
                  color:
                    index === currentStepIndex
                      ? '#FFFFFF'
                      : completedSteps.has(index)
                      ? theme.success
                      : theme.textSecondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: index === currentStepIndex ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: index === currentStepIndex ? 1 : 0.8,
                }}
                onMouseEnter={(e) => {
                  if (index !== currentStepIndex) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentStepIndex) {
                    e.currentTarget.style.opacity = '0.8';
                  }
                }}
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorialWizard;

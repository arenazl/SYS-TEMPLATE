import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileJson, Terminal, Rocket, CheckSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { TutorialWizard, TutorialStepConfig } from '../components/Tutorial/TutorialWizard';
import { TutorialStepSection, TutorialStepList } from '../components/Tutorial/TutorialStep';
import { CodeBlock } from '../components/Tutorial/CodeBlock';

export default function GettingStarted() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);

  // Tutorial steps configuration
  const tutorialSteps: TutorialStepConfig[] = [
    {
      id: 'welcome',
      title: 'Bienvenido a SYS-TEMPLATE',
      description: 'Aprende a crear tu primera entidad en minutos',
      estimatedTime: '2 min',
      icon: <BookOpen className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <TutorialStepSection>
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              <strong>SYS-TEMPLATE</strong> es un framework que genera aplicaciones completas con
              ABMs dinámicos a partir de simples definiciones JSON.
            </p>
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              En este tutorial aprenderás a:
            </p>
            <TutorialStepList
              items={[
                'Definir una entidad en formato JSON',
                'Ejecutar el generador de código',
                'Ver tu aplicación funcionando con CRUD completo',
                'Entender la estructura generada',
              ]}
            />
          </TutorialStepSection>

          <TutorialStepSection title="¿Qué vamos a crear?">
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              Crearemos una entidad <strong>Task</strong> (tarea) con los siguientes campos:
            </p>
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: theme.backgroundSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <TutorialStepList
                items={[
                  <span>
                    <strong style={{ color: theme.primary }}>titulo</strong> - Nombre de la tarea (texto requerido)
                  </span>,
                  <span>
                    <strong style={{ color: theme.primary }}>descripcion</strong> - Detalle de la tarea (texto largo)
                  </span>,
                  <span>
                    <strong style={{ color: theme.primary }}>completada</strong> - Estado de la tarea (boolean)
                  </span>,
                  <span>
                    <strong style={{ color: theme.primary }}>fecha_vencimiento</strong> - Fecha límite (date)
                  </span>,
                ]}
              />
            </div>
          </TutorialStepSection>

          <div
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: `${theme.info}15`,
              border: `1px solid ${theme.info}`,
              color: theme.text,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6' }}>
              <strong>💡 Nota:</strong> Este tutorial toma aproximadamente 10 minutos. Al final
              tendrás una aplicación completa con backend, frontend y base de datos configurada.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'entity-definition',
      title: 'Definir la Entidad',
      description: 'Crea el archivo JSON con la definición de tu entidad',
      estimatedTime: '3 min',
      icon: <FileJson className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <TutorialStepSection>
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              Las entidades se definen en archivos JSON dentro de la carpeta <code style={{
                backgroundColor: theme.backgroundSecondary,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace'
              }}>cli/</code>.
            </p>
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              Ya hemos preparado un archivo de ejemplo para ti: <strong>tutorial-example.json</strong>
            </p>
          </TutorialStepSection>

          <TutorialStepSection title="Estructura del archivo">
            <CodeBlock
              language="json"
              title="cli/tutorial-example.json"
              code={`{
  "module": {
    "name": "Tutorial",
    "description": "Ejemplo simple para aprender a usar el generador",
    "icon": "GraduationCap",
    "path": "tutorial",
    "folder": "tutorial",
    "requiredRole": "usuario",
    "containerStyle": "dashboard"
  },
  "entities": [
    {
      "name": "Task",
      "plural": "tasks",
      "table": "tasks",
      "fields": "titulo:string:req descripcion:text completada:bool fecha_vencimiento:date",
      "icon": "CheckSquare",
      "order": 1
    }
  ]
}`}
            />
          </TutorialStepSection>

          <TutorialStepSection title="Entendiendo la sintaxis de campos">
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              Los campos se definen con la sintaxis: <code style={{
                backgroundColor: theme.backgroundSecondary,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace'
              }}>nombre:tipo[:modificadores]</code>
            </p>
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: theme.backgroundSecondary,
                border: `1px solid ${theme.border}`,
                marginTop: '1rem',
              }}
            >
              <TutorialStepList
                items={[
                  <span>
                    <code style={{ color: theme.primary }}>string</code> - Texto corto
                  </span>,
                  <span>
                    <code style={{ color: theme.primary }}>text</code> - Texto largo (textarea)
                  </span>,
                  <span>
                    <code style={{ color: theme.primary }}>bool</code> - Verdadero/Falso
                  </span>,
                  <span>
                    <code style={{ color: theme.primary }}>date</code> - Fecha
                  </span>,
                  <span>
                    <code style={{ color: theme.primary }}>int</code> - Número entero
                  </span>,
                  <span>
                    <code style={{ color: theme.primary }}>decimal</code> - Número decimal
                  </span>,
                  <span>
                    <code style={{ color: theme.primary }}>:req</code> - Hace el campo requerido
                  </span>,
                ]}
              />
            </div>
          </TutorialStepSection>

          <div
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: `${theme.success}15`,
              border: `1px solid ${theme.success}`,
              color: theme.text,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6' }}>
              <strong>✅ ¡Listo!</strong> El archivo tutorial-example.json ya existe en tu proyecto.
              No necesitas crear nada, solo entender cómo funciona.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'run-generator',
      title: 'Ejecutar el Generador',
      description: 'Genera todo el código automáticamente',
      estimatedTime: '2 min',
      icon: <Terminal className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <TutorialStepSection>
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              El generador creará automáticamente:
            </p>
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: theme.backgroundSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <TutorialStepList
                items={[
                  '📄 Modelo SQLModel (backend/models/task.py)',
                  '📋 Schema Pydantic (backend/schemas/task.py)',
                  '🔌 API endpoints (backend/api/tasks.py)',
                  '💻 Página React con ABM completo',
                  '📊 Migración de base de datos',
                  '🗺️ Rutas y navegación',
                ]}
              />
            </div>
          </TutorialStepSection>

          <TutorialStepSection title="Comando para ejecutar">
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              Abre tu terminal y ejecuta:
            </p>
            <CodeBlock
              language="bash"
              code={`cd cli
npm run sync:migrate`}
            />
            <p style={{ color: theme.textSecondary, marginTop: '1rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
              O si prefieres ejecutar el tutorial específicamente:
            </p>
            <CodeBlock
              language="bash"
              code={`cd cli
npx tsx run-tutorial.ts --migrate`}
            />
          </TutorialStepSection>

          <TutorialStepSection title="¿Qué hace sync:migrate?">
            <TutorialStepList
              ordered
              items={[
                'Lee el archivo tutorial-example.json',
                'Genera los modelos Python con SQLModel',
                'Genera los schemas Pydantic para validación',
                'Crea los endpoints de API con FastAPI',
                'Genera la página React con el componente DynamicABM',
                'Actualiza las rutas y el registro de entidades',
                'Crea una migración Alembic para la base de datos',
                'Aplica la migración automáticamente',
              ]}
            />
          </TutorialStepSection>

          <div
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: `${theme.warning}15`,
              border: `1px solid ${theme.warning}`,
              color: theme.text,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6' }}>
              <strong>⚠️ Importante:</strong> Asegúrate de tener Node.js instalado y haber ejecutado
              <code style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace',
                margin: '0 0.25rem'
              }}>npm install</code> en la carpeta cli.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'explore-results',
      title: 'Explorar los Resultados',
      description: 'Revisa el código generado y prueba la aplicación',
      estimatedTime: '3 min',
      icon: <Rocket className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <TutorialStepSection title="Archivos generados">
            <p style={{ color: theme.text, marginBottom: '1rem', lineHeight: '1.6' }}>
              Si ejecutaste el generador correctamente, deberías ver estos archivos:
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ color: theme.text, fontWeight: 600, marginBottom: '0.5rem' }}>
                Backend (Python)
              </h5>
              <CodeBlock
                language="python"
                title="backend/models/task.py"
                maxHeight="200px"
                code={`from sqlmodel import Field, SQLModel
from datetime import date
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    descripcion: Optional[str] = None
    completada: bool = False
    fecha_vencimiento: Optional[date] = None`}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ color: theme.text, fontWeight: 600, marginBottom: '0.5rem' }}>
                Frontend (React + TypeScript)
              </h5>
              <p style={{ color: theme.textSecondary, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Ubicación: <code>frontend/src/pages/tutorial/TaskABM.tsx</code>
              </p>
              <p style={{ color: theme.text, fontSize: '0.875rem', lineHeight: '1.6' }}>
                El generador crea automáticamente una página React que usa el componente
                <strong> DynamicABM</strong> con todas las operaciones CRUD configuradas.
              </p>
            </div>
          </TutorialStepSection>

          <TutorialStepSection title="Probar la aplicación">
            <TutorialStepList
              ordered
              items={[
                'Asegúrate de que el backend esté corriendo (uvicorn main:app --reload)',
                'Asegúrate de que el frontend esté corriendo (npm run dev)',
                'Busca "Tasks" en el menú de navegación',
                'Intenta crear una nueva tarea',
                'Edita y elimina tareas para probar el CRUD completo',
              ]}
            />
          </TutorialStepSection>

          <div
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: `${theme.info}15`,
              border: `1px solid ${theme.info}`,
              color: theme.text,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6' }}>
              <strong>💡 Tip:</strong> Revisa el archivo <code>APP_GUIDE/13_GENERADOR.md</code> para
              aprender más sobre las opciones avanzadas del generador.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'next-steps',
      title: '¡Listo para crear tus propias entidades!',
      description: 'Próximos pasos y recursos',
      estimatedTime: '1 min',
      icon: <CheckSquare className="h-5 w-5" />,
      content: (
        <div className="space-y-6">
          <TutorialStepSection>
            <p style={{ color: theme.text, marginBottom: '1rem', fontSize: '1.125rem', lineHeight: '1.6' }}>
              ¡Felicitaciones! 🎉 Ahora sabes cómo usar el generador de SYS-TEMPLATE.
            </p>
          </TutorialStepSection>

          <TutorialStepSection title="Próximos pasos">
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: theme.backgroundSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <TutorialStepList
                items={[
                  'Crea tu propia entidad editando cli/negocio.json',
                  'Experimenta con diferentes tipos de campos',
                  'Añade relaciones entre entidades (foreign keys)',
                  'Personaliza los estilos y componentes del frontend',
                  'Explora la documentación en APP_GUIDE/',
                ]}
              />
            </div>
          </TutorialStepSection>

          <TutorialStepSection title="Documentación útil">
            <p style={{ color: theme.textSecondary, marginBottom: '1rem', fontSize: '0.875rem' }}>
              La documentación completa está disponible en la carpeta <code style={{
                backgroundColor: theme.backgroundSecondary,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace'
              }}>APP_GUIDE/</code> de tu proyecto local.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                <span>📖</span>
                <span style={{ fontWeight: 600 }}>Guía del Generador</span>
                <code style={{ fontSize: '0.75rem', color: theme.textSecondary }}>APP_GUIDE/13_GENERADOR.md</code>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                <span>🏗️</span>
                <span style={{ fontWeight: 600 }}>Stack Tecnológico</span>
                <code style={{ fontSize: '0.75rem', color: theme.textSecondary }}>APP_GUIDE/03_STACK.md</code>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                <span>🎨</span>
                <span style={{ fontWeight: 600 }}>Sistema de Diseño</span>
                <code style={{ fontSize: '0.75rem', color: theme.textSecondary }}>APP_GUIDE/04_UI.md</code>
              </div>
            </div>
          </TutorialStepSection>

          <div
            style={{
              padding: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: `${theme.success}15`,
              border: `2px solid ${theme.success}`,
              textAlign: 'center',
            }}
          >
            <p style={{
              margin: '0 0 1rem 0',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: theme.text
            }}>
              ¡Estás listo para crear aplicaciones increíbles! 🚀
            </p>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: theme.textSecondary,
              lineHeight: '1.6'
            }}>
              Comienza creando tu primera entidad personalizada o explora el dashboard.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleTutorialComplete = () => {
    setShowCelebration(true);
    // Optionally navigate to dashboard after celebration
    setTimeout(() => {
      // navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      <TutorialWizard
        title="Guía de Inicio Rápido"
        description="Aprende a crear tu primera entidad con el generador de SYS-TEMPLATE"
        steps={tutorialSteps}
        onComplete={handleTutorialComplete}
        persistProgress={true}
        storageKey="sys-template-getting-started"
        showProgressIndicator={true}
        allowStepNavigation={false}
      />
    </div>
  );
}

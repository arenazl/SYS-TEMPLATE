import { useState, useEffect, useRef } from 'react';
import { Send, BarChart3, Loader2, Sparkles, X, Plus, RefreshCw, LayoutGrid, Table2, List, Clock, Trophy, FolderKanban, Gauge } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { chatApi } from '../../lib/api';
import { toast } from 'sonner';
import AutocompleteInput from '../../components/ui/AutocompleteInput';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  data?: any[]; // Datos crudos para renderizar en diferentes formatos
  sql?: string; // SQL ejecutado
}

interface KPI {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}

interface SchemaColumn {
  name: string;
  type: string;
  fk: string | null;
  nullable?: boolean;
  is_fk?: boolean;
  fk_table?: string;
  fk_column?: string;
}

export default function BIPanelWithChat() {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [schema, setSchema] = useState<Record<string, SchemaColumn[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastQuery, setLastQuery] = useState<string>(''); // Guardar última consulta

  // Filtros activos (pills)
  const [activePills, setActivePills] = useState<Array<{
    id: string;
    label: string;
    value: string | number;
    color: string;
    removable: boolean;
  }>>([]);

  // Formato de visualización activo
  type ViewFormat = 'cards' | 'table' | 'list' | 'ranking';
  const [activeFormat, setActiveFormat] = useState<ViewFormat | null>(null);

  useEffect(() => {
    loadKPIs();
    loadSchema();
    loadPills();
  }, []);

  const loadPills = async () => {
    try {
      const data = await chatApi.getPills();
      if (data.pills) {
        setActivePills(data.pills);
      }
    } catch (error) {
      console.error('Error loading pills:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadKPIs = async () => {
    try {
      const data = await chatApi.getKPIs();
      setKpis(data.kpis || []);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    }
  };

  const loadSchema = async () => {
    try {
      const data = await chatApi.getSchema();
      console.log('[SCHEMA] Loaded:', data);

      // Convertir el schema al formato esperado por AutocompleteInput
      const formattedSchema: Record<string, SchemaColumn[]> = {};

      if (data.tables) {
        Object.keys(data.tables).forEach((tableName) => {
          const columns = data.tables[tableName];
          formattedSchema[tableName] = columns.map((col: any) => ({
            name: col.name,
            type: col.type,
            fk: col.is_fk && col.fk_table ? `${col.fk_table}.${col.fk_column}` : null,
            nullable: col.nullable,
            is_fk: col.is_fk,
            fk_table: col.fk_table,
            fk_column: col.fk_column
          }));
        });
      }

      setSchema(formattedSchema);
    } catch (error) {
      console.error('Error loading schema:', error);
    }
  };

  const ejecutarConsulta = async (formato?: ViewFormat) => {
    const consulta = input.trim() || lastQuery;
    if (!consulta || loading) return;

    // Solo agregar mensaje de usuario si es una consulta nueva (no cambio de formato)
    if (input.trim()) {
      setInput('');
      setMessages(prev => [...prev, { role: 'user', content: consulta }]);
      setLastQuery(consulta);
    }

    setLoading(true);

    try {
      const result = await chatApi.consulta(consulta, formato || undefined);

      // Si es cambio de formato, reemplazar último mensaje assistant
      if (formato && !input.trim()) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastAssistantIndex = newMessages.length - 1;
          if (lastAssistantIndex >= 0 && newMessages[lastAssistantIndex].role === 'assistant') {
            newMessages[lastAssistantIndex] = {
              role: 'assistant',
              content: result.response,
              data: result.datos_crudos || [],
              sql: result.sql_ejecutado
            };
          }
          return newMessages;
        });
      } else {
        // Consulta nueva, agregar mensaje
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: result.response,
            data: result.datos_crudos || [],
            sql: result.sql_ejecutado
          }
        ]);
      }

      // Mostrar SQL ejecutado en consola para debugging
      if (result.sql_ejecutado) {
        console.log('[SQL]', result.sql_ejecutado);
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = error.response?.data?.detail || 'Error ejecutando consulta';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `<p style="color:#ef4444">Error: ${errorMsg}</p>` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    ejecutarConsulta();
  };

  const removePill = (id: string) => {
    setActivePills(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" style={{ background: theme.background }}>
      {/* Header con Search */}
      <div
        className="border-b p-4 space-y-4"
        style={{ borderColor: theme.border, background: theme.card }}
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" style={{ color: theme.primary }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
              Business Intelligence con IA
            </h1>
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              Consultá tus datos en lenguaje natural
            </p>
          </div>
        </div>

        {/* Search Input con Autocomplete - Arriba */}
        <div className="flex gap-3 items-start">
          <AutocompleteInput
            value={input}
            onChange={setInput}
            schema={schema}
            placeholder="Ej: cuantas habitaciones, reservas del mes, top huespedes..."
            onSubmit={handleSubmit}
            disabled={loading}
          />
          <button
            onClick={() => ejecutarConsulta()}
            disabled={!input.trim() || loading}
            className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
            style={{
              background: theme.primary,
              color: '#ffffff'
            }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            Enviar
          </button>
        </div>

        {/* Pills de filtros interactivos */}
        <div className="flex gap-2 items-center overflow-x-auto pb-2">
          {/* Pills dinámicas basadas en consultas */}
          {activePills.map((pill) => (
            <button
              key={pill.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: pill.color,
                color: '#ffffff'
              }}
            >
              <span>{pill.value}</span>
              <span className="opacity-80">{pill.label}</span>
              {pill.removable && (
                <X
                  className="h-3.5 w-3.5 cursor-pointer hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePill(pill.id);
                  }}
                />
              )}
            </button>
          ))}

          {/* Botón agregar KPI */}
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all flex-shrink-0"
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>KPI</span>
          </button>

          {/* Botón refrescar */}
          <button
            className="flex items-center gap-1 px-2 py-1.5 rounded-full transition-all flex-shrink-0"
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary
            }}
            onClick={() => {
              loadPills();
              loadKPIs();
              toast.success('Datos actualizados');
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Separador */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 flex-shrink-0" />

          {/* Botones de formato */}
          {[
            { key: 'cards' as const, icon: LayoutGrid, label: 'Cards' },
            { key: 'table' as const, icon: Table2, label: 'Tabla' },
            { key: 'list' as const, icon: List, label: 'Lista' },
            { key: 'ranking' as const, icon: Trophy, label: 'Ranking' },
          ].map(fmt => {
            const Icon = fmt.icon;
            const isActive = activeFormat === fmt.key;
            return (
              <button
                key={fmt.key}
                onClick={() => {
                  setActiveFormat(fmt.key);
                  if (lastQuery) {
                    ejecutarConsulta(fmt.key);
                  }
                }}
                disabled={!lastQuery || loading}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md transition-all flex-shrink-0 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isActive ? `${theme.primary}20` : 'transparent',
                  border: `1px solid ${isActive ? theme.primary : 'transparent'}`,
                  color: isActive ? theme.primary : theme.textSecondary
                }}
                title={fmt.label}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{fmt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPIs Pills */}
      {kpis.length > 0 && (
        <div
          className="flex gap-3 p-4 overflow-x-auto border-b"
          style={{ borderColor: theme.border, background: theme.background }}
        >
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2"
              style={{
                background: `${kpi.color}20`,
                border: `1px solid ${kpi.color}40`
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: kpi.color }}
              />
              <span className="text-sm font-medium" style={{ color: theme.text }}>
                {kpi.label}: {kpi.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Sparkles className="h-16 w-16 mb-4" style={{ color: theme.primary, opacity: 0.5 }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
              ¿Qué querés saber de tu hotel?
            </h2>
            <p className="text-center max-w-md" style={{ color: theme.textSecondary }}>
              Preguntá en lenguaje natural. Ej: "¿Cuántas reservas tengo este mes?",
              "Muestra el top 5 de huéspedes frecuentes"
            </p>
            <div className="flex flex-wrap gap-2 mt-6 max-w-2xl justify-center">
              {[
                '¿Cuántas habitaciones están ocupadas hoy?',
                'Ingresos del último mes',
                'Top 5 huéspedes frecuentes',
                'Reservas por canal de venta'
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(query)}
                  className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary
                  }}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}
                  style={{
                    background: msg.role === 'user' ? theme.primary : theme.card,
                    color: msg.role === 'user' ? '#ffffff' : theme.text,
                    border: msg.role === 'user' ? 'none' : `1px solid ${theme.border}`
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                      style={{
                        '--text-primary': theme.text,
                        '--text-secondary': theme.textSecondary,
                        '--bg-primary': theme.background,
                        '--bg-secondary': theme.card,
                        '--bg-card': theme.card,
                        '--border-color': theme.border,
                        '--color-primary': theme.primary
                      } as any}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {loading && (
          <div className="flex justify-start">
            <div
              className="max-w-3xl rounded-lg p-4 flex items-center gap-2"
              style={{
                background: theme.card,
                border: `1px solid ${theme.border}`
              }}
            >
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: theme.primary }} />
              <span style={{ color: theme.textSecondary }}>Consultando...</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

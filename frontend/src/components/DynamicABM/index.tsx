/**
 * DynamicABM - Componente dinámico que renderiza ABMs desde configuración JSON
 *
 * En lugar de tener 18 archivos *ABM.tsx casi idénticos, este componente
 * lee la configuración de la entidad y genera todo automáticamente:
 * - Tabla con columnas
 * - Formulario con inputs correctos
 * - CRUD completo
 * - Relaciones FK (combos)
 * - Enums (selects)
 * - Master-Detail
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import {
  ABMPage,
  ABMCard,
  ABMCardActions,
  ABMTable,
  ABMTableAction,
  ABMSheetFooter,
  ABMBadge
} from '../ui/ABMPage';
import { getEntityByPlural, getDetailEntity, EntityConfig, FieldConfig } from '../../config/entityRegistry';
import { DynamicForm } from './DynamicForm';
import { DynamicDetailSection } from './DynamicDetailSection';

// Tipos
type Item = Record<string, unknown> & { id: number; activo?: boolean };

// Helper para obtener icono de Lucide
function getIcon(iconName: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>;
  return icons[iconName] || icons['FileText'];
}

interface DynamicABMProps {
  entityOverride?: string; // Permite pasar la entidad manualmente
}

export default function DynamicABM({ entityOverride }: DynamicABMProps = {}) {
  const { entidad: urlEntidad } = useParams<{ entidad: string }>();
  const { theme } = useTheme();

  // Usar entidad del override o de la URL
  const entidad = entityOverride || urlEntidad;

  // Obtener configuración de la entidad
  const entityConfig = useMemo(() => {
    if (!entidad) return null;
    return getEntityByPlural(entidad);
  }, [entidad]);

  // Estados
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  // Estados para FK options
  const [fkOptions, setFkOptions] = useState<Record<string, { id: number; [key: string]: unknown }[]>>({});

  // Estados para master-detail
  const [detalles, setDetalles] = useState<Record<string, unknown>[]>([]);
  const detailConfig = useMemo(() => {
    if (!entityConfig?.masterDetail) return null;
    return getDetailEntity(entityConfig.name);
  }, [entityConfig]);

  // Cargar datos
  const fetchData = async () => {
    if (!entityConfig) return;
    setLoading(true);
    try {
      const res = await api.get(`/${entityConfig.plural}?limit=100`);
      setItems(res.data.items || []);
    } catch {
      toast.error('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  // Cargar opciones de FK (incluyendo las del detalle)
  const loadFkOptions = async () => {
    if (!entityConfig) return;

    // FK de la entidad principal
    let fkFields = entityConfig.fields.filter(f => f.type === 'fk' && f.fkEntity);

    // Agregar FKs del detalle si es master-detail
    if (detailConfig) {
      const detailFks = detailConfig.fields.filter(f => f.type === 'fk' && f.fkEntity);
      fkFields = [...fkFields, ...detailFks];
    }

    const options: Record<string, { id: number; [key: string]: unknown }[]> = {};

    await Promise.all(
      fkFields.map(async (field) => {
        try {
          const table = field.fkTable || field.fkEntity!.toLowerCase() + 's';
          const res = await api.get(`/${table}?limit=500&activo=true`);
          options[field.name] = res.data.items || [];
        } catch {
          options[field.name] = [];
        }
      })
    );

    setFkOptions(options);
  };

  useEffect(() => {
    if (entityConfig) {
      fetchData();
      loadFkOptions();
    }
  }, [entityConfig]);

  // Filtrar items
  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [items, search]);

  // Handlers
  const handleAdd = () => {
    setEditing(null);
    setFormData(getInitialFormData());
    setDetalles([]);
    setSheetOpen(true);
  };

  const handleEdit = async (item: Item) => {
    setEditing(item);
    setFormData(item);

    // Cargar detalles si es master-detail
    if (detailConfig) {
      try {
        const masterFk = detailConfig.fields.find(f => f.fkEntity === entityConfig?.name);
        if (masterFk) {
          const res = await api.get(`/${detailConfig.plural}?${masterFk.name}=${item.id}&limit=500`);
          setDetalles(res.data.items || []);
        }
      } catch {
        setDetalles([]);
      }
    }

    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!entityConfig) return;
    try {
      await api.delete(`/${entityConfig.plural}/${id}`);
      toast.success('Eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleSubmit = async () => {
    if (!entityConfig) return;

    // Validar campos requeridos
    const missingFields = entityConfig.fields
      .filter(f => f.required && !['organizacion_id', 'password_hash'].includes(f.name))
      .filter(f => {
        const value = formData[f.name];
        return value === undefined || value === null || value === '';
      })
      .map(f => formatLabel(f.name));

    if (missingFields.length > 0) {
      toast.error(`Campos requeridos: ${missingFields.join(', ')}`);
      return;
    }

    // Validar detalles si es master-detail
    if (entityConfig.masterDetail && detalles.length === 0) {
      toast.error('Agregue al menos un item');
      return;
    }

    setSaving(true);
    try {
      let masterId: number;

      if (editing) {
        await api.put(`/${entityConfig.plural}/${editing.id}`, formData);
        masterId = editing.id;
      } else {
        const res = await api.post(`/${entityConfig.plural}`, formData);
        masterId = res.data.id;
      }

      // Guardar detalles si es master-detail
      if (detailConfig) {
        const masterFk = detailConfig.fields.find(f => f.fkEntity === entityConfig.name);
        if (masterFk) {
          // Eliminar detalles existentes
          if (editing) {
            const existingRes = await api.get(`/${detailConfig.plural}?${masterFk.name}=${editing.id}&limit=500`);
            for (const det of existingRes.data.items || []) {
              await api.delete(`/${detailConfig.plural}/${det.id}`);
            }
          }
          // Crear nuevos detalles
          for (const det of detalles) {
            await api.post(`/${detailConfig.plural}`, { ...det, [masterFk.name]: masterId });
          }
        }
      }

      toast.success(editing ? 'Actualizado' : 'Creado');
      setSheetOpen(false);
      setFormData({});
      setDetalles([]);
      setEditing(null);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string | { msg: string }[] } } };
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        toast.error(detail.map(d => d.msg).join(', '));
      } else {
        toast.error('Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  // Obtener valores iniciales del formulario
  const getInitialFormData = (): Record<string, unknown> => {
    if (!entityConfig) return {};
    const data: Record<string, unknown> = {};

    for (const field of entityConfig.fields) {
      if (field.type === 'date' && field.name === 'fecha') {
        data[field.name] = new Date().toISOString().split('T')[0];
      }
      if (field.type === 'enum' && field.enumValues?.length) {
        data[field.name] = field.enumValues[0];
      }
    }

    return data;
  };

  // Generar columnas para la tabla
  const columns = useMemo(() => {
    if (!entityConfig) return [];

    const cols = [{ key: 'id', header: 'ID' }];

    // Agregar campos visibles (máximo 5 para no saturar)
    const visibleFields = entityConfig.fields
      .filter(f => !['password_hash', 'organizacion_id', 'notas', 'descripcion'].includes(f.name))
      .filter(f => f.type !== 'text' && f.type !== 'json')
      .slice(0, 5);

    for (const field of visibleFields) {
      if (field.type === 'fk') {
        cols.push({
          key: field.name,
          header: formatLabel(field.name),
          render: (item: Item) => {
            const relName = field.name.replace(/_id$/, '');
            const rel = item[relName] as { nombre?: string; name?: string } | undefined;
            return rel?.nombre || rel?.name || '-';
          }
        } as never);
      } else if (field.type === 'enum') {
        cols.push({
          key: field.name,
          header: formatLabel(field.name),
          render: (item: Item) => (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getEstadoColor(String(item[field.name] || '')) }}
            >
              {String(item[field.name] || '-')}
            </span>
          )
        } as never);
      } else if (field.type === 'decimal' || field.type === 'float') {
        cols.push({
          key: field.name,
          header: formatLabel(field.name),
          render: (item: Item) => '$' + Number(item[field.name] || 0).toFixed(2)
        } as never);
      } else if (field.type === 'bool' || field.type === 'boolean') {
        cols.push({
          key: field.name,
          header: formatLabel(field.name),
          render: (item: Item) => item[field.name] ? 'Sí' : 'No'
        } as never);
      } else {
        cols.push({ key: field.name, header: formatLabel(field.name) });
      }
    }

    // Columna de estado
    cols.push({
      key: 'activo',
      header: 'Estado',
      render: (item: Item) => <ABMBadge active={item.activo ?? true} />
    } as never);

    return cols;
  }, [entityConfig]);

  // Si no hay configuración, mostrar error
  if (!entityConfig) {
    return (
      <div className="text-center py-16">
        <p style={{ color: theme.textSecondary }}>
          Entidad "{entidad}" no encontrada
        </p>
      </div>
    );
  }

  const Icon = getIcon(entityConfig.icon);

  return (
    <ABMPage
      title={capitalize(entityConfig.plural)}
      icon={<Icon className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay registros"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar' : 'Nuevo'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
          <DynamicForm
            fields={entityConfig.fields}
            formData={formData}
            onChange={setFormData}
            fkOptions={fkOptions}
          />

          {entityConfig.masterDetail && detailConfig && (
            <DynamicDetailSection
              detailConfig={detailConfig}
              detalles={detalles}
              onDetallesChange={setDetalles}
              fkOptions={fkOptions}
              masterEntity={entityConfig.name}
            />
          )}
        </div>
      }
      sheetFooter={
        <ABMSheetFooter
          onCancel={() => setSheetOpen(false)}
          onSave={handleSubmit}
          saving={saving}
        />
      }
      tableView={
        <ABMTable
          data={filteredItems}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={handleEdit}
          actions={(item) => (
            <>
              <ABMTableAction
                icon={<Pencil className="h-4 w-4" />}
                onClick={() => handleEdit(item)}
                title="Editar"
              />
              <ABMTableAction
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => handleDelete(item.id)}
                title="Eliminar"
                variant="danger"
              />
            </>
          )}
        />
      }
    >
      {filteredItems.map((item, index) => (
        <ABMCard key={item.id} onClick={() => handleEdit(item)} index={index}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {getDisplayValue(item, entityConfig)}
                </h3>
                {entityConfig.fields.some(f => f.name === 'estado' && f.type === 'enum') && (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getEstadoColor(String(item.estado || '')) }}
                  >
                    {String(item.estado || '')}
                  </span>
                )}
              </div>
            </div>
            <ABMBadge active={item.activo ?? true} />
          </div>
          <div
            className="flex justify-end mt-3 pt-3"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            <ABMCardActions
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          </div>
        </ABMCard>
      ))}
    </ABMPage>
  );
}

// ============ HELPERS ============

function formatLabel(name: string): string {
  return name
    .replace(/_id$/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getDisplayValue(item: Item, config: EntityConfig): string {
  // Buscar campo de display: nombre, name, codigo, numero, o primer string
  const displayFields = ['nombre', 'name', 'codigo', 'numero'];
  for (const fieldName of displayFields) {
    if (item[fieldName]) return String(item[fieldName]);
  }

  const firstString = config.fields.find(f => f.type === 'string');
  if (firstString && item[firstString.name]) {
    return String(item[firstString.name]);
  }

  return `ID: ${item.id}`;
}

function getEstadoColor(estado: string): string {
  const colors: Record<string, string> = {
    pendiente: '#f59e0b',
    confirmado: '#3b82f6',
    preparando: '#8b5cf6',
    enviado: '#06b6d4',
    entregado: '#22c55e',
    cancelado: '#ef4444',
    parcial: '#f59e0b',
    recibido: '#22c55e',
    activo: '#22c55e',
    inactivo: '#6b7280',
  };
  return colors[estado.toLowerCase()] || '#6b7280';
}

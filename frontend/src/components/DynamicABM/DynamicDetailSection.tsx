/**
 * DynamicDetailSection - Maneja la sección de detalles en formularios master-detail
 *
 * Ejemplo: Pedido (master) → DetallePedido (detail)
 * - Muestra lista de items agregados
 * - Permite agregar/eliminar items
 * - Calcula subtotales automáticamente
 */

import { useState, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { EntityConfig, FieldConfig } from '../../config/entityRegistry';

type DetailItem = Record<string, unknown> & { id?: number };

interface DynamicDetailSectionProps {
  detailConfig: EntityConfig;
  detalles: DetailItem[];
  onDetallesChange: (detalles: DetailItem[]) => void;
  fkOptions: Record<string, { id: number; [key: string]: unknown }[]>;
  masterEntity: string;
}

export function DynamicDetailSection({
  detailConfig,
  detalles,
  onDetallesChange,
  fkOptions,
  masterEntity
}: DynamicDetailSectionProps) {
  const { theme } = useTheme();
  const [detalleForm, setDetalleForm] = useState<Record<string, unknown>>({ cantidad: 1 });

  // Encontrar el FK principal del detalle (el que NO es el master)
  const itemFk = useMemo(() => {
    return detailConfig.fields.find(f =>
      f.type === 'fk' && f.fkEntity !== masterEntity
    );
  }, [detailConfig, masterEntity]);

  // Campos numéricos del detalle
  const cantidadField = detailConfig.fields.find(f => f.name === 'cantidad');
  const precioField = detailConfig.fields.find(f => f.name === 'precio_unitario');
  const subtotalField = detailConfig.fields.find(f => f.name === 'subtotal');

  // Opciones del item FK
  const itemOptions = itemFk ? (fkOptions[itemFk.name] || []) : [];

  // Detectar si el item tiene precio
  const hasPrecio = itemOptions.length > 0 && itemOptions[0]?.precio !== undefined;

  // Handler para cambiar item seleccionado
  const handleItemChange = (itemId: string) => {
    const item = itemOptions.find(p => p.id === parseInt(itemId));
    setDetalleForm({
      ...detalleForm,
      [itemFk!.name]: itemId ? Number(itemId) : undefined,
      ...(hasPrecio && precioField ? { precio_unitario: item?.precio || 0 } : {})
    });
  };

  // Agregar detalle
  const agregarDetalle = () => {
    if (!itemFk) return;

    const itemId = detalleForm[itemFk.name];
    if (!itemId || (cantidadField && !detalleForm.cantidad)) {
      toast.error('Complete los campos requeridos');
      return;
    }

    if (detalles.some(d => d[itemFk.name] === itemId)) {
      toast.error('El item ya está agregado');
      return;
    }

    const item = itemOptions.find(p => p.id === Number(itemId));
    const cantidad = Number(detalleForm.cantidad) || 1;
    const precioUnitario = Number(detalleForm.precio_unitario) || 0;

    const nuevoDetalle: DetailItem = {
      [itemFk.name]: Number(itemId),
      // Guardar referencia al item para mostrar nombre
      [itemFk.name.replace(/_id$/, '')]: item ? {
        id: item.id,
        nombre: getItemLabel(item)
      } : undefined,
      ...(cantidadField ? { cantidad } : {}),
      ...(precioField ? { precio_unitario: precioUnitario } : {}),
      ...(subtotalField ? { subtotal: cantidad * precioUnitario } : {})
    };

    onDetallesChange([...detalles, nuevoDetalle]);
    setDetalleForm({ cantidad: 1 });
  };

  // Eliminar detalle
  const eliminarDetalle = (index: number) => {
    onDetallesChange(detalles.filter((_, i) => i !== index));
  };

  // Actualizar cantidad
  const actualizarCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return;
    const nuevos = [...detalles];
    nuevos[index].cantidad = nuevaCantidad;
    if (subtotalField && precioField) {
      nuevos[index].subtotal = nuevaCantidad * Number(nuevos[index].precio_unitario || 0);
    }
    onDetallesChange(nuevos);
  };

  // Calcular totales
  const subtotal = detalles.reduce((sum, d) => sum + Number(d.subtotal || 0), 0);

  if (!itemFk) {
    return <div style={{ color: theme.textSecondary }}>Configuración de detalle inválida</div>;
  }

  const itemLabel = formatLabel(itemFk.name.replace(/_id$/, ''));

  return (
    <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '1rem', marginTop: '1rem' }}>
      <h3
        className="text-sm font-semibold uppercase tracking-wide mb-3"
        style={{ color: theme.textSecondary }}
      >
        Detalle
      </h3>

      {/* Form para agregar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={String(detalleForm[itemFk.name] ?? '')}
          onChange={(e) => handleItemChange(e.target.value)}
          className="flex-1 min-w-[150px] px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: theme.backgroundSecondary,
            border: `1px solid ${theme.border}`,
            color: theme.text
          }}
        >
          <option value="">{itemLabel}...</option>
          {itemOptions.map(p => (
            <option key={p.id} value={p.id}>
              {getItemLabel(p)}
              {hasPrecio ? ` ($${Number(p.precio || 0).toFixed(2)})` : ''}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {cantidadField && (
            <input
              type="number"
              min="1"
              value={String(detalleForm.cantidad ?? '')}
              onChange={(e) => setDetalleForm({ ...detalleForm, cantidad: Number(e.target.value) })}
              placeholder="Cant"
              className="w-16 px-2 py-2 rounded-lg text-sm text-center"
              style={{
                backgroundColor: theme.backgroundSecondary,
                border: `1px solid ${theme.border}`,
                color: theme.text
              }}
            />
          )}

          {precioField && (
            <input
              type="number"
              step="0.01"
              value={String(detalleForm.precio_unitario ?? '')}
              onChange={(e) => setDetalleForm({ ...detalleForm, precio_unitario: Number(e.target.value) })}
              placeholder="Precio"
              className="w-24 px-2 py-2 rounded-lg text-sm"
              style={{
                backgroundColor: theme.backgroundSecondary,
                border: `1px solid ${theme.border}`,
                color: theme.text
              }}
            />
          )}

          <button
            type="button"
            onClick={agregarDetalle}
            className="p-2 rounded-md flex-shrink-0"
            style={{ backgroundColor: '#6b7280', color: '#ffffff' }}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Lista de detalles */}
      {detalles.length === 0 ? (
        <div className="text-center py-6 text-sm" style={{ color: theme.textSecondary }}>
          No hay items
        </div>
      ) : (
        <div className="space-y-2">
          {detalles.map((det, idx) => {
            const itemRef = det[itemFk.name.replace(/_id$/, '')] as { nombre?: string } | undefined;
            const itemName = itemRef?.nombre || `#${det[itemFk.name]}`;

            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: theme.backgroundSecondary }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: theme.text }}>
                    {itemName}
                  </div>
                  {precioField && cantidadField && (
                    <div className="text-xs" style={{ color: theme.textSecondary }}>
                      ${Number(det.precio_unitario || 0).toFixed(2)} x {String(det.cantidad)}
                    </div>
                  )}
                </div>

                {cantidadField && subtotalField && (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(idx, Number(det.cantidad || 1) - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded"
                        style={{ backgroundColor: theme.border }}
                      >
                        -
                      </button>
                      <span
                        className="w-8 text-center text-sm font-medium"
                        style={{ color: theme.text }}
                      >
                        {String(det.cantidad)}
                      </span>
                      <button
                        type="button"
                        onClick={() => actualizarCantidad(idx, Number(det.cantidad || 0) + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded"
                        style={{ backgroundColor: theme.border }}
                      >
                        +
                      </button>
                    </div>
                    <div
                      className="w-24 text-right font-medium text-sm"
                      style={{ color: theme.text }}
                    >
                      ${Number(det.subtotal || 0).toFixed(2)}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => eliminarDetalle(idx)}
                  className="p-2 rounded-lg text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Totales */}
      {subtotalField && detalles.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
          <div className="flex justify-between text-lg font-bold">
            <span style={{ color: theme.text }}>Total:</span>
            <span style={{ color: theme.primary }}>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ HELPERS ============

function formatLabel(name: string): string {
  return name
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getItemLabel(item: { id: number; [key: string]: unknown }): string {
  const displayFields = ['nombre', 'name', 'codigo', 'numero'];
  for (const field of displayFields) {
    if (item[field]) return String(item[field]);
  }
  return `ID: ${item.id}`;
}

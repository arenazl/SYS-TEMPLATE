import { useState } from 'react';
import { Plus, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface KanbanItem {
  id: number;
  nombre: string;
  icono?: string | null;
  orden?: number | null;
  [key: string]: any;
}

interface KanbanColumn {
  id: string | number;
  title: string;
  items: KanbanItem[];
  color?: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onItemClick?: (item: KanbanItem, columnId: string | number) => void;
  onItemDelete?: (item: KanbanItem, columnId: string | number) => void;
  onAddItem?: (columnId: string | number) => void;
  onDragEnd?: (itemId: number, fromColumn: string | number, toColumn: string | number) => void;
}

export default function KanbanBoard({
  columns,
  onItemClick,
  onItemDelete,
  onAddItem,
  onDragEnd,
}: KanbanBoardProps) {
  const { theme } = useTheme();
  const [draggedItem, setDraggedItem] = useState<{ item: KanbanItem; columnId: string | number } | null>(null);

  const handleDragStart = (item: KanbanItem, columnId: string | number) => {
    setDraggedItem({ item, columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string | number) => {
    if (!draggedItem) return;

    if (draggedItem.columnId !== targetColumnId) {
      onDragEnd?.(draggedItem.item.id, draggedItem.columnId, targetColumnId);
    }

    setDraggedItem(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column Header */}
          <div
            className="rounded-t-lg p-4"
            style={{
              backgroundColor: column.color || theme.primary,
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{column.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm bg-white/20 px-2 py-1 rounded">
                  {column.items.length}
                </span>
                {onAddItem && (
                  <button
                    onClick={() => onAddItem(column.id)}
                    className="p-1.5 rounded hover:bg-white/20 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Column Content */}
          <div
            className="rounded-b-lg p-3 min-h-[400px] space-y-2"
            style={{
              backgroundColor: theme.card,
              border: `1px solid ${theme.border}`,
              borderTop: 'none',
            }}
          >
            {column.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item, column.id)}
                className="group rounded-lg p-3 cursor-move transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical
                      className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity"
                      style={{ color: theme.textSecondary }}
                    />
                    {item.icono && (
                      <span className="text-lg">{item.icono}</span>
                    )}
                    <h4
                      className="font-semibold text-sm flex-1 cursor-pointer"
                      style={{ color: theme.text }}
                      onClick={() => onItemClick?.(item, column.id)}
                    >
                      {item.nombre}
                    </h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onItemClick?.(item, column.id)}
                      className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
                      style={{ backgroundColor: `${theme.primary}15` }}
                    >
                      <Pencil className="h-3.5 w-3.5" style={{ color: theme.primary }} />
                    </button>
                    <button
                      onClick={() => onItemDelete?.(item, column.id)}
                      className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
                      style={{ backgroundColor: '#ef444415' }}
                    >
                      <Trash2 className="h-3.5 w-3.5" style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </div>

                {/* Item Details */}
                {item.orden !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                      Orden: {item.orden}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {column.items.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-12 rounded-lg border-2 border-dashed"
                style={{ borderColor: theme.border }}
              >
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Sin items
                </p>
                {onAddItem && (
                  <button
                    onClick={() => onAddItem(column.id)}
                    className="mt-2 text-sm font-medium"
                    style={{ color: theme.primary }}
                  >
                    + Agregar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

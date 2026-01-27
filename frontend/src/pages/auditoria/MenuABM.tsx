import { useState, useEffect, useMemo } from 'react';
import { Menu, Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import KanbanBoard from '../../components/KanbanBoard';
import {
  ABMPage,
  ABMCard,
  ABMCardActions,
  ABMTable,
  ABMTableAction,
  ABMInput,
  ABMTextarea,
  ABMSelect,
  ABMSheetFooter,
  ABMBadge,
} from '../../components/ui/ABMPage';

interface Menu {
  id: number;
  nombre: string;
  path: string;
  icono: string | null;
  orden: number | null;
  parent_id: number | null;
  organizacion_id: number | null;
  activo: boolean;
}

export default function MenuABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<Partial<Menu>>({});
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menus?limit=100');
      setItems(res.data.items || []);
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredItems = items.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/menus/${editing.id}`, formData);
      } else {
        await api.post('/menus', formData);
      }
      toast.success(editing ? 'Menu actualizado' : 'Menu creado');
      setSheetOpen(false);
      setFormData({});
      setEditing(null);
      fetchData();
    } catch (err) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Menu) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/menus/${id}`);
      toast.success('Eliminado');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({});
    setSheetOpen(true);
  };

  // Estructura Kanban: Categorías como columnas, items como tarjetas
  const kanbanData = useMemo(() => {
    const categories = items.filter(item => item.parent_id === null);

    return categories.map(category => ({
      id: category.id,
      title: category.nombre,
      color: theme.primary,
      items: items
        .filter(item => item.parent_id === category.id)
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    }));
  }, [items, theme.primary]);

  // Columnas para la tabla
  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'path', header: 'Path' },
    { key: 'icono', header: 'Icono' },
    { key: 'orden', header: 'Orden' },
    { key: 'parent_id', header: 'Parent id' },
    { key: 'activo', header: 'Estado', render: (item: Menu) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header con toggle de vista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="h-6 w-6" style={{ color: theme.primary }} />
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Menú
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Kanban/Tabla */}
          <div
            className="flex rounded-lg p-1"
            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: viewMode === 'kanban' ? theme.primary : 'transparent',
                color: viewMode === 'kanban' ? 'white' : theme.textSecondary,
              }}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
              style={{
                backgroundColor: viewMode === 'table' ? theme.primary : 'transparent',
                color: viewMode === 'table' ? 'white' : theme.textSecondary,
              }}
            >
              <List className="h-4 w-4" />
              Tabla
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: theme.primary,
              color: 'white',
            }}
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* Vista Kanban */}
      {viewMode === 'kanban' ? (
        loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.primary }} />
          </div>
        ) : (
          <KanbanBoard
            columns={kanbanData}
            onItemClick={(item) => handleEdit(item as Menu)}
            onItemDelete={(item) => handleDelete(item.id)}
            onAddItem={(columnId) => {
              setFormData({ parent_id: columnId as number });
              setSheetOpen(true);
            }}
          />
        )
      ) : (
        <ABMPage
          title="Menu"
          icon={<Menu className="h-5 w-5" />}
          buttonLabel="Nuevo"
          onAdd={handleAdd}
          searchPlaceholder="Buscar menus..."
          searchValue={search}
          onSearchChange={setSearch}
          loading={loading}
          isEmpty={filteredItems.length === 0}
          emptyMessage="No hay menus"
          sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Menu' : 'Nuevo Menu'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
            <ABMInput
              label="Nombre"
              type="text"
              value={formData.nombre || ''}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
            <ABMInput
              label="Path"
              type="text"
              value={formData.path || ''}
              onChange={(e) => setFormData({...formData, path: e.target.value})}
              required
            />
            <ABMInput
              label="Icono"
              type="text"
              value={formData.icono || ''}
              onChange={(e) => setFormData({...formData, icono: e.target.value})}
              
            />
            <ABMInput
              label="Orden"
              type="number"
              value={formData.orden || ''}
              onChange={(e) => setFormData({...formData, orden: Number(e.target.value)})}
              
            />
            <ABMInput
              label="Parent id"
              type="number"
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({...formData, parent_id: Number(e.target.value)})}
              
            />
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
              <ABMTableAction icon={<Pencil className="h-4 w-4" />} onClick={() => handleEdit(item)} title="Editar" />
              <ABMTableAction icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(item.id)} title="Eliminar" variant="danger" />
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
                <Menu className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.nombre}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Nombre: {item.nombre}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Path: {item.path}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Icono: {item.icono}</p>
              </div>
            </div>
            <ABMBadge active={item.activo} />
          </div>
          <div className="flex justify-end mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
            <ABMCardActions
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          </div>
        </ABMCard>
      ))}
    </ABMPage>
      )}

      {/* Sheet para crear/editar (compartido entre ambas vistas) */}
      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] z-50 overflow-y-auto"
            style={{
              backgroundColor: theme.background,
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-6"
              style={{
                backgroundColor: theme.card,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                {editing ? 'Editar Menu' : 'Nuevo Menu'}
              </h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: `${theme.border}50` }}
              >
                <span style={{ color: theme.text }}>×</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <ABMInput
                label="Nombre"
                type="text"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
              <ABMInput
                label="Path"
                type="text"
                value={formData.path || ''}
                onChange={(e) => setFormData({...formData, path: e.target.value})}
                required
              />
              <ABMInput
                label="Icono"
                type="text"
                value={formData.icono || ''}
                onChange={(e) => setFormData({...formData, icono: e.target.value})}
              />
              <ABMInput
                label="Orden"
                type="number"
                value={formData.orden || ''}
                onChange={(e) => setFormData({...formData, orden: Number(e.target.value)})}
              />
              <ABMInput
                label="Parent ID"
                type="number"
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({...formData, parent_id: Number(e.target.value)})}
              />
            </div>

            <div
              className="sticky bottom-0 p-6"
              style={{
                backgroundColor: theme.card,
                borderTop: `1px solid ${theme.border}`,
              }}
            >
              <ABMSheetFooter
                onCancel={() => setSheetOpen(false)}
                onSave={handleSubmit}
                saving={saving}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

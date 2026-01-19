import { useState, useEffect } from 'react';
import { Menu, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
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
  );
}

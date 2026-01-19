import { useState, useEffect } from 'react';
import { Key, Pencil, Trash2 } from 'lucide-react';
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

interface Permiso {
  id: number;
  nombre: string;
  codigo: string;
  modulo: string;
  descripcion: string | null;
  organizacion_id: number | null;
  activo: boolean;
}

export default function PermisoABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Permiso | null>(null);
  const [formData, setFormData] = useState<Partial<Permiso>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/permisos?limit=100');
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
        await api.put(`/permisos/${editing.id}`, formData);
      } else {
        await api.post('/permisos', formData);
      }
      toast.success(editing ? 'Permiso actualizado' : 'Permiso creado');
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

  const handleEdit = (item: Permiso) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/permisos/${id}`);
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
    { key: 'codigo', header: 'Codigo' },
    { key: 'modulo', header: 'Modulo' },
    { key: 'activo', header: 'Estado', render: (item: Permiso) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Permiso"
      icon={<Key className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar permisos..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay permisos"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Permiso' : 'Nuevo Permiso'}
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
              label="Codigo"
              type="text"
              value={formData.codigo || ''}
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              required
            />
            <ABMInput
              label="Modulo"
              type="text"
              value={formData.modulo || ''}
              onChange={(e) => setFormData({...formData, modulo: e.target.value})}
              required
            />
            <ABMTextarea
              label="Descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows={3}
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
                <Key className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.nombre}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Nombre: {item.nombre}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Codigo: {item.codigo}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Modulo: {item.modulo}</p>
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

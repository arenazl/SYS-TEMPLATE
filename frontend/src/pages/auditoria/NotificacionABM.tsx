import { useState, useEffect } from 'react';
import { Bell, Pencil, Trash2 } from 'lucide-react';
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

interface Notificacion {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string | null;
  tipo: string | null;
  leida: boolean | null;
  organizacion_id: number | null;
  activo: boolean;
}

export default function NotificacionABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Notificacion | null>(null);
  const [formData, setFormData] = useState<Partial<Notificacion>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notificaciones?limit=100');
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
        await api.put(`/notificaciones/${editing.id}`, formData);
      } else {
        await api.post('/notificaciones', formData);
      }
      toast.success(editing ? 'Notificacion actualizado' : 'Notificacion creado');
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

  const handleEdit = (item: Notificacion) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/notificaciones/${id}`);
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
    { key: 'usuario_id', header: 'Usuario id' },
    { key: 'titulo', header: 'Titulo' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'leida', header: 'Leida', render: (item: Notificacion) => <ABMBadge active={!!item.leida} activeLabel="Sí" inactiveLabel="No" /> },
    { key: 'activo', header: 'Estado', render: (item: Notificacion) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Notificacion"
      icon={<Bell className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar notificaciones..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay notificaciones"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Notificacion' : 'Nuevo Notificacion'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
            <ABMInput
              label="Usuario id"
              type="number"
              value={formData.usuario_id || ''}
              onChange={(e) => setFormData({...formData, usuario_id: Number(e.target.value)})}
              required
            />
            <ABMInput
              label="Titulo"
              type="text"
              value={formData.titulo || ''}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              required
            />
            <ABMTextarea
              label="Mensaje"
              value={formData.mensaje || ''}
              onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
              rows={3}
            />
            <ABMSelect
              label="Tipo"
              value={formData.tipo || ''}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              options={[{ value: 'info', label: 'info' }, { value: 'success', label: 'success' }, { value: 'warning', label: 'warning' }, { value: 'error', label: 'error' }]}
              placeholder="Seleccionar..."
            />
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="leida"
                checked={formData.leida || false}
                onChange={(e) => setFormData({...formData, leida: e.target.checked})}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="leida" className="text-sm font-medium" style={{ color: theme.text }}>
                Leida
              </label>
            </div>
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
                <Bell className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.usuario_id}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Usuario id: {item.usuario_id}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Titulo: {item.titulo}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Mensaje: {item.mensaje}</p>
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

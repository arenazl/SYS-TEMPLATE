import { useState, useEffect } from 'react';
import { Clock, Pencil, Trash2 } from 'lucide-react';
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

interface Sesion {
  id: number;
  usuario_id: number;
  token: string;
  ip: string | null;
  user_agent: string | null;
  expires_at: string | null;
  organizacion_id: number | null;
  activo: boolean;
}

export default function SesionABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Sesion | null>(null);
  const [formData, setFormData] = useState<Partial<Sesion>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sesiones?limit=100');
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
        await api.put(`/sesiones/${editing.id}`, formData);
      } else {
        await api.post('/sesiones', formData);
      }
      toast.success(editing ? 'Sesion actualizado' : 'Sesion creado');
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

  const handleEdit = (item: Sesion) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/sesiones/${id}`);
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
    { key: 'token', header: 'Token' },
    { key: 'ip', header: 'Ip' },
    { key: 'user_agent', header: 'User agent' },
    { key: 'expires_at', header: 'Expires at' },
    { key: 'activo', header: 'Estado', render: (item: Sesion) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Sesion"
      icon={<Clock className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar sesiones..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay sesiones"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Sesion' : 'Nuevo Sesion'}
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
              label="Token"
              type="text"
              value={formData.token || ''}
              onChange={(e) => setFormData({...formData, token: e.target.value})}
              required
            />
            <ABMInput
              label="Ip"
              type="text"
              value={formData.ip || ''}
              onChange={(e) => setFormData({...formData, ip: e.target.value})}
              
            />
            <ABMInput
              label="User agent"
              type="text"
              value={formData.user_agent || ''}
              onChange={(e) => setFormData({...formData, user_agent: e.target.value})}
              
            />
            <ABMInput
              label="Expires at"
              type="text"
              value={formData.expires_at || ''}
              onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
              
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
                <Clock className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.usuario_id}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Usuario id: {item.usuario_id}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Token: {item.token}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Ip: {item.ip}</p>
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

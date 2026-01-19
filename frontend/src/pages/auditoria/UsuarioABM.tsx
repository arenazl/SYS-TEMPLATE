import { useState, useEffect } from 'react';
import { Users, Pencil, Trash2 } from 'lucide-react';
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

interface Usuario {
  id: number;
  email: string;
  password_hash: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  rol: string;
  organizacion_id: number | null;
  activo: boolean;
}

export default function UsuarioABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<Partial<Usuario>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/usuarios?limit=100');
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
        await api.put(`/usuarios/${editing.id}`, formData);
      } else {
        await api.post('/usuarios', formData);
      }
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
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

  const handleEdit = (item: Usuario) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/usuarios/${id}`);
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
    { key: 'email', header: 'Email' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'apellido', header: 'Apellido' },
    { key: 'telefono', header: 'Telefono' },
    { key: 'rol', header: 'Rol' },
    { key: 'activo', header: 'Estado', render: (item: Usuario) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Usuario"
      icon={<Users className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar usuarios..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay usuarios"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Usuario' : 'Nuevo Usuario'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
            <ABMInput
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <ABMInput
              label="Nombre"
              type="text"
              value={formData.nombre || ''}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
            <ABMInput
              label="Apellido"
              type="text"
              value={formData.apellido || ''}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              required
            />
            <ABMInput
              label="Telefono"
              type="text"
              value={formData.telefono || ''}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              
            />
            <ABMSelect
              label="Rol"
              value={formData.rol || ''}
              onChange={(e) => setFormData({...formData, rol: e.target.value})}
              options={[{ value: 'usuario', label: 'usuario' }, { value: 'supervisor', label: 'supervisor' }, { value: 'admin', label: 'admin' }]}
              placeholder="Seleccionar..."
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
                <Users className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.email}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Email: {item.email}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Nombre: {item.nombre}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Apellido: {item.apellido}</p>
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

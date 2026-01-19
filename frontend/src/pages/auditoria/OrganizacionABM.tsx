import { useState, useEffect } from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
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

interface Organizacion {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  logo_url: string | null;
  color_primario: string | null;
  color_secundario: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  activo: boolean;
}

export default function OrganizacionABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Organizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Organizacion | null>(null);
  const [formData, setFormData] = useState<Partial<Organizacion>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organizaciones?limit=100');
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
        await api.put(`/organizaciones/${editing.id}`, formData);
      } else {
        await api.post('/organizaciones', formData);
      }
      toast.success(editing ? 'Organizacion actualizado' : 'Organizacion creado');
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

  const handleEdit = (item: Organizacion) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/organizaciones/${id}`);
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
    { key: 'logo_url', header: 'Logo url' },
    { key: 'color_primario', header: 'Color primario' },
    { key: 'color_secundario', header: 'Color secundario' },
    { key: 'activo', header: 'Estado', render: (item: Organizacion) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Organizacion"
      icon={<Building2 className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar organizaciones..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay organizaciones"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Organizacion' : 'Nuevo Organizacion'}
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
            <ABMTextarea
              label="Descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows={3}
            />
            <ABMInput
              label="Logo url"
              type="text"
              value={formData.logo_url || ''}
              onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
              
            />
            <ABMInput
              label="Color primario"
              type="text"
              value={formData.color_primario || ''}
              onChange={(e) => setFormData({...formData, color_primario: e.target.value})}
              
            />
            <ABMInput
              label="Color secundario"
              type="text"
              value={formData.color_secundario || ''}
              onChange={(e) => setFormData({...formData, color_secundario: e.target.value})}
              
            />
            <ABMInput
              label="Direccion"
              type="text"
              value={formData.direccion || ''}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              
            />
            <ABMInput
              label="Telefono"
              type="text"
              value={formData.telefono || ''}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              
            />
            <ABMInput
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              
            />
            <ABMInput
              label="Sitio web"
              type="text"
              value={formData.sitio_web || ''}
              onChange={(e) => setFormData({...formData, sitio_web: e.target.value})}
              
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
                <Building2 className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.nombre}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Nombre: {item.nombre}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Codigo: {item.codigo}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Descripcion: {item.descripcion}</p>
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

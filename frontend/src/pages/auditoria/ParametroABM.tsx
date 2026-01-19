import { useState, useEffect } from 'react';
import { Sliders, Pencil, Trash2 } from 'lucide-react';
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

interface Parametro {
  id: number;
  clave: string;
  valor: string;
  tipo: string;
  descripcion: string | null;
  editable: boolean | null;
  organizacion_id: number | null;
  activo: boolean;
}

export default function ParametroABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Parametro | null>(null);
  const [formData, setFormData] = useState<Partial<Parametro>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parametros?limit=100');
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
        await api.put(`/parametros/${editing.id}`, formData);
      } else {
        await api.post('/parametros', formData);
      }
      toast.success(editing ? 'Parametro actualizado' : 'Parametro creado');
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

  const handleEdit = (item: Parametro) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/parametros/${id}`);
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
    { key: 'clave', header: 'Clave' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'editable', header: 'Editable', render: (item: Parametro) => <ABMBadge active={!!item.editable} activeLabel="Sí" inactiveLabel="No" /> },
    { key: 'activo', header: 'Estado', render: (item: Parametro) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Parametro"
      icon={<Sliders className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar parametros..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay parametros"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Parametro' : 'Nuevo Parametro'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
            <ABMInput
              label="Clave"
              type="text"
              value={formData.clave || ''}
              onChange={(e) => setFormData({...formData, clave: e.target.value})}
              required
            />
            <ABMTextarea
              label="Valor"
              value={formData.valor || ''}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              rows={3}
            />
            <ABMSelect
              label="Tipo"
              value={formData.tipo || ''}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              options={[{ value: 'string', label: 'string' }, { value: 'number', label: 'number' }, { value: 'boolean', label: 'boolean' }, { value: 'json', label: 'json' }]}
              placeholder="Seleccionar..."
            />
            <ABMTextarea
              label="Descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows={3}
            />
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="editable"
                checked={formData.editable || false}
                onChange={(e) => setFormData({...formData, editable: e.target.checked})}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="editable" className="text-sm font-medium" style={{ color: theme.text }}>
                Editable
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
                <Sliders className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.clave}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Clave: {item.clave}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Valor: {item.valor}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Tipo: {item.tipo}</p>
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

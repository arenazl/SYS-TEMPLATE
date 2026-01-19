import { useState, useEffect } from 'react';
import { FileText, Pencil, Trash2 } from 'lucide-react';
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

interface Logauditoria {
  id: number;
  usuario_id: number | null;
  accion: string;
  entidad: string | null;
  entidad_id: number | null;
  datos_anteriores: Record<string, any> | null;
  datos_nuevos: Record<string, any> | null;
  ip: string | null;
  user_agent: string | null;
  organizacion_id: number | null;
  activo: boolean;
}

export default function LogauditoriaABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Logauditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Logauditoria | null>(null);
  const [formData, setFormData] = useState<Partial<Logauditoria>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs_auditoria?limit=100');
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
        await api.put(`/logs_auditoria/${editing.id}`, formData);
      } else {
        await api.post('/logs_auditoria', formData);
      }
      toast.success(editing ? 'Logauditoria actualizado' : 'Logauditoria creado');
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

  const handleEdit = (item: Logauditoria) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/logs_auditoria/${id}`);
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
    { key: 'accion', header: 'Accion' },
    { key: 'entidad', header: 'Entidad' },
    { key: 'entidad_id', header: 'Entidad id' },
    { key: 'ip', header: 'Ip' },
    { key: 'activo', header: 'Estado', render: (item: Logauditoria) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Logauditoria"
      icon={<FileText className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar logs_auditoria..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay logs_auditoria"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar Logauditoria' : 'Nuevo Logauditoria'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
            <ABMInput
              label="Usuario id"
              type="number"
              value={formData.usuario_id || ''}
              onChange={(e) => setFormData({...formData, usuario_id: Number(e.target.value)})}
              
            />
            <ABMInput
              label="Accion"
              type="text"
              value={formData.accion || ''}
              onChange={(e) => setFormData({...formData, accion: e.target.value})}
              required
            />
            <ABMInput
              label="Entidad"
              type="text"
              value={formData.entidad || ''}
              onChange={(e) => setFormData({...formData, entidad: e.target.value})}
              
            />
            <ABMInput
              label="Entidad id"
              type="number"
              value={formData.entidad_id || ''}
              onChange={(e) => setFormData({...formData, entidad_id: Number(e.target.value)})}
              
            />
            <ABMTextarea
              label="Datos anteriores"
              value={typeof formData.datos_anteriores === 'object' ? JSON.stringify(formData.datos_anteriores, null, 2) : formData.datos_anteriores || ''}
              onChange={(e) => {
                try {
                  setFormData({...formData, datos_anteriores: JSON.parse(e.target.value)});
                } catch {
                  // Keep as string if not valid JSON
                }
              }}
              rows={4}
              placeholder='{"key": "value"}'
            />
            <ABMTextarea
              label="Datos nuevos"
              value={typeof formData.datos_nuevos === 'object' ? JSON.stringify(formData.datos_nuevos, null, 2) : formData.datos_nuevos || ''}
              onChange={(e) => {
                try {
                  setFormData({...formData, datos_nuevos: JSON.parse(e.target.value)});
                } catch {
                  // Keep as string if not valid JSON
                }
              }}
              rows={4}
              placeholder='{"key": "value"}'
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
                <FileText className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  {item.usuario_id}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Usuario id: {item.usuario_id}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Accion: {item.accion}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>Entidad: {item.entidad}</p>
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

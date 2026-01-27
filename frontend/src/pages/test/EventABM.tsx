import { useState, useEffect } from 'react';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import { ABMPage, ABMCard, ABMCardActions, ABMTable, ABMTableAction, ABMInput, ABMTextarea, ABMSelect, ABMSheetFooter, ABMBadge } from '../../components/ui/ABMPage';
import { DatePicker } from '../../components/ui/DatePicker';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { FileUpload } from '../../components/ui/FileUpload';
import { RadioGroup } from '../../components/ui/RadioGroup';



interface Event {
  id: number;
  name: string;
  description?: string;
  event_date: string;
  start_time?: string;
  location?: string;
  capacity?: number;
  image?: string;
  event_type?: string;
  status: string;
  activo: boolean;
}

export default function EventABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [saving, setSaving] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events?limit=100');
      setItems(res.data.items || []);
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();

  }, []);

  const filteredItems = items.filter(item => {
    if (!search) return true;
    return Object.values(item).some(val => String(val).toLowerCase().includes(search.toLowerCase()));
  });


  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/events/${editing.id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      toast.success(editing ? 'Actualizado' : 'Creado');
      setSheetOpen(false);
      setFormData({});
      setEditing(null);
      fetchData();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item: Event) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/events/${id}`); toast.success('Eliminado'); fetchData(); }
    catch { toast.error('Error al eliminar'); }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({});
    setSheetOpen(true);
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'event_date', header: 'Event Date' },
    { key: 'start_time', header: 'Start Time' },
    { key: 'location', header: 'Location' },
    { key: 'activo', header: 'Estado', render: (item: Event) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Events"
      icon={<Calendar className="h-5 w-5" />}
      buttonLabel="Nuevo"
      onAdd={handleAdd}
      searchPlaceholder="Buscar..."
      searchValue={search}
      onSearchChange={setSearch}
      loading={loading}
      isEmpty={filteredItems.length === 0}
      emptyMessage="No hay registros"
      sheetOpen={sheetOpen}
      sheetTitle={editing ? 'Editar' : 'Nuevo'}
      onSheetClose={() => setSheetOpen(false)}
      sheetContent={
        <div className="space-y-4">
            <ABMInput label="Name" type="text"  value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <RichTextEditor label="Description" value={formData.description || ""} onChange={(value) => setFormData({...formData, description: value})}  />
            <DatePicker label="Event Date" value={formData.event_date || ""} onChange={(value) => setFormData({...formData, event_date: value})} required />
            <ABMInput label="Start Time" type="datetime-local" value={formData.start_time || ''} onChange={(e) => setFormData({...formData, start_time: e.target.value})}  />
            <ABMInput label="Location" type="text"  value={formData.location || ""} onChange={(e) => setFormData({...formData, location: e.target.value})}  />
            <ABMInput label="Capacity" type="number"  value={formData.capacity ?? ""} onChange={(e) => setFormData({...formData, capacity: e.target.value ? Number(e.target.value) : undefined})}  />
            <FileUpload label="Image" value={formData.image || ""} onChange={(file) => setFormData({...formData, image: file ? file.name : ""})}  />
            <ABMSelect label="Event Type" value={formData.event_type || ''} onChange={(e) => setFormData({...formData, event_type: e.target.value})} options={[{ value: 'conference', label: 'Conference' }, { value: 'workshop', label: 'Workshop' }, { value: 'webinar', label: 'Webinar' }, { value: 'meeting', label: 'Meeting' }]} placeholder="Seleccionar..."  />
            <RadioGroup label="Status" value={formData.status || ""} onChange={(value) => setFormData({...formData, status: value})} options={[{label: 'Scheduled', value: 'scheduled'}, {label: 'Ongoing', value: 'ongoing'}, {label: 'Completed', value: 'completed'}, {label: 'Cancelled', value: 'cancelled'}]} />
        </div>
      }
      sheetFooter={<ABMSheetFooter onCancel={() => setSheetOpen(false)} onSave={handleSubmit} saving={saving} />}
      tableView={<ABMTable data={filteredItems} columns={columns} keyExtractor={(item) => item.id} onRowClick={handleEdit} actions={(item) => (<><ABMTableAction icon={<Pencil className="h-4 w-4" />} onClick={() => handleEdit(item)} title="Editar" /><ABMTableAction icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(item.id)} title="Eliminar" variant="danger" /></>)} />}
    >
      {filteredItems.map((item, index) => (
        <ABMCard key={item.id} onClick={() => handleEdit(item)} index={index}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.primary}15` }}>
                <Calendar className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>{item.name || 'ID: ' + item.id}</h3>
                
              </div>
            </div>
            <ABMBadge active={item.activo} />
          </div>
          <div className="flex justify-end mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
            <ABMCardActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id)} />
          </div>
        </ABMCard>
      ))}
    </ABMPage>
  );
}

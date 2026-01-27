import { useState, useEffect } from 'react';
import { FileCode, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import { ABMPage, ABMCard, ABMCardActions, ABMTable, ABMTableAction, ABMInput, ABMTextarea, ABMSelect, ABMSheetFooter, ABMBadge } from '../../components/ui/ABMPage';
import { DatePicker } from '../../components/ui/DatePicker';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { FileUpload } from '../../components/ui/FileUpload';
import { TagsInput } from '../../components/ui/TagsInput';
import { RadioGroup } from '../../components/ui/RadioGroup';



interface Document {
  id: number;
  title: string;
  file_url?: string;
  notes?: string;
  created_date?: string;
  keywords?: string[];
  document_type?: string;
  access_level: string;
  activo: boolean;
}

export default function DocumentABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [formData, setFormData] = useState<Partial<Document>>({});
  const [saving, setSaving] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents?limit=100');
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
        await api.put(`/documents/${editing.id}`, formData);
      } else {
        await api.post('/documents', formData);
      }
      toast.success(editing ? 'Actualizado' : 'Creado');
      setSheetOpen(false);
      setFormData({});
      setEditing(null);
      fetchData();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item: Document) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/documents/${id}`); toast.success('Eliminado'); fetchData(); }
    catch { toast.error('Error al eliminar'); }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({});
    setSheetOpen(true);
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    { key: 'file_url', header: 'File Url' },
    { key: 'notes', header: 'Notes' },
    { key: 'created_date', header: 'Created Date' },
    { key: 'keywords', header: 'Keywords' },
    { key: 'activo', header: 'Estado', render: (item: Document) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Documents"
      icon={<FileCode className="h-5 w-5" />}
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
            <ABMInput label="Title" type="text"  value={formData.title || ""} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            <FileUpload label="File Url" value={formData.file_url || ""} onChange={(file) => setFormData({...formData, file_url: file ? file.name : ""})}  />
            <RichTextEditor label="Notes" value={formData.notes || ""} onChange={(value) => setFormData({...formData, notes: value})}  />
            <DatePicker label="Created Date" value={formData.created_date || ""} onChange={(value) => setFormData({...formData, created_date: value})}  />
            <TagsInput label="Keywords" value={formData.keywords || []} onChange={(tags) => setFormData({...formData, keywords: tags})}  />
            <ABMSelect label="Document Type" value={formData.document_type || ''} onChange={(e) => setFormData({...formData, document_type: e.target.value})} options={[{ value: 'pdf', label: 'Pdf' }, { value: 'word', label: 'Word' }, { value: 'excel', label: 'Excel' }, { value: 'image', label: 'Image' }]} placeholder="Seleccionar..."  />
            <RadioGroup label="Access Level" value={formData.access_level || ""} onChange={(value) => setFormData({...formData, access_level: value})} options={[{label: 'Public', value: 'public'}, {label: 'Private', value: 'private'}, {label: 'Restricted', value: 'restricted'}]} />
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
                <FileCode className="h-5 w-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.text }}>{item.title || 'ID: ' + item.id}</h3>
                
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

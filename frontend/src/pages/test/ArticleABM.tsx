import { useState, useEffect } from 'react';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import { ABMPage, ABMCard, ABMCardActions, ABMTable, ABMTableAction, ABMInput, ABMTextarea, ABMSelect, ABMSheetFooter, ABMBadge } from '../../components/ui/ABMPage';
import { DatePicker } from '../../components/ui/DatePicker';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { FileUpload } from '../../components/ui/FileUpload';
import { TagsInput } from '../../components/ui/TagsInput';
import { RadioGroup } from '../../components/ui/RadioGroup';



interface Article {
  id: number;
  title: string;
  slug: string;
  published_date: string;
  content: string;
  featured_image?: string;
  tags?: string[];
  status: string;
  views?: number;
  featured?: boolean;
  activo: boolean;
}

export default function ArticleABM() {
  const { theme } = useTheme();
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({});
  const [saving, setSaving] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/articles?limit=100');
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
        await api.put(`/articles/${editing.id}`, formData);
      } else {
        await api.post('/articles', formData);
      }
      toast.success(editing ? 'Actualizado' : 'Creado');
      setSheetOpen(false);
      setFormData({});
      setEditing(null);
      fetchData();
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item: Article) => {
    setEditing(item);
    setFormData(item);
    setSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    try { await api.delete(`/articles/${id}`); toast.success('Eliminado'); fetchData(); }
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
    { key: 'slug', header: 'Slug' },
    { key: 'published_date', header: 'Published Date' },
    { key: 'content', header: 'Content' },
    { key: 'featured_image', header: 'Featured Image' },
    { key: 'activo', header: 'Estado', render: (item: Article) => <ABMBadge active={item.activo} /> },
  ];

  return (
    <ABMPage
      title="Articles"
      icon={<FileText className="h-5 w-5" />}
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
            <ABMInput label="Slug" type="text"  value={formData.slug || ""} onChange={(e) => setFormData({...formData, slug: e.target.value})} required />
            <DatePicker label="Published Date" value={formData.published_date || ""} onChange={(value) => setFormData({...formData, published_date: value})} required />
            <RichTextEditor label="Content" value={formData.content || ""} onChange={(value) => setFormData({...formData, content: value})} required />
            <FileUpload label="Featured Image" value={formData.featured_image || ""} onChange={(file) => setFormData({...formData, featured_image: file ? file.name : ""})}  />
            <TagsInput label="Tags" value={formData.tags || []} onChange={(tags) => setFormData({...formData, tags})}  />
            <RadioGroup label="Status" value={formData.status || ""} onChange={(value) => setFormData({...formData, status: value})} options={[{label: 'Published', value: 'published'}, {label: 'Draft', value: 'draft'}, {label: 'Archived', value: 'archived'}]} />
            <ABMInput label="Views" type="number"  value={formData.views ?? ""} onChange={(e) => setFormData({...formData, views: e.target.value ? Number(e.target.value) : undefined})}  />
            <RadioGroup label="Featured" value={formData.featured ? "true" : "false"} onChange={(val) => setFormData({...formData, featured: val === "true"})} options={[{label: 'Yes', value: 'true'}, {label: 'No', value: 'false'}]}  />
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
                <FileText className="h-5 w-5" style={{ color: theme.primary }} />
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

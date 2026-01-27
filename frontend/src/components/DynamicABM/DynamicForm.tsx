/**
 * DynamicForm - Genera formulario dinámicamente según la configuración de campos
 *
 * Interpreta los tipos de campo y renderiza el input correcto:
 * - string → ABMInput type="text"
 * - text → ABMTextarea
 * - email → ABMInput type="email"
 * - int/integer → ABMInput type="number"
 * - decimal/float → ABMInput type="number" step="0.01"
 * - bool → checkbox
 * - date → ABMInput type="date" / DatePicker (with datepicker controlType)
 * - datetime → ABMInput type="datetime-local"
 * - enum → ABMSelect con opciones
 * - fk → ABMSelect con datos cargados
 * - richtext → RichTextEditor (with richtext controlType)
 * - file → FileUpload (with file controlType)
 * - tags → TagsInput (with tags controlType)
 * - radio → RadioGroup (with radio controlType)
 */

import { FieldConfig } from '../../config/entityRegistry';
import { ABMInput, ABMTextarea, ABMSelect, RadioGroup } from '../ui/ABMPage';
import { DatePicker } from '../ui/DatePicker';
import { RichTextEditor } from '../ui/RichTextEditor';
import { FileUpload } from '../ui/FileUpload';
import { TagsInput } from '../ui/TagsInput';
import { useTheme } from '../../contexts/ThemeContext';

interface DynamicFormProps {
  fields: FieldConfig[];
  formData: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  fkOptions: Record<string, { id: number; [key: string]: unknown }[]>;
  excludeFields?: string[];
}

export function DynamicForm({
  fields,
  formData,
  onChange,
  fkOptions,
  excludeFields = ['organizacion_id', 'password_hash']
}: DynamicFormProps) {
  const { theme } = useTheme();

  // Filtrar campos que no se muestran
  const visibleFields = fields.filter(f => !excludeFields.includes(f.name));

  // Handler genérico
  const handleChange = (name: string, value: unknown) => {
    onChange({ ...formData, [name]: value });
  };

  return (
    <>
      {visibleFields.map((field) => (
        <div key={field.name}>
          {renderField(field, formData, handleChange, fkOptions, theme)}
        </div>
      ))}
    </>
  );
}

function renderField(
  field: FieldConfig,
  formData: Record<string, unknown>,
  onChange: (name: string, value: unknown) => void,
  fkOptions: Record<string, { id: number; [key: string]: unknown }[]>,
  theme: { backgroundSecondary: string; border: string; text: string; textSecondary: string }
) {
  const value = formData[field.name];
  const label = formatLabel(field.name);

  switch (field.type) {
    case 'text':
      return (
        <ABMTextarea
          label={label}
          value={String(value || '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          rows={2}
        />
      );

    case 'email':
      return (
        <ABMInput
          label={label}
          type="email"
          value={String(value || '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
        />
      );

    case 'int':
    case 'integer':
      return (
        <ABMInput
          label={label}
          type="number"
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : undefined)}
          required={field.required}
        />
      );

    case 'decimal':
    case 'float':
      return (
        <ABMInput
          label={label}
          type="number"
          step="0.01"
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : undefined)}
          required={field.required}
        />
      );

    case 'bool':
    case 'boolean':
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="w-5 h-5 rounded"
            style={{ accentColor: theme.text }}
          />
          <span className="text-sm" style={{ color: theme.text }}>{label}</span>
        </label>
      );

    case 'date':
      // Check if using DatePicker control
      if (field.controlType === 'datepicker') {
        return (
          <DatePicker
            label={label}
            value={String(value || '')}
            onChange={(val) => onChange(field.name, val)}
            required={field.required}
          />
        );
      }
      // Default to native date input
      return (
        <ABMInput
          label={label}
          type="date"
          value={String(value || '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
        />
      );

    case 'datetime':
      return (
        <ABMInput
          label={label}
          type="datetime-local"
          value={String(value || '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
        />
      );

    case 'enum':
      if (!field.enumValues?.length) return null;
      return (
        <ABMSelect
          label={label}
          value={String(value || '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          options={field.enumValues.map(v => ({
            value: v,
            label: v.charAt(0).toUpperCase() + v.slice(1)
          }))}
          placeholder="Seleccionar..."
        />
      );

    case 'fk':
      const options = fkOptions[field.name] || [];
      return (
        <ABMSelect
          label={label}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => onChange(field.name, e.target.value ? Number(e.target.value) : undefined)}
          options={options.map(opt => ({
            value: String(opt.id),
            label: getOptionLabel(opt)
          }))}
          placeholder="Seleccionar..."
        />
      );

    case 'json':
      return (
        <ABMTextarea
          label={label}
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '')}
          onChange={(e) => {
            try {
              onChange(field.name, JSON.parse(e.target.value));
            } catch {
              onChange(field.name, e.target.value);
            }
          }}
          rows={4}
        />
      );

    case 'richtext':
      return (
        <RichTextEditor
          label={label}
          value={String(value || '')}
          onChange={(val) => onChange(field.name, val)}
          required={field.required}
          placeholder="Ingrese texto enriquecido..."
        />
      );

    case 'file':
      return (
        <FileUpload
          label={label}
          onChange={(file) => onChange(field.name, file)}
          required={field.required}
          accept="*/*"
        />
      );

    case 'tags':
      return (
        <TagsInput
          label={label}
          value={Array.isArray(value) ? value.join(', ') : String(value || '')}
          onChange={(tags) => onChange(field.name, tags)}
          required={field.required}
          placeholder="Ingrese etiquetas separadas por comas..."
        />
      );

    case 'radio':
      if (!field.enumValues?.length) return null;
      return (
        <RadioGroup
          label={label}
          value={String(value || '')}
          onChange={(val) => onChange(field.name, val)}
          options={field.enumValues.map(v => ({
            value: v,
            label: v.charAt(0).toUpperCase() + v.slice(1)
          }))}
          orientation="vertical"
        />
      );

    case 'string':
    default:
      return (
        <ABMInput
          label={label}
          type="text"
          value={String(value || '')}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
        />
      );
  }
}

// ============ HELPERS ============

function formatLabel(name: string): string {
  return name
    .replace(/_id$/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getOptionLabel(opt: { id: number; [key: string]: unknown }): string {
  // Buscar campo de display
  const displayFields = ['nombre', 'name', 'codigo', 'numero', 'titulo', 'email'];
  for (const field of displayFields) {
    if (opt[field]) return String(opt[field]);
  }
  return `ID: ${opt.id}`;
}

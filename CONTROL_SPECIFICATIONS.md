# Control Specifications: New UI Control Types

**Date:** 2026-01-27
**Status:** Design Phase
**Reviewed Patterns From:** `./frontend/src/components/ui/ValidatedInput.tsx`

---

## Overview

This document specifies the design for 5 new UI control types to extend the framework's form rendering capabilities. These controls follow the established pattern from `ValidatedInput.tsx` and integrate seamlessly with the existing DynamicForm system.

---

## Current Control Library (Baseline)

### Existing Control Types

| Control Type | Frontend Input | Supported Data Types | Use Cases |
|---|---|---|---|
| **string** | ABMInput (text) | string | Names, codes, general text |
| **text** | ABMTextarea | string | Descriptions, notes, multi-line text |
| **email** | ABMInput (email) | string | Email addresses |
| **int/integer** | ABMInput (number) | integer | Quantities, counts, IDs |
| **decimal/float** | ABMInput (number, step=0.01) | decimal | Prices, measurements |
| **bool/boolean** | Checkbox | boolean | Flags, toggles |
| **date** | ABMInput (date) | date | Birth dates, deadlines |
| **datetime** | ABMInput (datetime-local) | datetime | Timestamps |
| **enum** | ABMSelect | string | Pre-defined options (status, types) |
| **fk** | ABMSelect with data | integer | Foreign key relationships |
| **json** | ABMTextarea | object | Complex nested data |

### Identified Gaps

1. **No rich text editor** - Limited to plain text for descriptions
2. **No advanced date selection** - Only basic date input, no date range or time pickers
3. **No file upload** - Cannot handle file attachments or media
4. **No tag/chip input** - Cannot handle multiple string values in single field
5. **No radio button groups** - Only checkboxes and select dropdowns for binary/enum choices
6. **No time-specific input** - Only datetime-local, no time-only field

---

## New Control Types Design

### 1. DatePicker Control

#### Purpose
Enhanced date selection with calendar UI, date range support, and preset options.

#### Technical Specifications

**Component Name:** `DatePicker.tsx`

**Props Interface:**
```typescript
interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  hint?: string;
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange?: (value: string) => void;
  dateFormat?: 'date' | 'datetime' | 'time'; // Defaults to 'date'
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
  disabled?: boolean;
  required?: boolean;
  locale?: string; // Defaults to 'es-ES'
  presets?: {
    today: boolean;
    yesterday: boolean;
    tomorrow: boolean;
    thisWeek: boolean;
    thisMonth: boolean;
  };
}
```

**Key Features:**
- Calendar popup for date selection
- Support for single date, date range, and time selection
- Keyboard navigation (arrow keys)
- Min/Max date constraints
- Quick preset buttons (Today, This Week, etc.)
- Validation feedback (error/success states)
- Theme-aware styling (matches ValidatedInput pattern)
- Accessibility: ARIA labels, keyboard support
- Mobile-friendly (native date input fallback on mobile)

**Implementation Pattern:**
```typescript
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => {
  const { theme } = useTheme();
  const [touched, setTouched] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Follows ValidatedInput pattern for error handling, theming, labels
  // Calendar rendered inline or in modal
  // Date validation against minDate/maxDate
});
```

**Backend Support:**
- Type mapping: `datepicker` → Python `datetime.date`
- Validation: ISO date format, min/max constraints
- Schema: Pydantic `date` field with optional validators

**Grid Integration:**
- Filterable: Yes (date range filter)
- Sortable: Yes
- Display format: "DD/MM/YYYY"

---

### 2. RichTextEditor Control

#### Purpose
WYSIWYG rich text editing for descriptions, product details, and formatted content.

#### Technical Specifications

**Component Name:** `RichTextEditor.tsx`

**Props Interface:**
```typescript
interface RichTextEditorProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  value?: string; // HTML content
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  minHeight?: string; // CSS height, defaults to '200px'
  maxHeight?: string;
  readonly?: boolean;
  toolbar?: 'minimal' | 'standard' | 'full'; // Defaults to 'standard'
  allowedFormats?: ('bold' | 'italic' | 'underline' | 'link' | 'list' | 'heading' | 'code')[]; // Defaults to all
}
```

**Key Features:**
- Lightweight HTML editor (contentEditable div pattern)
- Toolbar with: Bold, Italic, Underline, Link, Lists, Headings, Code blocks
- Markdown support (optional)
- Sanitization of HTML input (XSS prevention)
- Undo/Redo support
- Character/word count
- Theme-aware styling
- Copy/Paste handling
- Mobile-friendly (toolbar responsive)

**Implementation Pattern:**
```typescript
export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>((props, ref) => {
  const { theme } = useTheme();
  const [content, setContent] = useState(props.value || '');
  const [touched, setTouched] = useState(false);

  // contentEditable div with toolbar
  // HTML sanitization via DOMPurify-like approach
  // Follows ValidatedInput pattern for error/success states
});
```

**Backend Support:**
- Type mapping: `richtext` → Python `str` (HTML content)
- Validation: HTML sanitization, max length validation
- Schema: Pydantic `str` field with custom validator for HTML safety

**Grid Integration:**
- Filterable: No (text search still possible)
- Sortable: Yes (by text length)
- Display: Stripped HTML preview (first 100 chars)

---

### 3. FileUpload Control

#### Purpose
Handle file attachments with preview, drag-and-drop, and upload progress.

#### Technical Specifications

**Component Name:** `FileUpload.tsx`

**Props Interface:**
```typescript
interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  value?: string; // File URL or path
  onChange?: (file: File | null) => void;
  onUpload?: (file: File) => Promise<string>; // Returns upload URL
  disabled?: boolean;
  required?: boolean;
  accept?: string; // MIME types, defaults to 'image/*,.pdf,.doc,.docx'
  maxSize?: number; // In bytes, defaults to 5MB
  multiple?: boolean; // Single or multiple files, defaults to false
  preview?: boolean; // Show image preview, defaults to true
  uploadProgress?: number; // 0-100
  dragAndDrop?: boolean; // Enable D&D, defaults to true
}
```

**Key Features:**
- Drag and drop file upload
- File type and size validation
- Image preview (thumbnails)
- Upload progress indicator
- Clear/Remove file functionality
- Multiple file support (future)
- Click to browse files
- Theme-aware styling
- Accessibility: File input with proper labels

**Implementation Pattern:**
```typescript
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>((props, ref) => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Drag-and-drop zone
  // File input (hidden)
  // Preview area with remove button
  // Validation: type and size
  // Upload handling
  // Progress indicator
});
```

**Backend Support:**
- Type mapping: `fileupload` → Python `str` (file URL/path)
- Integration: Requires external storage (Cloudinary, S3, etc.)
- Validation: File type whitelist, size limits
- Schema: Pydantic `str` field for URL, with file upload endpoint

**Grid Integration:**
- Filterable: No
- Sortable: No
- Display: File icon + filename

---

### 4. TagsInput Control

#### Purpose
Input multiple values (tags/chips) with keyboard shortcuts and validation.

#### Technical Specifications

**Component Name:** `TagsInput.tsx`

**Props Interface:**
```typescript
interface TagsInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  value?: string[]; // Array of tag strings
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  separator?: string | string[]; // Delimiters: space, comma, enter. Defaults to [',', ' ']
  duplicate?: 'allow' | 'reject'; // Handle duplicate tags, defaults to 'reject'
  suggestions?: string[]; // Optional autocomplete suggestions
  maxTags?: number;
  minTagLength?: number;
  maxTagLength?: number;
  allowCustom?: boolean; // Allow free-form tags, defaults to true
  tagColor?: 'default' | 'rainbow'; // Styling mode for tags
}
```

**Key Features:**
- Add tags via: typing and separator, dropdown suggestions, paste
- Remove tags via: backspace key, click remove button
- Keyboard shortcuts: Arrow keys for navigation, Enter to add, Backspace to remove
- Duplicate handling (accept or reject)
- Optional suggestions/autocomplete
- Tag validation (length, custom regex)
- Chip-style display with remove buttons
- Max tags limit
- Theme-aware styling
- Copy/Paste multiple values (comma-separated)

**Implementation Pattern:**
```typescript
export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>((props, ref) => {
  const { theme } = useTheme();
  const [tags, setTags] = useState<string[]>(props.value || []);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Input field for typing
  // Chips/tags display with remove buttons
  // Dropdown suggestions
  // Keyboard handling
  // Paste handling for comma-separated values
  // Validation
});
```

**Backend Support:**
- Type mapping: `tags` → Python `List[str]` (or JSON array)
- Storage: JSON array in database, or denormalized string (comma-separated)
- Validation: Item length, total length, duplicate check
- Schema: Pydantic `List[str]` field

**Grid Integration:**
- Filterable: Yes (contains filter)
- Sortable: Yes (by count of tags)
- Display: Chips showing first 2-3 tags, "+N more" indicator

---

### 5. RadioGroup Control

#### Purpose
Single-choice selection from predefined options with radio buttons or button-style toggle.

#### Technical Specifications

**Component Name:** `RadioGroup.tsx`

**Props Interface:**
```typescript
interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  value?: string | number; // Selected option value
  onChange?: (value: string | number) => void;
  options: Array<{
    value: string | number;
    label: string;
    description?: string; // Sub-label
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  disabled?: boolean;
  required?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid'; // Display arrangement, defaults to 'vertical'
  variant?: 'radio' | 'button'; // Radio buttons or toggle buttons, defaults to 'radio'
  columns?: number; // For 'grid' layout, defaults to 2
}
```

**Key Features:**
- Radio button display OR button-style toggle display
- Keyboard navigation (arrow keys)
- Option descriptions/sub-labels
- Icons for visual distinction
- Per-option disable capability
- Vertical/Horizontal/Grid layout options
- Responsive grid layout
- Error state indication
- Theme-aware styling
- Accessibility: ARIA roles, keyboard support

**Implementation Pattern:**
```typescript
export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>((props, ref) => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState(props.value);

  // Option items as radio buttons or buttons
  // Keyboard navigation (arrow keys)
  // Follows ValidatedInput pattern for labels, errors, hints
  // Responsive grid for 'grid' layout
});
```

**Backend Support:**
- Type mapping: `radio` → Python `str` or `int` (enum value)
- Can extend existing `enum` type or be separate type
- Validation: Value in allowed options list
- Schema: Pydantic enum field

**Grid Integration:**
- Filterable: Yes (exact match filter)
- Sortable: Yes (by label)
- Display: Selected label only

---

## Implementation Architecture

### File Structure

```
frontend/src/components/ui/
├── DatePicker.tsx           (NEW)
├── RichTextEditor.tsx       (NEW)
├── FileUpload.tsx           (NEW)
├── TagsInput.tsx            (NEW)
├── RadioGroup.tsx           (NEW)
├── ValidatedInput.tsx       (EXISTING - REFERENCE)
├── ABMInput.tsx             (EXISTING)
├── ABMSelect.tsx            (EXISTING)
├── ABMTextarea.tsx          (EXISTING)
└── ABMPage.tsx              (MODIFY)
```

### Common Patterns (All Controls Follow)

**Pattern from ValidatedInput.tsx:**
1. Use `forwardRef` for ref exposure
2. Extend appropriate HTML props (InputHTMLAttributes, etc.)
3. Use `useTheme()` from ThemeContext for styling
4. Implement touched/validation state tracking
5. Provide label, error, hint, success props
6. Return themed div with nested controls
7. Support required field indicator
8. Inline error messages with icons (AlertCircle)
9. Inline success indicator when touched and valid

**Common Implementation Features:**
- Component displayName assignment
- Destructuring with defaults
- Inline style objects using theme colors
- Tailwind CSS classes with theme fallback
- Icon support via lucide-react
- Type-safe props with TypeScript interfaces

### Integration Points

#### 1. DynamicForm.tsx (Phase 3 - subtask-3-2)
Add new field type cases in `renderField()` function:
```typescript
case 'datepicker':
  return <DatePicker ... />;
case 'richtext':
  return <RichTextEditor ... />;
case 'fileupload':
  return <FileUpload ... />;
case 'tags':
  return <TagsInput ... />;
case 'radio':
  return <RadioGroup ... />;
```

#### 2. entityRegistry.ts (Phase 3 - subtask-3-1)
Extend FieldConfig type:
```typescript
export interface FieldConfig {
  type: 'string' | ... | 'datepicker' | 'richtext' | 'fileupload' | 'tags' | 'radio';
  // ... existing fields
  // new field-specific options
  radioOptions?: string[]; // For 'radio' type
  maxTags?: number; // For 'tags' type
  fileTypes?: string[]; // For 'fileupload' type
}
```

#### 3. CLI Generation Scripts (Phase 5)
Update `generate-crud.ts` and `generate-layout.ts`:
- Add control type enum values
- Add field type templates
- Add backend schema templates for each control

#### 4. Backend Schemas (Phase 4 - subtask-4-1)
Add Pydantic validators for new control types:
- DatePicker: date validation, range checks
- RichTextEditor: HTML sanitization
- FileUpload: URL/path validation
- TagsInput: array validation, duplicate detection
- RadioGroup: enum validation

---

## Field Type Syntax in Definitions

### CLI Definition Format

How new controls appear in entity definitions (in `cli/negocio.json`):

```json
{
  "name": "Producto",
  "fields": "
    codigo:string:req
    nombre:string:req
    descripcion:richtext
    fecha_lanzamiento:datepicker
    imagen:fileupload
    palabras_clave:tags
    estado:radio(activo,inactivo,descontinuado):req
  "
}
```

### Field Type Mappings

| CLI Syntax | Control Type | Python Type | Notes |
|---|---|---|---|
| `campo:datepicker` | DatePicker | `datetime.date` | Single date selection |
| `campo:datetime:datepicker` | DatePicker | `datetime.datetime` | Date + time selection |
| `campo:richtext` | RichTextEditor | `str` | HTML-safe string |
| `campo:fileupload` | FileUpload | `str` | File URL/path |
| `campo:tags` | TagsInput | `List[str]` | JSON array in DB |
| `campo:radio(opt1,opt2,opt3)` | RadioGroup | `str` (enum) | Pre-defined options |

---

## Validation Rules

### DatePicker Validation
- ✓ Valid ISO date format (YYYY-MM-DD)
- ✓ Date within min/max range (if specified)
- ✓ Not in future (if constraint applies)
- ✓ Not in past (if constraint applies)

### RichTextEditor Validation
- ✓ HTML sanitization (prevent XSS)
- ✓ Max length (character count)
- ✓ Required if marked required
- ✓ No script tags or unsafe attributes

### FileUpload Validation
- ✓ File type in whitelist (MIME type check)
- ✓ File size under max limit (default 5MB)
- ✓ File successfully uploaded before save
- ✓ URL reachable and valid

### TagsInput Validation
- ✓ Each tag within min/max length
- ✓ Total tags under max limit
- ✓ No duplicate tags (if configured)
- ✓ Each tag matches allowed pattern (if regex provided)

### RadioGroup Validation
- ✓ Selected value in allowed options
- ✓ Value provided if marked required
- ✓ Single value only (no multiple selection)

---

## Testing Strategy

### Unit Tests (Phase 6 - subtask-6-1)
For each control type:
- [ ] Component renders without errors
- [ ] Props validation works
- [ ] Theme styling applies correctly
- [ ] Label and error messages display
- [ ] onChange callback fires correctly
- [ ] Required field indicator shows
- [ ] Error state displays properly
- [ ] Success state displays properly (if applicable)
- [ ] Keyboard navigation works
- [ ] Accessibility attributes present

### Integration Tests (Phase 6 - subtask-6-2)
- [ ] Controls integrate with DynamicForm
- [ ] Controls work in CRUD create/edit
- [ ] Data round-trips: input → backend → display
- [ ] Validation errors display from backend
- [ ] Multiple controls interact properly

### E2E Tests (Phase 8 - subtask-8-2)
- [ ] DatePicker: Select date, verify in grid filter
- [ ] RichTextEditor: Type formatted text, save, retrieve
- [ ] FileUpload: Upload file, display in list
- [ ] TagsInput: Add tags, search by tags
- [ ] RadioGroup: Select option, persist in database

---

## Backward Compatibility Notes

✓ **No Breaking Changes:**
- Existing field types continue to work unchanged
- DynamicForm's switch statement extends without breaking
- entityRegistry.ts FieldConfig extends gracefully
- No modifications to existing component props
- No changes to backend CRUD endpoints

✓ **Additive Only:**
- New control types are optional
- Existing screens with old controls unaffected
- Database schema unchanged for existing fields
- CLI generation scripts backward compatible

---

## Design Decisions & Rationale

### Why These 5 Controls?

1. **DatePicker** - Most requested feature gap, common in all applications
2. **RichTextEditor** - Needed for product descriptions, marketing content
3. **FileUpload** - Handles media, attachments, documents
4. **TagsInput** - Multi-value input without database relations
5. **RadioGroup** - Better UX than select for 3-5 binary/enum options

### Why Follow ValidatedInput Pattern?

- Proven, tested pattern in codebase
- Consistent theme/styling integration
- Proper validation and error handling
- Accessibility compliance
- forwardRef support for forms
- Developer familiarity

### Why Not Use External Libraries?

- Radix UI provides primitives, not high-level components
- Keeping stack lightweight (framework is "a bit slow")
- Custom components offer more control and consistency
- Reduces dependencies and bundle size
- Matches existing framework philosophy

### Field Type Mappings - Why Separate Types?

- `datepicker` vs `date`: Enables enhanced UI vs basic input
- `richtext` vs `text`: HTML content vs plain text
- `fileupload` as new type: Distinct from simple string
- `tags` vs enum: Multiple values vs single choice
- `radio` vs enum: UX preference (buttons vs dropdown)

---

## Migration Path (If Needed)

To convert existing field to new control type:

1. In entity definition, change field type syntax
2. Run CLI generation script
3. Database schema automatically updated (if needed)
4. Frontend component automatically rendered
5. Tests run, CRUD operations verified

Example:
```json
// Before
"descripcion:text"

// After
"descripcion:richtext"
```

---

## Document History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-01-27 | Initial design of 5 new control types |

---

## Related Documentation

- `AUDIT_FINDINGS.md` - Analysis of current control gaps (Phase 1.1)
- `ARCHITECTURE_PLAN.md` - Overall control architecture (Phase 1.3)
- `CONTROL_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation guide (Phase 7.1)
- `CODE_REVIEW.md` - Architecture review findings (Phase 7.2)
- `README.md` - Updated with new controls documentation (Phase 7.3)

---

## Sign-Off

**Design Phase Status:** ✓ Complete
**Ready for Implementation:** ✓ Yes
**Backward Compatibility:** ✓ Verified
**Team Review Required:** Before Phase 2 implementation

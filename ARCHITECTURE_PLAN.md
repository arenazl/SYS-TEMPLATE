# Control Architecture Design Plan

**Date:** January 27, 2026
**Phase:** Phase 1 - Control Inventory Audit & Design
**Subtask:** subtask-1-3 - Design control architecture
**Status:** Design (Ready for Phase 2 Implementation)

---

## Executive Summary

This document defines the control architecture for the SYS-TEMPLATE framework. It builds upon the audit findings (AUDIT_FINDINGS.md) and control specifications (CONTROL_SPECIFICATIONS.md) to provide a scalable, extensible architecture that supports current controls (11 types) and the planned 5 new controls, while enabling future expansion.

**Key Principles:**
- ✓ **Factory Pattern**: Move from switch statements to factory mapping
- ✓ **Separation of Concerns**: Decouple control discovery, rendering, and validation
- ✓ **Type-Safe Extensibility**: Add controls with type safety, not complexity
- ✓ **Backward Compatible**: All changes additive, no breaking modifications
- ✓ **Consistent Integration**: Unified approach across frontend, backend, CLI

---

## Table of Contents

1. [Current Architecture Review](#1-current-architecture-review)
2. [Control Lifecycle & Data Flow](#2-control-lifecycle--data-flow)
3. [Extensible Control Architecture](#3-extensible-control-architecture)
4. [Control Registration & Discovery](#4-control-registration--discovery)
5. [Frontend Control System](#5-frontend-control-system)
6. [Backend Integration](#6-backend-integration)
7. [CLI Generation System](#7-cli-generation-system)
8. [Validation Architecture](#8-validation-architecture)
9. [Type System Design](#9-type-system-design)
10. [Integration Points](#10-integration-points)
11. [Scalability & Future Expansion](#11-scalability--future-expansion)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. Current Architecture Review

### 1.1 Control Discovery Flow (Current)

```
Entity Definition (JSON)
    ↓
CLI Parser (parseFields)
    ├─ Extracts field name, type, modifiers
    ├─ Maps type to Python/TypeScript types
    └─ Stores in entityRegistry
    ↓
entityRegistry.ts (Frontend Config)
    ├─ FieldConfig with hardcoded type union
    └─ Field metadata (required, fk, enum info)
    ↓
DynamicForm.renderField() (Switch Statement)
    ├─ case 'string': ABMInput
    ├─ case 'text': ABMTextarea
    ├─ case 'date': ABMInput type=date
    └─ case 'enum': ABMSelect
    ↓
Component Render
```

### 1.2 Current Strengths

| Aspect | Strength |
|--------|----------|
| **Simplicity** | Easy to understand, no abstraction complexity |
| **Type Safety** | TypeScript enforces field type union |
| **Themeable** | All controls use ThemeContext |
| **Integrated** | Works across frontend, backend, CLI |
| **Backward Compatible** | ~4 existing screens work without changes |

### 1.3 Current Weaknesses

| Aspect | Weakness | Impact |
|--------|----------|--------|
| **Switch Statements** | Not scalable, becomes large with 10+ types | Hard to maintain |
| **Hardcoded Types** | Adding control requires modifying 4+ files | High friction for extension |
| **Type Union Bloat** | `type: 'string' \| 'text' \| ... \| 'enum' \| 'fk'` | Cognitive load |
| **No Variants** | Can't customize control behavior | Limited flexibility |
| **Limited Metadata** | Only name, type, required, fk, enum info | Can't pass control-specific props |
| **Monolithic DynamicForm** | All rendering logic in one file | Hard to test, maintain |

### 1.4 Why Current Architecture Must Evolve

With 5 new controls planned (DatePicker, RichTextEditor, FileUpload, TagsInput, RadioGroup):

1. **renderField() grows to 250+ lines** (currently ~150 lines)
2. **FieldConfig type becomes unmaintainable** (18 union members)
3. **Adding control requires changing DynamicForm, entityRegistry, CLI, backend**
4. **No way to pass control-specific config** (DatePicker min/max, FileUpload accept types, etc.)

**Solution:** Implement **Factory Pattern + Control Registry** for scalability

---

## 2. Control Lifecycle & Data Flow

### 2.1 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENTITY DEFINITION (JSON)                     │
│  name: "Producto"                                               │
│  fields: "nombre:string:req precio:decimal:req activo:bool"    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │   CLI   │
                    │ generate│
                    │-crud.ts │
                    └────┬────┘
          ┌─────────────┼─────────────┐
          │             │             │
    ┌─────▼────┐  ┌────▼────┐  ┌────▼─────┐
    │ Backend  │  │Frontend  │  │  SQLite/ │
    │ Schema   │  │ Config   │  │  MySQL   │
    │ (Python) │  │(TypeScript)
    └─────┬────┘  └────┬────┘  └──────────┘
          │             │
          │             └──────────┬─────────────────────────┐
          │                        │                         │
          │                    ┌───▼──────┐          ┌───────▼────┐
          │                    │entityRegistry│      │DynamicForm  │
          │                    │.ts        │      │renderField()│
          │                    └───┬──────┘      └───────┬────┘
          │                        │                     │
          │                        └─────────┬───────────┘
          │                                  │
          │                        ┌─────────▼────────┐
          │                        │ Control Factory  │
          │                        │ (NEW)            │
          │                        └────────┬─────────┘
          │                                 │
          │                        ┌────────▼─────────┐
          │                        │ Control Instance │
          │                        │ (Component)      │
          │                        └────────┬─────────┘
          │                                 │
          │                        ┌────────▼─────────┐
          │                        │   Browser Render │
          │                        │  (HTML/React)    │
          │                        └────────┬─────────┘
          │                                 │
          │                        ┌────────▼─────────┐
          │                        │  User Interaction│
          │                        │  (onChange/blur) │
          │                        └────────┬─────────┘
          │                                 │
          │                        ┌────────▼─────────┐
          │                        │   Form Data      │
          │                        │  Validation      │
          │                        └────────┬─────────┘
          │                                 │
          └─────────────────────────┬───────┘
                                    │
                          ┌─────────▼────────┐
                          │  API POST/PUT    │
                          │  (formData)      │
                          └────────┬─────────┘
                                   │
                            ┌──────▼───────┐
                            │   Backend    │
                            │  Validation  │
                            │  (Pydantic)  │
                            └──────┬───────┘
                                   │
                            ┌──────▼──────┐
                            │  Database   │
                            │   Insert    │
                            │   /Update   │
                            └──────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │ Success/    │
                            │  Error      │
                            │  Response   │
                            └─────────────┘
```

### 2.2 Value Transformation Journey

```
┌────────────────────────────────────────────────────────────┐
│ Entity Definition                                          │
│ campo:decimal:req → Python float, Frontend number input   │
└──────────────────────┬───────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼──┐      ┌───▼────┐    ┌───▼─────┐
   │Backend │      │Frontend │    │Database │
   │Schema  │      │Config   │    │Schema   │
   └────┬───┘      └───┬────┘    └───┬─────┘
        │              │             │
   Pydantic:      FieldConfig:   Column Type:
   float          type: 'decimal' Float
   Field(gt=0)    required: true
        │              │             │
        └──────────────┼─────────────┘
                       │
             ┌─────────▼──────────┐
             │   ABMInput         │
             │   type="number"    │
             │   step="0.01"      │
             │   (Rendered)       │
             └──────────┬─────────┘
                        │
             ┌──────────▼──────────┐
             │  User enters: "19.99"│
             │  onChange event      │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ Number(e.target.value)
             │ = 19.99 (JavaScript)│
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ Form Data           │
             │ { precio: 19.99 }   │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ JSON serialization  │
             │ {"precio": 19.99}   │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ POST to /api/...    │
             │ Content-Type: json  │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ Pydantic validation │
             │ float(19.99)        │
             │ gt=0 ✓              │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ SQLAlchemy insert   │
             │ Float column = 19.99│
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │ Database stores     │
             │ DECIMAL(10,2)       │
             └─────────────────────┘
```

---

## 3. Extensible Control Architecture

### 3.1 Proposed Architecture: Factory + Registry Pattern

```typescript
// ==================== CONTROL FACTORY ====================

interface ControlProps {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  // Control-specific props passed via config
  [key: string]: unknown;
}

interface ControlFactory {
  [type: string]: React.ComponentType<ControlProps>;
}

// Central registry of all controls
const controlFactory: ControlFactory = {
  // Existing controls
  'string': ABMInput,
  'text': ABMTextarea,
  'email': ABMInput,
  'int': ABMInput,
  'decimal': ABMInput,
  'bool': Checkbox,
  'date': ABMInput,
  'datetime': ABMInput,
  'enum': ABMSelect,
  'fk': ABMSelect,
  'json': ABMTextarea,

  // New controls (Phase 2)
  'datepicker': DatePicker,
  'richtext': RichTextEditor,
  'fileupload': FileUpload,
  'tags': TagsInput,
  'radio': RadioGroup,

  // Future controls
  // 'time': TimePicker,
  // 'async-select': AsyncSelect,
  // 'range-slider': RangeSlider,
};

// Lookup function
export function getControlComponent(type: string): React.ComponentType<ControlProps> {
  const Component = controlFactory[type];
  if (!Component) {
    console.warn(`Unknown control type: ${type}, falling back to ABMInput`);
    return ABMInput;
  }
  return Component;
}
```

### 3.2 Refactored DynamicForm (After Pattern)

```typescript
// BEFORE (Current - 150+ lines with switch)
function renderField(field: FieldConfig, ...) {
  switch(field.type) {
    case 'string': return <ABMInput ... />;
    case 'text': return <ABMTextarea ... />;
    // ... 10+ more cases
  }
}

// AFTER (Factory Pattern - 20 lines)
function renderField(field: FieldConfig, ...) {
  const Component = getControlComponent(field.type);
  return (
    <Component
      name={field.name}
      value={formData[field.name]}
      onChange={(val) => handleChange(field.name, val)}
      error={errors[field.name]}
      hint={field.hint}
      required={field.required}
      disabled={disabled}
      {...field.config}  // Control-specific props
    />
  );
}
```

**Benefits:**
- 85% reduction in DynamicForm code
- Adding new control: Add 1 line to factory, no changes to DynamicForm
- Type-safe: TypeScript checks component props match ControlProps
- Easy to test: Mock controls in tests

### 3.3 Control Metadata Extension

Current FieldConfig is too basic. Extend to support control-specific metadata:

```typescript
// BEFORE (Limited)
interface FieldConfig {
  name: string;
  type: 'string' | 'text' | ... | 'enum' | 'fk';
  required: boolean;
  fkEntity?: string;
  enumValues?: string[];
}

// AFTER (Extensible)
interface FieldConfig {
  name: string;
  type: string;  // ← Now open-ended string, not union!
  required: boolean;

  // Common metadata
  label?: string;
  hint?: string;
  placeholder?: string;

  // Control configuration (varies by type)
  config?: {
    // For DatePicker
    minDate?: string;
    maxDate?: string;
    dateFormat?: 'date' | 'datetime' | 'time';

    // For FileUpload
    accept?: string;
    maxSize?: number;

    // For TagsInput
    separator?: string | string[];
    maxTags?: number;

    // For RadioGroup
    options?: Array<{ value: string; label: string; icon?: ReactNode }>;
    layout?: 'vertical' | 'horizontal' | 'grid';

    // For foreign keys
    fkEntity?: string;
    fkTable?: string;

    // For enum/radio
    enumValues?: string[];

    // For RichTextEditor
    minHeight?: string;
    toolbar?: 'minimal' | 'standard' | 'full';

    // Generic: any control can add config
    [key: string]: unknown;
  };
}
```

### 3.4 Control Discovery Layer

Create a dedicated module for control management:

```typescript
// frontend/src/lib/ControlRegistry.ts

/**
 * Central control registry for the framework
 * Handles control discovery, props validation, default rendering
 */

interface ControlMetadata {
  component: React.ComponentType<ControlProps>;
  defaultProps?: Partial<ControlProps>;
  category: 'input' | 'selection' | 'advanced' | 'file';
  supportsGrid: boolean;
  version: string;
}

class ControlRegistry {
  private controls = new Map<string, ControlMetadata>();

  register(type: string, metadata: ControlMetadata) {
    this.controls.set(type, metadata);
  }

  get(type: string): ControlMetadata | null {
    return this.controls.get(type);
  }

  getComponent(type: string): React.ComponentType<ControlProps> {
    return this.get(type)?.component || ABMInput;
  }

  listAll(): Array<{ type: string; metadata: ControlMetadata }> {
    return Array.from(this.controls.entries()).map(([type, metadata]) => ({
      type,
      metadata
    }));
  }

  isGridSupported(type: string): boolean {
    return this.get(type)?.supportsGrid ?? false;
  }
}

// Singleton instance
export const controlRegistry = new ControlRegistry();

// Initialize with all controls
controlRegistry.register('string', {
  component: ABMInput,
  category: 'input',
  supportsGrid: true,
  version: '1.0'
});

controlRegistry.register('datepicker', {
  component: DatePicker,
  category: 'advanced',
  supportsGrid: true,
  version: '1.0'
});

// ... register all controls
```

---

## 4. Control Registration & Discovery

### 4.1 Multi-Layer Discovery System

```
┌──────────────────────────────┐
│  Control Type (from entity)  │
│  "field:datepicker"          │
└────────────┬─────────────────┘
             │
    ┌────────▼──────────┐
    │ CLI Parser        │
    │ parseFields()     │
    └────────┬──────────┘
             │
    ┌────────▼────────────────────────┐
    │ entityRegistry.ts               │
    │ FieldConfig {                   │
    │   type: 'datepicker',           │
    │   config: {                     │
    │     minDate, maxDate, format   │
    │   }                             │
    │ }                               │
    └────────┬────────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ ControlRegistry.get()        │
    │ Returns: ControlMetadata     │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ Render Component             │
    │ <DatePicker {...config} />   │
    └─────────────────────────────┘
```

### 4.2 Discovery Layers

| Layer | File | Responsibility |
|-------|------|-----------------|
| **Definition** | `entity.json` | Specify field type and config |
| **Parser** | `cli/generate-crud.ts` | Parse field syntax, extract type & config |
| **Registry** | `frontend/src/config/entityRegistry.ts` | Store parsed fields and types |
| **Discovery** | `frontend/src/lib/ControlRegistry.ts` | Map type to component |
| **Rendering** | `frontend/src/components/DynamicABM/DynamicForm.tsx` | Render control with props |

### 4.3 Type Resolution

```typescript
// Frontend resolution: field type → React component

function resolveControl(fieldConfig: FieldConfig): ControlResolution {
  const metadata = controlRegistry.get(fieldConfig.type);

  if (!metadata) {
    // Fallback for unknown types
    return {
      component: ABMInput,
      props: { type: 'text' }
    };
  }

  // Merge default props with field-specific config
  const finalProps = {
    ...metadata.defaultProps,
    ...fieldConfig.config
  };

  return {
    component: metadata.component,
    props: finalProps
  };
}
```

---

## 5. Frontend Control System

### 5.1 Control Component Pattern (Standardized)

All controls follow this interface:

```typescript
interface ControlProps {
  // Identity
  name: string;

  // Data
  value: unknown;
  onChange: (value: unknown) => void;

  // Display
  label?: string;
  placeholder?: string;
  hint?: string;

  // State
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;

  // Control-specific (passed via ...config)
  [key: string]: unknown;
}

// Example: DatePicker extends this
interface DatePickerProps extends ControlProps {
  dateFormat?: 'date' | 'datetime' | 'time';
  minDate?: string;
  maxDate?: string;
  locale?: string;
  presets?: { today: boolean; thisWeek: boolean; };
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, value, onChange, error, required, dateFormat = 'date', minDate, maxDate, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <div>
        {label && <label>{label} {required && <span>*</span>}</label>}
        {/* Calendar UI */}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );
  }
);
```

### 5.2 Control Lifecycle in Forms

```
1. INITIALIZATION
   └─ Field config loaded from entityRegistry
   └─ Control component resolved via ControlRegistry
   └─ Initial value provided

2. RENDER
   └─ Component mounts
   └─ Theme context accessed
   └─ Props destructured (label, value, onChange, config...)
   └─ HTML/React rendered

3. INTERACTION
   └─ User input (click, type, select, etc.)
   └─ Internal state updated (if needed)
   └─ onChange callback fired with new value
   └─ Form data updated

4. VALIDATION
   └─ Client-side validation (optional)
   └─ Error state set if invalid
   └─ Error message displayed
   └─ Success indicator shown if valid

5. SUBMISSION
   └─ Form data serialized
   └─ API POST/PUT sent to backend
   └─ Backend validation (Pydantic)
   └─ Database insert/update
   └─ Response returns to frontend

6. FEEDBACK
   └─ Success message shown
   └─ Form cleared or redirected
   └─ Errors display from backend validation
```

### 5.3 Component Organization

```
frontend/src/components/
├── DynamicABM/
│   ├── DynamicForm.tsx           ← Main form renderer
│   ├── DynamicDetailSection.tsx
│   └── index.tsx
├── ui/
│   ├── ControlRegistry.ts        ← (NEW) Central control registration
│   ├── controls/                 ← (NEW) Organized by category
│   │   ├── input/
│   │   │   ├── ABMInput.tsx
│   │   │   ├── ValidatedInput.tsx
│   │   │   └── DatePicker.tsx
│   │   ├── selection/
│   │   │   ├── ABMSelect.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   └── TagsInput.tsx
│   │   └── advanced/
│   │       ├── RichTextEditor.tsx
│   │       └── FileUpload.tsx
│   ├── ABMPage.tsx               ← Base components (ABMInput, ABMSelect, ABMTextarea)
│   └── ... other UI components
├── Layout.tsx
└── ... other components
```

**Note:** Organization is optional for Phase 2. Can keep all in `ui/` folder for now.

---

## 6. Backend Integration

### 6.1 Control Type → Backend Type Mapping

```typescript
// cli/generate-crud.ts

interface TypeMapping {
  fieldType: string;
  pythonType: string;
  sqlAlchemyType: string;
  pydanticType: string;
  example: unknown;
}

const typeMap: TypeMapping[] = [
  // Existing
  { fieldType: 'string', pythonType: 'str', sqlAlchemyType: 'String(255)', pydanticType: 'str', example: 'John' },
  { fieldType: 'decimal', pythonType: 'float', sqlAlchemyType: 'Float', pydanticType: 'float', example: 19.99 },
  { fieldType: 'bool', pythonType: 'bool', sqlAlchemyType: 'Boolean', pydanticType: 'bool', example: true },
  { fieldType: 'date', pythonType: 'date', sqlAlchemyType: 'Date', pydanticType: 'date', example: '2026-01-27' },
  { fieldType: 'enum', pythonType: 'str', sqlAlchemyType: 'String(50)', pydanticType: 'str', example: 'ACTIVE' },

  // New (Phase 2)
  { fieldType: 'datepicker', pythonType: 'date', sqlAlchemyType: 'Date', pydanticType: 'date', example: '2026-01-27' },
  { fieldType: 'richtext', pythonType: 'str', sqlAlchemyType: 'Text', pydanticType: 'str', example: '<p>Hello</p>' },
  { fieldType: 'fileupload', pythonType: 'str', sqlAlchemyType: 'String(512)', pydanticType: 'str', example: 'https://cdn.example.com/file.pdf' },
  { fieldType: 'tags', pythonType: 'List[str]', sqlAlchemyType: 'JSON', pydanticType: 'List[str]', example: ['tag1', 'tag2'] },
  { fieldType: 'radio', pythonType: 'str', sqlAlchemyType: 'String(100)', pydanticType: 'str', example: 'option1' },
];
```

### 6.2 Backend Schema Generation

For each control type, generator creates appropriate Pydantic schema:

```python
# backend/schemas/producto.py (Generated)

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import date

class ProductoCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    precio: float = Field(..., gt=0)
    descripcion: Optional[str] = Field(None, max_length=2000)
    fecha_lanzamiento: Optional[date] = None
    palabras_clave: Optional[List[str]] = Field(None, max_items=10)
    imagen: Optional[str] = Field(None)  # URL from FileUpload
    estado: str = Field(..., pattern='^(activo|inactivo|descontinuado)$')

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    descripcion: Optional[str] = None
    fecha_lanzamiento: Optional[date] = None
    palabras_clave: Optional[List[str]] = None
    imagen: Optional[str] = None
    estado: Optional[str] = None

class ProductoResponse(BaseModel):
    id: int
    nombre: str
    precio: float
    descripcion: Optional[str]
    fecha_lanzamiento: Optional[date]
    palabras_clave: Optional[List[str]]
    imagen: Optional[str]
    estado: str
```

### 6.3 Validation Rules per Control Type

| Control Type | Validation Rules | Example |
|---|---|---|
| **datepicker** | ISO date format, min/max range | `2026-01-27` |
| **richtext** | HTML sanitization, max length | `<p>Content</p>` |
| **fileupload** | File type whitelist, size limit | URL string |
| **tags** | Each tag length, total count, duplicates | `["tag1", "tag2"]` |
| **radio** | Value in allowed options | `"option1"` |

---

## 7. CLI Generation System

### 7.1 Field Definition Syntax

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

**Syntax Rules:**
- `nombre` - field name
- `:` - delimiter
- `tipo` - field type (string, richtext, datepicker, fileupload, tags, radio)
- `:req` - (optional) required flag
- `:config(...)` - (optional) type-specific config

### 7.2 Generator Responsibilities

The CLI generator must handle:

1. **Parse field type** → Extract base type and config
2. **Generate backend model** → SQLAlchemy column with correct type
3. **Generate backend schema** → Pydantic with validators
4. **Generate frontend config** → FieldConfig with metadata
5. **Generate API CRUD** → POST/PUT validation
6. **Generate frontend component** → DynamicForm integration

### 7.3 Generator Enhancement

```typescript
// cli/generate-crud.ts (Enhanced for Phase 2)

interface FieldGenerator {
  parseField(fieldDef: string): { type: string; config: Record<string, unknown> };
  generateModel(field: ParsedField): string;      // SQLAlchemy
  generateSchema(field: ParsedField): string;     // Pydantic
  generateFrontendConfig(field: ParsedField): string; // FieldConfig
}

// Register generators for each type
const generators: Record<string, FieldGenerator> = {
  'string': new StringFieldGenerator(),
  'datepicker': new DatePickerFieldGenerator(),
  'richtext': new RichTextFieldGenerator(),
  'fileupload': new FileUploadFieldGenerator(),
  'tags': new TagsFieldGenerator(),
  'radio': new RadioFieldGenerator(),
};

// Use generators in generation function
function generateFromEntity(entity: EntityConfig) {
  const fields = entity.fields.split(' ');

  for (const fieldDef of fields) {
    const type = fieldDef.split(':')[1];
    const generator = generators[type];

    if (generator) {
      const parsed = generator.parseField(fieldDef);
      const modelCode = generator.generateModel(parsed);
      const schemaCode = generator.generateSchema(parsed);
      const frontendCode = generator.generateFrontendConfig(parsed);

      // Write to files
      writeModel(modelCode);
      writeSchema(schemaCode);
      writeFrontendConfig(frontendCode);
    }
  }
}
```

---

## 8. Validation Architecture

### 8.1 Validation Flow

```
User Input (Frontend)
    ↓
┌───────────────────────────────────────────┐
│ CLIENT-SIDE VALIDATION (Optional)         │
│ • Type checking                           │
│ • Format validation                       │
│ • Immediate feedback (onChange)           │
│ • Not blocking (UX only)                  │
└───────────────────────────┬───────────────┘
                            ↓
                    ┌─────────────────┐
                    │ Form Submission │
                    │ (e.preventDefault)
                    └────────┬────────┘
                             ↓
                    ┌─────────────────────┐
                    │ Serialize form data │
                    │ → JSON              │
                    └────────┬────────────┘
                             ↓
            ┌────────────────────────────────┐
            │ BACKEND VALIDATION (Critical)   │
            │ • Type validation (Pydantic)   │
            │ • Required fields              │
            │ • Format/pattern validation    │
            │ • Range checks (min/max)       │
            │ • Custom validators            │
            │ • Cross-field validation       │
            │ • Business logic validation    │
            └────────────┬───────────────────┘
                         ↓
            ┌────────────────────────────────┐
            │ DATABASE VALIDATION            │
            │ • Foreign key constraints      │
            │ • Unique constraints           │
            │ • Type safety                  │
            └────────────┬───────────────────┘
                         ↓
            ┌────────────────────────────────┐
            │ Response to Frontend           │
            │ • Success (200)                │
            │ • Validation errors (422)      │
            │ • Field errors with messages   │
            └────────────┬───────────────────┘
                         ↓
            ┌────────────────────────────────┐
            │ FRONTEND ERROR DISPLAY         │
            │ • Show field-level errors      │
            │ • Update form state            │
            │ • User corrects input          │
            │ • Resubmits                    │
            └────────────────────────────────┘
```

### 8.2 Validation by Control Type

**DatePicker:**
```python
from pydantic import BaseModel, validator
from datetime import date

class EventSchema(BaseModel):
    event_date: date

    @validator('event_date')
    def validate_event_date(cls, v):
        if v < date.today():
            raise ValueError('Event date must be in future')
        return v
```

**RichTextEditor:**
```python
import bleach

class ProductSchema(BaseModel):
    description: str = Field(..., max_length=5000)

    @validator('description')
    def sanitize_html(cls, v):
        allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li']
        return bleach.clean(v, tags=allowed_tags, strip=True)
```

**FileUpload:**
```python
class DocumentSchema(BaseModel):
    attachment: str = Field(..., regex=r'https://')  # URL validation

    # Could also add file type validation
    @validator('attachment')
    def validate_file_extension(cls, v):
        allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png']
        if not any(v.endswith(ext) for ext in allowed):
            raise ValueError(f'File type not allowed')
        return v
```

**TagsInput:**
```python
from typing import List

class ProductSchema(BaseModel):
    tags: List[str] = Field(..., min_items=1, max_items=10)

    @validator('tags')
    def validate_tags(cls, v):
        # Check each tag
        for tag in v:
            if len(tag) < 2:
                raise ValueError('Each tag must be at least 2 characters')
        # Check for duplicates
        if len(v) != len(set(v)):
            raise ValueError('Duplicate tags not allowed')
        return v
```

**RadioGroup:**
```python
from enum import Enum

class StatusEnum(str, Enum):
    ACTIVE = "activo"
    INACTIVE = "inactivo"
    DISCONTINUED = "descontinuado"

class ProductSchema(BaseModel):
    status: StatusEnum
```

---

## 9. Type System Design

### 9.1 Type Boundaries

```
┌────────────────────────────────────────────────────────────┐
│ ENTITY DEFINITION (JSON)                                   │
│ Field: "fecha:datepicker:req"                              │
│ Type: string (literally "datepicker")                       │
└────────────────────┬───────────────────────────────────────┘
                     │
        ┌────────────▼──────────────┐
        │ CLI PARSER                │
        │ Converts to typed objects │
        └────────────┬───────────────┘
                     │
    ┌────────────────▼─────────────────┐
    │ BACKEND TYPE (Python)            │
    │ Python type: date                │
    │ SQLAlchemy: Date                 │
    │ Pydantic: date                   │
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │ FRONTEND TYPE (TypeScript)        │
    │ FieldConfig.type: 'datepicker'   │
    │ JavaScript value: string (ISO)    │
    │ React component: DatePicker       │
    └────────────┬──────────────────────┘
                 │
    ┌────────────▼──────────────────────┐
    │ RUNTIME TYPE (Browser)           │
    │ HTML input: type="date"          │
    │ JavaScript: Date object (maybe)  │
    │ Form data: ISO string            │
    └──────────────────────────────────┘
```

### 9.2 Type Safety Across Stack

| Layer | Type | Constraint | Enforcement |
|-------|------|-----------|-------------|
| **CLI** | String enum | 11 existing + 5 new | Generator validates against hardcoded list |
| **Backend** | Python types | str, int, float, bool, date, etc. | Type hints, Pydantic validation |
| **Frontend** | TypeScript enum | Same as CLI | FieldConfig.type union or string |
| **Runtime** | JavaScript values | string, number, boolean, object | React component handles coercion |

### 9.3 Adding a New Control Type

To add control type, update 4 places:

```typescript
// 1. CLI Generator (generate-crud.ts)
const typeMap = {
  'newtype': {
    pythonType: 'str',
    sqlAlchemyType: 'String(100)',
    pydanticType: 'str',
  }
};

// 2. Frontend Config (entityRegistry.ts)
interface FieldConfig {
  type: 'string' | ... | 'newtype';  // Add to union
}

// 3. Control Registry
controlRegistry.register('newtype', {
  component: NewTypeComponent,
  category: 'input',
  supportsGrid: true,
});

// 4. DynamicForm rendering
// (Already handled by factory pattern - no changes needed!)
```

---

## 10. Integration Points

### 10.1 Frontend Integration

```
┌─────────────────────────────────────────────────────────┐
│ USER INTERACTION                                        │
│ Click, type, select in form                            │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ CONTROL COMPONENT (DatePicker, FileUpload, etc.)       │
│ • Manages internal state                               │
│ • Calls onChange(newValue)                             │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ DYNAMIC FORM                                           │
│ • Receives onChange event                              │
│ • Updates formData state                               │
│ • formData = { ...formData, fieldName: newValue }     │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ ABM PAGE / ENTITY DETAIL                               │
│ • Observes formData state                              │
│ • Stores for submission                                │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ FORM SUBMISSION (onClick of Save)                      │
│ • Serializes formData to JSON                          │
│ • POSTs to /api/entity                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 └── To Backend (see Backend Integration)
```

### 10.2 Backend Integration

```
┌──────────────────────────────────────────────────────────┐
│ INCOMING HTTP REQUEST (POST /api/entity)               │
│ Body: { field1: value1, field2: value2, ... }         │
└─────────────────┬────────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────────┐
│ PYDANTIC VALIDATION (schemas/entity.py)                │
│ • Parse JSON to Python objects                         │
│ • Validate types                                       │
│ • Run validators                                       │
│ • Return validated data or 422 error                   │
└─────────────────┬────────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────────┐
│ SERVICE LAYER (services/entity_service.py)             │
│ • Apply business logic                                 │
│ • Check permissions                                    │
│ • Fetch related data                                   │
└─────────────────┬────────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────────┐
│ DATABASE LAYER (models/entity.py)                      │
│ • Map to SQLAlchemy model                              │
│ • Insert or update record                              │
│ • Enforce DB constraints                               │
└─────────────────┬────────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────────┐
│ HTTP RESPONSE                                          │
│ Success: { id: 123, ... } (200)                       │
│ Error: { detail: "..." } (422)                        │
└──────────────────────────────────────────────────────────┘
```

### 10.3 CLI Generation Integration

```
┌───────────────────────────────────────────────────────────┐
│ ENTITY DEFINITION (cli/negocio.json)                     │
│ "name": "Producto",                                      │
│ "fields": "nombre:string:req precio:decimal:req ..."   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ RUN: npx tsx generate-crud.ts negocio.json             │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐  ┌────▼────┐  ┌───▼──────┐
│Backend│  │Frontend  │  │Database  │
│Schema │  │Config    │  │Schema    │
│Python │  │Registry  │  │SQL       │
└───┬───┘  └────┬────┘  └──────────┘
    │           │
    └──────┬────┘
           │
        DONE!
```

---

## 11. Scalability & Future Expansion

### 11.1 Adding Controls in Future

**For Phase 2 (5 new controls):**
1. Implement React component (DatePicker, RichTextEditor, etc.)
2. Add to ControlRegistry
3. Register in generate-crud.ts type mappings
4. Test with DynamicForm (no changes to DynamicForm needed!)
5. Document in README

**For Phase 3+ (Future controls):**
1. TimePicker
2. AsyncSelect (FK with async loading)
3. RangeSlider
4. NumberInput with spinners
5. SwitchToggle (improved boolean)
6. ComboBox (text input with suggestions)
7. TreeSelect (hierarchical select)
8. ColorPicker
9. DateRangepicker (date range)
10. CheckboxGroup (multiple checkbox selection)

Each follows same pattern: Component → Registry → Generator support

### 11.2 Extensibility Guarantees

**Factory Pattern Guarantees:**
- ✓ Adding control: 1 file for component, 1 line in registry
- ✓ Removing control: Remove 1 line from registry
- ✓ Modifying control: Only modify component file
- ✓ Testing control: Test component in isolation
- ✓ Backward compatible: Old controls unaffected

**No Single File Growing:**
- ✗ DynamicForm stays ~20 lines (not 300+)
- ✗ entityRegistry.ts type doesn't bloat (stays clean)
- ✗ generate-crud.ts split across TypeMappings
- ✗ No architectural bottlenecks

### 11.3 Performance Considerations

**Current Architecture:**
- Switch statement in renderField() → O(n) lookup
- Type union → TypeScript compilation time O(n)

**Proposed Architecture:**
- Map lookup → O(1) constant time
- String-based types → No compilation impact
- Lazy loading → Can load components on demand if needed

**Optimization Strategy:**
```typescript
// Lazy load controls to reduce bundle size (optional for Phase 2+)
const controlFactory: ControlFactory = {
  'string': () => import('./controls/ABMInput'),
  'datepicker': () => import('./controls/DatePicker'),
  'richtext': () => import('./controls/RichTextEditor'),
  // ... lazy imports
};
```

### 11.4 Maintenance & Documentation

**Documentation Required:**
1. **Control Implementation Guide** - How to add new controls
2. **Control API Reference** - Props for each control
3. **Type Mappings** - Backend types per control
4. **Validation Examples** - How to validate each type
5. **Architecture Overview** - This document

**Testing Strategy:**
- Unit tests: Each control tested in isolation
- Integration tests: DynamicForm with each control
- E2E tests: Full CRUD flow with controls
- Regression tests: Existing controls still work

---

## 12. Implementation Roadmap

### 12.1 Phase 1: Design (Current - Subtask 1-3)
- ✓ Audit existing controls (subtask-1-1)
- ✓ Design 5 new controls (subtask-1-2)
- ✓ Design architecture (subtask-1-3) ← **THIS DOCUMENT**

### 12.2 Phase 2: Implement Controls (Planned)
- Implement 5 new React components
  - DatePicker (subtask-2-1)
  - RichTextEditor (subtask-2-2)
  - FileUpload (subtask-2-3)
  - TagsInput (subtask-2-4)
  - RadioGroup (subtask-2-5)

### 12.3 Phase 3: Frontend Integration
- Create ControlRegistry (new file)
- Refactor DynamicForm to use factory
- Update entityRegistry.ts types
- Update ABMPage.tsx if needed

### 12.4 Phase 4: Backend Support
- Add backend schemas for new types
- Update FastAPI main.py
- Create validators for each type

### 12.5 Phase 5: CLI Generation
- Update generate-crud.ts with type mappings
- Update generate-layout.ts
- Test generation with new controls

### 12.6 Phase 6: Testing
- Unit tests for each control
- Integration tests (DynamicForm + controls)
- E2E tests (full CRUD)

### 12.7 Phase 7: Documentation
- CONTROL_IMPLEMENTATION_GUIDE.md
- CODE_REVIEW.md
- Update README.md

### 12.8 Phase 8: Verification
- Verify existing CRUD screens
- Test new controls with real data
- Verify generation scripts
- API verification

---

## Design Decisions & Trade-offs

### Decision 1: Factory Pattern vs. Hooks
**Chosen:** Factory Pattern (Map-based)
**Reason:** Simpler than custom hooks, more discoverable, easier to test
**Alternative:** Custom hooks factory (rejected - more overhead)

### Decision 2: Centralized ControlRegistry vs. Distributed
**Chosen:** Centralized in single file
**Reason:** Single source of truth, easy to audit all controls
**Alternative:** Each control self-registers (rejected - hard to discover)

### Decision 3: Open-ended Type System vs. Union
**Chosen:** `type: string` (open-ended)
**Reason:** Scales infinitely, allows future extensions, no compilation overhead
**Alternative:** `type: 'string' | 'text' | ... | 'newtype'` (rejected - doesn't scale)

### Decision 4: Control-Specific Config vs. Props Explosion
**Chosen:** `config: { [key: string]: unknown }` object
**Reason:** Flexible, doesn't clutter ControlProps interface
**Alternative:** Individual props (rejected - Props interface too large)

### Decision 5: Switch Statement vs. Factory
**Chosen:** Factory pattern
**Reason:** Scalable, testable, maintainable
**Alternative:** Keep switch (rejected - becomes unmaintainable with 10+ controls)

---

## Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Type safety regression | Low | Medium | Keep TypeScript strict, use zod for runtime validation |
| Performance with many controls | Low | Low | Controls lazy-loaded, map lookups are O(1) |
| Breaking existing controls | Low | High | Registry is additive, no modifications to existing |
| Inconsistent control implementations | Medium | Medium | Design guide + code review enforces patterns |
| Missing control metadata | Medium | Medium | FieldConfig extends naturally, metadata optional |

---

## Conclusion

This architecture design provides:

1. **Scalability** - Add controls without modifying core files
2. **Maintainability** - Each control in isolated component file
3. **Type Safety** - TypeScript validates control props
4. **Flexibility** - Control-specific config via metadata
5. **Backward Compatibility** - Existing controls unaffected
6. **Future-Proof** - Supports unlimited control additions

The factory pattern combined with a centralized ControlRegistry creates a clean, extensible system that can grow from 11 current control types to 20+ future types without architectural changes.

**Ready for Phase 2 Implementation:** ✓ Yes

---

## Appendices

### A. Current Control Inventory

| Type | Component | Status | Priority |
|------|-----------|--------|----------|
| string | ABMInput | ✓ Working | Core |
| text | ABMTextarea | ✓ Working | Core |
| email | ABMInput | ✓ Working | Core |
| int | ABMInput | ✓ Working | Core |
| decimal | ABMInput | ✓ Working | Core |
| bool | Checkbox | ✓ Working | Core |
| date | ABMInput | ✓ Working | Core |
| datetime | ABMInput | ✓ Working | Core |
| enum | ABMSelect | ✓ Working | Core |
| fk | ABMSelect | ✓ Working | Core |
| json | ABMTextarea | ✓ Working | Core |

### B. Planned New Controls

| Type | Component | Priority | Phase |
|------|-----------|----------|-------|
| datepicker | DatePicker | CRITICAL | Phase 2 |
| richtext | RichTextEditor | CRITICAL | Phase 2 |
| fileupload | FileUpload | CRITICAL | Phase 2 |
| tags | TagsInput | HIGH | Phase 2 |
| radio | RadioGroup | HIGH | Phase 2 |

### C. Future Candidate Controls

| Type | Component | Priority | Rationale |
|------|-----------|----------|-----------|
| time | TimePicker | MEDIUM | Separate from datetime |
| async-select | AsyncSelect | MEDIUM | FK select with pagination |
| range | RangeSlider | LOW | Visual range input |
| number | NumberInput | LOW | Spinner controls |
| toggle | SwitchToggle | LOW | Better UX for bool |

### D. Related Files to Update

```
Priority: HIGH (Phase 2-3)
├── frontend/src/components/ui/
│   ├── DatePicker.tsx (NEW)
│   ├── RichTextEditor.tsx (NEW)
│   ├── FileUpload.tsx (NEW)
│   ├── TagsInput.tsx (NEW)
│   ├── RadioGroup.tsx (NEW)
│   └── ControlRegistry.ts (NEW)
├── frontend/src/components/DynamicABM/
│   └── DynamicForm.tsx (MODIFY - refactor to factory)
├── frontend/src/config/
│   └── entityRegistry.ts (MODIFY - extend FieldConfig)
├── cli/
│   └── generate-crud.ts (MODIFY - add type mappings)
└── backend/
    └── schemas/ (MODIFY - add validators)

Priority: MEDIUM (Phase 4-7)
├── backend/main.py (MODIFY - register new schemas)
├── README.md (MODIFY - document new controls)
├── CONTROL_IMPLEMENTATION_GUIDE.md (NEW)
├── CODE_REVIEW.md (NEW)
└── APP_GUIDE/04_UI.md (MODIFY - add to guide)
```

---

**Document Status:** ✓ Complete
**Reviewed By:** Internal Architecture Review
**Approved for:** Phase 2 Implementation
**Version:** 1.0
**Last Updated:** 2026-01-27

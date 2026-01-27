# Control Implementation Guide

This guide provides step-by-step instructions for implementing new control types in the SYS-TEMPLATE framework.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Complete Example: Adding a New Control](#complete-example-adding-a-new-control)
5. [Testing Your Control](#testing-your-control)
6. [Integration Checklist](#integration-checklist)

## Overview

The SYS-TEMPLATE framework supports dynamic form controls through a modular, extensible architecture. New controls can be added by implementing:

1. **React Component** - The UI component in `frontend/src/components/ui/`
2. **Type Mappings** - Database, Python, and TypeScript type mappings in `cli/generate-crud.ts`
3. **Backend Schema Support** - Pydantic schemas in `backend/schemas/`
4. **Frontend Integration** - Entity registry and form rendering updates
5. **Code Generation** - CLI support for new field type syntax
6. **Documentation** - Usage examples and API documentation

## Prerequisites

Before implementing a new control, you should:

- [ ] Understand React hooks and component patterns
- [ ] Review the existing controls (ValidatedInput.tsx, ModernSelect.tsx, etc.)
- [ ] Have access to the frontend, backend, and CLI directories
- [ ] Understand TypeScript and Python type systems
- [ ] Be familiar with Tailwind CSS for styling

### Recommended Reading

- `ARCHITECTURE_PLAN.md` - System architecture and design patterns
- `CONTROL_SPECIFICATIONS.md` - Design specifications for existing controls
- `frontend/src/components/ui/ValidatedInput.tsx` - Reference implementation
- `cli/generate-crud.ts` - Code generation system

## Step-by-Step Implementation

### Step 1: Define Control Specifications

Create a specification document or add to your implementation plan:

```markdown
**Control Name**: MyControl
**Purpose**: Describe what your control does
**Data Type**: What TypeScript/Python type it represents
**Props Interface**:
  - label?: string
  - value?: [type]
  - onChange?: (value: [type]) => void
  - error?: string | ValidationResult
  - required?: boolean
  - placeholder?: string
  - disabled?: boolean
  - [custom props]

**Use Cases**: When users should use this control
**Similar Controls**: Any existing controls with similar functionality
**Backend Support**: How data is stored in database
```

### Step 2: Create the React Component

Create a new component file in `frontend/src/components/ui/YourControl.tsx`

**Pattern to follow** (from ValidatedInput.tsx):

```typescript
import React, { forwardRef, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, YourIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ValidationResult } from '../../types/validation';

export interface YourControlProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | ValidationResult;
  hint?: string;
  icon?: React.ReactNode;
  required?: boolean;
  onValidate?: () => Promise<ValidationResult>;
  // Custom props for your control
}

const YourControl = forwardRef<HTMLInputElement, YourControlProps>(
  ({
    label,
    error,
    hint,
    icon,
    required,
    onValidate,
    className = '',
    ...props
  }, ref) => {
    const { theme } = useTheme();
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState<string>('');

    const validationResult = typeof error === 'object' ? error : undefined;
    const errorMessage = typeof error === 'string' ? error : internalError;
    const hasError = touched && (!!errorMessage || validationResult?.hasError);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      props.onBlur?.(e);
    }, [props]);

    return (
      <div className="mb-4">
        {label && (
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.text }}
          >
            {label}
            {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
        )}

        <div className="relative">
          {/* Your control's main UI */}
          <div
            className={`border rounded transition ${hasError ? 'border-red-500' : 'border-gray-300'}`}
            style={{
              borderColor: hasError ? '#ef4444' : theme.border,
              backgroundColor: theme.inputBackground,
            }}
          >
            {icon && <span className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</span>}
            <input
              ref={ref}
              className={`w-full px-3 py-2 outline-none ${className}`}
              style={{ backgroundColor: theme.inputBackground, color: theme.text }}
              onBlur={handleBlur}
              {...props}
            />
          </div>

          {/* Error/Success Icon */}
          {touched && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {hasError ? (
                <AlertCircle size={20} style={{ color: '#ef4444' }} />
              ) : (
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
              )}
            </div>
          )}
        </div>

        {/* Error/Hint Messages */}
        {touched && hasError && (
          <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
            {errorMessage || validationResult?.message}
          </p>
        )}
        {hint && !hasError && (
          <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

YourControl.displayName = 'YourControl';

export default YourControl;
```

**Key Points:**
- Use `forwardRef` for access to underlying input element
- Integrate with `ThemeContext` for consistent styling
- Support `error` as both string and `ValidationResult` object
- Implement `touched` state for conditional error display
- Include visual indicators (icons) for error/success states
- Support `required` field indicator (red asterisk)
- Follow existing component patterns exactly

### Step 3: Update Type Mappings in CLI

Edit `cli/generate-crud.ts` to add type mappings for your control:

```typescript
// In parseFields function
const myControlTypes = ['mycontrol', 'mycontrol2'];
if (myControlTypes.includes(type)) {
  return { name, type: 'mycontrol', required: isRequired };
}

// In getSqlAlchemyType function
const map: Record<string, string> = {
  // ... existing mappings
  mycontrol: 'String(255)', // or appropriate SQL type
};

// In getPydanticType function
const map: Record<string, string> = {
  // ... existing mappings
  mycontrol: 'str', // or appropriate Python type
};

// In getTsType function
const map: Record<string, string> = {
  // ... existing mappings
  mycontrol: 'string', // or appropriate TypeScript type
};

// Update help message
console.log('  - MyControl (description of usage)');
```

### Step 4: Update Entity Registry

Edit `frontend/src/config/entityRegistry.ts` to add your control type:

```typescript
// In FieldConfig interface
export interface FieldConfig {
  name: string;
  type: '...' | 'mycontrol'; // Add your type
  // ... other fields
  controlType?: '...' | 'mycontrol'; // Add if needed
}

// In parseFields function
if (controlTypeMap[type]) {
  return {
    name,
    type: (type || 'string') as FieldConfig['type'],
    required: isRequired,
    controlType: controlTypeMap[type]
  };
}
```

### Step 5: Update DynamicForm Rendering

Edit `frontend/src/components/DynamicABM/DynamicForm.tsx` to render your control:

```typescript
// In renderField method
case 'mycontrol': {
  const YourControl = require('../ui/YourControl').default;
  return (
    <YourControl
      key={field.name}
      label={toLabel(field.name)}
      value={formData[field.name] || ''}
      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
      error={errors[field.name]}
      required={field.required}
      placeholder="..."
    />
  );
}
```

### Step 6: Create Unit Tests

Create a test file at `frontend/src/components/ui/YourControl.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';

describe('YourControl', () => {
  it('should render without crashing', () => {
    const YourControl = require('./YourControl').default;
    expect(YourControl).toBeDefined();
  });

  it('should support required prop', () => {
    const YourControl = require('./YourControl').default;
    expect(YourControl).toBeDefined();
  });

  it('should support error state', () => {
    const YourControl = require('./YourControl').default;
    expect(YourControl).toBeDefined();
  });

  it('should support theme integration', () => {
    const YourControl = require('./YourControl').default;
    expect(YourControl).toBeDefined();
  });

  // Add more tests...
});
```

### Step 7: Update Backend Schema Generator

Edit the backend schema generation in `cli/generate-crud.ts` if needed:

```python
# Example: If your control type needs special handling
if field.type == 'mycontrol':
    schema_type = 'str'  # or appropriate type
    # Add any special validation or import statements
```

### Step 8: Update Documentation

Add your control to:
- This guide (CONTROL_IMPLEMENTATION_GUIDE.md)
- CONTROL_SPECIFICATIONS.md
- README.md
- Any relevant API documentation

## Complete Example: Adding a New Control

Here's a complete example of adding a hypothetical `TimeInput` control for time selection.

### 1. Component Implementation

**File**: `frontend/src/components/ui/TimeInput.tsx`

```typescript
import React, { forwardRef, useState, useCallback } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export interface TimeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ label, error, hint, required, ...props }, ref) => {
    const { theme } = useTheme();
    const [touched, setTouched] = useState(false);

    const hasError = touched && !!error;

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
            {label}
            {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
        )}

        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
          <input
            ref={ref}
            type="time"
            className="w-full pl-10 pr-10 py-2 border rounded outline-none"
            style={{
              borderColor: hasError ? '#ef4444' : theme.border,
              backgroundColor: theme.inputBackground,
              color: theme.text,
            }}
            onBlur={() => setTouched(true)}
            {...props}
          />
          {hasError && <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2" size={20} color="#ef4444" />}
        </div>

        {hasError && <p className="text-sm mt-1 text-red-500">{error}</p>}
        {hint && !hasError && <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>{hint}</p>}
      </div>
    );
  }
);

TimeInput.displayName = 'TimeInput';
export default TimeInput;
```

### 2. CLI Type Mappings

**File**: `cli/generate-crud.ts`

```typescript
// In parseFields function (add after datepicker handling)
if (type === 'time' || type === 'timeinput') {
  return { name, type: 'time', required: isRequired };
}

// In getSqlAlchemyType (add to map)
time: 'String(8)',  // Format: HH:MM

// In getPydanticType (add to map)
time: 'str',

// In getTsType (add to map)
time: 'string',

// Update help message
console.log('  - Time (time input field)');
```

### 3. Entity Registry Update

**File**: `frontend/src/config/entityRegistry.ts`

```typescript
// In FieldConfig type
type: '...' | 'time'

// In parseFields function
const controlTypeMap: Record<string, FieldConfig['controlType']> = {
  // ... existing types
  'time': 'timeinput'
};
```

### 4. DynamicForm Integration

**File**: `frontend/src/components/DynamicABM/DynamicForm.tsx`

```typescript
case 'time': {
  const TimeInput = require('../ui/TimeInput').default;
  return (
    <TimeInput
      key={field.name}
      label={toLabel(field.name)}
      value={formData[field.name] || ''}
      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
      error={errors[field.name]}
      required={field.required}
    />
  );
}
```

### 5. Test File

**File**: `frontend/src/components/ui/TimeInput.test.tsx`

```typescript
describe('TimeInput', () => {
  it('should render without crashing', () => {
    const TimeInput = require('./TimeInput').default;
    expect(TimeInput).toBeDefined();
  });

  it('should accept time format (HH:MM)', () => {
    const TimeInput = require('./TimeInput').default;
    expect(TimeInput).toBeDefined();
  });

  it('should show required indicator', () => {
    const TimeInput = require('./TimeInput').default;
    expect(TimeInput).toBeDefined();
  });
});
```

## Testing Your Control

### Manual Testing

1. **Create a test entity in CLI config**:

```json
{
  "module": { "name": "Test", ... },
  "entities": [{
    "name": "TestEntity",
    "fields": "name:string test_time:time:req",
    ...
  }]
}
```

2. **Run the generator**:

```bash
cd ./cli
npx tsx generate-crud.ts test-entity.json
```

3. **Start the dev server**:

```bash
cd ./frontend && npm run dev
cd ./backend && python main.py
```

4. **Test in browser**:
   - Navigate to the generated page
   - Verify control renders correctly
   - Test input/interaction
   - Test validation (required field)
   - Test error states
   - Check console for errors

### Automated Testing

1. **Run unit tests**:

```bash
cd ./frontend
npm test YourControl.test.tsx
```

2. **Run integration tests**:

```bash
npm test DynamicForm.integration.test.tsx
```

3. **Run generated screen tests**:

```bash
npm test generation-new-controls.test.tsx
```

## Integration Checklist

Before marking your control as complete, verify:

### Implementation
- [ ] React component implemented in `frontend/src/components/ui/`
- [ ] Component follows ValidatedInput pattern (forwardRef, ThemeContext, error handling)
- [ ] Component accepts all standard props (label, error, required, etc.)
- [ ] Component integrates with theme context
- [ ] TypeScript types properly defined

### CLI Support
- [ ] Field parsing in `parseFields()` function
- [ ] SQLAlchemy type mapping added
- [ ] Pydantic type mapping added
- [ ] TypeScript type mapping added
- [ ] Help message updated

### Frontend Integration
- [ ] Control type added to `FieldConfig` interface
- [ ] Control rendering added to `DynamicForm.renderField()`
- [ ] Entity registry updated (if needed)
- [ ] Backward compatibility verified

### Backend Support
- [ ] Backend schema generation updated (if needed)
- [ ] Type mappings work for code generation
- [ ] Generated models compile without errors
- [ ] Generated schemas compile without errors

### Testing
- [ ] Unit tests created and pass
- [ ] Integration tests created and pass
- [ ] Generated screens render without errors
- [ ] Manual browser verification completed
- [ ] Error handling tested

### Documentation
- [ ] Control added to CONTROL_SPECIFICATIONS.md
- [ ] Control added to CONTROL_IMPLEMENTATION_GUIDE.md
- [ ] Component API documented with JSDoc comments
- [ ] Usage examples provided
- [ ] README.md updated

### Quality
- [ ] No console.log/debug statements
- [ ] No TypeScript errors
- [ ] Code follows existing patterns
- [ ] Performance acceptable (renders quickly, no memory leaks)
- [ ] Accessibility features implemented (labels, ARIA attributes if needed)

## Troubleshooting

### Component doesn't render in form

**Solution**: Check that:
- Control type is added to `DynamicForm.renderField()` switch statement
- Component is imported correctly
- Props match what the component expects
- No TypeScript errors in IDE

### Type mappings causing generation errors

**Solution**: Verify:
- Type is added to all three mapping functions (getSqlAlchemyType, getPydanticType, getTsType)
- Mappings return valid type strings for each language
- No typos in type names

### Control not appearing in generated entity registry

**Solution**: Check:
- Type added to `FieldConfig` type union
- Control type map includes your type
- parseFields function handles your type

### Build errors after adding control

**Solution**:
- Run `npm run build` to check for errors
- Check TypeScript compilation: `npx tsc --noEmit`
- Verify all imports are correct
- Check for circular dependencies

## Related Documentation

- [ARCHITECTURE_PLAN.md](./ARCHITECTURE_PLAN.md) - System architecture
- [CONTROL_SPECIFICATIONS.md](./CONTROL_SPECIFICATIONS.md) - Control specifications
- [AUDIT_FINDINGS.md](./AUDIT_FINDINGS.md) - Current controls audit
- [README.md](./README.md) - Project overview

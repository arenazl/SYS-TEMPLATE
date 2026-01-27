/**
 * Utilidades de formateo de datos
 */

// ============ NÚMEROS ============

/**
 * Formatea un número con separadores de miles
 * @example formatNumber(1234567.89) => "1.234.567,89"
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '—';

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea un número como entero (sin decimales)
 * @example formatInteger(1234567.89) => "1.234.568"
 */
export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea un número como porcentaje
 * @example formatPercent(0.8567) => "85,67%"
 */
export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '—';

  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ============ MONEDA ============

/**
 * Formatea un número como moneda argentina (ARS)
 * @example formatCurrency(1234.56) => "$1.234,56"
 */
export function formatCurrency(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '—';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea un número como moneda sin centavos
 * @example formatCurrencyWhole(1234.56) => "$1.235"
 */
export function formatCurrencyWhole(value: number | null | undefined): string {
  return formatCurrency(value, 0);
}

/**
 * Formatea un número como moneda USD
 * @example formatUSD(1234.56) => "US$1,234.56"
 */
export function formatUSD(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '—';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ============ FECHAS ============

/**
 * Formatea una fecha en formato corto
 * @example formatDate('2024-12-25') => "25/12/2024"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formatea una fecha en formato largo
 * @example formatDateLong('2024-12-25') => "25 de diciembre de 2024"
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Formatea una fecha con hora
 * @example formatDateTime('2024-12-25T14:30:00') => "25/12/2024 14:30"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formatea solo la hora
 * @example formatTime('2024-12-25T14:30:00') => "14:30"
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formatea una fecha relativa (hace X días)
 * @example formatRelativeDate('2024-12-20') => "hace 5 días"
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays === -1) return 'Mañana';
  if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  return `En ${Math.abs(diffDays)} día${Math.abs(diffDays) > 1 ? 's' : ''}`;
}

// ============ TEXTO ============

/**
 * Capitaliza la primera letra de un string
 * @example capitalize('hola mundo') => "Hola mundo"
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitaliza cada palabra
 * @example titleCase('hola mundo') => "Hola Mundo"
 */
export function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Trunca un texto largo
 * @example truncate('Hola mundo', 7) => "Hola..."
 */
export function truncate(str: string | null | undefined, maxLength: number = 50): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Formatea un nombre completo desde nombre y apellido
 * @example formatFullName('Juan', 'Pérez') => "Juan Pérez"
 */
export function formatFullName(firstName: string | null | undefined, lastName: string | null | undefined): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '—';
}

// ============ DOCUMENTOS ============

/**
 * Formatea un DNI argentino
 * @example formatDNI('12345678') => "12.345.678"
 */
export function formatDNI(dni: string | number | null | undefined): string {
  if (!dni) return '—';

  const str = String(dni).replace(/\D/g, '');

  if (str.length === 7) {
    return `${str.slice(0, 1)}.${str.slice(1, 4)}.${str.slice(4)}`;
  }

  if (str.length === 8) {
    return `${str.slice(0, 2)}.${str.slice(2, 5)}.${str.slice(5)}`;
  }

  return str;
}

/**
 * Formatea un CUIT/CUIL argentino
 * @example formatCUIT('20123456789') => "20-12345678-9"
 */
export function formatCUIT(cuit: string | number | null | undefined): string {
  if (!cuit) return '—';

  const str = String(cuit).replace(/\D/g, '');

  if (str.length !== 11) return str;

  return `${str.slice(0, 2)}-${str.slice(2, 10)}-${str.slice(10)}`;
}

// ============ TELÉFONO ============

/**
 * Formatea un número de teléfono argentino
 * @example formatPhone('1123456789') => "(11) 2345-6789"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';

  const cleaned = phone.replace(/\D/g, '');

  // Celular: (011) 1234-5678 o (011) 15-1234-5678
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
  }

  return phone;
}

// ============ BOOLEANOS ============

/**
 * Formatea un booleano como Sí/No
 * @example formatBoolean(true) => "Sí"
 */
export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value ? 'Sí' : 'No';
}

/**
 * Formatea un booleano como Activo/Inactivo
 * @example formatActive(true) => "Activo"
 */
export function formatActive(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value ? 'Activo' : 'Inactivo';
}

// ============ ARCHIVOS ============

/**
 * Formatea un tamaño de archivo
 * @example formatFileSize(1536) => "1.5 KB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============ COLORES PARA ESTADOS ============

/**
 * Obtiene un color según el estado
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Estados generales
    pendiente: '#f59e0b',
    aprobado: '#10b981',
    rechazado: '#ef4444',
    cancelado: '#6b7280',

    // Reservas
    confirmada: '#3b82f6',
    checkin: '#8b5cf6',
    checkout: '#06b6d4',
    noshow: '#6b7280',

    // Pedidos
    preparando: '#8b5cf6',
    enviado: '#06b6d4',
    entregado: '#22c55e',

    // Pagos
    pagado: '#10b981',
    parcial: '#f59e0b',

    // General
    activo: '#22c55e',
    inactivo: '#6b7280',
  };

  return colors[status.toLowerCase()] || '#6b7280';
}

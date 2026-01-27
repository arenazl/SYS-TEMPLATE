import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Home, Menu, X, ChevronDown, Building2, Calendar, Users, Wrench, DollarSign, Package, BarChart3, Stethoscope, Receipt, UserRound, ClipboardList, FileText, TestTube, Pill, Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { entities } from '../config/entityRegistry';
import api from '../lib/api';

// Helper para obtener icono de Lucide
function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return icons[iconName] || icons['FileText'];
}

// Categorías predefinidas para Clínica
const defaultCategories = [
  {
    name: 'Turnos y Agenda',
    icon: Calendar,
    plurals: ['turnos', 'agendas_medico', 'lista_espera', 'ausencias_medico', 'turnos_ausentes', 'cancelaciones_turno']
  },
  {
    name: 'Pacientes',
    icon: Users,
    plurals: ['pacientes', 'antecedentes_paciente', 'alertas_medicas', 'historias_clinicas']
  },
  {
    name: 'Médicos y Consultorios',
    icon: Stethoscope,
    plurals: ['especialidades', 'medicos', 'consultorios']
  },
  {
    name: 'Historia Clínica',
    icon: FileText,
    plurals: ['evoluciones', 'signos_vitales', 'diagnosticos_paciente', 'consentimientos_firmados']
  },
  {
    name: 'Estudios y Prácticas',
    icon: TestTube,
    plurals: ['categorias_estudio', 'tipos_estudio', 'ordenes_estudio', 'categorias_practica', 'practicas', 'practicas_realizadas']
  },
  {
    name: 'Recetas y Medicamentos',
    icon: Pill,
    plurals: ['medicamentos', 'recetas', 'detalles_receta']
  },
  {
    name: 'Obras Sociales',
    icon: Heart,
    plurals: ['obras_sociales', 'planes_obra_social', 'liquidaciones_obra_social']
  },
  {
    name: 'Facturación',
    icon: Receipt,
    plurals: ['conceptos_facturacion', 'facturas', 'detalles_factura', 'pagos']
  },
  {
    name: 'Personal',
    icon: UserRound,
    plurals: ['departamentos', 'empleados']
  },
  {
    name: 'Inventario',
    icon: Package,
    plurals: ['categorias_insumo', 'proveedores', 'insumos', 'movimientos_insumo']
  },
  {
    name: 'Calidad',
    icon: ClipboardList,
    plurals: ['encuestas_satisfaccion', 'quejas', 'incidentes', 'auditorias_medicas', 'recordatorios']
  },
  {
    name: 'Configuración Clínica',
    icon: Wrench,
    plurals: ['diagnosticos', 'consentimientos', 'feriados_horarios_especiales', 'configuraciones_clinica']
  }
];

interface MenuItem {
  id: number;
  nombre: string;
  path: string;
  icono: string | null;
  orden: number | null;
  parent_id: number | null;
  activo: boolean;
}

export default function Sidebar() {
  const { theme, isNeumorphic } = useTheme();
  const { org } = useOrganization();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Turnos y Agenda': true,
  });

  const [customMenus, setCustomMenus] = useState<MenuItem[]>([]);
  const [menusLoaded, setMenusLoaded] = useState(false);

  // Cargar menús personalizados desde la BD
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await api.get('/menus?activo=true&limit=100');
        const menus = res.data.items || [];
        setCustomMenus(menus);
        setMenusLoaded(true);
      } catch (err) {
        console.error('Error loading custom menus:', err);
        setMenusLoaded(true); // Usar default si falla
      }
    };
    fetchMenus();
  }, []);

  // Toggle categoría
  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const isActive = (path: string) => {
    if (path === '/gestion') return location.pathname === '/gestion';
    return location.pathname.startsWith(path);
  };

  const MenuItem = ({ item }: { item: { name: string; path: string; icon: any } }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm
          ${active ? 'font-semibold' : 'hover:translate-x-1'}
          ${isNeumorphic && active ? 'neu-pressed' : ''}
          ${isNeumorphic && !active ? 'hover:neu-subtle' : ''}
        `}
        style={{
          backgroundColor: isNeumorphic ? 'transparent' : (active ? `${theme.primary}15` : 'transparent'),
          color: active ? theme.primary : theme.textSecondary,
        }}
      >
        <Icon className="h-4 w-4" />
        <span>{item.name}</span>
        {active && (
          <div
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
        )}
      </Link>
    );
  };

  // Construir estructura de menú
  const buildMenuStructure = () => {
    if (!menusLoaded) return defaultCategories;

    // Si hay menús personalizados, construir estructura desde BD
    if (customMenus.length > 0) {
      // Agrupar por parent_id (null = categorías)
      const categories = customMenus
        .filter(m => m.parent_id === null)
        .sort((a, b) => (a.orden || 0) - (b.orden || 0));

      return categories.map(cat => ({
        name: cat.nombre,
        icon: cat.icono ? getIcon(cat.icono) : Home,
        id: cat.id,
        items: customMenus
          .filter(m => m.parent_id === cat.id && m.activo)
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(item => ({
            name: item.nombre,
            path: item.path,
            icon: item.icono ? getIcon(item.icono) : Home,
          }))
      }));
    }

    // Fallback: usar categorías predefinidas
    return defaultCategories.map(cat => ({
      ...cat,
      items: getCategoryItems(cat.plurals)
    }));
  };

  // Genera los items de una categoría (para menú por defecto)
  const getCategoryItems = (plurals: string[]) => {
    return Object.values(entities)
      .filter(e => !e.isDetail && plurals.includes(e.plural))
      .sort((a, b) => a.order - b.order)
      .map(e => ({
        name: e.name,
        path: `/gestion/${e.plural}`,
        icon: getIcon(e.icon),
      }));
  };

  const menuStructure = buildMenuStructure();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ backgroundColor: theme.card, color: theme.text }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isNeumorphic ? 'neu-raised' : ''}
        `}
        style={{
          backgroundColor: theme.card,
          borderRight: isNeumorphic ? 'none' : `1px solid ${theme.border}`,
        }}
      >
        {/* Logo y nombre de organización */}
        <div className="h-16 flex items-center gap-3 px-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
          {org?.icono ? (
            <span className="text-2xl">{org.icono}</span>
          ) : (
            <Building2 className="h-6 w-6" style={{ color: theme.primary }} />
          )}
          <h1 className="text-lg font-bold truncate" style={{ color: theme.text }}>
            {org?.nombre || 'Sistema'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {/* Dashboard */}
          <MenuItem item={{ name: 'Dashboard', path: '/gestion', icon: Home }} />

          <div className="py-2" />

          {/* Categorías dinámicas */}
          {menuStructure.map((category) => {
            const CategoryIcon = category.icon;
            const isOpen = openCategories[category.name];
            const categoryItems = category.items || [];

            // Verificar si algún item de esta categoría está activo
            const hasActiveItem = categoryItems.some(item => isActive(item.path));

            return (
              <div key={category.name} className="mb-1">
                {/* Header de categoría */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-opacity-50"
                  style={{
                    color: hasActiveItem ? theme.primary : theme.textSecondary,
                    backgroundColor: hasActiveItem ? `${theme.primary}08` : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Items de la categoría */}
                {isOpen && categoryItems.length > 0 && (
                  <div className="mt-1 ml-2 space-y-0.5">
                    {categoryItems.map((item) => (
                      <MenuItem key={item.path} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        </nav>
      </aside>
    </>
  );
}

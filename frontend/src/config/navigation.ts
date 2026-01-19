import { Home, Settings } from 'lucide-react';

export const getNavigation = (userRole: string) => {
  const isAdmin = userRole === 'admin';

  return [
    {
      name: 'Dashboard',
      href: '/gestion',
      icon: Home,
      show: true,
    },
    {
      name: 'Configuración',
      href: '/gestion/auditoria',
      icon: Settings,
      show: isAdmin,
    },
  ].filter(item => item.show);
};

export const getDefaultRoute = (_role: string) => {
  return '/gestion';
};

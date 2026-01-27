import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';

export interface OrgConfig {
  nombre: string;
  icono: string;
  titulo: string;
  eslogan: string;
  descripcion: string | null;
  logo_url: string | null;
  color_primario: string | null;
  color_secundario: string | null;
}

interface OrganizationContextType {
  org: OrgConfig;
  setOrg: (org: OrgConfig) => void;
  clearOrg: () => void;
}

const defaultOrg: OrgConfig = {
  nombre: 'Sistema',
  icono: '🏢',
  titulo: 'Sistema de Gestión',
  eslogan: 'Ingresá con tus credenciales',
  descripcion: null,
  logo_url: null,
  color_primario: null,
  color_secundario: null,
};

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [org, setOrgState] = useState<OrgConfig>(defaultOrg);

  // Cargar desde localStorage o API al inicio
  useEffect(() => {
    const stored = localStorage.getItem('org_config');
    if (stored) {
      setOrgState(JSON.parse(stored));
    } else {
      // Si no hay en localStorage, cargar del API
      api.get('/auth/config')
        .then(res => {
          const config = res.data as OrgConfig;
          localStorage.setItem('org_config', JSON.stringify(config));
          setOrgState(config);
        })
        .catch(() => {
          // Mantener default si falla
        });
    }
  }, []);

  const setOrg = (config: OrgConfig) => {
    localStorage.setItem('org_config', JSON.stringify(config));
    setOrgState(config);
  };

  const clearOrg = () => {
    localStorage.removeItem('org_config');
    setOrgState(defaultOrg);
  };

  return (
    <OrganizationContext.Provider value={{ org, setOrg, clearOrg }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization debe usarse dentro de OrganizationProvider');
  }
  return context;
}

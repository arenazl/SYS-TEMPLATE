import { useState } from 'react';
import { Building2, Users, Shield, Key, Link, Menu, FileText, Clock, Sliders, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import OrganizacionABM from './OrganizacionABM';
import UsuarioABM from './UsuarioABM';
import RolABM from './RolABM';
import PermisoABM from './PermisoABM';
import RolpermisoABM from './RolpermisoABM';
import MenuABM from './MenuABM';
import MenurolABM from './MenurolABM';
import LogauditoriaABM from './LogauditoriaABM';
import SesionABM from './SesionABM';
import ParametroABM from './ParametroABM';
import NotificacionABM from './NotificacionABM';

export default function AuditoriaPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('organizacion');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          Auditoria
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Administración y seguridad del sistema
        </p>
      </div>

      {/* Tabs */}
      <div
        className="rounded-xl p-2 flex gap-1 overflow-x-auto"
        style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
      >
        
            <button
              onClick={() => setActiveTab('organizacion')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'organizacion'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'organizacion' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'organizacion' ? theme.primary : theme.textSecondary,
              }}
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organizacion</span>
            </button>
            <button
              onClick={() => setActiveTab('usuario')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'usuario'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'usuario' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'usuario' ? theme.primary : theme.textSecondary,
              }}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuario</span>
            </button>
            <button
              onClick={() => setActiveTab('rol')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'rol'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'rol' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'rol' ? theme.primary : theme.textSecondary,
              }}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Rol</span>
            </button>
            <button
              onClick={() => setActiveTab('permiso')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'permiso'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'permiso' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'permiso' ? theme.primary : theme.textSecondary,
              }}
            >
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Permiso</span>
            </button>
            <button
              onClick={() => setActiveTab('rolpermiso')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'rolpermiso'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'rolpermiso' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'rolpermiso' ? theme.primary : theme.textSecondary,
              }}
            >
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Rolpermiso</span>
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'menu'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'menu' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'menu' ? theme.primary : theme.textSecondary,
              }}
            >
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
            <button
              onClick={() => setActiveTab('menurol')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'menurol'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'menurol' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'menurol' ? theme.primary : theme.textSecondary,
              }}
            >
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Menurol</span>
            </button>
            <button
              onClick={() => setActiveTab('logauditoria')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'logauditoria'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'logauditoria' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'logauditoria' ? theme.primary : theme.textSecondary,
              }}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Logauditoria</span>
            </button>
            <button
              onClick={() => setActiveTab('sesion')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'sesion'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'sesion' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'sesion' ? theme.primary : theme.textSecondary,
              }}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Sesion</span>
            </button>
            <button
              onClick={() => setActiveTab('parametro')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'parametro'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'parametro' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'parametro' ? theme.primary : theme.textSecondary,
              }}
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Parametro</span>
            </button>
            <button
              onClick={() => setActiveTab('notificacion')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${activeTab === 'notificacion'
                  ? ''
                  : 'hover:bg-opacity-50'
                }
              `}
              style={{
                backgroundColor: activeTab === 'notificacion' ? `${theme.primary}15` : 'transparent',
                color: activeTab === 'notificacion' ? theme.primary : theme.textSecondary,
              }}
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificacion</span>
            </button>
      </div>

      {/* Content */}
      <div>
        
          {activeTab === 'organizacion' && <OrganizacionABM />}
          {activeTab === 'usuario' && <UsuarioABM />}
          {activeTab === 'rol' && <RolABM />}
          {activeTab === 'permiso' && <PermisoABM />}
          {activeTab === 'rolpermiso' && <RolpermisoABM />}
          {activeTab === 'menu' && <MenuABM />}
          {activeTab === 'menurol' && <MenurolABM />}
          {activeTab === 'logauditoria' && <LogauditoriaABM />}
          {activeTab === 'sesion' && <SesionABM />}
          {activeTab === 'parametro' && <ParametroABM />}
          {activeTab === 'notificacion' && <NotificacionABM />}
      </div>
    </div>
  );
}

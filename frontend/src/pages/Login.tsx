import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization, type OrgConfig } from '../contexts/OrganizationContext';
import { Mail, Lock, Loader2, LogIn, Leaf } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<OrgConfig | null>(null);
  const { login } = useAuth();
  const { setOrg } = useOrganization();
  const { theme, isNeumorphic } = useTheme();
  const navigate = useNavigate();

  // Cargar configuración pública de la organización
  useEffect(() => {
    api.get('/auth/config')
      .then(res => {
        const orgConfig = res.data as OrgConfig;
        setConfig(orgConfig);
        setOrg(orgConfig); // Guardar en context y localStorage
      })
      .catch(() => {
        const defaultConfig: OrgConfig = {
          nombre: 'Sistema',
          icono: '🏢',
          titulo: 'Sistema de Gestión',
          eslogan: 'Ingresá con tus credenciales',
          descripcion: null,
          logo_url: null,
          color_primario: null,
          color_secundario: null
        };
        setConfig(defaultConfig);
        setOrg(defaultConfig);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/gestion');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  // Demo users - deben coincidir con cli/seed.ts
  const demoUsers = [
    { email: 'admin@clinica.com', password: 'admin123', label: 'Admin', color: 'from-red-500 to-rose-600' },
    { email: 'medico@clinica.com', password: 'medico123', label: 'Médico', color: 'from-emerald-500 to-teal-600' },
    { email: 'recepcion@clinica.com', password: 'recep123', label: 'Recepción', color: 'from-blue-500 to-indigo-600' },
  ];

  const quickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setLoading(true);

    try {
      await login(userEmail, userPassword);
      navigate('/gestion');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: theme.background }}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-8 ${isNeumorphic ? 'neu-card' : 'border shadow-xl'}`}
        style={{
          backgroundColor: theme.card,
          borderColor: isNeumorphic ? 'transparent' : theme.border
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          {config?.logo_url ? (
            <img src={config.logo_url} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-2xl object-contain" />
          ) : (
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isNeumorphic ? 'neu-button' : ''}`}
              style={{ backgroundColor: isNeumorphic ? theme.card : `${theme.primary}20` }}
            >
              {isNeumorphic ? (
                <Leaf className="h-8 w-8" style={{ color: theme.primary }} />
              ) : (
                <LogIn className="h-8 w-8" style={{ color: theme.primary }} />
              )}
            </div>
          )}
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            {config?.titulo || (isNeumorphic ? 'MindfulSpace' : 'Sistema de Gestión')}
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
            {config?.eslogan || (isNeumorphic ? 'Tu espacio de bienestar' : 'Ingresá con tus credenciales')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1" style={{ color: theme.textSecondary }}>
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${isNeumorphic ? 'neu-input' : ''}`}
                style={{
                  backgroundColor: isNeumorphic ? theme.card : theme.backgroundSecondary,
                  border: isNeumorphic ? 'none' : `1px solid ${theme.border}`,
                  color: theme.text,
                }}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: theme.textSecondary }}>
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${isNeumorphic ? 'neu-input' : ''}`}
                style={{
                  backgroundColor: isNeumorphic ? theme.card : theme.backgroundSecondary,
                  border: isNeumorphic ? 'none' : `1px solid ${theme.border}`,
                  color: theme.text,
                }}
                placeholder="Tu contraseña"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isNeumorphic ? 'neu-gradient-primary' : ''}`}
            style={{ backgroundColor: isNeumorphic ? undefined : theme.primary }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Demo users */}
        <div className="mt-6">
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
            <span className="text-xs" style={{ color: theme.textSecondary }}>
              ACCESO DEMO
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {demoUsers.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => quickLogin(user.email, user.password)}
                disabled={loading}
                className={`bg-gradient-to-r ${user.color} text-white py-2 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]`}
              >
                {user.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

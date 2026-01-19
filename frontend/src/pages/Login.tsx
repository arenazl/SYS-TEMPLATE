import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

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

  // Demo users (deben coincidir con seed.py)
  const demoUsers = [
    { email: 'admin@admin.com', password: 'admin123', label: 'Admin', color: 'from-red-500 to-rose-600' },
    { email: 'usuario@demo.com', password: '123456', label: 'Usuario', color: 'from-blue-500 to-indigo-600' },
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
        className="w-full max-w-md rounded-2xl border p-8 shadow-xl"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${theme.primary}20` }}
          >
            <LogIn className="h-8 w-8" style={{ color: theme.primary }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Sistema de Gestión
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
            Ingresá con tus credenciales
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
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: theme.backgroundSecondary,
                  border: `1px solid ${theme.border}`,
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
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: theme.backgroundSecondary,
                  border: `1px solid ${theme.border}`,
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary }}
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

          <div className="grid grid-cols-2 gap-3">
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

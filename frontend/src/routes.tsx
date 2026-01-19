import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DynamicABM from './components/DynamicABM';
import AuditoriaPage from './pages/auditoria/AuditoriaPage';

export const router = createBrowserRouter([
  // === RUTAS PÚBLICAS ===
  { path: '/login', element: <Login /> },

  // === RUTA RAÍZ - Redirige a login ===
  { path: '/', element: <Navigate to="/login" replace /> },

  // === RUTAS PROTEGIDAS ===
  {
    path: '/gestion',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      // Dashboard
      { index: true, element: <Dashboard /> },

      // === RUTA DINÁMICA ===
      // Una sola ruta maneja TODAS las entidades:
      // /gestion/productos, /gestion/clientes, /gestion/pedidos, etc.
      { path: ':entidad', element: <DynamicABM /> },

      // Configuración / Auditoría (mantiene página con tabs)
      { path: 'auditoria', element: <AuditoriaPage /> },
    ],
  },

  // Catch-all: redirigir a login
  { path: '*', element: <Navigate to="/login" replace /> },
]);

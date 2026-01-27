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

      // === MÓDULO CLÍNICA ===
      // Maneja todas las entidades del módulo clínica:
      // /gestion/clinica/pacientes, /gestion/clinica/turnos, etc.
      { path: 'clinica/:entidad', element: <DynamicABM /> },

      // === RUTA DINÁMICA GENERAL ===
      // Una sola ruta maneja TODAS las entidades fuera de módulos:
      // /gestion/especialidades, /gestion/medicos, etc.
      { path: ':entidad', element: <DynamicABM /> },

      // Configuración / Auditoría (mantiene página con tabs)
      { path: 'auditoria', element: <AuditoriaPage /> },
    ],
  },

  // Catch-all: redirigir a login
  { path: '*', element: <Navigate to="/login" replace /> },
]);

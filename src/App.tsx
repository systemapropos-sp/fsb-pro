import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { seedInitialData } from '@/lib/storage';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Directorio from './pages/Directorio';
import Jugadas from './pages/Jugadas';
import Tickets from './pages/Tickets';
import Pendientes from './pages/Pendientes';
import Resultados from './pages/Resultados';
import Reglas from './pages/Reglas';
import Lineas from './pages/Lineas';
import Configuraciones from './pages/Configuraciones';
import Pagar from './pages/Pagar';
import Calculadora from './pages/Calculadora';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AppShell>
              <Dashboard />
            </AppShell>
          }
        />
        <Route
          path="/ventas"
          element={
            <AppShell>
              <Ventas />
            </AppShell>
          }
        />
        <Route
          path="/directorio"
          element={
            <AppShell>
              <Directorio />
            </AppShell>
          }
        />
        <Route
          path="/jugadas"
          element={
            <AppShell>
              <Jugadas />
            </AppShell>
          }
        />
        <Route
          path="/tickets"
          element={
            <AppShell>
              <Tickets />
            </AppShell>
          }
        />
        <Route
          path="/pendientes"
          element={
            <AppShell>
              <Pendientes />
            </AppShell>
          }
        />
        <Route
          path="/resultados"
          element={
            <AppShell>
              <Resultados />
            </AppShell>
          }
        />
        <Route
          path="/reglas"
          element={
            <AppShell>
              <Reglas />
            </AppShell>
          }
        />
        <Route
          path="/lineas"
          element={
            <AppShell>
              <Lineas />
            </AppShell>
          }
        />
        <Route
          path="/configuraciones"
          element={
            <AppShell>
              <Configuraciones />
            </AppShell>
          }
        />
        <Route
          path="/pagar"
          element={
            <AppShell>
              <Pagar />
            </AppShell>
          }
        />
        <Route
          path="/calculadora"
          element={
            <AppShell>
              <Calculadora />
            </AppShell>
          }
        />
      </Routes>
    </HashRouter>
  );
}

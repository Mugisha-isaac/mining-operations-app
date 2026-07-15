import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { WorkersPage } from '@/features/workers/WorkersPage';
import { IncidentsPage } from '@/features/incidents/IncidentsPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppLayout } from '@/routes/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

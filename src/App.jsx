import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './features/auth/components/Login';
import Sidebar from './shared/components/Sidebar';
import Header from './shared/components/Header';
import Dashboard from './features/dashboard/components/Dashboard';
import UsersManagement from './features/users/components/UsersManagement';
import DriversManagement from './features/drivers/components/DriversManagement';
import PricingManagement from './features/pricing/components/PricingManagement';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import ChangePassword from './features/auth/components/ChangePassword';

const AdminLayout = () => {
  return (
    <div className="relative flex min-h-screen w-full bg-surface-base">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-status-info/10 blur-3xl" />
      </div>
      <Sidebar />
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/drivers" element={<DriversManagement />} />
            <Route path="/pricing" element={<PricingManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

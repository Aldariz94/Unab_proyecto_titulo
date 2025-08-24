import React from 'react';
import { AuthProvider, ThemeProvider } from './context';
import { useAuth } from './hooks';
import { PublicLayout, UserLayout, DashboardLayout } from './layouts';
import { LoginPage, CatalogPage } from './pages';

const AppContent = () => {
    const { user, showLogin, setShowLogin } = useAuth();

    if (user) {
        if (user.rol === 'admin') {
            return <DashboardLayout />; // <-- Funciona sin cambios aquí
        }
        return <UserLayout />;
    }

    if (showLogin) {
        return <LoginPage />;
    }

    return (
        <PublicLayout onLoginClick={() => setShowLogin(true)}>
            <CatalogPage />
        </PublicLayout>
    );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
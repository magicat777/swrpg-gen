import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/auth/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SessionPage } from './pages/session/SessionPage';
import { SessionsPage } from './pages/sessions/SessionsPage';
import { StoryPage } from './pages/story/StoryPage';
import { CharactersPage } from './pages/characters/CharactersPage';
import { LocationsPage } from './pages/locations/LocationsPage';
import GalaxyMapPage from './pages/galaxy-map/GalaxyMapPage';
import { LorePage } from './pages/lore/LorePage';
import { TimelinePage } from './pages/timeline/TimelinePage';
import { SettingsPage } from './pages/settings/SettingsPage';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ErrorBoundary>
        <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        {/* Protected routes - all under Layout */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout><ErrorBoundary><DashboardPage /></ErrorBoundary></Layout>} />
            <Route path="/sessions" element={<Layout><ErrorBoundary><SessionsPage /></ErrorBoundary></Layout>} />
            <Route path="/characters" element={<Layout><ErrorBoundary><CharactersPage /></ErrorBoundary></Layout>} />
            <Route path="/locations" element={<Layout><ErrorBoundary><LocationsPage /></ErrorBoundary></Layout>} />
            <Route path="/locations/:locationId" element={<Layout><ErrorBoundary><LocationsPage /></ErrorBoundary></Layout>} />
            <Route path="/galaxy-map" element={<Layout><ErrorBoundary><GalaxyMapPage /></ErrorBoundary></Layout>} />
            <Route path="/lore" element={<Layout><ErrorBoundary><LorePage /></ErrorBoundary></Layout>} />
            <Route path="/timeline" element={<Layout><ErrorBoundary><TimelinePage /></ErrorBoundary></Layout>} />
            <Route path="/settings" element={<Layout><ErrorBoundary><SettingsPage /></ErrorBoundary></Layout>} />
            <Route path="/session/:sessionId" element={<Layout><ErrorBoundary><SessionPage /></ErrorBoundary></Layout>} />
            <Route path="/story/:sessionId" element={<Layout><ErrorBoundary><StoryPage /></ErrorBoundary></Layout>} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
        </Routes>
    </ErrorBoundary>
  );
};

export default App;
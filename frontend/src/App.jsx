import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { NewsDetail } from './pages/NewsDetail';
import { CategoryPage } from './pages/CategoryPage';
import { Login } from './pages/Login';
import TagPage from "./pages/TagPage";
import IndexPage from './pages/IndexPage';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';

// Guard: hanya izinkan role admin atau author. Tunggu auth selesai loading.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Jangan render apa pun sampai status auth diketahui
    return null;
  }

  if (!user) {
    return <Navigate to="/medialog" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/article/:slug" element={<NewsDetail />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/tag/:slug" element={<TagPage />} />
              <Route path="/indeks" element={<IndexPage />} />
              <Route path="/medialog" element={<Login />} />
              {/* Catch-all 404 route */}
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route
              path="/ruasdash"
              element={
                <ProtectedRoute allowedRoles={['admin', 'author']}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

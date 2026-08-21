import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { NewsDetail } from './pages/NewsDetail';
import { CategoryPage } from './pages/CategoryPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import TagPage from "./pages/TagPage";
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
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:slug" element={<NewsDetail />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/tag/:slug" element={<TagPage />} />
            <Route path="/medialog" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/ruasdash"
              element={
                <ProtectedRoute allowedRoles={['admin', 'author']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Catch-all 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

// LitInvestorBlog-frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthProvider.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import DonatePage from './pages/DonatePage';
import CommentModerationPage from './pages/CommentModerationPage';
import ArticleEditorPage from './pages/ArticleEditorPage';

import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from 'sonner';
import './App.css';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticlesByCategoryPage from './pages/ArticlesByCategoryPage';
import ArchivePage from './pages/ArchivePage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import AdminPage from './pages/AdminPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              {}
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticleDetailPage />} />
              <Route
                path="/categoria/:slug"
                element={<ArticlesByCategoryPage />}
              />
              <Route path="/archive" element={<ArchivePage />} />

              {}
              <Route path="/categorie" element={<ArchivePage />} />
              <Route path="/categories" element={<ArchivePage />} />

              {}
              <Route path="/about-us" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/donate" element={<DonatePage />} />

              {}
              <Route path="/search" element={<ArchivePage />} />

              {}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />

              {}
              <Route
                path="/admin/articoli/nuovo"
                element={<ArticleEditorPage />}
              />
              <Route
                path="/admin/articoli/modifica/:id"
                element={<ArticleEditorPage />}
              />
              <Route
                path="/admin/moderazione"
                element={<CommentModerationPage />}
              />
              {}
              <Route path="/admin/dashboard" element={<AdminPage />} />

              {}
              <Route path="*" element={<NotFoundPage />} />
              <Route
                path="/complete-profile"
                element={<CompleteProfilePage />}
              />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

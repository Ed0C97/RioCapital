import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import DonatePage from './pages/DonatePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import CommentModerationPage from './pages/CommentModerationPage';
import DonationsPage from './pages/DonationsPage';
import ArticleEditorPage from './pages/ArticleEditorPage';
import MyArticlesPage from './pages/MyArticlesPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from 'sonner';
import './App.css';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticlesByCategoryPage from './pages/ArticlesByCategoryPage';
import ArchivePage from './pages/ArchivePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex justify-center">
            <Routes>
              {/* === Rotte Pubbliche Principali === */}
              <Route path="/" element={<HomePage />} />
              <Route path="/articolo/:slug" element={<ArticleDetailPage />} />
              <Route path="/categoria/:slug" element={<ArticlesByCategoryPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/archivio" element={<ArchivePage />} />

              {/* === Rotte Pubbliche Secondarie === */}
              <Route path="/categorie" element={<CategoriesPage />} />
              <Route path="/chi-siamo" element={<AboutPage />} />
              <Route path="/contatti" element={<ContactPage />} />
              <Route path="/dona" element={<DonatePage />} />

              {/* === Rotte di Autenticazione === */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* === Rotte Utente Autenticato === */}
              <Route path="/profilo" element={<ProfilePage />} />
              <Route path="/preferiti" element={<FavoritesPage />} />

              {/* === Rotte Collaboratore/Admin === */}
              <Route path="/admin/articoli" element={<MyArticlesPage />} />
              <Route path="/admin/articoli/nuovo" element={<ArticleEditorPage />} />
              <Route path="/admin/articoli/modifica/:id" element={<ArticleEditorPage />} />

              {/* === Rotte Solo Admin === */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/commenti" element={<CommentModerationPage />} />
              <Route path="/admin/donazioni" element={<DonationsPage />} />

              {/* === Rotte Legacy per Compatibilità (opzionali ma utili) === */}
              <Route path="/admin/articles" element={<MyArticlesPage />} />
              <Route path="/admin/articles/new" element={<ArticleEditor-page />} />
              <Route path="/admin/articles/edit/:id" element={<ArticleEditorPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />

              {/* === Rotta Catch-All per Pagine Non Trovate (404) === */}
              <Route path="*" element={<NotFoundPage />} />
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

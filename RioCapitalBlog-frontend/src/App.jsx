import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
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
// import CategoriesPage from './pages/CategoriesPage'; // <-- NON CI SERVE PIÙ
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from 'sonner';
import './App.css';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticlesByCategoryPage from './pages/ArticlesByCategoryPage';
import ArchivePage from './pages/ArchivePage'; // <-- LA NUOVA PAGINA
import CompleteProfilePage from './pages/CompleteProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* --- Rotte Principali --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/articolo/:slug" element={<ArticleDetailPage />} />
              <Route path="/categoria/:slug" element={<ArticlesByCategoryPage />} />
              <Route path="/archivio" element={<ArchivePage />} />
              
              {/* --- Vecchie rotte per le categorie ora puntano all'archivio --- */}
              <Route path="/categorie" element={<ArchivePage />} />
              <Route path="/categories" element={<ArchivePage />} />

              {/* --- Altre Pagine --- */}
              <Route path="/chi-siamo" element={<AboutPage />} />
              <Route path="/contatti" element={<ContactPage />} />
              <Route path="/dona" element={<DonatePage />} />
              
              {/* --- Autenticazione e Profilo --- */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profilo" element={<ProfilePage />} />
              <Route path="/preferiti" element={<FavoritesPage />} />
              
              {/* --- Area Admin/Collaboratore --- */}
              <Route path="/admin/articoli" element={<MyArticlesPage />} />
              <Route path="/admin/articoli/nuovo" element={<ArticleEditorPage />} />
              <Route path="/admin/articoli/modifica/:id" element={<ArticleEditorPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/commenti" element={<CommentModerationPage />} />
              <Route path="/admin/donazioni" element={<DonationsPage />} />
              
              {/* --- Rotta 404 --- */}
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/complete-profile" element={<CompleteProfilePage />} />
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
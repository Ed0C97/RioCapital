// RioCapitalBlog-frontend/src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Heart
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Iscrizione alla newsletter completata con successo!');
        setEmail('');
      } else {
        const data = await response.json();
        alert(data.error || 'Errore durante l\'iscrizione');
      }
    } catch (error) {
      alert('Errore di connessione');
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 RioCapitalBlog-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold RioCapitalBlog-text-gradient">RioCapitalBlog</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Il tuo blog finanziario di fiducia. Notizie, analisi e consigli per navigare
              nel mondo degli investimenti e della finanza personale.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Link Rapidi</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Home
              </Link>
              <Link to="/categories" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Categorie
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Chi Siamo
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Contatti
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Categorie</h3>
            <div className="space-y-2">
              <Link to="/category/investimenti" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Investimenti
              </Link>
              <Link to="/category/mercati" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Mercati
              </Link>
              <Link to="/category/criptovalute" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Criptovalute
              </Link>
              <Link to="/category/economia" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Economia
              </Link>
              <Link to="/category/finanza-personale" className="block text-muted-foreground hover:text-primary transition-colors text-sm">
                Finanza Personale
              </Link>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Newsletter</h3>
            <p className="text-muted-foreground text-sm">
              Ricevi le ultime notizie finanziarie direttamente nella tua casella di posta.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Iscriviti
              </Button>
            </form>
          </div>
        </div>

        {}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2025 RioCapitalBlog. Tutti i diritti riservati.
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/donate" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                <Heart className="w-4 h-4" />
                <span>Supporta il nostro lavoro</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

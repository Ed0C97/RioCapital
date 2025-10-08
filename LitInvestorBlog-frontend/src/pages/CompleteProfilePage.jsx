// LitInvestorBlog-frontend/src/pages/CompleteProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { User } from 'lucide-react';

const CompleteProfilePage = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, checkAuthStatus } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("L'username è obbligatorio.");
      return;
    }
    setLoading(true);

    try {

      const response = await fetch('/api/auth/complete-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registrazione fallita.');
      }

      await checkAuthStatus();
      toast.success('Profilo completato! Benvenuto!');

    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <form onSubmit={handleSubmit} className="login-form-container">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Completa il tuo Profilo</h1>
          <p className="text-gray-500 mt-2">
            Scegli un username per continuare.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">Username *</label>
          <div className="inputForm">
            <User size={20} className="text-gray-400" />
            <input
              name="username"
              placeholder="Scegli il tuo username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="button-submit" disabled={loading}>
          {loading ? 'Salvataggio...' : 'Salva e Continua'}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfilePage;

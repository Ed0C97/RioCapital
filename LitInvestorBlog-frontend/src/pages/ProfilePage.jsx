// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  User,
  Mail,
  Linkedin,
  Bell,
  Save,
  Shield,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '../components/ui/UserAvatar';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'collaborator':
        return 'Collaborator';
      default:
        return 'User';
    }
  };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    linkedin_url: '',
    newsletter_subscribed: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        linkedin_url: user.linkedin_url || '',
        newsletter_subscribed: user.newsletter_subscribed || false,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, newsletter_subscribed: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profilo aggiornato con successo!');
    } else {
      toast.error(result.error || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  if (!user) {
    return <div className="text-center p-20">Caricamento profilo...</div>;
  }

  return (
    <div className="bg-[#f5f5f7]">
      {/* Header di Pagina */}
      <div className="w-full mb-12">
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
          <div className="border-b border-[#d2d2d7] my-4"></div>
          <h2 className="text-2xl font-regular">
            <span className="text-gray-500">Welcome</span>,{' '}
            <span className="text-gray-800">{user.username}</span>
          </h2>
        </div>
      </div>

      {/* Contenitore Principale */}
      <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pb-16">
        <div className="mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- SOSTITUISCI QUESTO BLOCCO --- */}
            <div className="flex items-center justify-between">
              {/* Parte Sinistra: Avatar e Nome/Email */}
              <div className="flex items-center space-x-4">
                <UserAvatar
                  username={user.username}
                  firstName={user.first_name}
                  avatarUrl={user.avatar_url} // se vuoi usare l'immagine reale se presente
                  size={80} // uguale a w-20 h-20
                />
                <div>
                  <h3 className="text-xl font-bold">
                    {formData.first_name} {formData.last_name}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Parte Destra: Ruolo e Data */}
              {/* ======================================================= */}
              {/* PARAMETRI DA REGOLARE:                                  */}
              {/* gap-4: Spazio orizzontale tra Ruolo e Data              */}
              {/* text-sm: Grandezza del testo                          */}
              {/* ======================================================= */}
              <div className="hidden md:flex flex-col items-end text-sm text-muted-foreground space-y-1">
                {/* Badge Ruolo */}
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full font-medium border ${getRoleBadgeColor(user.role)}`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  <span>{getRoleLabel(user.role)}</span>
                </div>

                {/* Data Registrazione */}
                {user.created_at && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>
                      Memebro dal{' '}
                      {new Date(user.created_at).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sezione Informazioni Personali */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">
                Informazioni Personali
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="pl-9 !bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Cognome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="pl-9 !bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="!bg-white shadow-none border-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">Profilo LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-4 h-4" />
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="pl-9 !bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Sezione Preferenze */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">
                Preferenze
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newsletter">Iscrizione Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi aggiornamenti e analisi via email.
                  </p>
                </div>
                <div className="switch-container">
                  <Switch
                    id="newsletter"
                    checked={formData.newsletter_subscribed}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </div>

            {/* Pulsante Salva */}
            <div className="flex justify-end">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!loading) handleSubmit(e); // <-- CORRETTO QUI
                }}
                className={`flex items-center text-sm font-medium transition-colors ${
                  loading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

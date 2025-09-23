// RioCapitalBlog-frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User, Mail, Calendar, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    newsletter_subscribed: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        newsletter_subscribed: user.newsletter_subscribed || false
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(formData);

    if (result.success) {
      toast.success('Profilo aggiornato con successo!');
    } else {
      toast.error(result.error || 'Errore durante l\'aggiornamento del profilo');
    }

    setLoading(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Amministratore';
      case 'collaborator':
        return 'Collaboratore';
      default:
        return 'Utente';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Il Mio Profilo</h1>
        <p className="text-muted-foreground">
          Gestisci le informazioni del tuo account e le preferenze
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback className="text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                <Shield className="w-3 h-3 mr-1" />
                {getRoleLabel(user.role)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Membro dal {new Date(user.created_at).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.newsletter_subscribed ? 'Iscritto alla newsletter' : 'Non iscritto alla newsletter'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informazioni Personali</span>
              </CardTitle>
              <CardDescription>
                Aggiorna le tue informazioni personali e le preferenze dell'account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Il tuo nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Cognome</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Il tuo cognome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Raccontaci qualcosa di te..."
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Massimo 500 caratteri
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Preferenze</span>
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newsletter">Newsletter</Label>
                      <p className="text-sm text-muted-foreground">
                        Ricevi aggiornamenti sui nuovi articoli e contenuti
                      </p>
                    </div>
                    <Switch
                      id="newsletter"
                      checked={formData.newsletter_subscribed}
                      onCheckedChange={(checked) => handleSwitchChange('newsletter_subscribed', checked)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Salvando...' : 'Salva Modifiche'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

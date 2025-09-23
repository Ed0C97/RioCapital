// RioCapitalBlog-frontend/src/pages/AboutPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Edit, Save, X, Users, Target, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const AboutPage = () => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await fetch('/api/content/about');
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || getDefaultContent());
      } else {
        setContent(getDefaultContent());
      }
    } catch (error) {
      console.error('Errore nel caricamento del contenuto:', error);
      setContent(getDefaultContent());
    }
  };

  const getDefaultContent = () => {
    return `RioCapitalBlog è la tua fonte di riferimento per informazioni finanziarie accurate, analisi di mercato approfondite e consigli pratici per la gestione del denaro.

La nostra missione è democratizzare l'accesso all'educazione finanziaria, fornendo contenuti di qualità che aiutino i nostri lettori a prendere decisioni informate sui loro investimenti e sulla gestione delle finanze personali.

Il nostro team è composto da esperti del settore finanziario, analisti di mercato e giornalisti specializzati che lavorano ogni giorno per portarvi le notizie più rilevanti e le analisi più accurate del mondo della finanza.

Crediamo che l'informazione finanziaria debba essere accessibile a tutti, indipendentemente dal livello di esperienza. Per questo motivo, i nostri articoli spaziano dai concetti base per principianti alle analisi più sofisticate per investitori esperti.`;
  };

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditContent('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/content/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
        credentials: 'include'
      });

      if (response.ok) {
        setContent(editContent);
        setIsEditing(false);
        toast.success('Contenuto aggiornato con successo!');
      } else {
        toast.error('Errore durante l\'aggiornamento del contenuto');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: Users,
      label: 'Lettori Attivi',
      value: '10,000+',
      description: 'Utenti che si fidano dei nostri contenuti'
    },
    {
      icon: Target,
      label: 'Articoli Pubblicati',
      value: '500+',
      description: 'Contenuti di qualità dal 2020'
    },
    {
      icon: Award,
      label: 'Esperti nel Team',
      value: '15+',
      description: 'Professionisti del settore finanziario'
    },
    {
      icon: TrendingUp,
      label: 'Crescita Mensile',
      value: '25%',
      description: 'Aumento costante dei lettori'
    }
  ];

  const teamMembers = [
    {
      name: 'Marco Rossi',
      role: 'Direttore Editoriale',
      description: 'Esperto in analisi finanziaria con 15 anni di esperienza nei mercati internazionali.',
      avatar: 'MR'
    },
    {
      name: 'Laura Bianchi',
      role: 'Analista Senior',
      description: 'Specializzata in criptovalute e tecnologie blockchain, ex Goldman Sachs.',
      avatar: 'LB'
    },
    {
      name: 'Giuseppe Verdi',
      role: 'Consulente Investimenti',
      description: 'Consulente finanziario certificato con focus su finanza personale e pianificazione.',
      avatar: 'GV'
    },
    {
      name: 'Anna Neri',
      role: 'Giornalista Finanziaria',
      description: 'Giornalista economica con collaborazioni per Il Sole 24 Ore e Milano Finanza.',
      avatar: 'AN'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 RioCapitalBlog-text-gradient">Chi Siamo</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Scopri la storia, la missione e il team dietro RioCapitalBlog
        </p>
      </div>

      {}
      <div className="max-w-4xl mx-auto mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>La Nostra Storia</CardTitle>
              <CardDescription>
                Scopri come è nato RioCapitalBlog e qual è la nostra missione
              </CardDescription>
            </div>
            {isAdmin() && !isEditing && (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Modifica
              </Button>
            )}
            {isAdmin() && isEditing && (
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salva'}
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Annulla
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="w-full"
                placeholder="Inserisci il contenuto della sezione Chi Siamo..."
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                {content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">I Nostri Numeri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 RioCapitalBlog-gradient rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Il Nostro Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 RioCapitalBlog-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <Badge variant="secondary" className="mb-3">
                      {member.role}
                    </Badge>
                    <p className="text-muted-foreground">{member.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">I Nostri Valori</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Trasparenza</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Forniamo informazioni chiare e oneste, senza conflitti di interesse nascosti.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Accessibilità</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Rendiamo l'educazione finanziaria comprensibile e accessibile a tutti.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Qualità</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Ogni contenuto è accuratamente ricercato e verificato dai nostri esperti.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

// RioCapitalBlog-frontend/src/pages/ContactPage.jsx

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Messaggio inviato con successo! Ti risponderemo presto.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: ''
        });
      } else {
        toast.error('Errore durante l\'invio del messaggio. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'info@RioCapitalBlog.it',
      description: 'Rispondiamo entro 24 ore'
    },
    {
      icon: Phone,
      title: 'Telefono',
      content: '+39 02 1234 5678',
      description: 'Lun-Ven 9:00-18:00'
    },
    {
      icon: MapPin,
      title: 'Indirizzo',
      content: 'Via Milano 123, 20121 Milano',
      description: 'Sede principale'
    },
    {
      icon: Clock,
      title: 'Orari',
      content: 'Lun-Ven 9:00-18:00',
      description: 'Supporto clienti'
    }
  ];

  const categories = [
    { value: 'general', label: 'Domanda Generale', icon: HelpCircle },
    { value: 'suggestion', label: 'Suggerimento', icon: Lightbulb },
    { value: 'collaboration', label: 'Collaborazione', icon: MessageSquare },
    { value: 'technical', label: 'Problema Tecnico', icon: AlertCircle }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 RioCapitalBlog-text-gradient">Contattaci</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Hai domande, suggerimenti o vuoi collaborare con noi? Siamo qui per aiutarti.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni di Contatto</CardTitle>
                <CardDescription>
                  Ecco come puoi raggiungerci
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 RioCapitalBlog-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{info.title}</h3>
                      <p className="text-foreground">{info.content}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Domande frequenti
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Come posso diventare collaboratore?</h4>
                  <p className="text-sm text-muted-foreground">
                    Invia il tuo CV e alcuni esempi di articoli tramite il form di contatto.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Posso suggerire argomenti?</h4>
                  <p className="text-sm text-muted-foreground">
                    Assolutamente! Usa la categoria "Suggerimento" nel form.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Come funzionano le donazioni?</h4>
                  <p className="text-sm text-muted-foreground">
                    Le donazioni ci aiutano a mantenere il sito gratuito e senza pubblicità.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Invia un Messaggio</span>
              </CardTitle>
              <CardDescription>
                Compila il form sottostante e ti risponderemo il prima possibile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Il tuo nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="la-tua-email@esempio.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            <category.icon className="w-4 h-4" />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Oggetto *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Oggetto del messaggio"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Messaggio *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Scrivi qui il tuo messaggio..."
                    rows={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimo 10 caratteri
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || formData.message.length < 10}
                    className="flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Invio in corso...' : 'Invia Messaggio'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dove Siamo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Mappa interattiva</p>
                  <p className="text-sm text-muted-foreground">Via Milano 123, 20121 Milano</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

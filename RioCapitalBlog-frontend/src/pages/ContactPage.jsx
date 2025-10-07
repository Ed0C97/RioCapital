// src/pages/ContactPage.jsx

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Send, User, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';
import RelatedArticles from "@/components/RelatedArticles.jsx";

// 1. Importa il componente per l'animazione
import FadeInOnScroll from '../components/FadeInOnScroll';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success('Messaggio inviato con successo!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Errore durante l\'invio del messaggio.');
      }
    } catch (error) {
      toast.error('Errore di connessione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e549c]">
      {/* --- BLOCCO HEADER DI PAGINA (Larghezza Limitata) --- */}
      {/* 2. Avvolgi il blocco header con l'animazione */}
      <FadeInOnScroll>
        <div className="w-full mb-16">
          <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
            <div className="border-b border-[#d2d2d7] my-2"></div>
            <h2 className="text-2xl font-regular text-gray-500">Contacts</h2>
          </div>
        </div>
      </FadeInOnScroll>

      {/* --- Contenitore Principale (Larghezza Limitata) --- */}
      <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pb-16">

        {/* Sezione Introduttiva */}
        {/* 3. Avvolgi la sezione introduttiva con un leggero ritardo */}
        <FadeInOnScroll delay={100}>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Mettiti in contatto</h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Hai una domanda, un suggerimento o una proposta di collaborazione? Compila il form sottostante. Il nostro team ti risponderà il prima possibile.
            </p>
          </div>
        </FadeInOnScroll>

        {/* Form di Contatto */}
        {/* 4. Avvolgi il form con un ritardo maggiore per l'effetto a cascata */}
        <FadeInOnScroll delay={200}>
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="pl-9 !bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-9 !bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Oggetto *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="pl-9 !bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Messaggio *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={18}
                  required
                  className="pl-9 !bg-white shadow-none border-none"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    !bg-transparent !text-blue-600 !border !border-blue-600
                    flex items-center justify-center
                    hover:!bg-blue-600 hover:!text-white hover:font-semibold
                    transition-all duration-300
                  "
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Invio in corso..." : "Invia Messaggio"}
                </Button>
              </div>
            </form>
          </div>
        </FadeInOnScroll>
      </div>

      {/* Sezione "I più popolari" (larghezza piena, come in AboutPage) */}
      {/* 5. Avvolgi anche la sezione finale */}
      <FadeInOnScroll>
        <div className="mt-1">
          <RelatedArticles
            title="I più popolari"
            fetchUrl="/api/articles?per_page=4"
          />
        </div>
      </FadeInOnScroll>
    </div>
  );
};

export default ContactPage;

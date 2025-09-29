// src/pages/AboutPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Textarea } from '../components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import RelatedArticles from '../components/RelatedArticles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import founderImage from '../assets/img.png';
import clsx from 'clsx';
import RichTextEditor from '../components/RichTextEditor';

const AboutPage = () => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    founderName: 'Lit Investor',
    founderRole: 'Direttore',
    mainText: '',
  });
  const [editContent, setEditContent] = useState('');
  const [isJustified, setIsJustified] = useState(true);

  const fetchAboutContent = async () => {
  try {
    const response = await fetch('/api/content/about');
    if (response.ok) {
      const data = await response.json();
      setContent(prev => ({ ...prev, mainText: data.content.body }));
    } else {
      // Se non trova il contenuto nel DB, mainText rimane vuoto
      setContent(prev => ({ ...prev, mainText: '' }));
    }
  } catch (error) {
    console.error('Errore nel caricamento del contenuto:', error);
    setContent(prev => ({ ...prev, mainText: '' }));
  }
};

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const handleEdit = () => {
    setEditContent(content.mainText);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // src/pages/AboutPage.jsx

  const handleSave = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/content/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editContent }), // <-- Corretto in 'body'
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Salvataggio fallito.');

    const data = await response.json();
    // Aggiorna lo stato con i dati freschi dal server
    setContent(prev => ({ ...prev, mainText: data.content.body }));
    setIsEditing(false);
    toast.success('Contenuto aggiornato!');
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white">
      {/* --- BLOCCO HEADER DI PAGINA (Larghezza Limitata) --- */}
      <div className="w-full mb-16">
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
          <div className="border-b border-[#d2d2d7] my-2"></div>
          <h2 className="text-2xl font-regular text-gray-500">About me</h2>
        </div>
      </div>

      {/* --- BLOCCO FONDATORE (Larghezza Limitata) --- */}
      <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="md:col-span-2 text-left">
            <h2 className="text-5xl font-semibold text-gray-800">
              {content.founderName}
            </h2>
            <p className="text-xl text-gray-500 mt-4">
              {content.founderRole}
            </p>
          </div>
          <div className="md:col-span-1 flex justify-center md:justify-end">
            <img
              src={founderImage}
              alt={content.founderName}
              className="w-[320px] h-[320px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* --- MODIFICA CHIAVE: NUOVA SEZIONE A LARGHEZZA PIENA PER IL TESTO --- */}
      <div className="bg-gray-50">
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] py-20 my-0">
          {/* Contenuto Testo Principale */}
          <div>
            {isEditing ? (
              <RichTextEditor
                value={editContent}
                onChange={setEditContent}
                placeholder="Scrivi qui la tua storia..."
                height="200px"
              />
            ) : (
              <div className="article-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.mainText}</ReactMarkdown>
              </div>
            )}

            {/* Link di Azione per Admin */}
            {isAdmin() && (
              <div className="flex justify-end items-center space-x-6 mt-6">
                {!isEditing ? (
                  <a href="#" onClick={(e) => { e.preventDefault(); handleEdit(); }} className="flex items-center text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                    <Edit className="w-4 h-4 mr-2" /> Modifica Testo
                  </a>
                ) : (
                  <>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleSave(); }} className="flex items-center text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                      <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvataggio...' : 'Salva'}
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleCancel(); }} className="flex items-center text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                      <X className="w-4 h-4 mr-2" /> Annulla
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* -------------------------------------------------------------------- */}

      {/* Sezione "I più popolari" (già a larghezza piena) */}
      <div className="mt-1">
        <RelatedArticles
          title="I più popolari"
          fetchUrl="/api/articles?per_page=4"
        />
      </div>
    </div>
  );
};

export default AboutPage;
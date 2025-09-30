// RioCapitalBlog-frontend/src/pages/ArticleEditorPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RoleGuard from '../components/RoleGuard';
import RichTextEditor from '../components/RichTextEditor';
import ImageUploader from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Save, Eye, ArrowLeft, CheckCircle, FileText, Image as ImageIcon,
  Settings, Tag, Link as LinkIcon, Type, BookText, Info
} from 'lucide-react';
import { toast } from 'sonner';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import katex from 'katex';
import { marked } from 'marked';


const ArticleEditorPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [article, setArticle] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    image_url: null,
    published: false,
    featured: false,
    tags: '',
    show_author_contacts: false
  });

  useEffect(() => {
  fetchCategories();
}, []); // <-- Array di dipendenze vuoto

// Effetto per caricare i dati dell'articolo (solo in modalità modifica)
useEffect(() => {
  if (isEditing && user) {
    fetchArticle();
  } else {
    setLoading(false);
  }
}, [id, user, isEditing]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error);
    }
  };

  const fetchArticle = async () => {
    setLoading(true);
    try {
      // 'id' qui può essere un numero (dalla modifica) o uno slug (non usato, ma per coerenza)
      // Usiamo l'endpoint che accetta l'ID numerico
      const response = await fetch(`/api/articles/id/${id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const articleData = data.article;

        if (!user) {
          console.log("In attesa che l'utente venga caricato...");
          return;
      }

      if (!isAdmin() && articleData.author_id !== user.id) {
        toast.error('Non hai i permessi per modificare questo articolo');
        navigate('/admin/articoli');
        return;
      }

        setArticle({
          title: articleData.title || '',
          slug: articleData.slug || '',
          excerpt: articleData.excerpt || '',
          content: articleData.content || '',
          category_id: articleData.category_id || '',
          image_url: articleData.image_url || null,
          published: articleData.published || false,
          featured: articleData.featured || false,
          tags: articleData.tags ? articleData.tags.join(', ') : '',
          show_author_contacts: articleData.show_author_contacts || false
        });
      } else {
        toast.error('Articolo non trovato');
        navigate('/admin/articoli');
      }
    } catch (error) {
      console.error("Errore:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (field, value) => {
    setArticle(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'title' && !isEditing) {
      setArticle(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const validateArticle = () => {
    const errors = [];

    if (!article.title.trim()) errors.push('Il titolo è obbligatorio');
    if (!article.slug.trim()) errors.push('Lo slug è obbligatorio');
    if (!article.excerpt.trim()) errors.push('Il riassunto è obbligatorio');
    if (!article.content.trim()) errors.push('Il contenuto è obbligatorio');
    if (!article.category_id) errors.push('La categoria è obbligatoria');

    if (article.title.length > 200) errors.push('Il titolo è troppo lungo (max 200 caratteri)');
    if (article.excerpt.length > 500) errors.push('Il riassunto è troppo lungo (max 500 caratteri)');

    return errors;
  };

  const handleSave = async (publish = false) => {
    const errors = validateArticle();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setSaving(true);
    try {
      const articleData = {
        ...article,
        published: publish || article.published,
        tags: article.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const url = isEditing ? `/api/articles/${id}` : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          isEditing
            ? 'Articolo aggiornato con successo!'
            : 'Articolo creato con successo!'
        );

        if (!isEditing) {
          navigate(`/admin/articles/edit/${data.article.id}`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      toast.error("Impossibile aprire l'anteprima. Disabilita il blocco popup.");
      return;
    }

    const markdownComponent = (
      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    );

    const contentWithLatex = (article.content || '').replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
        try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
        catch (e) { return match; }
    });

    const htmlContent = ReactDOMServer.renderToString(markdownComponent);
    const htmlExcerpt = marked(article.excerpt || '');

    previewWindow.document.write(`
      <html>
        <head>
          <title>Anteprima: ${article.title}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
          
          {/* Includi un link al tuo CSS per uno stile accurato */}
          <link rel="stylesheet" href="/src/App.css"> 
          
          <style>
            body { padding: 2rem; }
          </style>
        </head>
        <body>
          <article class="max-w-3xl mx-auto">
            <h1>${article.title}</h1>
            <hr/>
            ${htmlContent}
          </article>
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  if (loading) {
        return <div className="text-center p-8">Caricamento...</div>;
  }

// src/pages/ArticleEditorPage.jsx

  // src/pages/ArticleEditorPage.jsx

  return (
    <RoleGuard user={user} requiredRoles={['collaborator', 'admin']}>
      <div className="bg-[#f5f5f7]">
        <div className="w-full mb-12">
          <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
            {/* Titolo e Linea */}
            <div className="mb-8">
              <div className="border-b border-[#d2d2d7] my-2"></div>
              <h2 className="text-2xl font-regular text-gray-500">
                {isEditing ? 'Modifica Articolo' : 'Nuovo Articolo'}
              </h2>
            </div>

            {/* Controlli (Back e Pulsanti Azione) */}
            <div className="flex items-center justify-between">
              <a href="/admin/my-articles" onClick={(e) => { e.preventDefault(); navigate('/admin/my-articles'); }} className="flex items-center text-sm text-gray-500 font-medium hover:font-semibold transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </a>
              <div className="flex items-center space-x-4">
                <Button onClick={handlePreview} disabled={!article.title || !article.content} className="btn-outline btn-outline-gray">
                  <Eye className="w-4 h-4 mr-2" /> Anteprima
                </Button>
                <Button onClick={() => handleSave(false)} disabled={saving} className="btn-outline btn-outline-blue">
                  <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salva Bozza'}
                </Button>
                <Button onClick={() => handleSave(true)} disabled={saving} className="btn-outline btn-outline-green">
                  <CheckCircle className="w-4 h-4 mr-2" /> {saving ? 'Pubblicando...' : 'Pubblica'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenitore Principale */}
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pb-16 space-y-8">

          {/* Sezione Slug e Stato (fuori dalle card) */}
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon size={14} />
              <span>Slug: <code className="text-xs bg-gray-200 p-1 rounded">{article.slug || 'verrà-generato-dal-titolo'}</code></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Stato:</span>
                <span className="font-semibold">{article.published ? 'Pubblicato' : 'Bozza'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Evidenza:</span>
                <span className="font-semibold">{article.featured ? 'Sì' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Contatti:</span>
                <span className="font-semibold">{article.show_author_contacts ? 'Visibili' : 'Nascosti'}</span>
              </div>
            </div>
          </div>

          {/* Card Unica per le Impostazioni */}
          <Card className="shadow-none border-none">
            <CardContent className="p-6 space-y-6">
              {/* Titolo e Riassunto */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo <span className="text-red-500">*</span></Label>
                  <div className="relative"><Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><Input id="title" value={article.title} onChange={(e) => handleInputChange('title', e.target.value)} required className="pl-9" /></div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Riassunto <span className="text-red-500">*</span></Label>
                  <Textarea id="excerpt" value={article.excerpt} onChange={(e) => handleInputChange('excerpt', e.target.value)} rows={3} required />
                </div>
              </div>

              {/* Categoria e Tag */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 w-full max-w-xl">
                {/* Colonna Categoria (rimane invariata) */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria <span className="text-red-500">*</span></Label>
                  <Select value={article.category_id.toString()} onValueChange={(value) => handleInputChange('category_id', parseInt(value))}>
                    <SelectTrigger><SelectValue placeholder="Seleziona categoria" /></SelectTrigger>
                    <SelectContent>{categories.map((category) => (<SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                </div>

                {/* --- MODIFICA QUI --- */}
                {/* Colonna Tag con allineamento a destra */}
                <div className="flex flex-col items-start md:items-end">
                  <div className="space-y-2 w-full max-w-5xl"> {/* Controlla la larghezza qui */}
                    <Label htmlFor="tags">Tag</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input id="tags" value={article.tags} onChange={(e) => handleInputChange('tags', e.target.value)} placeholder="tag1, tag2" className="pl-9" />
                    </div>
                  </div>
                </div>
                {/* -------------------- */}
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between"><Label htmlFor="published">Pubblicato</Label><div className="switch-container"><Switch id="published" checked={article.published} onCheckedChange={(checked) => handleInputChange('published', checked)} /></div></div>
                {isAdmin() && (<div className="flex items-center justify-between"><Label htmlFor="featured">In evidenza</Label><div className="switch-container"><Switch id="featured" checked={article.featured} onCheckedChange={(checked) => handleInputChange('featured', checked)} /></div></div>)}
                <div className="flex items-center justify-between"><Label htmlFor="show-contacts">Mostra Contatti</Label><div className="switch-container"><Switch id="show-contacts" checked={article.show_author_contacts} onCheckedChange={(checked) => handleInputChange('show_author_contacts', checked)} /></div></div>
              </div>
            </CardContent>
          </Card>

          {/* Card Immagine di Copertina */}
          <Card className="shadow-none border-none">
            <CardHeader><CardTitle className="text-xl">Immagine di Copertina</CardTitle></CardHeader>
            <CardContent>
              <ImageUploader currentImage={article.image_url} onImageUploaded={(url) => handleInputChange('image_url', url)} />
            </CardContent>
          </Card>

          {/* Card Contenuto Articolo */}
          <Card className="shadow-none border-none">
            <CardHeader><CardTitle className="text-xl">Contenuto Articolo <span className="text-red-500">*</span></CardTitle></CardHeader>
            <CardContent>
              <RichTextEditor value={article.content} onChange={(content) => handleInputChange('content', content)} height="600px" />
            </CardContent>
          </Card>

        </div>
      </div>
    </RoleGuard>
  );
};

export default ArticleEditorPage;

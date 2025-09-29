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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  Save,
  Eye,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Settings,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ArticleEditorPage = () => {
  const { user, canWriteArticles, isAdmin } = useAuth();
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
      .trim('-');
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

    const contentWithLatex = (article.content || '').replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
        try { return katex.renderToString(latex, { throwOnError: false, displayMode: true }); }
        catch (e) { return match; }
    });

    const htmlContent = marked(contentWithLatex);
    const htmlExcerpt = marked(article.excerpt || '');

    previewWindow.document.write(`
      <html>
        <head>
          <title>Anteprima: ${article.title}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.7; }
            .content h1, .content h2 { margin-top: 1.5em; margin-bottom: 0.5em; }
            .content ul, .content ol { padding-left: 2em; }
            .content blockquote { border-left: 3px solid #ddd; padding-left: 1em; }
            .excerpt { font-style: italic; color: #555; border-left: 3px solid #eee; padding-left: 1em; }
          </style>
        </head>
        <body>
          <h1>${article.title}</h1>
          <div class="excerpt">${htmlExcerpt}</div>
          <hr/>
          <div class="content">${htmlContent}</div>
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  if (loading) {
        return <div className="text-center p-8">Caricamento...</div>;
  }

  return (
    <RoleGuard user={user} requiredRoles={['collaborator', 'admin']}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/articles')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna agli articoli
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Modifica Articolo' : 'Nuovo Articolo'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Modifica il tuo articolo esistente' : 'Crea un nuovo articolo per il blog'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!article.title || !article.content}
            >
              <Eye className="w-4 h-4 mr-2" />
              Anteprima
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={saving}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salva Bozza'}
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {saving ? 'Pubblicando...' : 'Pubblica'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Informazioni Articolo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo *</Label>
                  <Input
                    id="title"
                    value={article.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Inserisci il titolo dell'articolo"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    {article.title.length}/200 caratteri
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL *</Label>
                  <Input
                    id="slug"
                    value={article.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-articolo"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL finale: /articolo/{article.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Riassunto *</Label>
                  <Textarea
                    id="excerpt"
                    value={article.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Breve descrizione dell'articolo"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {article.excerpt.length}/500 caratteri
                  </p>
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Immagine di Copertina</span>
                </CardTitle>
                <CardDescription>
                  Carica un'immagine che rappresenti il tuo articolo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  currentImage={article.image_url}
                  onImageUploaded={(url) => handleInputChange('image_url', url)}
                />
              </CardContent>
            </Card>

            {/* Editor contenuto */}
            <RichTextEditor
              value={article.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Scrivi il contenuto del tuo articolo..."
              height="500px"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impostazioni pubblicazione */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Pubblicazione</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="published">Pubblicato</Label>
                    <p className="text-sm text-muted-foreground">
                      Rendi l'articolo visibile pubblicamente
                    </p>
                  </div>
                  <div className="switch-container">
                    <Switch
                      id="published"
                      checked={article.published}
                      onCheckedChange={(checked) => handleInputChange('published', checked)}
                    />
                  </div>
                </div>

                {isAdmin() && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="featured">In evidenza</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostra in homepage
                      </p>
                    </div>
                    <div className="switch-container">
                      <Switch
                        id="featured"
                        checked={article.featured}
                        onCheckedChange={(checked) => handleInputChange('featured', checked)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label htmlFor="show-contacts">Mostra Contatti Autore</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostra firma e contatti alla fine dell'articolo.
                    </p>
                  </div>
                  <div className="switch-container">
                    <Switch
                      id="show-contacts"
                      checked={article.show_author_contacts}
                      onCheckedChange={(checked) => handleInputChange('show_author_contacts', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={article.category_id.toString()}
                    onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tag</Label>
                  <Input
                    id="tags"
                    value={article.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separa i tag con virgole
                  </p>
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle>Stato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stato:</span>
                    <Badge variant={article.published ? 'default' : 'secondary'}>
                      {article.published ? 'Pubblicato' : 'Bozza'}
                    </Badge>
                  </div>
                  {article.featured && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Evidenza:</span>
                      <Badge variant="outline">In evidenza</Badge>
                    </div>
                  )}
                  {article.show_author_contacts && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contatti Autore:</span>
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        Attivi
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Parole:</span>
                    <span className="text-sm text-muted-foreground">
                      ~{article.content.replace(/(\*\*|__|#|`|\[|\]|\(|\)|!|\$)/g, '').split(' ').filter(word => word.length > 0).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                  <span className="text-sm">Caratteri:</span>
                  <span className="text-sm text-muted-foreground">
                    {article.content.replace(/(\*\*|__|#|`|\[|\]|\(|\)|!|\$)/g, '').length}
                  </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Suggerimenti</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">**grassetto**</Badge>
                  <Badge variant="secondary">*corsivo*</Badge>
                  <Badge variant="secondary">`codice`</Badge>
                  <Badge variant="secondary">[link](url)</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary"># Titolo</Badge>
                  <Badge variant="secondary">- Lista</Badge>
                  <Badge variant="secondary">&gt; Citazione</Badge>
                </div>
                <div>
                  <p className="font-medium mt-2">Formule Matematiche:</p>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
                    <code>$$E=mc^2$$</code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le formule LaTeX verranno renderizzate correttamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default ArticleEditorPage;

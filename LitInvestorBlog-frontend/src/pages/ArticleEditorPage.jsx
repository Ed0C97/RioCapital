// RioCapitalBlog-frontend/src/pages/ArticleEditorPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext.js';
import RoleGuard from '../components/RoleGuard';
import RichTextEditor from '../components/RichTextEditor';
import ImageUploader from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/card';
import {
  Save,
  Eye,
  ArrowLeft,
  CheckCircle,
  Link as LinkIcon,
  Type,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { clsx } from 'clsx';

// Reusable FilterLink component, identical to the one in ArchivePage
const FilterLink = ({ label, onClick, isActive }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={clsx(
      'flex items-center gap-3 text-sm group w-full text-left py-1.5 transition-colors duration-150',
      isActive
        ? 'text-blue-600 font-semibold'
        : 'text-gray-700 hover:text-blue-600',
    )}
  >
    <ArrowRight
      className={clsx(
        'w-4 h-4 transition-all duration-150',
        'group-hover:text-blue-600 group-hover:translate-x-1',
        isActive ? 'text-blue-600' : 'text-gray-400',
      )}
    />
    <span>{label}</span>
  </a>
);

const ArticleEditorPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [validationAttempted, setValidationAttempted] = useState(false);

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
    show_author_contacts: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories.');
    }
  };

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/id/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        toast.error('Article not found.');
        navigate('/admin/my-articles');
        return;
      }
      const data = await response.json();
      const articleData = data.article;

      if (user && !isAdmin() && articleData.author_id !== user.id) {
        toast.error("You don't have permission to edit this article.");
        navigate('/admin/my-articles');
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
        show_author_contacts: articleData.show_author_contacts || false,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('An error occurred while fetching the article.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySlug = async (slugToCopy) => {
    if (!slugToCopy || slugToCopy === 'will-be-generated-from-title') {
      toast.info('Slug has not been generated yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(slugToCopy);
      toast.success('Slug copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy slug:', err);
      toast.error('Could not copy slug.');
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
    setArticle((prev) => ({ ...prev, [field]: value }));
    if (field === 'title' && !isEditing) {
      setArticle((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleCategorySelect = (categoryId) => {
    const newCategoryId = article.category_id === categoryId ? '' : categoryId;
    handleInputChange('category_id', newCategoryId);
  };

  const validateArticle = () => {
    const errors = [];
    if (!article.title.trim()) errors.push('Title is required.');
    if (!article.slug.trim()) errors.push('Slug is required.');
    if (!article.excerpt.trim()) errors.push('Excerpt is required.');
    if (!article.content.trim()) errors.push('Content is required.');
    if (!article.category_id) errors.push('Category is required.');
    if (article.title.length > 200)
      errors.push('Title is too long (max 200 chars).');
    if (article.excerpt.length > 500)
      errors.push('Excerpt is too long (max 500 chars).');
    return errors;
  };

  const handleSave = async (publish = false) => {
    setValidationAttempted(true);

    const errors = validateArticle();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setSaving(true);
    try {
      const articleData = {
        ...article,
        published: publish,
        tags: article.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };
      const url = isEditing ? `/api/articles/${id}` : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';

      // --- CORREZIONE QUI ---
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
        credentials: 'include', // <-- RIGA AGGIUNTA
      });
      // ---------------------

      if (response.ok) {
        const data = await response.json();
        toast.success(
          isEditing
            ? 'Article updated successfully!'
            : 'Article created successfully!',
        );
        if (!isEditing) {
          navigate(`/admin/articles/edit/${data.article.id}`);
        } else {
          // Aggiorna lo stato 'published' anche nel form dopo il salvataggio
          handleInputChange('published', publish);
        }
      } else {
        const error = await response.json();
        // Mostra un messaggio più specifico se il backend lo fornisce
        toast.error(error.error || 'An error occurred while saving.');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('A network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      toast.error(
        'Could not open preview. Please disable your pop-up blocker.',
      );
      return;
    }
    const markdownComponent = (
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {article.content}
      </ReactMarkdown>
    );
    const htmlContent = ReactDOMServer.renderToString(markdownComponent);
    previewWindow.document.write(
      `<html><head><title>Preview: ${article.title}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"><link rel="stylesheet" href="/src/App.css"><style>body { font-family: sans-serif; padding: 2rem; } .article-content { max-width: 800px; margin: auto; }</style></head><body><div class="article-content"><h1>${article.title}</h1><p><em>${article.excerpt}</em></p><hr />${htmlContent}</div></body></html>`,
    );
    previewWindow.document.close();
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // Stili uniformi per Input, Textarea e RichTextEditor wrapper
  // Uso di !important (con !) per forzare l'override di stili predefiniti di Shadcn/ui o Tailwind
  const cleanInputStyle =
    '!border !border-gray-300 !bg-white focus:border-blue-500 focus:ring-blue-500';

  return (
    <RoleGuard user={user} requiredRoles={['collaborator', 'admin']}>
      <div className="bg-[#f5f5f7]">
        <div className="w-full mb-12">
          <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
            {/* Title and Line */}
            <div className="mb-8">
              <div className="border-b border-[#d2d2d7] my-2"></div>
              <h2 className="text-2xl font-regular text-gray-500">
                {isEditing ? 'Edit Article' : 'New Article'}
              </h2>
            </div>

            {/* Controls (Back and Action Buttons) */}
            <div className="flex items-center justify-between">
              <a
                href="/admin/my-articles"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin/my-articles');
                }}
                className="flex items-center text-sm text-gray-500 font-medium hover:font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </a>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handlePreview}
                  disabled={!article.title || !article.content}
                  className="btn-outline btn-outline-gray"
                >
                  <Eye className="w-4 h-4 mr-2" /> Preview
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={saving || article.published}
                  className="btn-outline btn-outline-blue"
                >
                  <Save className="w-4 h-4 mr-2" />{' '}
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={saving || !article.published}
                  className="btn-outline btn-outline-green"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />{' '}
                  {saving ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pb-16 space-y-8">
          {/* Slug and Status Section (outside cards) */}
          <div className="text-sm text-muted-foreground space-y-4">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleCopySlug(article.slug)}
              title="Copy slug"
            >
              <LinkIcon
                size={16}
                className="text-gray-400 group-hover:text-blue-600 transition-colors"
              />
              <span>
                Slug:
                <code className="font-semibold p-2 bg-gray-100 text-gray-600 group-hover:text-blue-700 transition-colors">
                  {article.slug || 'will-be-generated-from-title'}
                </code>
              </span>
            </div>
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <span className="font-semibold text-[#0071e3]">
                  {article.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Featured:</span>
                <span className="font-semibold text-[#E18528FF]">
                  {article.featured ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Contacts:</span>
                <span className="font-semibold text-[#499537FF]">
                  {article.show_author_contacts ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
          </div>

          {/* Single Card for Settings */}
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle className="text-xl">Main Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Title and Excerpt */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="title"
                      value={article.title}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      required
                      className={`pl-9 ${cleanInputStyle}`} // Applicazione dello stile pulito forzato
                    />
                  </div>
                  {validationAttempted && !article.title.trim() && (
                    <p className="text-xs text-red-500 italic mt-2">
                      Title is required.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">
                    Excerpt <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="excerpt"
                    value={article.excerpt}
                    onChange={(e) =>
                      handleInputChange('excerpt', e.target.value)
                    }
                    rows={3}
                    required
                    className={cleanInputStyle} // Applicazione dello stile pulito forzato
                  />
                  {validationAttempted && !article.excerpt.trim() && (
                    <p className="text-xs text-red-500 italic mt-2">
                      Excerpt is required.
                    </p>
                  )}
                </div>
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 w-full">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <ul className="space-y-1 pt-2">
                    {categories?.map((cat) => (
                      <li key={cat.id}>
                        <FilterLink
                          label={cat.name}
                          onClick={() => handleCategorySelect(cat.id)}
                          isActive={article.category_id === cat.id}
                        />
                      </li>
                    ))}
                  </ul>
                  {validationAttempted && !article.category_id && (
                    <p className="text-xs text-red-500 italic mt-2">
                      A category selection is required.
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start md:items-end">
                  <div className="space-y-2 w-full max-w-5xl">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="tags"
                        value={article.tags}
                        onChange={(e) =>
                          handleInputChange('tags', e.target.value)
                        }
                        placeholder="tag1, tag2"
                        className={`pl-9 ${cleanInputStyle}`} // Applicazione dello stile pulito forzato
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Published</Label>
                  <div className="switch-container">
                    <Switch
                      id="published"
                      checked={article.published}
                      onCheckedChange={(checked) =>
                        handleInputChange('published', checked)
                      }
                    />
                  </div>
                </div>
                {isAdmin() && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured</Label>
                    <div className="switch-container">
                      <Switch
                        id="featured"
                        checked={article.featured}
                        onCheckedChange={(checked) =>
                          handleInputChange('featured', checked)
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-contacts">Show Contacts</Label>
                  <div className="switch-container">
                    <Switch
                      id="show-contacts"
                      checked={article.show_author_contacts}
                      onCheckedChange={(checked) =>
                        handleInputChange('show_author_contacts', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Image Card */}
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle className="text-xl">Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Wrapper per ImageUploader per uniformità. Ho rimosso il padding dal wrapper per lasciare che ImageUploader gestisca il suo spazio interno. */}
              <div className={`rounded-lg ${cleanInputStyle}`}>
                <ImageUploader
                  currentImage={article.image_url}
                  onImageUploaded={(url) => handleInputChange('image_url', url)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Article Content Card */}
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle className="text-xl">
                Article Content <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {/* Applico lo stile direttamente al RichTextEditor (assumendo che accetti la prop className per il suo contenitore esterno) */}
              <RichTextEditor
                value={article.content}
                onChange={(content) => handleInputChange('content', content)}
                height="600px"
                className={`rounded-lg ${cleanInputStyle}`} // Applicazione dello stile pulito forzato
              />
              {validationAttempted && !article.content.trim() && (
                <p className="text-xs text-red-500 italic mt-2">
                  Content is required.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
};

export default ArticleEditorPage;

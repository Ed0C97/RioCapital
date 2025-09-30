// RioCapitalBlog-frontend/src/components/RichTextEditor.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Badge } from './ui/badge';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit,
  Type,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Scrivi il tuo articolo...',
  height = '400px'
}) => {
  const [content, setContent] = useState(value);
  const [activeTab, setActiveTab] = useState('edit');
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Caricamento immagine in corso...");

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Caricamento fallito');
      }

      const data = await response.json();
      const backendUrl = 'http://localhost:5000';
      const fullImageUrl = backendUrl + data.url;

      const markdownImage = `\n![${file.name}](${fullImageUrl})\n`;
      insertAtCursor(markdownImage);

      toast.success("Immagine inserita con successo!", { id: toastId });

    } catch (error) {
      toast.error(`Errore: ${error.message}`, { id: toastId });
      console.error(error);
    } finally {

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  const insertText = (before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newContent =
      content.substring(0, start) +
      before + textToInsert + after +
      content.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent =
      content.substring(0, start) +
      text +
      content.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Grassetto',
      action: () => insertText('**', '**', 'testo in grassetto')
    },
    {
      icon: Italic,
      label: 'Corsivo',
      action: () => insertText('*', '*', 'testo in corsivo')
    },
    {
      icon: Underline,
      label: 'Sottolineato',
      action: () => insertText('<u>', '</u>', 'testo sottolineato')
    },
    {
      icon: Heading1,
      label: 'Titolo H1',
      action: () => insertAtCursor('\n# Titolo principale\n')
    },
    {
      icon: Heading2,
      label: 'Titolo H2',
      action: () => insertAtCursor('\n## Sottotitolo\n')
    },
    {
      icon: Heading3,
      label: 'Titolo H3',
      action: () => insertAtCursor('\n### Titolo sezione\n')
    },
    {
      icon: List,
      label: 'Lista puntata',
      action: () => insertAtCursor('\n- Elemento lista\n- Altro elemento\n')
    },
    {
      icon: ListOrdered,
      label: 'Lista numerata',
      action: () => insertAtCursor('\n1. Primo elemento\n2. Secondo elemento\n')
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](https://esempio.com)', 'testo del link')
    },
    {
      icon: Image,
      label: 'Immagine',
      action: () => imageInputRef.current?.click()
    },
    {
      icon: Code,
      label: 'Codice inline',
      action: () => insertText('`', '`', 'codice')
    },
    {
      icon: Quote,
      label: 'Citazione',
      action: () => insertAtCursor('\n> Questa è una citazione\n')
    },
    {
      icon: Calculator,
      label: 'Formula LaTeX',
      action: () => insertText('$$', '$$', 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')
    }
  ];

  const renderPreview = () => {

    const contentWithLatex = (content || '').replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex, { throwOnError: false, displayMode: true });
      } catch (e) {
        return match;
      }
    });

    const finalHtml = marked(contentWithLatex);

    return { __html: finalHtml };
  };

  const insertLatexTemplate = (template) => {
    const templates = {
      fraction: '\\frac{numeratore}{denominatore}',
      sqrt: '\\sqrt{valore}',
      integral: '\\int_{a}^{b} f(x) dx',
      sum: '\\sum_{i=1}^{n} x_i',
      limit: '\\lim_{x \\to \\infty} f(x)',
      matrix: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      derivative: '\\frac{d}{dx} f(x)',
      partial: '\\frac{\\partial f}{\\partial x}'
    };

    insertText('$$', '$$', templates[template]);
  };

  return (
      <Card>
        <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />

      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Edit className="w-5 h-5" />
          <span>Editor Articolo</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent p-0 w-auto space-x-4 mb-4">
            <TabsTrigger
              value="edit"
              className="text-muted-foreground data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 pb-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              <span>Modifica</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="text-muted-foreground data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 pb-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              <span>Anteprima</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
          {/* Toolbar + Template LaTeX senza box */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-6 mb-3">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.label}
                  className="h-8 w-8 p-0"
                >
                  <button.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Template LaTeX */}
            <div className="pt-2">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-medium">Template LaTeX:</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-3">
                {[
                  { key: 'fraction', label: 'Frazione' },
                  { key: 'sqrt', label: 'Radice' },
                  { key: 'integral', label: 'Integrale' },
                  { key: 'sum', label: 'Sommatoria' },
                  { key: 'limit', label: 'Limite' },
                  { key: 'matrix', label: 'Matrice' },
                  { key: 'derivative', label: 'Derivata' },
                  { key: 'partial', label: 'Parziale' }
                ].map((template) => (
                  <Button
                    key={template.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertLatexTemplate(template.key)}
                    className="text-xs h-7 px-3"
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono resize-none shadow-none focus-visible:ring-0"
            style={{ height }}
          />
        </TabsContent>

          <TabsContent value="preview">
            <style>
              {`
                .preview-content { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; min-height: 400px; background: white; color: black; }
                .preview-content h1, .preview-content h2, .preview-content h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600; line-height: 1.3; }
                .preview-content h1 { font-size: 2rem; }
                .preview-content h2 { font-size: 1.75rem; }
                .preview-content h3 { font-size: 1.5rem; }
                .preview-content p { margin-bottom: 1rem; }
                .preview-content ul, .preview-content ol { margin-left: 1.5rem; padding-left: 1.5rem; margin-bottom: 1rem; }
                .preview-content ul { list-style-type: disc; }
                .preview-content ol { list-style-type: decimal; }
                .preview-content blockquote { border-left: 3px solid #ccc; padding-left: 1rem; margin-left: 0; font-style: italic; }
              `}
            </style>
            <div
              className="preview-content"
              dangerouslySetInnerHTML={renderPreview()}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RichTextEditor;

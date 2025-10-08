// LitInvestorBlog-frontend/src/components/ImageUploader.jsx

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const NEW_LIMIT_IN_MB = 25;
const NEW_LIMIT_IN_BYTES = NEW_LIMIT_IN_MB * 1024 * 1024;

const ImageUploader = ({
  onImageUploaded,
  currentImage = null,
  maxSize = NEW_LIMIT_IN_BYTES,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      toast.error(
        `Tipo di file non supportato. Usa: ${acceptedTypes.join(', ')}`,
      );
      return false;
    }

    if (file.size > maxSize) {
      toast.error(
        `File troppo grande. Massimo ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
      return false;
    }

    return true;
  };

  const uploadFile = async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();

        const backendUrl = import.meta.env.VITE_API_BASE_URL;
        const fullImageUrl = backendUrl + data.url;

        setPreviewUrl(fullImageUrl);
        onImageUploaded?.(fullImageUrl);

        toast.success('Immagine caricata con successo!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Errore durante il caricamento');
        setPreviewUrl(null);
        onImageUploaded?.(null);
      }
    } catch (error) {
      console.error('Errore upload:', error);
      toast.error('Errore di connessione durante il caricamento');
      setPreviewUrl(null);
      onImageUploaded?.(null);
    } finally {
      setUploading(false);

      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUploaded?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Anteprima"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="absolute top-2 right-2"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Caricamento...</p>
                  </div>
                </div>
              )}
            </div>
            {uploading && (
              <div className="mt-3">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1 text-center">
                  {uploadProgress}% completato
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`transition-colors cursor-pointer ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <CardContent className="p-8 text-center">
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <div>
                  <p className="text-lg font-medium">Caricamento in corso...</p>
                  <Progress value={uploadProgress} className="w-full mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadProgress}% completato
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-2">
                    Carica un'immagine di copertina
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Trascina qui un'immagine o clicca per selezionare
                  </p>
                  <Button variant="outline" className="mb-4">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Seleziona Immagine
                  </Button>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Formati supportati: JPEG, PNG, WebP</p>
                    <p>
                      Dimensione massima: {Math.round(maxSize / 1024 / 1024)}MB
                    </p>
                    <p>Dimensioni consigliate: 1200x630px</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {}
      {previewUrl && !uploading && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
          <Check className="w-4 h-4" />
          <span>Immagine caricata con successo</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

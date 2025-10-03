// RioCapitalBlog-frontend/src/components/ShareButton.jsx

import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link,
  Mail,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ShareButton = ({
  articleId,
  title,
  url,
  variant = "ghost",
  size = "sm",
  showText = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const shareUrl = url || `${window.location.origin}/articolo/${articleId}`;
  const shareTitle = title || 'Articolo interessante su RioCapitalBlog';

  const trackShare = async (platform) => {
    try {
      await fetch('/api/articles/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: articleId,
          platform
        }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Errore nel tracciamento della condivisione:', error);
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
        trackShare('facebook');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
        trackShare('twitter');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
        trackShare('linkedin');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;
        window.open(url, '_blank');
        trackShare('whatsapp');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-gray-600',
      action: () => {
        const subject = encodeURIComponent(shareTitle);
        const body = encodeURIComponent(`Ti consiglio di leggere questo articolo: ${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        trackShare('email');
      }
    },
    {
      name: 'Copia Link',
      icon: Link,
      color: 'text-gray-600',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copiato negli appunti!');
          trackShare('copy');
        } catch (error) {

          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success('Link copiato negli appunti!');
          trackShare('copy');
        }
      }
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoading}
        >
          <Share2 className={`w-4 h-4 ${showText ? 'mr-2' : ''}`} />
          {showText && 'Condividi'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {shareOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={option.action}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <option.icon className={`w-4 h-4 ${option.color}`} />
            <span>{option.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;

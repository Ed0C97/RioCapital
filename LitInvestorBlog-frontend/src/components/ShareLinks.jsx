// src/components/ShareLinks.jsx

import React, { useState } from 'react';
import { Facebook, Instagram, Mail, Link, Check } from 'lucide-react';
import { toast } from 'sonner';
import { SiX } from 'react-icons/si'; // icona ufficiale di X

const ShareLinks = ({ articleTitle }) => {
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedTitle = encodeURIComponent(articleTitle);
  const encodedUrl = encodeURIComponent(pageUrl);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X',
      icon: SiX, // qui usiamo l’icona di X
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com',
    },
    {
      name: 'Mail',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=Read this article: ${encodedUrl}`,
    },
  ];

  const copyLink = () => {
    navigator.clipboard
      .writeText(pageUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copiato negli appunti!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error('Impossibile copiare il link.');
        console.error('Errore copia link:', err);
      });
  };

  return (
    // --- MODIFICA 1: Allineamento a sinistra ---
    // Cambiato "justify-center" in "justify-start"
    <div className="flex justify-start items-center space-x-4">
      {shareOptions.map((option) => (
        <a
          key={option.name}
          href={option.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Condividi su ${option.name}`}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          {/* --- MODIFICA 2: Icone più piccole --- */}
          {/* Cambiato "w-6 h-6" in "w-5 h-5" */}
          <option.icon className="w-5 h-5" />
        </a>
      ))}
      <span
        onClick={copyLink}
        aria-label="Copia link"
        className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Link className="w-5 h-5" />
        )}
      </span>
    </div>
  );
};

export default ShareLinks;

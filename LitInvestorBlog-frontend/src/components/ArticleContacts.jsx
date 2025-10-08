// src/components/ArticleContacts.jsx

import React from 'react';
import { Linkedin } from 'lucide-react';

const ArticleContacts = ({ name, email, linkedinUrl }) => {
  if (!name || !email) {
    return null;
  }

  return (
    // --- MODIFICA CHIAVE: Stile della linea unificato ---
    // border-y: linea sopra e sotto, spessore 1px di default
    // border-[#d2d2d7]: colore personalizzato
    <div className="my-12 py-14 border-y border-[#d2d2d7]">
      <h3 className="text-2xl font-bold mb-7">Contatti autore</h3>

      <div className="flex flex-col">
        <div className="flex flex-col gap-0">
          <p className="font-semibold text-lg text-gray-800">{name}</p>
          <p className="text-md text-gray-600">Lit Investor</p>
          <a
            href={`mailto:${email}`}
            className="block text-blue-600 hover:underline transition-colors"
          >
            {email}
          </a>
        </div>

        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Profilo LinkedIn di ${name}`}
            className="inline-block mt-3"
          >
            <Linkedin className="w-6 h-6 text-gray-500 hover:text-blue-700 transition-colors" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ArticleContacts;

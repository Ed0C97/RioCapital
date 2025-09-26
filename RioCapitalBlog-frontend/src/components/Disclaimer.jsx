// src/components/Disclaimer.jsx

import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { ChevronDown, ChevronsRight } from 'lucide-react';

const Disclaimer = ({ variant = 'gray' }) => {

  // --- MODIFICA 1: Scegliamo il codice esadecimale del colore ---
  const backgroundColorValue = {
    gray: '#f5f5f7',
    white: '#ffffff',
  }[variant];

  return (
    // --- MODIFICA 2: Usiamo lo stile in linea per applicare il colore ---
    <div
      className="border-gray-200 text-gray-600 text-sm rounded-xl"
      style={{ backgroundColor: backgroundColorValue }}
    >
      <div className="container mx-auto px-6 py-6">
        <Collapsible>
          <div className="flex items-start justify-between">
            <p className="flex-grow pr-4">
              <span className="font-semibold">Disclaimer:</span> I contenuti di questo blog hanno esclusivamente finalità informative e non costituiscono consulenza finanziaria.
            </p>

            <CollapsibleTrigger asChild>
              <span className="flex-shrink-0 flex items-center text-[#0066cc] hover:underline cursor-pointer font-medium group">
                Continua a leggere
                <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </span>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <h3 className="font-bold text-base text-gray-800">Attenzione</h3>
              <p>
                Le informazioni contenute in questo blog hanno esclusivamente finalità informative e divulgative. I contenuti non costituiscono in alcun modo consulenza finanziaria, legale, fiscale o di altra natura professionale, né un invito o una raccomandazione all’acquisto o alla vendita di strumenti finanziari o prodotti di investimento.
              </p>
              <p>
                L’autore e/o gli eventuali collaboratori non sono responsabili per eventuali perdite, danni o conseguenze derivanti, direttamente o indirettamente, dall’utilizzo delle informazioni pubblicate. Prima di assumere decisioni di natura finanziaria o d’investimento, si raccomanda di rivolgersi a un consulente finanziario abilitato e indipendente, adeguatamente qualificato e autorizzato dalle autorità competenti.
              </p>
              <p>
                L’utilizzo dei contenuti del blog implica l’accettazione integrale del presente disclaimer.
              </p>
              <a href="/termini-e-condizioni" className="inline-flex items-center text-[#0066cc] hover:underline font-medium pt-2">
                <ChevronsRight className="w-4 h-4 mr-1" />
                Per maggiori informazioni leggere i Termini e Condizioni
              </a>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default Disclaimer;
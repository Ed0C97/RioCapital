// LitInvestorBlog-frontend/src/pages/CancelPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const CancelPage = () => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-red-500">Pagamento Annullato</h1>
    <p className="mt-4">
      La donazione è stata annullata. Puoi riprovare in qualsiasi momento.
    </p>
    <Link
      to="/donate"
      className="mt-8 inline-block bg-gray-500 text-white px-6 py-2 rounded"
    >
      Torna alla pagina delle donazioni
    </Link>
  </div>
);

export default CancelPage;

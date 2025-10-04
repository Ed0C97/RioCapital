import React from 'react';
import { Link } from 'react-router-dom';

const SuccessPage = () => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-green-500">Pagamento Riuscito!</h1>
    <p className="mt-4">Grazie mille per la tua donazione. Il tuo supporto è prezioso!</p>
    <Link to="/" className="mt-8 inline-block bg-blue-500 text-white px-6 py-2 rounded">
      Torna alla Home
    </Link>
  </div>
);

export default SuccessPage;
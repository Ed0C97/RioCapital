// src/components/GlassCardForm.jsx

import React from 'react';

// Componente SVG per il logo di default della carta, per mantenere il JSX pulito.
const DefaultCardLogo = () => (
  <svg width="48px" height="48px" viewBox="0 0 64 64">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="#FFFFFF">
        <circle cx="16" cy="16" r="16"></circle>
        <circle cx="16" cy="48" r="16"></circle>
        <circle cx="48" cy="16" r="16"></circle>
        <circle cx="48" cy="48" r="16"></circle>
      </g>
    </g>
  </svg>
);

/**
 * Componente che renderizza il form di pagamento "glassmorphism".
 * È un componente controllato: riceve lo stato della carta (cardDetails)
 * e la funzione per aggiornarlo (onCardDetailsChange) dal genitore.
 */
const GlassCardForm = ({ selectedMethod, paymentButtons, cardDetails, onCardDetailsChange }) => {

  // Determina se il metodo di pagamento selezionato è la carta di credito.
  const isCard = selectedMethod === 'card';

  // Trova i dettagli del metodo di pagamento corrente (es. icona e nome).
  const currentMethodDetails = paymentButtons.find(p => p.value === selectedMethod);
  const Icon = currentMethodDetails?.icon;

  return (
    <div className="payment-page-background">
      <div className="payment-form-wrapper">
        <div className="payment-module">
          <div className="circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
          </div>
          <h1 className="title">
            {isCard
              ? <>Inserisci i dati della tua<br/>carta di credito</>
              : <>Procedi con il pagamento<br/>sicuro</>
            }
          </h1>
          <div className="card">
            <div className="logo">
              {isCard || !Icon ? <DefaultCardLogo /> : <Icon style={{ color: 'white', width: '48px', height: '48px' }} />}
            </div>

            {/* Mostra il form completo solo se il metodo è 'card' */}
            {isCard ? (
              <>
                <div className="form-group card-number">
                  <label>Numero Carta</label>
                  <input
                    id="card-number"
                    placeholder="1234 1234 1234 1234"
                    type="text"
                    required
                    maxLength="19"
                    value={cardDetails.number}
                    onChange={onCardDetailsChange}
                  />
                  <span className="underline"></span>
                </div>
                <div className="group">
                  <div className="form-group">
                    <label>Titolare</label>
                    <input
                      id="card-name"
                      placeholder="MARIO ROSSI"
                      type="text"
                      required
                      value={cardDetails.name}
                      onChange={onCardDetailsChange}
                    />
                    <span className="underline"></span>
                  </div>
                  <div className="form-group">
                    <label>Scadenza</label>
                    <input
                      id="card-exp"
                      placeholder="10/25"
                      type="text"
                      maxLength="5"
                      required
                      value={cardDetails.exp}
                      onChange={onCardDetailsChange}
                    />
                    <span className="underline"></span>
                  </div>
                  <div className="form-group">
                    <label>CCV</label>
                    <input
                      id="card-ccv"
                      placeholder="123"
                      type="text"
                      maxLength="3"
                      required
                      value={cardDetails.ccv}
                      onChange={onCardDetailsChange}
                    />
                    <span className="underline"></span>
                  </div>
                </div>
              </>
            ) : (
              // Altrimenti, mostra un bottone generico per gli altri metodi di pagamento
              <div className="simplified-view">
                <button type="submit" className="pay-button">
                  Paga con {currentMethodDetails?.label}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassCardForm;
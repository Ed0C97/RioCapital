// src/components/GlassCardForm.jsx

import React from 'react';
import { Landmark } from 'lucide-react';

// --- Loghi SVG ---

const VisaLogo = () => (
  <svg
    width="60px"
    height="60px"
    viewBox="0 -86.5 256 256"
    preserveAspectRatio="xMidYMid"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M132.397094,56.2397455 C132.251036,44.7242808 142.65954,38.2977599 150.500511,34.4772086 C158.556724,30.5567233 161.262627,28.0430004 161.231878,24.5376253 C161.17038,19.1719416 154.805357,16.804276 148.847757,16.7120293 C138.454628,16.5505975 132.412467,19.5178668 127.607952,21.7625368 L123.864273,4.24334875 C128.684163,2.02174043 137.609033,0.084559486 146.864453,-7.10542736e-15 C168.588553,-7.10542736e-15 182.802234,10.7236802 182.879107,27.3511501 C182.963666,48.4525854 153.69071,49.6210438 153.890577,59.05327 C153.959762,61.912918 156.688728,64.964747 162.669389,65.7411565 C165.628971,66.133205 173.800493,66.433007 183.0636,62.1665965 L186.699658,79.11693 C181.718335,80.931115 175.314876,82.6684285 167.343223,82.6684285 C146.895202,82.6684285 132.512402,71.798691 132.397094,56.2397455 M221.6381,81.2078555 C217.671491,81.2078555 214.327548,78.8940005 212.836226,75.342502 L181.802894,1.24533061 L203.511621,1.24533061 L207.831842,13.1835926 L234.360459,13.1835926 L236.866494,1.24533061 L256,1.24533061 L239.303345,81.2078555 L221.6381,81.2078555 M224.674554,59.6067505 L230.939643,29.5804456 L213.781755,29.5804456 L224.674554,59.6067505 M106.076031,81.2078555 L88.9642665,1.24533061 L109.650591,1.24533061 L126.754669,81.2078555 L106.076031,81.2078555 M75.473185,81.2078555 L53.941265,26.7822953 L45.2316377,73.059396 C44.2092367,78.2252115 40.1734431,81.2078555 35.6917903,81.2078555 L0.491982464,81.2078555 L0,78.886313 C7.22599245,77.318119 15.4359498,74.7890215 20.409585,72.083118 C23.4537265,70.4303645 24.322383,68.985166 25.3217224,65.0569935 L41.8185094,1.24533061 L63.68098,1.24533061 L97.1972855,81.2078555 L75.473185,81.2078555"
        fill="#ffffff"
        transform="translate(128.000000, 41.334214) scale(1, -1) translate(-128.000000, -41.334214)"
      ></path>
    </g>
  </svg>
);

const MastercardLogo = () => (
  <svg width="60px" height="60px" viewBox="0 0 24 24">
    <g fill="none" fillRule="evenodd">
      <circle cx="7" cy="12" r="7" fill="#EA001B" />
      <circle cx="17" cy="12" r="7" fill="#FFA200" fillOpacity=".8" />
    </g>
  </svg>
);

const DefaultCardLogo = () => (
  <Landmark color="white" size={48} />
);

/**
 * Componente che renderizza il form di pagamento "glassmorphism".
 */
const GlassCardForm = ({
  selectedMethod,
  paymentButtons,
  cardDetails,
  onCardDetailsChange,
  cardType,
  customAmount,
  onCustomAmountChange
}) => {
  const isCard = selectedMethod === 'card';
  const currentMethodDetails = paymentButtons.find(p => p.value === selectedMethod);
  const Icon = currentMethodDetails ? currentMethodDetails.icon : null;

  const logos = {
    visa: <VisaLogo />,
    mastercard: <MastercardLogo />,
    default: <DefaultCardLogo />
  };

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
            <div className="logo" key={cardType + selectedMethod}>
              {isCard
                ? logos[cardType]
                : (Icon ? <Icon style={{ color: 'white', width: '48px', height: '48px' }} /> : <DefaultCardLogo />)
              }
            </div>

            <div className="absolute top-8 right-8">
              <div className="flex items-baseline justify-end">
                {customAmount.length < 7 ? (
                  <> {/* Usiamo un Fragment (<>) per raggruppare i due elementi */}
                    {/* 1. Simbolo Euro (ora è DENTRO la condizione) */}
                    <span
                      className={`
                        text-xl font-mono transition-colors duration-300
                        ${customAmount && parseFloat(customAmount) > 0 ? 'text-white' : 'text-white/50'}
                      `}
                    >
                      €
                    </span>

                    {/* 2. Input */}
                    <input
                      id="card-custom-amount"
                      type="text"
                      value={customAmount}
                      onChange={onCustomAmountChange}
                      placeholder="0"
                      className="bg-transparent border-none outline-none p-0 text-right
                                 font-mono text-5xl font-bold text-white ml-1 w-auto"
                      style={{
                        width: `${customAmount.length + 1}ch`,
                        minWidth: '2ch' // Imposta una larghezza minima per il placeholder
                      }}
                    />
                  </>
                ) : (
                  // La Gag ora è l'unica cosa mostrata quando la condizione è falsa
                  <div
                    key={customAmount}
                    className="font-mono text-3xl font-bold text-white ml-2 animate-pulse cursor-pointer"
                    onClick={() => onCustomAmountChange({ target: { value: '' } })}
                  >
                    Se vabbè...
                  </div>
                )}
              </div>
            </div>

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
              currentMethodDetails && (
                <div className="simplified-view">
                  <button type="submit" className="pay-button">
                    Paga con {currentMethodDetails.label}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassCardForm;
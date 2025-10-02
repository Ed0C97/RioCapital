// RioCapitalBlog-frontend/src/pages/DonatePage.jsx
import { cn } from "@/lib/utils"
import GlassCardForm from '../components/GlassCardForm';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'; // <-- RIGA AGGIUNTA/MODIFICATA
import { Textarea } from '../components/ui/textarea';
import {
  Heart,
  Coffee,
  Gift,
  Star,
  Info,
  Beer,
  GraduationCap,
  Check // <-- AGGIUNGI QUESTA
} from 'lucide-react';
import { SiApplepay, SiGooglepay, SiPaypal, SiSamsungpay } from 'react-icons/si';
import { FaCreditCard } from 'react-icons/fa';

const DonatePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    anonymous: false
  });
  // --- STATO INIZIALE AGGIORNATO ---
  const [paymentMethod, setPaymentMethod] = useState('card'); // Default su 'card'
  const [cardType, setCardType] = useState('default');

  // Nuovo stato per i dati della carta
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    exp: '',  // Corrisponde a id="card-exp"
    ccv: ''   // Corrisponde a id="card-ccv"
  });

  const predefinedAmounts = [
    { value: '5', icon: Coffee, title: 'Un caffè', subtitle: '(a Venezia)' },
    { value: '10', icon: Beer, title: 'Una birretta', subtitle: 'Offro io!' },
    { value: '20', icon: Gift, title: 'Compleanno', subtitle: 'Un regalo per me' },
    { value: '50', icon: GraduationCap, title: 'Laurea', subtitle: 'Finalmente Dottore' }
  ];

  const getCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (cleaned.startsWith('4')) {
      return 'visa';
    }

    const mastercardPrefixes = ['51', '52', '53', '54', '55'];
    if (mastercardPrefixes.some(prefix => cleaned.startsWith(prefix))) {
      return 'mastercard';
    }

    const mcRangePrefix = parseInt(cleaned.substring(0, 4));
    if (mcRangePrefix >= 2221 && mcRangePrefix <= 2720) {
      return 'mastercard';
    }

    return 'default';
  };

  // --- NUOVA LISTA DI METODI DI PAGAMENTO ---
  const paymentButtons = [
    { value: 'card', label: 'Carta di Credito/Debito', icon: FaCreditCard, selectedClass: 'selected-card' },
    { value: 'paypal', label: 'PayPal', icon: SiPaypal, selectedClass: 'selected-paypal' },
    { value: 'google', label: 'Google Pay', icon: SiGooglepay, selectedClass: 'selected-google' },
    { value: 'apple', label: 'Apple Pay', icon: SiApplepay, selectedClass: 'selected-apple' },
    { value: 'samsung', label: 'Samsung Pay', icon: SiSamsungpay, selectedClass: 'selected-samsung' }
];

  const handleAmountSelect = (amount) => {
    // Converte il valore in un numero con due decimali (es. "5" -> "5.00")
    const formattedAmount = parseFloat(amount).toFixed(2);
    setCustomAmount(formattedAmount); // Imposta l'importo nel campo personalizzato
    setSelectedAmount(''); // Pulisce il vecchio stato (non più necessario)
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Questa regex previene l'uso della virgola e limita a 2 decimali
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount('');
    }
  };

  useEffect(() => {
  if (user && user.email) {
    setDonorInfo(prevInfo => ({
      ...prevInfo,
      email: user.email
    }));
  }
}, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonorInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCustomAmountBlur = (e) => {
    const value = e.target.value;
    // Se l'utente ha scritto qualcosa (es. "10"), lo formatta in "10.00"
    if (value) {
      const formattedValue = parseFloat(value).toFixed(2);
      setCustomAmount(formattedValue);
    }
  };

  const handleCardInputChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('card-', ''); // Ottiene 'number', 'name', 'exp', 'ccv'

    let processedValue = value;

    // Applica la formattazione specifica per ogni campo
    switch (key) {
      case 'number':
        processedValue = value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
        // --- RIGHE DA AGGIUNGERE ---
        const detectedType = getCardType(processedValue);
        setCardType(detectedType);
        // -------------------------
        break;
      case 'exp':
        // Permette solo numeri e aggiunge uno slash dopo il mese
        const cleaned = value.replace(/[^\d]/g, '');
        if (cleaned.length >= 3) {
          processedValue = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        } else {
          processedValue = cleaned;
        }
        break;
      case 'ccv':
        // Permette solo numeri
        processedValue = value.replace(/[^\d]/g, '');
        break;
      case 'name':
        // Permette lettere e spazi, convertendo in maiuscolo per estetica
        processedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
        break;
      default:
        processedValue = value;
    }

    // Aggiorna lo stato usando la 'key' dinamica
    setCardDetails(prevDetails => ({
      ...prevDetails,
      [key]: processedValue
    }));
  };

  const getFinalAmount = () => {
    return customAmount || selectedAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = getFinalAmount();

    if (!donorInfo.email || !/\S+@\S+\.\S+/.test(donorInfo.email)) {
    toast.error('Inserisci un indirizzo email valido per la ricevuta.');
    return; // Blocca l'invio del form se l'email non è valida
  }

    if (!paymentMethod) {
      toast.error('Seleziona un metodo di pagamento');
      return;
    }
    if (!amount || parseFloat(amount) < 1) {
      toast.error('Inserisci un importo valido (minimo 1€)');
      return;
    }

    setLoading(true);

    try {
      const donationData = {
        amount: parseFloat(amount),
        donor_name: donorInfo.anonymous ? 'Donatore Anonimo' : donorInfo.name,
        donor_email: donorInfo.email,
        message: donorInfo.message,
        payment_method: paymentMethod,
        anonymous: donorInfo.anonymous
      };

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (response.ok) {
        toast.success('Grazie per la tua donazione! Stai per essere reindirizzato al pagamento.');
        setTimeout(() => {
          toast.info('Funzionalità di pagamento in fase di implementazione.');
        }, 1500);

        setSelectedAmount('');
        setCustomAmount('');
        setDonorInfo({
          name: '',
          email: '',
          message: '',
          anonymous: false
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Errore durante l\'elaborazione della donazione.');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(-70deg, #202020, #000000)'
      }}
    >
      {/* Header Section */}
      <div className="w-full mb-12">
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
          <div className="mb-8">
            <div className="border-b border-[#d2d2d7] my-2"></div>
            {/* CORREZIONE #3: Cambiato il colore del titolo in bianco per leggibilità */}
            <h2 className="text-2xl font-regular text-white"> {/* <-- da text-gray-500 a text-white */}
              Sostieni RioCapitalBlog
            </h2>
          </div>
          {/* CORREZIONE #4: Cambiato il colore del paragrafo in grigio chiaro */}
          <p className="text-gray-300 text-center space-y-2">
            Le tue donazioni ci permettono di mantenere <strong>Lit Investor Blog</strong> completamente gratuito, senza pubblicità invasive e sempre ricco di contenuti di qualità.
            Grazie al tuo contributo, possiamo continuare a offrirti <strong>analisi approfondite, guide pratiche e aggiornamenti costanti</strong> sul mondo degli investimenti.
            <strong>Ogni piccolo gesto conta:</strong> ogni donazione fa davvero la differenza!

            <br /><br />

            <strong>Disclaimer sulla privacy dei pagamenti:</strong>
            Ti assicuriamo che tutte le donazioni sono <strong>completamente anonime</strong>.
            Non raccoglieremo né conserveremo mai i tuoi dati di pagamento.
            Il tuo supporto ci aiuta a crescere, ma <strong>la tua privacy è sempre al primo posto</strong>.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pb-16">
        <div>
          {/* Donation Form Card */}
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Fai una Donazione</span>
              </CardTitle>
              <CardDescription>
                Scegli l'importo e il metodo di pagamento che preferisci.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Amount Selection */}
                <div className="space-y-4">
                  <Label className="font-medium">Scegli l'importo</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {predefinedAmounts.map((amount) => {
                    const Icon = amount.icon;
                    // Controlliamo se questa opzione è quella attualmente selezionata
                    const isSelected = parseFloat(customAmount) === parseFloat(amount.value);

                    return (
                      // Usiamo un div al posto del Button per un look pulito
                      <div
                        key={amount.value}
                        onClick={() => handleAmountSelect(amount.value)}
                        role="button" // Importante per l'accessibilità
                        tabIndex="0"  // Permette la navigazione con la tastiera
                        className={`
                          flex flex-col items-center justify-center p-4 
                          cursor-pointer transition-transform duration-200 hover:scale-105
                          ${isSelected ? 'text-primary' : 'text-gray-500'}
                        `}
                      >
                        {/* 1. Icona grande */}
                        <Icon className="w-12 h-12" />

                        {/* 2. Scritta in stampatello attaccata sotto */}
                        <div className="mt-2 uppercase font-semibold text-xs tracking-wider">
                          {amount.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
                  <div>
                    <Label
                      htmlFor="custom-amount"
                      className="text-sm text-muted-foreground"
                    >
                      Oppure inserisci un importo personalizzato
                    </Label>

                    <div className="relative mt-2 w-1/3">
                      <span
                        className={cn(
                          "absolute left-3 top-1/2 transform -translate-y-1/2 font-bold text-xl transition-colors",
                          customAmount ? "text-[#0071e3]" : "text-muted-foreground"
                        )}
                      >
                        €
                      </span>

                      <Input
                        id="custom-amount"
                        type="text"
                        inputMode="decimal"
                        min="1"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        onBlur={handleCustomAmountBlur}
                        placeholder="0.00"
                        className="!pl-10 underline-input text-left !text-xl font-bold !text-[#0071e3]"
                      />
                    </div>
                  </div>
                  {/* --- FINE BLOCCO INPUT MANUALE --- */}
                </div>
                {/* --- SEZIONE METODO DI PAGAMENTO CORRETTA --- */}
                <div className="space-y-6">
                  <Label className="font-medium">1. Scegli il metodo di pagamento</Label>

                  {/* Selettore Classico (RIPRISTINATO) */}
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                    {paymentButtons.map((method) => {
                      const isSelected = paymentMethod === method.value;
                      return (
                        <Label
                          key={method.value}
                          htmlFor={method.value}
                          className={`
                            flex items-center space-x-4 p-2 cursor-pointer rounded-md transition-all
                            hover:bg-white/10
                            ${isSelected ? 'text-primary font-bold' : 'text-gray-400'}
                          `}
                        >
                          {/* 1. Nascondiamo il radio button originale, ma lo teniamo per la funzionalità */}
                          <RadioGroupItem value={method.value} id={method.value} className="sr-only" />

                          {/* 2. Creiamo il nostro selettore personalizzato (un checkmark) */}
                          <div className="w-6 h-6 flex items-center justify-center">
                            {isSelected && <Check className="h-5 w-5 text-primary" />}
                          </div>

                          {/* 3. Icona del metodo di pagamento */}
                          <method.icon className={`w-6 h-6 transition-colors ${isSelected ? 'text-primary' : 'text-gray-500'}`} />

                          {/* 4. Nome del metodo di pagamento */}
                          <span>{method.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>

                  {/* Il componente del form viene chiamato DOPO il selettore */}
                  <GlassCardForm
                    selectedMethod={paymentMethod}
                    paymentButtons={paymentButtons}
                    cardDetails={cardDetails}
                    onCardDetailsChange={handleCardInputChange}
                    cardType={cardType} // <-- RIGA DA AGGIUNGERE
                  />
                </div>
                {/* --- FINE SEZIONE --- */}

                {/* Donor Info */}
                <div className="space-y-4">
                    <Label className="font-medium flex items-center gap-2"> {/* Testo etichetta nero/default */}
                        <Info size={16} />
                        Informazioni (opzionali)
                    </Label>
                    <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        {/* Assicurati che la classe sia qui */}
                        <Input id="name" name="name" value={donorInfo.name} onChange={handleInputChange} placeholder="Il tuo nome" disabled={donorInfo.anonymous} className="underline-input" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-muted-foreground">(per la ricevuta)</span></Label>
                        {/* Assicurati che la classe sia qui */}
                        <Input id="email" name="email" type="email" value={donorInfo.email} onChange={handleInputChange} placeholder="la-tua-email@esempio.com" className="underline-input" disabled={!!user} />
                    </div>
                    </div>
                    <div className="space-y-2 mt-10">
                    <Label htmlFor="message">Messaggio</Label>
                    {/* Assicurati che la classe sia qui */}
                    <Textarea id="message" name="message" value={donorInfo.message} onChange={handleInputChange} placeholder="Lascia un messaggio di supporto..." rows={3} className="underline-input" />
                    </div>
                    <div className="flex items-center space-x-2">
                    <input type="checkbox" id="anonymous" name="anonymous" checked={donorInfo.anonymous} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <Label htmlFor="anonymous" className="cursor-pointer">Voglio fare una donazione anonima</Label>
                    </div>
                </div>

                {/* Summary & Submit */}
                {getFinalAmount() && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-muted">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">Importo Totale:</span>
                      <span className="text-3xl font-bold text-[#0071e3]">€ {getFinalAmount()}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading || !getFinalAmount()} className="w-full md:w-auto" size="lg">
                    <Heart className="w-4 h-4 mr-2" />
                    <span>{loading ? 'Elaborazione...' : `Dona Ora €${getFinalAmount() || '0'}`}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
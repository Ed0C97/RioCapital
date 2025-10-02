// RioCapitalBlog-frontend/src/pages/DonatePage.jsx

import GlassCardForm from '../components/GlassCardForm';
import React, { useState } from 'react';
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
} from 'lucide-react';
import { SiApplepay, SiGooglepay, SiPaypal, SiSamsungpay } from 'react-icons/si';
import { FaCreditCard } from 'react-icons/fa';

const DonatePage = () => {
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

  // Nuovo stato per i dati della carta
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    exp: '',  // Corrisponde a id="card-exp"
    ccv: ''   // Corrisponde a id="card-ccv"
  });

  const predefinedAmounts = [
    { value: '5', label: '5€', description: 'Un caffè', icon: Coffee },
    { value: '10', label: '10€', description: 'Supporto', icon: Heart },
    { value: '25', label: '25€', description: 'Sostenitore', icon: Gift },
    { value: '50', label: '50€', description: 'Sponsor', icon: Star }
  ];

  // --- NUOVA LISTA DI METODI DI PAGAMENTO ---
  const paymentButtons = [
    { value: 'card', label: 'Carta di Credito/Debito', icon: FaCreditCard, selectedClass: 'selected-card' },
    { value: 'paypal', label: 'PayPal', icon: SiPaypal, selectedClass: 'selected-paypal' },
    { value: 'google', label: 'Google Pay', icon: SiGooglepay, selectedClass: 'selected-google' },
    { value: 'apple', label: 'Apple Pay', icon: SiApplepay, selectedClass: 'selected-apple' },
    { value: 'samsung', label: 'Samsung Pay', icon: SiSamsungpay, selectedClass: 'selected-samsung' }
];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
      if (value) {
        setSelectedAmount('');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonorInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCardInputChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('card-', ''); // Ottiene 'number', 'name', 'exp', 'ccv'

    let processedValue = value;

    // Applica la formattazione specifica per ogni campo
    switch (key) {
      case 'number':
        // Permette solo numeri e aggiunge uno spazio ogni 4 cifre
        processedValue = value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
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
    <div className="bg-[#f5f5f7]">
      {/* Header Section */}
      <div className="w-full mb-12">
        <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] pt-12">
          <div className="mb-8">
            <div className="border-b border-[#d2d2d7] my-2"></div>
            <h2 className="text-2xl font-regular text-gray-500">
              Sostieni RioCapitalBlog
            </h2>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Le tue donazioni ci aiutano a mantenere RioCapitalBlog gratuito, senza pubblicità e ricco di contenuti di qualità. Ogni contributo fa la differenza.
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
                      return (
                        <Button
                          key={amount.value}
                          type="button"
                          variant={selectedAmount === amount.value ? "default" : "outline"}
                          className="h-auto p-4 flex flex-col items-center space-y-2"
                          onClick={() => handleAmountSelect(amount.value)}
                        >
                          <Icon className="w-5 h-5" />
                          <div className="text-center">
                            <div className="font-bold">{amount.label}</div>
                            <div className="text-xs opacity-70">{amount.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  <div>
                    <Label htmlFor="custom-amount" className="text-sm text-muted-foreground">Oppure inserisci un importo personalizzato</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                      <Input
                        id="custom-amount"
                        type="text"
                        inputMode="decimal"
                        min="1"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                {/* --- SEZIONE METODO DI PAGAMENTO CORRETTA --- */}
                <div className="space-y-6">
                  <Label className="font-medium">1. Scegli il metodo di pagamento</Label>

                  {/* Selettore Classico (RIPRISTINATO) */}
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                    {paymentButtons.map((method) => (
                      <Label key={method.value} htmlFor={method.value} className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors">
                        <RadioGroupItem value={method.value} id={method.value} />
                        <method.icon className="w-5 h-5 text-muted-foreground" />
                        <span>{method.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>

                  {/* Il componente del form viene chiamato DOPO il selettore */}
                  <GlassCardForm
                    selectedMethod={paymentMethod}
                    paymentButtons={paymentButtons}
                    cardDetails={cardDetails}
                    onCardDetailsChange={handleCardInputChange}
                  />
                </div>
                {/* --- FINE SEZIONE --- */}

                {/* Donor Info */}
                <div className="space-y-4">
                   <Label className="font-medium flex items-center gap-2">
                      <Info size={16} />
                      Informazioni (opzionali)
                   </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" name="name" value={donorInfo.name} onChange={handleInputChange} placeholder="Il tuo nome" disabled={donorInfo.anonymous} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-muted-foreground">(per la ricevuta)</span></Label>
                      <Input id="email" name="email" type="email" value={donorInfo.email} onChange={handleInputChange} placeholder="la-tua-email@esempio.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Messaggio</Label>
                    <Textarea id="message" name="message" value={donorInfo.message} onChange={handleInputChange} placeholder="Lascia un messaggio di supporto..." rows={3} />
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
                      <span className="text-3xl font-bold RioCapitalBlog-text-gradient">€{getFinalAmount()}</span>
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
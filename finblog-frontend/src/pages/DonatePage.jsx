// finblog-frontend/src/pages/DonatePage.jsx

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Heart,
  Coffee,
  Gift,
  Star,
  Users,
  TrendingUp,
  Shield,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [paymentMethod, setPaymentMethod] = useState('card');

  const predefinedAmounts = [
    { value: '5', label: '5€', description: 'Un caffè', icon: Coffee },
    { value: '10', label: '10€', description: 'Supporto base', icon: Heart },
    { value: '25', label: '25€', description: 'Sostenitore', icon: Gift },
    { value: '50', label: '50€', description: 'Sponsor', icon: Star }
  ];

  const paymentMethods = [
    { value: 'card', label: 'Carta di Credito/Debito', icon: CreditCard },
    { value: 'paypal', label: 'PayPal', icon: Smartphone },
    { value: 'bank', label: 'Bonifico Bancario', icon: Banknote }
  ];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonorInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getFinalAmount = () => {
    return customAmount || selectedAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = getFinalAmount();

    if (!amount || parseFloat(amount) < 1) {
      toast.error('Inserisci un importo valido (minimo 1€)');
      return;
    }

    setLoading(true);

    try {
      const donationData = {
        amount: parseFloat(amount),
        donor_name: donorInfo.anonymous ? null : donorInfo.name,
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
        const data = await response.json();
        toast.success('Grazie per la tua donazione! Stai per essere reindirizzato al pagamento.');

        setTimeout(() => {
          toast.info('Funzionalità di pagamento in fase di implementazione');
        }, 2000);

        setSelectedAmount('');
        setCustomAmount('');
        setDonorInfo({
          name: '',
          email: '',
          message: '',
          anonymous: false
        });
      } else {
        toast.error('Errore durante l\'elaborazione della donazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: Users,
      label: 'Donatori',
      value: '1,234',
      description: 'Persone che ci supportano'
    },
    {
      icon: TrendingUp,
      label: 'Raccolti',
      value: '€15,678',
      description: 'Totale donazioni ricevute'
    },
    {
      icon: Heart,
      label: 'Articoli Gratuiti',
      value: '500+',
      description: 'Contenuti sempre accessibili'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 finblog-text-gradient">Sostieni FinBlog</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Le tue donazioni ci aiutano a mantenere FinBlog gratuito, senza pubblicità e ricco di contenuti di qualità.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 finblog-gradient rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="font-medium mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Perché Donare?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Contenuti Gratuiti</h4>
                  <p className="text-sm text-muted-foreground">
                    Manteniamo tutti i nostri articoli accessibili gratuitamente
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Senza Pubblicità</h4>
                  <p className="text-sm text-muted-foreground">
                    Nessuna pubblicità invasiva che disturbi la lettura
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Qualità Garantita</h4>
                  <p className="text-sm text-muted-foreground">
                    Investiamo in ricerca e contenuti di alta qualità
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Indipendenza</h4>
                  <p className="text-sm text-muted-foreground">
                    Manteniamo la nostra indipendenza editoriale
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donatori Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marco R.</span>
                  <Badge variant="secondary">€25</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Donatore Anonimo</span>
                  <Badge variant="secondary">€10</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Laura B.</span>
                  <Badge variant="secondary">€50</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Giuseppe V.</span>
                  <Badge variant="secondary">€15</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Fai una Donazione</span>
              </CardTitle>
              <CardDescription>
                Scegli l'importo e il metodo di pagamento che preferisci
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selezione importo */}
                <div className="space-y-4">
                  <Label>Scegli l'importo</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount.value}
                        type="button"
                        variant={selectedAmount === amount.value ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={() => handleAmountSelect(amount.value)}
                      >
                        <amount.icon className="w-5 h-5" />
                        <div className="text-center">
                          <div className="font-bold">{amount.label}</div>
                          <div className="text-xs opacity-70">{amount.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Oppure inserisci un importo personalizzato</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                      <Input
                        id="custom-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="space-y-4">
                  <Label>Metodo di pagamento</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {paymentMethods.map((method) => (
                      <div key={method.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={method.value} id={method.value} />
                        <Label htmlFor={method.value} className="flex items-center space-x-2 cursor-pointer">
                          <method.icon className="w-4 h-4" />
                          <span>{method.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {}
                <div className="space-y-4">
                  <Label>Informazioni (opzionali)</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        name="name"
                        value={donorInfo.name}
                        onChange={handleInputChange}
                        placeholder="Il tuo nome"
                        disabled={donorInfo.anonymous}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={donorInfo.email}
                        onChange={handleInputChange}
                        placeholder="la-tua-email@esempio.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Messaggio (opzionale)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={donorInfo.message}
                      onChange={handleInputChange}
                      placeholder="Lascia un messaggio di supporto..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      name="anonymous"
                      checked={donorInfo.anonymous}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer">
                      Donazione anonima
                    </Label>
                  </div>
                </div>

                {}
                {getFinalAmount() && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Importo donazione:</span>
                        <span className="text-2xl font-bold">€{getFinalAmount()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || !getFinalAmount()}
                    className="flex items-center space-x-2"
                    size="lg"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{loading ? 'Elaborazione...' : 'Dona Ora'}</span>
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

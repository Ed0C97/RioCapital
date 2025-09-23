// RioCapitalBlog-frontend/src/pages/DonationsPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import RoleGuard from '../components/RoleGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  CreditCard,
  TrendingUp,
  Heart,
  Gift,
  Users,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const DonationsPage = () => {
  const { user, isAdmin } = useAuth();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    averageAmount: 0,
    thisMonth: 0,
    thisMonthAmount: 0,
    topDonor: null
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    filterDonations();
    calculateStats();
  }, [donations, searchTerm, statusFilter, timeFilter]);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/donations/list', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle donazioni:', error);
      toast.error('Errore nel caricamento delle donazioni');
    } finally {
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];

    if (searchTerm) {
      filtered = filtered.filter(donation =>
        donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(donation => donation.status === statusFilter);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (timeFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      if (timeFilter !== 'all') {
        filtered = filtered.filter(donation =>
          new Date(donation.created_at) >= filterDate
        );
      }
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredDonations(filtered);
  };

  const calculateStats = () => {
    const total = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const averageAmount = total > 0 ? totalAmount / total : 0;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthDonations = donations.filter(d =>
      new Date(d.created_at) >= thisMonth
    );
    const thisMonthCount = thisMonthDonations.length;
    const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    const donorAmounts = {};
    donations.forEach(d => {
      if (d.donor_email && !d.anonymous) {
        donorAmounts[d.donor_email] = (donorAmounts[d.donor_email] || 0) + d.amount;
      }
    });

    const topDonorEmail = Object.keys(donorAmounts).reduce((a, b) =>
      donorAmounts[a] > donorAmounts[b] ? a : b, null
    );

    const topDonor = topDonorEmail ? {
      email: topDonorEmail,
      amount: donorAmounts[topDonorEmail],
      name: donations.find(d => d.donor_email === topDonorEmail)?.donor_name
    } : null;

    setStats({
      total,
      totalAmount,
      averageAmount,
      thisMonth: thisMonthCount,
      thisMonthAmount,
      topDonor
    });
  };

  const exportDonations = async (format = 'csv') => {
    try {
      const response = await fetch(`/api/donations/export?format=${format}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donazioni-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Export completato');
      }
    } catch (error) {
      console.error('Errore export:', error);
      toast.error('Errore durante l\'export');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completata</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">In attesa</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallita</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Rimborsata</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'paypal':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 RioCapitalBlog-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-muted-foreground">Caricamento donazioni...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span>Gestione Donazioni</span>
            </h1>
            <p className="text-muted-foreground">
              Visualizza e gestisci tutte le donazioni ricevute
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => exportDonations('csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportDonations('xlsx')}
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta Excel
            </Button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Totale Donazioni</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Importo Totale</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Media Donazione</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.averageAmount)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Questo Mese</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.thisMonthAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.thisMonth} donazioni
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        {stats.topDonor && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Top Donatore</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {stats.topDonor.name || 'Donatore Anonimo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.topDonor.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.topDonor.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Totale donato
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cerca per nome, email o messaggio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="completed">Completate</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="failed">Fallite</SelectItem>
                  <SelectItem value="refunded">Rimborsate</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutto il tempo</SelectItem>
                  <SelectItem value="today">Oggi</SelectItem>
                  <SelectItem value="week">Ultima settimana</SelectItem>
                  <SelectItem value="month">Ultimo mese</SelectItem>
                  <SelectItem value="year">Ultimo anno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {}
        {filteredDonations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {donations.length === 0
                    ? 'Nessuna donazione ancora'
                    : 'Nessuna donazione trovata'
                  }
                </h3>
                <p className="text-muted-foreground">
                  {donations.length === 0
                    ? 'Le donazioni appariranno qui quando ricevute'
                    : 'Prova a modificare i filtri di ricerca'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredDonations.length} donazioni trovate
              </p>
            </div>

            {filteredDonations.map((donation) => (
              <Card key={donation.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {donation.anonymous
                            ? 'Donatore Anonimo'
                            : donation.donor_name || 'Nome non fornito'
                          }
                        </h3>
                        {!donation.anonymous && donation.donor_email && (
                          <p className="text-sm text-muted-foreground">
                            {donation.donor_email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatCurrency(donation.amount)}
                      </div>
                      {getStatusBadge(donation.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(donation.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getPaymentMethodIcon(donation.payment_method)}
                        <span className="capitalize">{donation.payment_method}</span>
                      </div>
                    </div>

                    {donation.transaction_id && (
                      <div className="text-xs font-mono">
                        ID: {donation.transaction_id}
                      </div>
                    )}
                  </div>

                  {donation.message && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm italic">
                        "{donation.message}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default DonationsPage;

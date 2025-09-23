// RioCapitalBlog-frontend/src/pages/CommentModerationPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RoleGuard from '../components/RoleGuard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  Flag,
  Eye,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

const CommentModerationPage = () => {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedComments, setSelectedComments] = useState([]);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    filterComments();
  }, [comments, searchTerm, statusFilter]);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments/moderate', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei commenti:', error);
      toast.error('Errore nel caricamento dei commenti');
    } finally {
      setLoading(false);
    }
  };

  const filterComments = () => {
    let filtered = [...comments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(comment => comment.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(comment =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.article?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredComments(filtered);
  };

  const moderateComment = async (commentId, action, reason = '') => {
    try {
      const response = await fetch(`/api/comments/${commentId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment =>
          comment.id === commentId
            ? { ...comment, status: data.status, moderation_reason: reason }
            : comment
        ));

        const actionText = {
          approve: 'approvato',
          reject: 'rifiutato',
          delete: 'eliminato'
        };

        toast.success(`Commento ${actionText[action]}`);
      } else {
        toast.error('Errore durante la moderazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    }
  };

  const moderateMultiple = async (action) => {
    if (selectedComments.length === 0) {
      toast.error('Seleziona almeno un commento');
      return;
    }

    try {
      const response = await fetch('/api/comments/moderate-bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_ids: selectedComments,
          action,
          reason: moderationReason
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment =>
          selectedComments.includes(comment.id)
            ? { ...comment, status: data.status, moderation_reason: moderationReason }
            : comment
        ));

        setSelectedComments([]);
        setModerationReason('');

        const actionText = {
          approve: 'approvati',
          reject: 'rifiutati',
          delete: 'eliminati'
        };

        toast.success(`${selectedComments.length} commenti ${actionText[action]}`);
      } else {
        toast.error('Errore durante la moderazione multipla');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    }
  };

  const toggleCommentSelection = (commentId) => {
    setSelectedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredComments.map(comment => comment.id);
    setSelectedComments(visibleIds);
  };

  const clearSelection = () => {
    setSelectedComments([]);
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
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approvato</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rifiutato</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />In attesa</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStats = () => {
    const total = comments.length;
    const pending = comments.filter(c => c.status === 'pending').length;
    const approved = comments.filter(c => c.status === 'approved').length;
    const rejected = comments.filter(c => c.status === 'rejected').length;
    const reported = comments.filter(c => c.reported).length;

    return { total, pending, approved, rejected, reported };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 RioCapitalBlog-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <p className="text-muted-foreground">Caricamento commenti...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard user={user} requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
            <MessageSquare className="w-8 h-8" />
            <span>Moderazione Commenti</span>
          </h1>
          <p className="text-muted-foreground">
            Gestisci e modera i commenti degli utenti
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Totale</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">In attesa</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approvati</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rifiutati</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.reported}</div>
              <div className="text-sm text-muted-foreground">Segnalati</div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cerca commenti, utenti o articoli..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i commenti</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="approved">Approvati</SelectItem>
                  <SelectItem value="rejected">Rifiutati</SelectItem>
                  <SelectItem value="reported">Segnalati</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {}
            {selectedComments.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {selectedComments.length} commenti selezionati
                    </span>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Deseleziona tutto
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => moderateMultiple('approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approva
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => moderateMultiple('reject')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rifiuta
                    </Button>
                  </div>
                </div>

                <Textarea
                  placeholder="Motivo della moderazione (opzionale)"
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {}
        {filteredComments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {comments.length === 0
                    ? 'Nessun commento da moderare'
                    : 'Nessun commento trovato'
                  }
                </h3>
                <p className="text-muted-foreground">
                  {comments.length === 0
                    ? 'Tutti i commenti sono stati moderati'
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
                {filteredComments.length} commenti trovati
              </p>
              <Button variant="outline" size="sm" onClick={selectAllVisible}>
                Seleziona tutti visibili
              </Button>
            </div>

            {filteredComments.map((comment) => (
              <Card key={comment.id} className={`${
                selectedComments.includes(comment.id) ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => toggleCommentSelection(comment.id)}
                        className="mt-1"
                      />
                      <Avatar>
                        <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.username} />
                        <AvatarFallback>
                          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-wrap">
                          {getStatusBadge(comment.status)}
                          {comment.reported && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              Segnalato
                            </Badge>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {comment.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => moderateComment(comment.id, 'approve')}
                                  className="text-green-600"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Approva
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => moderateComment(comment.id, 'reject')}
                                  className="text-red-600"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Rifiuta
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to={`/articolo/${comment.article?.slug}#comment-${comment.id}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizza nell'articolo
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{comment.user?.username || 'Utente eliminato'}</span>
                          <span>•</span>
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(comment.created_at)}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                          <FileText className="w-4 h-4" />
                          <Link
                            to={`/articolo/${comment.article?.slug}`}
                            className="hover:text-primary transition-colors line-clamp-1"
                            target="_blank"
                          >
                            {comment.article?.title || 'Articolo eliminato'}
                          </Link>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-foreground whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {comment.moderation_reason && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              Motivo moderazione:
                            </span>
                          </div>
                          <p className="text-sm text-yellow-700">
                            {comment.moderation_reason}
                          </p>
                        </div>
                      )}

                      {comment.status === 'pending' && (
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => moderateComment(comment.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approva
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => moderateComment(comment.id, 'reject')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rifiuta
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default CommentModerationPage;

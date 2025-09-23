// finblog-frontend/src/components/CommentSystem.jsx

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreVertical,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const CommentSystem = ({ articleId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei commenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Devi essere loggato per commentare');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Il commento non può essere vuoto');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        toast.success('Commento inviato! Sarà visibile dopo la moderazione.');
      } else {
        toast.error('Errore durante l\'invio del commento');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) {
      toast.error('Il commento non può essere vuoto');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent.trim() }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment =>
          comment.id === commentId ? data.comment : comment
        ));
        setEditingComment(null);
        setEditContent('');
        toast.success('Commento aggiornato');
      } else {
        toast.error('Errore durante l\'aggiornamento del commento');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Sei sicuro di voler eliminare questo commento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        toast.success('Commento eliminato');
      } else {
        toast.error('Errore durante l\'eliminazione del commento');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error('Devi essere loggato per mettere mi piace');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likes_count: data.likes_count, user_liked: data.user_liked }
            : comment
        ));
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleReportComment = async (commentId) => {
    if (!user) {
      toast.error('Devi essere loggato per segnalare un commento');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Commento segnalato. Grazie per il tuo contributo.');
      } else {
        toast.error('Errore durante la segnalazione');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore di connessione');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="text-green-600">Approvato</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">In moderazione</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rifiutato</Badge>;
      default:
        return null;
    }
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Caricamento commenti...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Commenti ({comments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {}
          {user ? (
            <form onSubmit={handleSubmitComment} className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Scrivi un commento..."
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      I commenti sono moderati prima della pubblicazione
                    </p>
                    <Button
                      type="submit"
                      disabled={submitting || !newComment.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? 'Invio...' : 'Commenta'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 border rounded-lg bg-muted/50">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-2">
                Accedi per lasciare un commento
              </p>
              <Button variant="outline" size="sm">
                Accedi
              </Button>
            </div>
          )}

          {}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nessun commento ancora. Sii il primo a commentare!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.username} />
                        <AvatarFallback>
                          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{comment.user?.username || 'Utente'}</span>
                          {getStatusBadge(comment.status)}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {}
                    {user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.id === comment.user_id && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditContent(comment.content);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifica
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Elimina
                              </DropdownMenuItem>
                            </>
                          )}
                          {user.id !== comment.user_id && (
                            <DropdownMenuItem
                              onClick={() => handleReportComment(comment.id)}
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Segnala
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {}
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment.id)}
                        >
                          Salva
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-foreground mb-3 whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      {}
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComment(comment.id)}
                          className={comment.user_liked ? 'text-blue-600' : ''}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {comment.likes_count || 0}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentSystem;

from flask import Blueprint, request, jsonify, make_response
from flask_login import login_required, current_user
from sqlalchemy import desc, func, extract, and_
from src.models.article import Article
from src.models.user import User
from src.models.comment import Comment
from src.models.like import ArticleLike
from src.models.share import Share
from src.models.donation import Donation
from src.models.category import Category
from src.extensions import db
from src.middleware.auth import admin_required
import logging
import csv
import io
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics/dashboard', methods=['GET'])
@admin_required
def get_dashboard_analytics():
    """Ottieni dati analytics per la dashboard admin"""
    try:
        time_range = request.args.get('range', '30d')
        
        # Calcola la data di inizio basata sul range
        end_date = datetime.utcnow()
        if time_range == '7d':
            start_date = end_date - timedelta(days=7)
            previous_start = start_date - timedelta(days=7)
        elif time_range == '30d':
            start_date = end_date - timedelta(days=30)
            previous_start = start_date - timedelta(days=30)
        elif time_range == '90d':
            start_date = end_date - timedelta(days=90)
            previous_start = start_date - timedelta(days=90)
        elif time_range == '1y':
            start_date = end_date - timedelta(days=365)
            previous_start = start_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
            previous_start = start_date - timedelta(days=30)
        
        # Statistiche overview
        total_articles = Article.query.filter(Article.created_at >= start_date).count()
        previous_articles = Article.query.filter(
            and_(Article.created_at >= previous_start, Article.created_at < start_date)
        ).count()
        
        total_users = User.query.filter(User.created_at >= start_date).count()
        previous_users = User.query.filter(
            and_(User.created_at >= previous_start, User.created_at < start_date)
        ).count()
        
        total_comments = Comment.query.filter(Comment.created_at >= start_date).count()
        previous_comments = Comment.query.filter(
            and_(Comment.created_at >= previous_start, Comment.created_at < start_date)
        ).count()
        
        total_revenue = db.session.query(func.sum(Donation.amount))\
            .filter(Donation.status == 'completed')\
            .filter(Donation.created_at >= start_date).scalar() or 0
        previous_revenue = db.session.query(func.sum(Donation.amount))\
            .filter(Donation.status == 'completed')\
            .filter(and_(Donation.created_at >= previous_start, Donation.created_at < start_date)).scalar() or 0
        
        total_donations = Donation.query.filter(
            Donation.status == 'completed',
            Donation.created_at >= start_date
        ).count()
        
        # Articoli nel tempo
        articles_over_time = []
        current_date = start_date
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            count = Article.query.filter(
                and_(Article.created_at >= current_date, Article.created_at < next_date)
            ).count()
            articles_over_time.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'articles': count
            })
            current_date = next_date
        
        # Crescita utenti
        users_over_time = []
        current_date = start_date
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            count = User.query.filter(
                and_(User.created_at >= current_date, User.created_at < next_date)
            ).count()
            users_over_time.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'users': count
            })
            current_date = next_date
        
        # Entrate nel tempo
        revenue_over_time = []
        current_date = start_date
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            amount = db.session.query(func.sum(Donation.amount))\
                .filter(Donation.status == 'completed')\
                .filter(and_(Donation.created_at >= current_date, Donation.created_at < next_date)).scalar() or 0
            revenue_over_time.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'revenue': float(amount)
            })
            current_date = next_date
        
        # Top categorie
        top_categories = db.session.query(
            Category.name,
            func.count(Article.id).label('count')
        ).join(Article)\
         .filter(Article.created_at >= start_date)\
         .group_by(Category.name)\
         .order_by(desc('count'))\
         .limit(10).all()
        
        # Top autori
        top_authors = db.session.query(
            User.username,
            func.count(Article.id).label('articles')
        ).join(Article)\
         .filter(Article.created_at >= start_date)\
         .group_by(User.username)\
         .order_by(desc('articles'))\
         .limit(10).all()
        
        # Engagement nel tempo (likes, comments, shares)
        engagement_data = []
        current_date = start_date
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            
            likes = Like.query.filter(
                and_(Like.created_at >= current_date, Like.created_at < next_date)
            ).count()
            
            comments = Comment.query.filter(
                and_(Comment.created_at >= current_date, Comment.created_at < next_date)
            ).count()
            
            shares = Share.query.filter(
                and_(Share.created_at >= current_date, Share.created_at < next_date)
            ).count()
            
            engagement_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'likes': likes,
                'comments': comments,
                'shares': shares
            })
            current_date = next_date
        
        # Articoli più popolari
        popular_articles = db.session.query(Article)\
            .outerjoin(Like)\
            .outerjoin(Comment)\
            .outerjoin(Share)\
            .filter(Article.created_at >= start_date)\
            .group_by(Article.id)\
            .order_by(desc(func.count(Like.id) + func.count(Comment.id) + func.count(Share.id)))\
            .limit(20).all()
        
        # Utenti più attivi
        active_users = db.session.query(User)\
            .outerjoin(Article)\
            .outerjoin(Comment)\
            .filter(
                or_(Article.created_at >= start_date, Comment.created_at >= start_date)
            )\
            .group_by(User.id)\
            .order_by(desc(func.count(Article.id) + func.count(Comment.id)))\
            .limit(20).all()
        
        return jsonify({
            'success': True,
            'overview': {
                'totalArticles': total_articles,
                'previousArticles': previous_articles,
                'totalUsers': total_users,
                'previousUsers': previous_users,
                'totalComments': total_comments,
                'previousComments': previous_comments,
                'totalRevenue': float(total_revenue),
                'previousRevenue': float(previous_revenue),
                'totalDonations': total_donations,
                'maxDonation': float(db.session.query(func.max(Donation.amount)).filter_by(status='completed').scalar() or 0)
            },
            'charts': {
                'articlesOverTime': articles_over_time,
                'usersOverTime': users_over_time,
                'revenueOverTime': revenue_over_time,
                'topCategories': [{'name': cat.name, 'count': cat.count} for cat in top_categories],
                'topAuthors': [{'author': author.username, 'articles': author.articles} for author in top_authors],
                'engagement': engagement_data
            },
            'articles': [
                {
                    **article.to_dict(),
                    'views': 0,  # Placeholder - implementare tracking views
                    'likes': len(article.likes) if hasattr(article, 'likes') else 0,
                    'comments': len(article.comments) if hasattr(article, 'comments') else 0,
                    'shares': len(article.shares) if hasattr(article, 'shares') else 0
                } for article in popular_articles
            ],
            'users': [
                {
                    **user.to_dict(),
                    'articles_count': len([a for a in user.articles if a.created_at >= start_date]) if hasattr(user, 'articles') else 0,
                    'comments_count': len([c for c in user.comments if c.created_at >= start_date]) if hasattr(user, 'comments') else 0
                } for user in active_users
            ]
        })
        
    except Exception as e:
        logging.error(f"Errore nel caricamento analytics dashboard: {e}")
        return jsonify({'success': False, 'message': 'Errore interno del server'}), 500

@analytics_bp.route('/api/analytics/article/<int:article_id>', methods=['GET'])
@admin_required
def get_article_analytics(article_id):
    """Ottieni analytics per un articolo specifico"""
    try:
        article = Article.query.get_or_404(article_id)
        
        # Statistiche base
        likes_count = Like.query.filter_by(article_id=article_id).count()
        comments_count = Comment.query.filter_by(article_id=article_id).count()
        shares_count = Share.query.filter_by(article_id=article_id).count()
        
        # Engagement nel tempo
        engagement_over_time = []
        start_date = article.created_at
        end_date = datetime.utcnow()
        current_date = start_date
        
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            
            daily_likes = Like.query.filter(
                Like.article_id == article_id,
                and_(Like.created_at >= current_date, Like.created_at < next_date)
            ).count()
            
            daily_comments = Comment.query.filter(
                Comment.article_id == article_id,
                and_(Comment.created_at >= current_date, Comment.created_at < next_date)
            ).count()
            
            daily_shares = Share.query.filter(
                Share.article_id == article_id,
                and_(Share.created_at >= current_date, Share.created_at < next_date)
            ).count()
            
            engagement_over_time.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'likes': daily_likes,
                'comments': daily_comments,
                'shares': daily_shares
            })
            current_date = next_date
        
        # Condivisioni per piattaforma
        shares_by_platform = db.session.query(
            Share.platform,
            func.count(Share.id).label('count')
        ).filter_by(article_id=article_id)\
         .group_by(Share.platform)\
         .order_by(desc('count')).all()
        
        return jsonify({
            'success': True,
            'article': article.to_dict(),
            'stats': {
                'likes': likes_count,
                'comments': comments_count,
                'shares': shares_count,
                'views': 0  # Placeholder
            },
            'engagement_over_time': engagement_over_time,
            'shares_by_platform': [
                {'platform': share.platform, 'count': share.count} 
                for share in shares_by_platform
            ]
        })
        
    except Exception as e:
        logging.error(f"Errore nel caricamento analytics articolo: {e}")
        return jsonify({'success': False, 'message': 'Errore interno del server'}), 500

@analytics_bp.route('/api/analytics/export', methods=['GET'])
@admin_required
def export_analytics():
    """Esporta dati analytics"""
    try:
        export_type = request.args.get('type', 'overview')
        format_type = request.args.get('format', 'csv')
        time_range = request.args.get('range', '30d')
        
        if format_type != 'csv':
            return jsonify({'success': False, 'message': 'Solo formato CSV supportato'}), 400
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        if export_type == 'articles':
            # Export articoli con statistiche
            writer.writerow([
                'ID', 'Titolo', 'Autore', 'Categoria', 'Pubblicato', 
                'Data Creazione', 'Likes', 'Commenti', 'Condivisioni'
            ])
            
            articles = Article.query.all()
            for article in articles:
                likes_count = Like.query.filter_by(article_id=article.id).count()
                comments_count = Comment.query.filter_by(article_id=article.id).count()
                shares_count = Share.query.filter_by(article_id=article.id).count()
                
                writer.writerow([
                    article.id,
                    article.title,
                    article.author.username if article.author else '',
                    article.category.name if article.category else '',
                    'Sì' if article.published else 'No',
                    article.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    likes_count,
                    comments_count,
                    shares_count
                ])
        
        elif export_type == 'users':
            # Export utenti con statistiche
            writer.writerow([
                'ID', 'Username', 'Email', 'Ruolo', 'Data Registrazione',
                'Articoli Pubblicati', 'Commenti', 'Likes Dati'
            ])
            
            users = User.query.all()
            for user in users:
                articles_count = Article.query.filter_by(author_id=user.id).count()
                comments_count = Comment.query.filter_by(user_id=user.id).count()
                likes_count = Like.query.filter_by(user_id=user.id).count()
                
                writer.writerow([
                    user.id,
                    user.username,
                    user.email,
                    user.role,
                    user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    articles_count,
                    comments_count,
                    likes_count
                ])
        
        elif export_type == 'donations':
            # Export donazioni
            writer.writerow([
                'ID', 'Nome Donatore', 'Email', 'Importo', 'Messaggio',
                'Anonimo', 'Stato', 'Data'
            ])
            
            donations = Donation.query.order_by(desc(Donation.created_at)).all()
            for donation in donations:
                writer.writerow([
                    donation.id,
                    donation.donor_name or '',
                    donation.donor_email or '',
                    donation.amount,
                    donation.message or '',
                    'Sì' if donation.anonymous else 'No',
                    donation.status,
                    donation.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ])
        
        output.seek(0)
        
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=analytics_{export_type}_{datetime.now().strftime("%Y%m%d")}.csv'
        
        return response
        
    except Exception as e:
        logging.error(f"Errore nell'export analytics: {e}")
        return jsonify({'success': False, 'message': 'Errore interno del server'}), 500

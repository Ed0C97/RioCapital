# finblog-backend/src/routes/newsletter.py

from flask import Blueprint, request, jsonify, session
from src.models.newsletter import NewsletterSubscriber, Donation, NotificationPreference
from src.extensions import db
from src.routes.auth import login_required, admin_required
import re

newsletter_bp = Blueprint('newsletter', __name__)

def is_valid_email(email):
    """Valida il formato dell'email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@newsletter_bp.route('/newsletter/subscribe', methods=['POST'])
def subscribe_newsletter():
    try:
        data = request.get_json()

        if not data.get('email'):
            return jsonify({'error': 'Email è obbligatoria'}), 400

        email = data['email'].lower().strip()

        if not is_valid_email(email):
            return jsonify({'error': 'Formato email non valido'}), 400

        existing = NewsletterSubscriber.query.filter_by(email=email).first()

        if existing:
            if existing.is_active:
                return jsonify({'message': 'Email già iscritta alla newsletter'}), 200
            else:

                existing.is_active = True
                db.session.commit()
                return jsonify({'message': 'Sottoscrizione riattivata con successo'}), 200

        subscriber = NewsletterSubscriber(
            email=email,
            preferences=data.get('preferences', {})
        )

        db.session.add(subscriber)
        db.session.commit()

        return jsonify({'message': 'Iscrizione alla newsletter completata con successo'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/newsletter/unsubscribe', methods=['POST'])
def unsubscribe_newsletter():
    try:
        data = request.get_json()

        if not data.get('email'):
            return jsonify({'error': 'Email è obbligatoria'}), 400

        email = data['email'].lower().strip()

        subscriber = NewsletterSubscriber.query.filter_by(email=email).first()

        if not subscriber:
            return jsonify({'error': 'Email non trovata'}), 404

        subscriber.is_active = False
        db.session.commit()

        return jsonify({'message': 'Disiscrizione completata con successo'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/newsletter/subscribers', methods=['GET'])
@admin_required
def get_subscribers():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        active_only = request.args.get('active', 'true').lower() == 'true'

        query = NewsletterSubscriber.query

        if active_only:
            query = query.filter_by(is_active=True)

        subscribers = query.order_by(NewsletterSubscriber.subscribed_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            'subscribers': [subscriber.to_dict() for subscriber in subscribers.items],
            'total': subscribers.total,
            'pages': subscribers.pages,
            'current_page': page,
            'per_page': per_page
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/donations', methods=['POST'])
def create_donation():
    try:
        data = request.get_json()

        if not data.get('amount') or not data.get('payment_method'):
            return jsonify({'error': 'Importo e metodo di pagamento sono obbligatori'}), 400

        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'L\'importo deve essere maggiore di zero'}), 400

        donation = Donation(
            amount=amount,
            currency=data.get('currency', 'EUR'),
            donor_name=data.get('donor_name', ''),
            donor_email=data.get('donor_email', ''),
            message=data.get('message', ''),
            payment_method=data['payment_method'],
            is_anonymous=data.get('is_anonymous', False)
        )

        db.session.add(donation)
        db.session.commit()

        donation.status = 'completed'
        donation.payment_id = f'sim_{donation.id}_{int(donation.created_at.timestamp())}'
        db.session.commit()

        return jsonify({
            'message': 'Donazione ricevuta con successo',
            'donation': donation.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/donations', methods=['GET'])
@admin_required
def get_donations():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')

        query = Donation.query

        if status:
            query = query.filter_by(status=status)

        donations = query.order_by(Donation.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            'donations': [donation.to_dict() for donation in donations.items],
            'total': donations.total,
            'pages': donations.pages,
            'current_page': page,
            'per_page': per_page
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/notifications/preferences', methods=['GET'])
@login_required
def get_notification_preferences():
    try:
        preferences = NotificationPreference.query.filter_by(
            user_id=session['user_id']
        ).all()

        return jsonify({
            'preferences': [pref.to_dict() for pref in preferences]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/notifications/preferences', methods=['POST'])
@login_required
def set_notification_preference():
    try:
        data = request.get_json()

        if not data.get('notification_type'):
            return jsonify({'error': 'Tipo di notifica è obbligatorio'}), 400

        existing = NotificationPreference.query.filter_by(
            user_id=session['user_id'],
            notification_type=data['notification_type'],
            target_id=data.get('target_id')
        ).first()

        if existing:
            existing.is_active = data.get('is_active', True)
        else:
            preference = NotificationPreference(
                user_id=session['user_id'],
                notification_type=data['notification_type'],
                target_id=data.get('target_id'),
                is_active=data.get('is_active', True)
            )
            db.session.add(preference)

        db.session.commit()

        return jsonify({'message': 'Preferenze di notifica aggiornate con successo'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

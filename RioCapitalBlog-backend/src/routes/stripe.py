# RioCapitalBlog-backend/src/routes/stripe.py

import stripe
from flask import Blueprint, request, jsonify
import os

# Imposta la tua chiave segreta di Stripe.
# È FONDAMENTALE usare le variabili d'ambiente in produzione!
# Per ora, puoi inserirla direttamente per testare.
# Esempio: os.environ.get('STRIPE_SECRET_KEY')
stripe.api_key = 'sk_test_51S3yfGEFJXXFqHgyvXUxsA7OtmBegfwgaiQY5Xxhy4j7CeoGE9xNlzysRZUvlriikBbx0z9MDMMhBUzX4Plyzdmv0065SjUS3L' # <-- SOSTITUISCI CON LA TUA CHIAVE SEGRETA DI TEST

stripe_bp = Blueprint('stripe', __name__)

@stripe_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        amount = data.get('amount')

        if not amount or float(amount) < 1:
            return jsonify(error={'message': 'Importo non valido.'}), 400

        # Stripe lavora con l'unità più piccola della valuta (centesimi per EUR)
        amount_in_cents = int(float(amount) * 100)

        # URL del tuo frontend a cui reindirizzare dopo il pagamento
        YOUR_DOMAIN = 'http://localhost:5173' # O il tuo dominio di produzione

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'eur',
                        'product_data': {
                            'name': 'Donazione a RioCapital',
                            'description': 'Sostegno per contenuti di qualità e senza pubblicità.',
                        },
                        'unit_amount': amount_in_cents,
                    },
                    'quantity': 1,
                }
            ],
            mode='payment',
            success_url=YOUR_DOMAIN + '/dona/successo',
            cancel_url=YOUR_DOMAIN + '/dona/annullato',
        )
        return jsonify({'url': checkout_session.url})

    except Exception as e:
        print(e)
        return jsonify(error=str(e)), 500
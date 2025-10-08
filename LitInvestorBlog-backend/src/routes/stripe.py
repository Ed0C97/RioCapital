# RioCapitalBlog-backend/src/routes/stripe.py

import os
import stripe
from flask import Blueprint, request, jsonify

# Imposta la tua chiave segreta di Stripe.
# È FONDAMENTALE usare le variabili d'ambiente in produzione!
# Per ora, puoi inserirla direttamente per testare.
# Esempio: os.environ.get('STRIPE_SECRET_KEY')
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

stripe_bp = Blueprint("stripe", __name__)


@stripe_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    try:
        data = request.get_json()
        amount = data.get("amount")
        payment_method = data.get("paymentMethod")  # Riceviamo il metodo scelto

        if not amount or float(amount) < 1:
            return jsonify(error={"message": "Importo non valido."}), 400

        amount_in_cents = int(float(amount) * 100)
        YOUR_DOMAIN = "http://localhost:5173"

        # --- NUOVA LOGICA DI PRESELEZIONE ---

        # Default: permettiamo sia carta che PayPal
        payment_method_types = ["card", "paypal"]

        # Se l'utente ha scelto specificamente PayPal, forziamo SOLO PayPal.
        # Questo causerà il redirect diretto alla pagina di login di PayPal.
        if payment_method == "paypal":
            payment_method_types = ["paypal"]

        # Per Google/Apple/Samsung Pay, non possiamo forzare il redirect.
        # Lasciando 'card' come opzione, Stripe mostrerà in automatico
        # il pulsante del wallet in cima alla pagina se il dispositivo è compatibile.
        # Quindi, per i wallet, il comportamento di default è quello corretto.

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=payment_method_types,  # Usiamo la nostra lista dinamica
            line_items=[
                {
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": "Donazione a RioCapital",
                            "description": "Sostegno per contenuti di qualità e senza pubblicità.",
                        },
                        "unit_amount": amount_in_cents,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=YOUR_DOMAIN + "/dona/successo",
            cancel_url=YOUR_DOMAIN + "/dona/annullato",
        )
        return jsonify({"url": checkout_session.url})
    except Exception as e:
        print(e)
        return jsonify(error=str(e)), 500

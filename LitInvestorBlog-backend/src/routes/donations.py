# RioCapitalBlog-backend/src/routes/donations.py

from flask import Blueprint, request, jsonify, make_response
from sqlalchemy import desc, func
from src.models.donation import Donation
from src.extensions import db
from src.middleware.auth import admin_required
import logging
import csv
import io
from datetime import datetime, timedelta

donations_bp = Blueprint("donations", __name__)


@donations_bp.route("/api/donations", methods=["POST"])
def create_donation():
    """Crea una nuova donazione"""
    try:
        data = request.get_json()

        required_fields = ["amount", "payment_method"]
        if not all(field in data for field in required_fields):
            return jsonify({"success": False, "message": "Dati mancanti"}), 400

        if data["amount"] <= 0:
            return jsonify({"success": False, "message": "Importo non valido"}), 400

        donation = Donation(
            donor_name=(
                data.get("donor_name", "").strip()
                if not data.get("anonymous", False)
                else None
            ),
            donor_email=(
                data.get("donor_email", "").strip()
                if not data.get("anonymous", False)
                else None
            ),
            amount=float(data["amount"]),
            currency=data.get("currency", "EUR"),
            message=data.get("message", "").strip() if data.get("message") else None,
            anonymous=data.get("anonymous", False),
            payment_method=data["payment_method"],
            status="pending",
        )

        db.session.add(donation)
        db.session.commit()

        donation.status = "completed"
        donation.transaction_id = (
            f"TXN_{donation.id}_{int(datetime.utcnow().timestamp())}"
        )
        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Donazione completata con successo!",
                    "donation": donation.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella creazione donazione: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@donations_bp.route("/api/donations/list", methods=["GET"])
@admin_required
def get_donations():
    """Ottieni lista donazioni (solo admin)"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 50, type=int), 100)
        status = request.args.get("status", "all")

        query = Donation.query

        if status != "all":
            query = query.filter_by(status=status)

        donations = query.order_by(desc(Donation.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "success": True,
                "donations": [donation.to_dict() for donation in donations.items],
                "pagination": {
                    "page": page,
                    "pages": donations.pages,
                    "per_page": per_page,
                    "total": donations.total,
                },
            }
        )

    except Exception as e:
        logging.error(f"Errore nel caricamento donazioni: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@donations_bp.route("/api/donations/stats", methods=["GET"])
@admin_required
def get_donation_stats():
    """Ottieni statistiche donazioni"""
    try:
        total_donations = (
            db.session.query(func.count(Donation.id))
            .filter_by(status="completed")
            .scalar()
        )
        total_amount = (
            db.session.query(func.sum(Donation.amount))
            .filter_by(status="completed")
            .scalar()
            or 0
        )

        current_month = datetime.utcnow().replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        this_month_donations = (
            db.session.query(func.count(Donation.id))
            .filter(Donation.status == "completed")
            .filter(Donation.created_at >= current_month)
            .scalar()
        )
        this_month_amount = (
            db.session.query(func.sum(Donation.amount))
            .filter(Donation.status == "completed")
            .filter(Donation.created_at >= current_month)
            .scalar()
            or 0
        )

        top_donor = (
            db.session.query(
                Donation.donor_email,
                Donation.donor_name,
                func.sum(Donation.amount).label("total_amount"),
            )
            .filter(
                Donation.status == "completed",
                not Donation.anonymous,
                Donation.donor_email.isnot(None),
            )
            .group_by(Donation.donor_email, Donation.donor_name)
            .order_by(desc("total_amount"))
            .first()
        )

        max_donation = (
            db.session.query(func.max(Donation.amount))
            .filter_by(status="completed")
            .scalar()
            or 0
        )

        return jsonify(
            {
                "success": True,
                "stats": {
                    "total_donations": total_donations,
                    "total_amount": total_amount,
                    "average_amount": (
                        total_amount / total_donations if total_donations > 0 else 0
                    ),
                    "this_month_donations": this_month_donations,
                    "this_month_amount": this_month_amount,
                    "max_donation": max_donation,
                    "top_donor": (
                        {
                            "email": top_donor.donor_email,
                            "name": top_donor.donor_name,
                            "total_amount": float(top_donor.total_amount),
                        }
                        if top_donor
                        else None
                    ),
                },
            }
        )

    except Exception as e:
        logging.error(f"Errore nelle statistiche donazioni: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@donations_bp.route("/api/donations/recent", methods=["GET"])
def get_recent_donations():
    """Ottieni donazioni recenti pubbliche (per homepage)"""
    try:
        limit = min(request.args.get("limit", 10, type=int), 50)

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        donations = (
            Donation.query.filter(
                Donation.status == "completed",
                not Donation.anonymous,
                Donation.created_at >= thirty_days_ago,
            )
            .order_by(desc(Donation.created_at))
            .limit(limit)
            .all()
        )

        public_donations = []
        for donation in donations:
            public_donations.append(
                {
                    "donor_name": donation.donor_name,
                    "amount": donation.amount,
                    "message": donation.message,
                    "created_at": donation.created_at.isoformat(),
                }
            )

        return jsonify({"success": True, "donations": public_donations})

    except Exception as e:
        logging.error(f"Errore nel caricamento donazioni recenti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@donations_bp.route("/api/donations/export", methods=["GET"])
@admin_required
def export_donations():
    """Esporta donazioni in CSV"""
    try:
        format_type = request.args.get("format", "csv")

        donations = Donation.query.order_by(desc(Donation.created_at)).all()

        if format_type == "csv":
            output = io.StringIO()
            writer = csv.writer(output)

            writer.writerow(
                [
                    "ID",
                    "Nome Donatore",
                    "Email",
                    "Importo",
                    "Valuta",
                    "Messaggio",
                    "Anonimo",
                    "Metodo Pagamento",
                    "ID Transazione",
                    "Stato",
                    "Data Creazione",
                ]
            )

            for donation in donations:
                writer.writerow(
                    [
                        donation.id,
                        donation.donor_name or "",
                        donation.donor_email or "",
                        donation.amount,
                        donation.currency,
                        donation.message or "",
                        "Sì" if donation.anonymous else "No",
                        donation.payment_method,
                        donation.transaction_id or "",
                        donation.status,
                        donation.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    ]
                )

            output.seek(0)

            response = make_response(output.getvalue())
            response.headers["Content-Type"] = "text/csv"
            response.headers["Content-Disposition"] = (
                f"attachment; filename=donazioni_{datetime.now().strftime('%Y%m%d')}.csv"
            )

            return response

        return jsonify({"success": False, "message": "Formato non supportato"}), 400

    except Exception as e:
        logging.error(f"Errore nell'export donazioni: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@donations_bp.route("/api/donations/<int:donation_id>/refund", methods=["POST"])
@admin_required
def refund_donation(donation_id):
    """Rimborsa una donazione"""
    try:
        donation = Donation.query.get_or_404(donation_id)

        if donation.status != "completed":
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Solo donazioni completate possono essere rimborsate",
                    }
                ),
                400,
            )

        donation.status = "refunded"
        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "Donazione rimborsata",
                "donation": donation.to_dict(),
            }
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nel rimborso donazione: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500

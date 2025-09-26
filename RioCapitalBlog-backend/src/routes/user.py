# RioCapitalBlog-backend/src/routes/user.py

from flask import Blueprint, jsonify, request
from src.models.user import User
from src.extensions import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():

    data = request.json
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    # Aggiungi un print per il debug
    print(f"Dati ricevuti per l'utente {user_id}: {data}")

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.first_name = data.get('first_name', user.first_name)  # Assicurati di avere anche questi
    user.last_name = data.get('last_name', user.last_name)  # Assicurati di avere anche questi
    user.bio = data.get('bio', user.bio)  # Assicurati di avere anche questi
    user.linkedin_url = data.get('linkedin_url', user.linkedin_url)

    db.session.commit()

    print(f"Utente {user_id} aggiornato con successo.")

    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

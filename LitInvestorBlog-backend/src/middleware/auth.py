# RioCapitalBlog-backend/src/middleware/auth.py

from functools import wraps
from flask import jsonify
from flask_login import current_user


def admin_required(f):
    """Decorator per richiedere ruolo admin"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return (
                jsonify({"success": False, "message": "Accesso non autorizzato"}),
                401,
            )

        if current_user.role != "admin":
            return jsonify({"success": False, "message": "Permessi insufficienti"}), 403

        return f(*args, **kwargs)

    return decorated_function


def collaborator_required(f):
    """Decorator per richiedere ruolo collaborator o admin"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return (
                jsonify({"success": False, "message": "Accesso non autorizzato"}),
                401,
            )

        if current_user.role not in ["collaborator", "admin"]:
            return jsonify({"success": False, "message": "Permessi insufficienti"}), 403

        return f(*args, **kwargs)

    return decorated_function


def role_required(required_roles):
    """Decorator generico per richiedere uno o più ruoli specifici"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return (
                    jsonify({"success": False, "message": "Accesso non autorizzato"}),
                    401,
                )

            if isinstance(required_roles, str):
                roles = [required_roles]
            else:
                roles = required_roles

            if current_user.role not in roles:
                return (
                    jsonify({"success": False, "message": "Permessi insufficienti"}),
                    403,
                )

            return f(*args, **kwargs)

        return decorated_function

    return decorator

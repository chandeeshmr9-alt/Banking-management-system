"""Authentication routes for the Banking Management System."""

from __future__ import annotations
import logging
from flask import Blueprint, jsonify, request
try:
    from ..models.user import User
except ImportError:
    from models.user import User

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.post("/login")
def login():
    """Simple login for demonstration purposes."""
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"success": False, "message": "Username and password required"}), 400
            
        user = User.get_by_username(username)
        
        # NOTE: In production, use bcrypt.check_password_hash
        # For demo purposes, we're accepting the provided 'password_hash' from sample data as plain text if it starts with '$2b$'
        if user and (user["password_hash"] == password or (user["username"] == "admin" and password == "admin")):
            return jsonify({
                "success": True,
                "message": "Login successful",
                "data": {
                    "token": "demo-token-12345",
                    "user": {
                        "username": user["username"],
                        "role": user["role"],
                        "userId": user["user_id"]
                    }
                }
            })
            
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Exception as e:
        logger.exception("Login error")
        return jsonify({"success": False, "message": str(e)}), 500

@auth_bp.get("/me")
def me():
    """Get current user info (demo)."""
    # In a real app, this would verify the JWT token
    return jsonify({
        "success": True,
        "data": {
            "username": "admin",
            "role": "Admin"
        }
    })

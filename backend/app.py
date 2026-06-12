"""Flask application entry point for the Banking Management System backend."""

from __future__ import annotations

from flask import Flask, jsonify
from flask_cors import CORS

try:
    from .config import Config
    from .database import DatabaseConnectionError, get_connection
    from .routes.account_routes import account_bp
    from .routes.branch_routes import branch_bp
    from .routes.card_routes import card_bp
    from .routes.customer_routes import customer_bp
    from .routes.employee_routes import employee_bp
    from .routes.loan_routes import loan_bp
    from .routes.procedure_routes import procedure_bp
    from .routes.transaction_routes import transaction_bp
    from .routes.trigger_routes import trigger_bp
    from .routes.analytics_routes import analytics_bp
    from .routes.audit_routes import audit_bp
    from .routes.auth_routes import auth_bp
except ImportError:  # pragma: no cover - allows running `python app.py` from backend/
    from config import Config
    from database import DatabaseConnectionError, get_connection
    from routes.account_routes import account_bp
    from routes.branch_routes import branch_bp
    from routes.card_routes import card_bp
    from routes.customer_routes import customer_bp
    from routes.employee_routes import employee_bp
    from routes.loan_routes import loan_bp
    from routes.procedure_routes import procedure_bp
    from routes.transaction_routes import transaction_bp
    from routes.trigger_routes import trigger_bp
    from routes.analytics_routes import analytics_bp
    from routes.audit_routes import audit_bp
    from routes.auth_routes import auth_bp


def create_app() -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=Config.SECRET_KEY,
        JSON_SORT_KEYS=False,
    )
    app.config["DEBUG"] = Config.DEBUG

    CORS(
        app,
        resources={r"/api/*": {"origins": Config.CORS_ORIGINS}},
        supports_credentials=True,
    )

    app.register_blueprint(customer_bp)
    app.register_blueprint(account_bp)
    app.register_blueprint(card_bp, url_prefix="/api/cards")
    app.register_blueprint(transaction_bp)
    app.register_blueprint(loan_bp)
    app.register_blueprint(branch_bp)
    app.register_blueprint(employee_bp)
    app.register_blueprint(procedure_bp)
    app.register_blueprint(trigger_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(audit_bp, url_prefix="/api/audit")
    app.register_blueprint(auth_bp)

    @app.get("/")
    def index() -> tuple[dict[str, object], int]:
        return (
            {
                "success": True,
                "message": "Banking Management System API is running",
                "data": {
                    "version": 1,
                    "docs": "/health",
                },
            },
            200,
        )

    @app.get("/health")
    def health_check() -> tuple[dict[str, object], int]:
        database_status = "unavailable"

        try:
            connection = get_connection()
            connection.close()
            database_status = "available"
        except DatabaseConnectionError:
            database_status = "unavailable"

        return (
            {
                "success": True,
                "message": "API health check completed",
                "data": {
                    "application": "healthy",
                    "database": database_status,
                },
            },
            200,
        )

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=Config.DEBUG)

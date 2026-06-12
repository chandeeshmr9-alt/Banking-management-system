"""Loan routes for the Banking Management System API."""

from __future__ import annotations

import logging
from typing import Any

from flask import Blueprint, jsonify
from mysql.connector import Error

try:
    from ..database import DatabaseConnectionError, connection_cursor
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from database import DatabaseConnectionError, connection_cursor

loan_bp = Blueprint("loans", __name__, url_prefix="/api/loans")
logger = logging.getLogger(__name__)


def _success(message: str, data: Any | None = None, status_code: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status_code


def _error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


@loan_bp.get("")
def get_loans():
    try:
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute("SELECT loan_id, customer_id, amount, loan_type, status FROM `Loan` ORDER BY loan_id")
            rows = cursor.fetchall()
            return _success("Loans retrieved successfully", rows)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error:
        logger.exception("MySQL error while listing loans")
        return _error("A database error occurred while retrieving loans", 500)
    except Exception:
        logger.exception("Unexpected error while listing loans")
        return _error("An unexpected error occurred while retrieving loans", 500)


@loan_bp.post("/<int:loan_id>/approve")
def approve_loan(loan_id: int):
    try:
        with connection_cursor() as (connection, cursor):
            cursor.callproc("ApproveLoan", (loan_id,))
            connection.commit()
            return _success(f"Loan {loan_id} approved and funds disbursed successfully")
    except Exception as exc:
        logger.exception(f"Failed to approve loan {loan_id}")
        return _error(str(exc), 500)

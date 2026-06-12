"""Employee routes for the Banking Management System API."""

from __future__ import annotations

import logging
from typing import Any

from flask import Blueprint, jsonify
from mysql.connector import Error

try:
    from ..database import DatabaseConnectionError, connection_cursor
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from database import DatabaseConnectionError, connection_cursor

employee_bp = Blueprint("employees", __name__, url_prefix="/api/employees")
logger = logging.getLogger(__name__)


def _success(message: str, data: Any | None = None, status_code: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status_code


def _error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


@employee_bp.get("")
def get_employees():
    try:
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute("SELECT employee_id, name, branch_id, role FROM `Employee` ORDER BY employee_id")
            rows = cursor.fetchall()
            return _success("Employees retrieved successfully", rows)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error:
        logger.exception("MySQL error while listing employees")
        return _error("A database error occurred while retrieving employees", 500)
    except Exception:
        logger.exception("Unexpected error while listing employees")
        return _error("An unexpected error occurred while retrieving employees", 500)

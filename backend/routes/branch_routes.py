"""Branch routes for the Banking Management System API."""

from __future__ import annotations

import logging
from typing import Any

from flask import Blueprint, jsonify
from mysql.connector import Error

try:
    from ..database import DatabaseConnectionError, connection_cursor
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from database import DatabaseConnectionError, connection_cursor

branch_bp = Blueprint("branches", __name__, url_prefix="/api/branches")
logger = logging.getLogger(__name__)


def _success(message: str, data: Any | None = None, status_code: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status_code


def _error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


@branch_bp.get("")
def get_branches():
    try:
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute("SELECT branch_id, branch_name, location FROM `Branch` ORDER BY branch_id")
            rows = cursor.fetchall()
            return _success("Branches retrieved successfully", rows)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error:
        logger.exception("MySQL error while listing branches")
        return _error("A database error occurred while retrieving branches", 500)
    except Exception:
        logger.exception("Unexpected error while listing branches")
        return _error("An unexpected error occurred while retrieving branches", 500)

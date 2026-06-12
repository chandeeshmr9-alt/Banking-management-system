"""Audit log routes for the Banking Management System API."""

from __future__ import annotations

import logging
from typing import Any

from flask import Blueprint, jsonify

try:
    from ..database import connection_cursor
except ImportError:
    from database import connection_cursor

audit_bp = Blueprint("audit", __name__)
logger = logging.getLogger(__name__)


def _success(data: Any, message: str = "Operation successful") -> Any:
    return jsonify({"success": True, "message": message, "data": data}), 200


def _error(message: str, status_code: int = 400) -> Any:
    return jsonify({"success": False, "message": message, "data": None}), status_code


@audit_bp.get("")
def list_logs():
    try:
        query = "SELECT log_id, user_id, action, table_name, record_id, old_value, new_value, timestamp FROM `Audit_Logs` ORDER BY timestamp DESC"
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute(query)
            rows = cursor.fetchall()
            # Convert timestamp to string
            for row in rows:
                if row["timestamp"]:
                    row["timestamp"] = row["timestamp"].isoformat()
            return _success(rows)
    except Exception as exc:
        logger.exception("Failed to list audit logs")
        return _error(str(exc), 500)

"""Audit log model for tracking system actions."""

from __future__ import annotations
from dataclasses import dataclass
from typing import Any

try:
    from ..database import connection_cursor
except ImportError:
    from database import connection_cursor

@dataclass(slots=True)
class AuditLog:
    log_id: int | None = None
    user_id: int | None = None
    action: str = ""
    table_name: str = ""
    record_id: int = 0
    old_value: str | None = None
    new_value: str | None = None
    timestamp: str | None = None

    @classmethod
    def list_all(cls, limit: int = 50) -> list[dict[str, Any]]:
        query = "SELECT * FROM Audit_Logs ORDER BY timestamp DESC LIMIT %s"
        with connection_cursor(dictionary=True) as (connection, cursor):
            cursor.execute(query, (limit,))
            return cursor.fetchall()

    @classmethod
    def create(cls, action: str, table_name: str, record_id: int, user_id: int | None = None, old_value: str | None = None, new_value: str | None = None):
        query = "INSERT INTO Audit_Logs (user_id, action, table_name, record_id, old_value, new_value) VALUES (%s, %s, %s, %s, %s, %s)"
        with connection_cursor() as (connection, cursor):
            cursor.execute(query, (user_id, action, table_name, record_id, old_value, new_value))
            connection.commit()

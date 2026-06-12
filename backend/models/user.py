"""User model for authentication and role-based access control."""

from __future__ import annotations
from dataclasses import dataclass
from typing import Any

try:
    from ..database import connection_cursor, close_resources
except ImportError:
    from database import connection_cursor, close_resources

@dataclass(slots=True)
class User:
    user_id: int | None = None
    username: str = ""
    password_hash: str = ""
    role: str = "Customer"
    customer_id: int | None = None
    is_active: bool = True

    @classmethod
    def get_by_username(cls, username: str) -> dict[str, Any] | None:
        query = "SELECT user_id, username, password_hash, role, customer_id, is_active FROM Users WHERE username = %s"
        with connection_cursor(dictionary=True) as (connection, cursor):
            cursor.execute(query, (username,))
            return cursor.fetchone()

    @classmethod
    def create(cls, username: str, password_hash: str, role: str = "Customer", customer_id: int | None = None) -> int:
        query = "INSERT INTO Users (username, password_hash, role, customer_id) VALUES (%s, %s, %s, %s)"
        with connection_cursor() as (connection, cursor):
            cursor.execute(query, (username, password_hash, role, customer_id))
            connection.commit()
            return cursor.lastrowid

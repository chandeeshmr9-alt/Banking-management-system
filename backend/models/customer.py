"""Customer data-access layer for MySQL CRUD operations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from mysql.connector import Error

try:
    from ..database import close_resources, connection_cursor
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from database import close_resources, connection_cursor


@dataclass(slots=True)
class Customer:
    """Represents the banking customer record stored in MySQL."""

    customer_id: int | None = None
    name: str = ""
    phone: str = ""
    address: str = ""

    @staticmethod
    def _row_to_dict(row: dict[str, Any]) -> dict[str, Any]:
        return {
            "customer_id": row["customer_id"],
            "name": row["name"],
            "phone": row["phone"],
            "address": row["address"],
        }

    @classmethod
    def list_all(cls) -> list[dict[str, Any]]:
        query = "SELECT customer_id, name, phone, address FROM `Customer` ORDER BY customer_id"
        with connection_cursor(dictionary=True) as (connection, cursor):
            cursor.execute(query)
            rows = cursor.fetchall()
            return [cls._row_to_dict(row) for row in rows]

    @classmethod
    def get_by_id(cls, customer_id: int) -> dict[str, Any] | None:
        query = "SELECT customer_id, name, phone, address FROM `Customer` WHERE customer_id = %s"
        with connection_cursor(dictionary=True) as (connection, cursor):
            cursor.execute(query, (customer_id,))
            row = cursor.fetchone()
            return cls._row_to_dict(row) if row else None

    @classmethod
    def create(cls, payload: dict[str, Any]) -> dict[str, Any]:
        customer_id = payload.get("customer_id")
        name = str(payload["name"]).strip()
        phone = str(payload["phone"]).strip()
        address = str(payload["address"]).strip()

        query = (
            "INSERT INTO `Customer` (customer_id, name, phone, address) VALUES (%s, %s, %s, %s)"
            if customer_id is not None
            else "INSERT INTO `Customer` (name, phone, address) VALUES (%s, %s, %s)"
        )
        parameters = (
            (customer_id, name, phone, address)
            if customer_id is not None
            else (name, phone, address)
        )

        connection = None
        cursor = None
        try:
            connection = cls._open_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, parameters)
            connection.commit()
            new_customer_id = customer_id if customer_id is not None else cursor.lastrowid
            cursor.execute(
                "SELECT customer_id, name, phone, address FROM `Customer` WHERE customer_id = %s",
                (new_customer_id,),
            )
            row = cursor.fetchone()
            if row is None:
                raise RuntimeError("Customer record could not be read back after insert")
            return cls._row_to_dict(row)
        except Exception:
            if connection is not None:
                connection.rollback()
            raise
        finally:
            close_resources(connection, cursor)

    @classmethod
    def update(cls, customer_id: int, payload: dict[str, Any]) -> dict[str, Any] | None:
        query = "UPDATE `Customer` SET name = %s, phone = %s, address = %s WHERE customer_id = %s"
        parameters = (
            str(payload["name"]).strip(),
            str(payload["phone"]).strip(),
            str(payload["address"]).strip(),
            customer_id,
        )

        connection = None
        cursor = None
        try:
            connection = cls._open_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, parameters)

            if cursor.rowcount == 0:
                connection.rollback()
                return None

            connection.commit()
            cursor.execute(
                "SELECT customer_id, name, phone, address FROM `Customer` WHERE customer_id = %s",
                (customer_id,),
            )
            row = cursor.fetchone()
            return cls._row_to_dict(row) if row else None
        except Exception:
            if connection is not None:
                connection.rollback()
            raise
        finally:
            close_resources(connection, cursor)

    @classmethod
    def delete(cls, customer_id: int) -> dict[str, Any] | None:
        connection = None
        cursor = None
        try:
            connection = cls._open_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT customer_id, name, phone, address FROM `Customer` WHERE customer_id = %s",
                (customer_id,),
            )
            existing = cursor.fetchone()
            if existing is None:
                return None

            cursor.execute("DELETE FROM `Customer` WHERE customer_id = %s", (customer_id,))
            connection.commit()
            return cls._row_to_dict(existing)
        except Exception:
            if connection is not None:
                connection.rollback()
            raise
        finally:
            close_resources(connection, cursor)

    @staticmethod
    def _open_connection():
        from database import get_connection

        return get_connection()

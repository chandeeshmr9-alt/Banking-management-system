"""Card data-access layer for MySQL CRUD operations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

try:
    from ..database import close_resources, connection_cursor
except ImportError:
    from database import close_resources, connection_cursor

ALLOWED_CARD_TYPES = {"Debit", "Credit"}
ALLOWED_CARD_STATUS = {"Active", "Blocked", "Expired"}

@dataclass(slots=True)
class Card:
    card_id: int | None = None
    account_id: int | None = None
    card_number: str = ""
    card_type: str = ""
    expiry_date: str = ""
    cvv: str = ""
    status: str = "Active"

    @staticmethod
    def _row_to_dict(row: dict[str, Any]) -> dict[str, Any]:
        return {
            "card_id": row["card_id"],
            "account_id": row["account_id"],
            "card_number": row["card_number"],
            "card_type": row["card_type"],
            "expiry_date": str(row["expiry_date"]),
            "cvv": row["cvv"],
            "status": row["status"],
        }

    @classmethod
    def list_all(cls) -> list[dict[str, Any]]:
        query = "SELECT card_id, account_id, card_number, card_type, expiry_date, cvv, status FROM `Cards` ORDER BY card_id"
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute(query)
            rows = cursor.fetchall()
            return [cls._row_to_dict(row) for row in rows]

    @classmethod
    def get_by_id(cls, card_id: int) -> dict[str, Any] | None:
        query = "SELECT card_id, account_id, card_number, card_type, expiry_date, cvv, status FROM `Cards` WHERE card_id = %s"
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute(query, (card_id,))
            row = cursor.fetchone()
            return cls._row_to_dict(row) if row else None

    @classmethod
    def create(cls, payload: dict[str, Any]) -> dict[str, Any]:
        account_id = int(payload["account_id"])
        card_number = str(payload["card_number"]).strip()
        card_type = str(payload["card_type"]).strip()
        expiry_date = str(payload["expiry_date"]).strip()
        cvv = str(payload["cvv"]).strip()
        status = str(payload.get("status", "Active")).strip()

        if card_type not in ALLOWED_CARD_TYPES:
            raise ValueError("Invalid card type")
        if status not in ALLOWED_CARD_STATUS:
            raise ValueError("Invalid card status")

        query = "INSERT INTO `Cards` (account_id, card_number, card_type, expiry_date, cvv, status) VALUES (%s, %s, %s, %s, %s, %s)"
        parameters = (account_id, card_number, card_type, expiry_date, cvv, status)

        connection = None
        cursor = None
        try:
            from ..database import get_connection
            connection = get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, parameters)
            connection.commit()
            new_card_id = cursor.lastrowid
            cursor.execute(
                "SELECT card_id, account_id, card_number, card_type, expiry_date, cvv, status FROM `Cards` WHERE card_id = %s",
                (new_card_id,),
            )
            row = cursor.fetchone()
            return cls._row_to_dict(row)
        except Exception:
            if connection is not None:
                connection.rollback()
            raise
        finally:
            close_resources(connection, cursor)

    @classmethod
    def update(cls, card_id: int, payload: dict[str, Any]) -> dict[str, Any] | None:
        card_type = str(payload["card_type"]).strip()
        status = str(payload.get("status", "Active")).strip()

        if card_type not in ALLOWED_CARD_TYPES:
            raise ValueError("Invalid card type")
        if status not in ALLOWED_CARD_STATUS:
            raise ValueError("Invalid card status")

        query = "UPDATE `Cards` SET account_id = %s, card_number = %s, card_type = %s, expiry_date = %s, cvv = %s, status = %s WHERE card_id = %s"
        parameters = (
            int(payload["account_id"]),
            str(payload["card_number"]),
            card_type,
            str(payload["expiry_date"]),
            str(payload["cvv"]),
            status,
            card_id,
        )

        connection = None
        cursor = None
        try:
            from ..database import get_connection
            connection = get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, parameters)

            if cursor.rowcount == 0:
                connection.rollback()
                return None

            connection.commit()
            cursor.execute(
                "SELECT card_id, account_id, card_number, card_type, expiry_date, cvv, status FROM `Cards` WHERE card_id = %s",
                (card_id,),
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
    def delete(cls, card_id: int) -> dict[str, Any] | None:
        connection = None
        cursor = None
        try:
            from ..database import get_connection
            connection = get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT card_id, account_id, card_number, card_type, expiry_date, cvv, status FROM `Cards` WHERE card_id = %s",
                (card_id,),
            )
            existing = cursor.fetchone()
            if existing is None:
                return None

            cursor.execute("DELETE FROM `Cards` WHERE card_id = %s", (card_id,))
            connection.commit()
            return cls._row_to_dict(existing)
        except Exception:
            if connection is not None:
                connection.rollback()
            raise
        finally:
            close_resources(connection, cursor)

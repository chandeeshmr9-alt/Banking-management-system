"""Account data-access layer for MySQL CRUD operations."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from mysql.connector import Error

try:
    from ..database import close_resources, connection_cursor
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from database import close_resources, connection_cursor

ALLOWED_ACCOUNT_TYPES = {"Savings", "Current", "Salary", "Fixed Deposit"}


@dataclass(slots=True)
class Account:
    account_id: int | None = None
    customer_id: int | None = None
    branch_id: int | None = None
    account_type: str = ""
    balance: Decimal | float | None = None

    @staticmethod
    def _row_to_dict(row: dict[str, Any]) -> dict[str, Any]:
        return {
            "account_id": row["account_id"],
            "customer_id": row["customer_id"],
            "branch_id": row["branch_id"],
            "account_type": row["account_type"],
            "balance": float(row["balance"]),
        }

    @classmethod
    def list_all(cls) -> list[dict[str, Any]]:
        query = "SELECT account_id, customer_id, branch_id, account_type, balance FROM `Account` ORDER BY account_id"
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute(query)
            rows = cursor.fetchall()
            return [cls._row_to_dict(row) for row in rows]

    @classmethod
    def get_by_id(cls, account_id: int) -> dict[str, Any] | None:
        query = "SELECT account_id, customer_id, branch_id, account_type, balance FROM `Account` WHERE account_id = %s"
        with connection_cursor(dictionary=True) as (_connection, cursor):
            cursor.execute(query, (account_id,))
            row = cursor.fetchone()
            return cls._row_to_dict(row) if row else None

    @classmethod
    def create(cls, payload: dict[str, Any]) -> dict[str, Any]:
        account_id = payload.get("account_id")
        customer_id = int(payload["customer_id"])
        branch_id = int(payload["branch_id"])
        account_type = str(payload["account_type"]).strip()
        balance = Decimal(str(payload.get("balance", 0)))

        if account_type not in ALLOWED_ACCOUNT_TYPES:
            raise ValueError("Invalid account type")

        query = (
            "INSERT INTO `Account` (account_id, customer_id, branch_id, account_type, balance) VALUES (%s, %s, %s, %s, %s)"
            if account_id is not None
            else "INSERT INTO `Account` (customer_id, branch_id, account_type, balance) VALUES (%s, %s, %s, %s)"
        )
        parameters = (
            (account_id, customer_id, branch_id, account_type, balance)
            if account_id is not None
            else (customer_id, branch_id, account_type, balance)
        )

        connection = None
        cursor = None
        try:
            connection = cls._open_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, parameters)
            connection.commit()
            new_account_id = account_id if account_id is not None else cursor.lastrowid
            cursor.execute(
                "SELECT account_id, customer_id, branch_id, account_type, balance FROM `Account` WHERE account_id = %s",
                (new_account_id,),
            )
            row = cursor.fetchone()
            if row is None:
                raise RuntimeError("Account record could not be read back after insert")
            return cls._row_to_dict(row)
        except Exception:
            if connection is not None:
                connection.rollback()
            raise
        finally:
            close_resources(connection, cursor)

    @classmethod
    def update(cls, account_id: int, payload: dict[str, Any]) -> dict[str, Any] | None:
        account_type = str(payload["account_type"]).strip()
        if account_type not in ALLOWED_ACCOUNT_TYPES:
            raise ValueError("Invalid account type")

        query = "UPDATE `Account` SET customer_id = %s, branch_id = %s, account_type = %s, balance = %s WHERE account_id = %s"
        parameters = (
            int(payload["customer_id"]),
            int(payload["branch_id"]),
            account_type,
            Decimal(str(payload.get("balance", 0))),
            account_id,
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
                "SELECT account_id, customer_id, branch_id, account_type, balance FROM `Account` WHERE account_id = %s",
                (account_id,),
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
    def delete(cls, account_id: int) -> dict[str, Any] | None:
        connection = None
        cursor = None
        try:
            connection = cls._open_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT account_id, customer_id, branch_id, account_type, balance FROM `Account` WHERE account_id = %s",
                (account_id,),
            )
            existing = cursor.fetchone()
            if existing is None:
                return None

            cursor.execute("DELETE FROM `Account` WHERE account_id = %s", (account_id,))
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
        try:
            from ..database import get_connection
        except ImportError:  # pragma: no cover - allows running modules directly from backend/
            from database import get_connection

        return get_connection()

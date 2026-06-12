"""Trigger demonstration routes for the Banking Management System API."""

from __future__ import annotations

import logging
from decimal import Decimal, InvalidOperation
from typing import Any

from flask import Blueprint, jsonify, request
from mysql.connector import Error

try:
    from ..database import DatabaseConnectionError, close_resources, get_connection
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from database import DatabaseConnectionError, close_resources, get_connection

trigger_bp = Blueprint("triggers", __name__, url_prefix="/api/triggers")
logger = logging.getLogger(__name__)


def _success(message: str, data: Any | None = None, status_code: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status_code


def _error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


def _parse_account_id(raw_value: Any) -> int:
    if raw_value is None:
        raise ValueError("Account ID is required")

    try:
        account_id = int(str(raw_value).strip())
    except (TypeError, ValueError) as exc:
        raise ValueError("Account ID must be numeric") from exc

    if account_id <= 0:
        raise ValueError("Account ID must be greater than zero")

    return account_id


def _parse_amount(raw_value: Any) -> Decimal:
    if raw_value is None:
        raise ValueError("Amount is required")

    try:
        amount = Decimal(str(raw_value).strip())
    except (TypeError, InvalidOperation) as exc:
        raise ValueError("Amount must be numeric") from exc

    if amount <= 0:
        raise ValueError("Amount must be greater than zero")

    return amount


def _clean_payload(payload: dict[str, Any]) -> tuple[int, Decimal]:
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a valid JSON object")

    return _parse_account_id(payload.get("account_id")), _parse_amount(payload.get("amount"))


def _fetch_account(cursor, account_id: int) -> dict[str, Any] | None:
    cursor.execute(
        "SELECT account_id, customer_id, branch_id, account_type, balance FROM `Account` WHERE account_id = %s",
        (account_id,),
    )
    row = cursor.fetchone()
    if row is None:
        return None

    return {
        "account_id": row["account_id"],
        "customer_id": row["customer_id"],
        "branch_id": row["branch_id"],
        "account_type": row["account_type"],
        "balance": float(row["balance"]),
    }


def _fetch_transaction(cursor, transaction_id: int) -> dict[str, Any] | None:
    cursor.execute(
        "SELECT transaction_id, account_id, transaction_type, amount, transaction_date FROM `Transactions` WHERE transaction_id = %s",
        (transaction_id,),
    )
    row = cursor.fetchone()
    if row is None:
        return None

    return {
        "transaction_id": row["transaction_id"],
        "account_id": row["account_id"],
        "transaction_type": row["transaction_type"],
        "amount": float(row["amount"]),
        "transaction_date": row["transaction_date"].isoformat(sep=" ") if hasattr(row["transaction_date"], "isoformat") else str(row["transaction_date"]),
    }


def _execute_transaction(account_id: int, amount: Decimal, transaction_type: str):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        before = _fetch_account(cursor, account_id)
        if before is None:
            return _error("Account not found", 404)

        cursor.execute(
            "INSERT INTO `Transactions` (account_id, transaction_type, amount, transaction_date) VALUES (%s, %s, %s, CURRENT_TIMESTAMP)",
            (account_id, transaction_type, amount),
        )
        transaction_id = cursor.lastrowid
        connection.commit()

        after = _fetch_account(cursor, account_id)
        transaction = _fetch_transaction(cursor, transaction_id)

        return _success(
            f"{transaction_type} completed successfully",
            {
                "account_id": account_id,
                "transaction_type": transaction_type,
                "transaction_status": "Success",
                "amount": float(amount),
                "old_balance": before["balance"],
                "new_balance": after["balance"] if after is not None else before["balance"],
                "transaction": transaction,
            },
        )
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        if connection is not None:
            connection.rollback()
        message = getattr(exc, "msg", None) or str(exc)
        logger.exception("MySQL error while processing trigger request")
        return _error(message, 400)
    except Exception:
        if connection is not None:
            connection.rollback()
        logger.exception("Unexpected error while processing trigger request")
        return _error("An unexpected error occurred while processing the trigger demonstration", 500)
    finally:
        close_resources(connection, cursor)


@trigger_bp.post("/deposit")
def deposit():
    try:
        account_id, amount = _clean_payload(request.get_json(silent=True) or {})
        return _execute_transaction(account_id, amount, "Deposit")
    except ValueError as exc:
        return _error(str(exc), 400)


@trigger_bp.post("/withdraw")
def withdraw():
    try:
        account_id, amount = _clean_payload(request.get_json(silent=True) or {})
        return _execute_transaction(account_id, amount, "Withdrawal")
    except ValueError as exc:
        return _error(str(exc), 400)

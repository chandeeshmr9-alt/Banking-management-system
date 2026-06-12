"""Stored procedure routes for the Banking Management System API."""

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

procedure_bp = Blueprint("procedures", __name__, url_prefix="/api/procedures")
logger = logging.getLogger(__name__)


def _success(message: str, data: Any | None = None, status_code: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status_code


def _error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


def _parse_account_id(raw_value: Any, field_name: str) -> int:
    if raw_value is None:
        raise ValueError(f"{field_name} is required")

    if isinstance(raw_value, int):
        parsed_value = raw_value
    else:
        text = str(raw_value).strip()
        if not text:
            raise ValueError(f"{field_name} is required")
        if not text.isdigit():
            raise ValueError(f"{field_name} must be numeric")
        parsed_value = int(text)

    if parsed_value <= 0:
        raise ValueError(f"{field_name} must be greater than zero")

    return parsed_value


def _parse_amount(raw_value: Any) -> Decimal:
    if raw_value is None:
        raise ValueError("Amount is required")

    try:
        amount = Decimal(str(raw_value).strip())
    except (InvalidOperation, AttributeError):
        raise ValueError("Amount must be a valid number")

    if amount <= 0:
        raise ValueError("Amount must be greater than zero")

    return amount


def _clean_transfer_payload(payload: dict[str, Any]) -> tuple[int, int, Decimal]:
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a valid JSON object")

    from_account_id = payload.get("from_account_id", payload.get("source_account_id"))
    to_account_id = payload.get("to_account_id", payload.get("destination_account_id"))
    amount = payload.get("amount")

    source_account_id = _parse_account_id(from_account_id, "From Account ID")
    destination_account_id = _parse_account_id(to_account_id, "To Account ID")
    transfer_amount = _parse_amount(amount)

    if source_account_id == destination_account_id:
        raise ValueError("From Account ID and To Account ID must be different")

    return source_account_id, destination_account_id, transfer_amount


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


def _balance_snapshot(account: dict[str, Any] | None) -> dict[str, Any] | None:
    if account is None:
        return None

    return {
        "account_id": account["account_id"],
        "customer_id": account["customer_id"],
        "branch_id": account["branch_id"],
        "account_type": account["account_type"],
        "balance": account["balance"],
    }


def _fetch_recent_transactions(cursor, source_account_id: int, destination_account_id: int, transfer_amount: Decimal):
    cursor.execute(
        """
        SELECT transaction_id, account_id, transaction_type, amount, transaction_date
        FROM `Transactions`
        WHERE account_id IN (%s, %s)
          AND transaction_type IN ('Withdrawal', 'Deposit')
          AND amount = %s
        ORDER BY transaction_id DESC
        LIMIT 2
        """,
        (source_account_id, destination_account_id, transfer_amount),
    )
    rows = cursor.fetchall()
    rows.reverse()

    return [
        {
            "transaction_id": row["transaction_id"],
            "account_id": row["account_id"],
            "transaction_type": row["transaction_type"],
            "amount": float(row["amount"]),
            "transaction_date": row["transaction_date"].isoformat(sep=" ") if hasattr(row["transaction_date"], "isoformat") else str(row["transaction_date"]),
        }
        for row in rows
    ]


def _map_mysql_error(exc: Error):
    message = getattr(exc, "msg", None) or str(exc)
    logger.exception("MySQL error while processing stored procedure request")
    return _error(message, 400)


@procedure_bp.post("/transfer-funds")
def transfer_funds():
    connection = None
    cursor = None

    try:
        source_account_id, destination_account_id, transfer_amount = _clean_transfer_payload(request.get_json(silent=True) or {})

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        source_before = _fetch_account(cursor, source_account_id)
        if source_before is None:
            return _error("Source account not found.", 404)

        destination_before = _fetch_account(cursor, destination_account_id)
        if destination_before is None:
            return _error("Destination account not found.", 404)

        cursor.execute("CALL TransferFunds(%s, %s, %s)", (source_account_id, destination_account_id, transfer_amount))

        while cursor.nextset():
            pass

        connection.commit()

        source_account = _fetch_account(cursor, source_account_id)
        destination_account = _fetch_account(cursor, destination_account_id)
        transactions = _fetch_recent_transactions(cursor, source_account_id, destination_account_id, transfer_amount)

        if source_account is None:
            return _error("Source account not found after transfer", 404)
        if destination_account is None:
            return _error("Destination account not found after transfer", 404)

        return _success(
            "Transfer successful",
            {
                "transfer_amount": float(transfer_amount),
                "sender_before": _balance_snapshot(source_before),
                "sender_after": _balance_snapshot(source_account),
                "receiver_before": _balance_snapshot(destination_before),
                "receiver_after": _balance_snapshot(destination_account),
                "transactions": transactions,
            },
        )
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        if connection is not None:
            connection.rollback()
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while transferring funds")
        if connection is not None:
            connection.rollback()
        return _error("An unexpected error occurred while transferring funds", 500)
    finally:
        close_resources(connection, cursor)


@procedure_bp.post("/calculate-interest")
def calculate_interest():
    request.get_json(silent=True)
    return _error("This procedure demo only implements transfer funds for now", 501)

"""Account CRUD routes for the Banking Management System API."""

from __future__ import annotations

import logging
from typing import Any

from flask import Blueprint, jsonify, request
from mysql.connector import Error, errorcode

try:
    from ..database import DatabaseConnectionError
    from ..models.account import ALLOWED_ACCOUNT_TYPES, Account
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from database import DatabaseConnectionError
    from models.account import ALLOWED_ACCOUNT_TYPES, Account

logger = logging.getLogger(__name__)

account_bp = Blueprint("accounts", __name__, url_prefix="/api/accounts")


def _success(message: str, data: Any | None = None, status_code: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status_code


def _error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


def _parse_account_id(raw_account_id: Any) -> int:
    if raw_account_id is None:
        raise ValueError("Account ID is required")

    try:
        account_id = int(str(raw_account_id).strip())
    except (TypeError, ValueError) as exc:
        raise ValueError("Account ID must be numeric") from exc

    if account_id <= 0:
        raise ValueError("Account ID must be greater than zero")

    return account_id


def _parse_int_field(value: Any, field_name: str) -> int:
    try:
        parsed_value = int(str(value).strip())
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be numeric") from exc

    if parsed_value <= 0:
        raise ValueError(f"{field_name} must be greater than zero")

    return parsed_value


def _parse_balance(value: Any) -> float:
    try:
        parsed_value = float(str(value).strip())
    except (TypeError, ValueError) as exc:
        raise ValueError("Balance must be numeric") from exc

    if parsed_value < 0:
        raise ValueError("Balance cannot be negative")

    return parsed_value


def _clean_payload(payload: dict[str, Any], allow_account_id: bool = False) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a valid JSON object")

    cleaned: dict[str, Any] = {
        "customer_id": _parse_int_field(payload.get("customer_id"), "Customer ID"),
        "branch_id": _parse_int_field(payload.get("branch_id"), "Branch ID"),
        "account_type": str(payload.get("account_type", "")).strip(),
        "balance": _parse_balance(payload.get("balance", 0)),
    }

    if not cleaned["account_type"]:
        raise ValueError("Account type is required")

    if cleaned["account_type"] not in ALLOWED_ACCOUNT_TYPES:
        raise ValueError("Invalid account type")

    if allow_account_id and payload.get("account_id") not in (None, ""):
        cleaned["account_id"] = _parse_account_id(payload.get("account_id"))

    return cleaned


def _map_mysql_error(exc: Error):
    if exc.errno == errorcode.ER_DUP_ENTRY:
        return _error("Account ID already exists", 409)

    if exc.errno == errorcode.ER_NO_REFERENCED_ROW_2:
        return _error("Customer or branch not found", 400)

    if exc.errno == errorcode.ER_ROW_IS_REFERENCED_2:
        return _error("Account cannot be deleted because related records exist", 409)

    logger.exception("MySQL error while processing account request")
    return _error("A database error occurred while processing the account record", 500)


@account_bp.get("")
def get_accounts():
    try:
        accounts = Account.list_all()
        return _success("Accounts retrieved successfully", accounts)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while listing accounts")
        return _error("An unexpected error occurred while retrieving accounts", 500)


@account_bp.get("/<account_id>")
def get_account_by_id(account_id: str):
    try:
        parsed_account_id = _parse_account_id(account_id)
        account = Account.get_by_id(parsed_account_id)
        if account is None:
            return _error("Account not found", 404)
        return _success("Account retrieved successfully", account)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while reading account")
        return _error("An unexpected error occurred while retrieving the account", 500)


@account_bp.post("")
def create_account():
    try:
        payload = request.get_json(silent=True) or {}
        cleaned_payload = _clean_payload(payload, allow_account_id=True)
        account = Account.create(cleaned_payload)
        return _success("Account created successfully", account, 201)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while creating account")
        return _error("An unexpected error occurred while creating the account", 500)


@account_bp.put("/<account_id>")
def update_account(account_id: str):
    try:
        parsed_account_id = _parse_account_id(account_id)
        payload = request.get_json(silent=True) or {}

        if payload.get("account_id") not in (None, ""):
            incoming_account_id = _parse_account_id(payload.get("account_id"))
            if incoming_account_id != parsed_account_id:
                raise ValueError("Account ID in the request body must match the URL parameter")

        cleaned_payload = _clean_payload(payload)
        account = Account.update(parsed_account_id, cleaned_payload)
        if account is None:
            return _error("Account not found", 404)
        return _success("Account updated successfully", account)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while updating account")
        return _error("An unexpected error occurred while updating the account", 500)


@account_bp.delete("/<account_id>")
def delete_account(account_id: str):
    try:
        parsed_account_id = _parse_account_id(account_id)
        account = Account.delete(parsed_account_id)
        if account is None:
            return _error("Account not found", 404)
        return _success("Account deleted successfully", account)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while deleting account")
        return _error("An unexpected error occurred while deleting the account", 500)

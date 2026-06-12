"""Customer CRUD routes for the Banking Management System API."""

from __future__ import annotations

import logging
from typing import Any

from flask import Blueprint, jsonify, request
from mysql.connector import Error, errorcode

try:
    from ..models.customer import Customer
    from ..database import DatabaseConnectionError
except ImportError:  # pragma: no cover - allows running modules directly from backend/
    from models.customer import Customer
    from database import DatabaseConnectionError

logger = logging.getLogger(__name__)

customer_bp = Blueprint("customers", __name__, url_prefix="/api/customers")


def _success(message: str, data: Any | None = None, status_code: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status_code


def _error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


def _parse_customer_id(raw_customer_id: Any) -> int:
    if raw_customer_id is None:
        raise ValueError("Customer ID is required")

    if isinstance(raw_customer_id, int):
        customer_id = raw_customer_id
    else:
        text = str(raw_customer_id).strip()
        digits = "".join(character for character in text if character.isdigit())
        if not digits:
            raise ValueError("Customer ID must be numeric")
        customer_id = int(digits)

    if customer_id <= 0:
        raise ValueError("Customer ID must be greater than zero")

    return customer_id


def _clean_payload(payload: dict[str, Any], allow_customer_id: bool = False) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a valid JSON object")

    cleaned: dict[str, Any] = {
        "name": str(payload.get("name", "")).strip(),
        "phone": str(payload.get("phone", "")).strip(),
        "address": str(payload.get("address", "")).strip(),
    }

    if not cleaned["name"]:
        raise ValueError("Customer name is required")
    if not cleaned["phone"]:
        raise ValueError("Customer phone is required")
    if not cleaned["address"]:
        raise ValueError("Customer address is required")

    if allow_customer_id and payload.get("customer_id") not in (None, ""):
        cleaned["customer_id"] = _parse_customer_id(payload.get("customer_id"))

    return cleaned


def _map_mysql_error(exc: Error):
    if exc.errno == errorcode.ER_DUP_ENTRY:
        return _error("Customer phone or ID already exists", 409)

    if exc.errno == errorcode.ER_ROW_IS_REFERENCED_2:
        return _error("Customer cannot be deleted because related records exist", 409)

    logger.exception("MySQL error while processing customer request")
    return _error("A database error occurred while processing the customer record", 500)


@customer_bp.get("")
def get_customers():
    try:
        customers = Customer.list_all()
        return _success("Customers retrieved successfully", customers)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while listing customers")
        return _error("An unexpected error occurred while retrieving customers", 500)


@customer_bp.get("/<customer_id>")
def get_customer_by_id(customer_id: str):
    try:
        parsed_customer_id = _parse_customer_id(customer_id)
        customer = Customer.get_by_id(parsed_customer_id)
        if customer is None:
            return _error("Customer not found", 404)
        return _success("Customer retrieved successfully", customer)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while reading customer")
        return _error("An unexpected error occurred while retrieving the customer", 500)


@customer_bp.post("")
def create_customer():
    try:
        payload = request.get_json(silent=True) or {}
        cleaned_payload = _clean_payload(payload, allow_customer_id=True)
        customer = Customer.create(cleaned_payload)
        return _success("Customer created successfully", customer, 201)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while creating customer")
        return _error("An unexpected error occurred while creating the customer", 500)


@customer_bp.put("/<customer_id>")
def update_customer(customer_id: str):
    try:
        parsed_customer_id = _parse_customer_id(customer_id)
        payload = request.get_json(silent=True) or {}

        if payload.get("customer_id") not in (None, ""):
            incoming_customer_id = _parse_customer_id(payload.get("customer_id"))
            if incoming_customer_id != parsed_customer_id:
                raise ValueError("Customer ID in the request body must match the URL parameter")

        cleaned_payload = _clean_payload(payload)
        customer = Customer.update(parsed_customer_id, cleaned_payload)
        if customer is None:
            return _error("Customer not found", 404)
        return _success("Customer updated successfully", customer)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while updating customer")
        return _error("An unexpected error occurred while updating the customer", 500)


@customer_bp.delete("/<customer_id>")
def delete_customer(customer_id: str):
    try:
        parsed_customer_id = _parse_customer_id(customer_id)
        customer = Customer.delete(parsed_customer_id)
        if customer is None:
            return _error("Customer not found", 404)
        return _success("Customer deleted successfully", customer)
    except ValueError as exc:
        return _error(str(exc), 400)
    except DatabaseConnectionError as exc:
        return _error(str(exc), 503)
    except Error as exc:
        return _map_mysql_error(exc)
    except Exception:
        logger.exception("Unexpected error while deleting customer")
        return _error("An unexpected error occurred while deleting the customer", 500)

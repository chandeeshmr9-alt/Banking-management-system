"""Card management routes for the Banking Management System API."""

from __future__ import annotations

import logging
from typing import Any

from flask import Blueprint, jsonify, request

try:
    from ..models.card import Card
except ImportError:
    from models.card import Card

card_bp = Blueprint("cards", __name__)
logger = logging.getLogger(__name__)


def _success(data: Any, message: str = "Operation successful") -> Any:
    return jsonify({"success": True, "message": message, "data": data}), 200


def _error(message: str, status_code: int = 400) -> Any:
    return jsonify({"success": False, "message": message, "data": None}), status_code


@card_bp.get("")
def list_cards():
    try:
        return _success(Card.list_all())
    except Exception as exc:
        logger.exception("Failed to list cards")
        return _error(str(exc), 500)


@card_bp.get("/<int:card_id>")
def get_card(card_id: int):
    try:
        card = Card.get_by_id(card_id)
        if not card:
            return _error("Card not found", 404)
        return _success(card)
    except Exception as exc:
        logger.exception("Failed to get card")
        return _error(str(exc), 500)


@card_bp.post("")
def create_card():
    try:
        payload = request.get_json(silent=True) or {}
        required = ["account_id", "card_number", "card_type", "expiry_date", "cvv"]
        missing = [f for f in required if f not in payload]
        if missing:
            return _error(f"Missing required fields: {', '.join(missing)}")

        card = Card.create(payload)
        return _success(card, "Card created successfully")
    except ValueError as exc:
        return _error(str(exc), 400)
    except Exception as exc:
        logger.exception("Failed to create card")
        return _error(str(exc), 500)


@card_bp.put("/<int:card_id>")
def update_card(card_id: int):
    try:
        payload = request.get_json(silent=True) or {}
        card = Card.update(card_id, payload)
        if not card:
            return _error("Card not found", 404)
        return _success(card, "Card updated successfully")
    except ValueError as exc:
        return _error(str(exc), 400)
    except Exception as exc:
        logger.exception("Failed to update card")
        return _error(str(exc), 500)


@card_bp.delete("/<int:card_id>")
def delete_card(card_id: int):
    try:
        card = Card.delete(card_id)
        if not card:
            return _error("Card not found", 404)
        return _success(card, "Card deleted successfully")
    except Exception as exc:
        logger.exception("Failed to delete card")
        return _error(str(exc), 500)

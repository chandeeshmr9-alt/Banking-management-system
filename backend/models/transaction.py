"""Placeholder transaction model for future expansion."""

from __future__ import annotations

from dataclasses import dataclass, asdict


@dataclass(slots=True)
class Transaction:
    transaction_id: int | None = None
    account_id: int | None = None
    transaction_type: str | None = None
    amount: float | None = None
    transaction_date: str | None = None

    def to_dict(self) -> dict[str, object | None]:
        return asdict(self)

    @staticmethod
    def placeholder() -> dict[str, str]:
        return {
            "message": "Transaction model scaffold is ready for future CRUD implementation.",
        }

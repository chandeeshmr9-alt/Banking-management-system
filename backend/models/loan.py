"""Placeholder loan model for future expansion."""

from __future__ import annotations

from dataclasses import dataclass, asdict


@dataclass(slots=True)
class Loan:
    loan_id: int | None = None
    customer_id: int | None = None
    amount: float | None = None
    loan_type: str | None = None
    status: str | None = None

    def to_dict(self) -> dict[str, object | None]:
        return asdict(self)

    @staticmethod
    def placeholder() -> dict[str, str]:
        return {
            "message": "Loan model scaffold is ready for future CRUD implementation.",
        }

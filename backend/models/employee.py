"""Placeholder employee model for future expansion."""

from __future__ import annotations

from dataclasses import dataclass, asdict


@dataclass(slots=True)
class Employee:
    employee_id: int | None = None
    name: str | None = None
    branch_id: int | None = None
    role: str | None = None

    def to_dict(self) -> dict[str, object | None]:
        return asdict(self)

    @staticmethod
    def placeholder() -> dict[str, str]:
        return {
            "message": "Employee model scaffold is ready for future CRUD implementation.",
        }

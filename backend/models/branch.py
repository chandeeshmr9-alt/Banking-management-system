"""Placeholder branch model for future expansion."""

from __future__ import annotations

from dataclasses import dataclass, asdict


@dataclass(slots=True)
class Branch:
    branch_id: int | None = None
    branch_name: str | None = None
    location: str | None = None

    def to_dict(self) -> dict[str, object | None]:
        return asdict(self)

    @staticmethod
    def placeholder() -> dict[str, str]:
        return {
            "message": "Branch model scaffold is ready for future CRUD implementation.",
        }

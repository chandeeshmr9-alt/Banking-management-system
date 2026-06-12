"""Application configuration for the Banking Management System backend."""

from __future__ import annotations

import os
from dataclasses import dataclass


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Config:
    """Centralized runtime configuration loaded from environment variables."""

    SECRET_KEY: str = os.getenv("SECRET_KEY", "banking-management-system-secret")
    DEBUG: bool = _parse_bool(os.getenv("FLASK_DEBUG"), default=True)
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "Ajay@123")
    DB_NAME: str = os.getenv("DB_NAME", "banking_management_system")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_POOL_NAME: str = os.getenv("DB_POOL_NAME", "banking_pool")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    CORS_ORIGINS: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if origin.strip()
    )

    @classmethod
    def database_config(cls) -> dict[str, object]:
        return {
            "host": cls.DB_HOST,
            "user": cls.DB_USER,
            "password": cls.DB_PASSWORD,
            "database": cls.DB_NAME,
            "port": cls.DB_PORT,
            "pool_name": cls.DB_POOL_NAME,
            "pool_size": cls.DB_POOL_SIZE,
        }

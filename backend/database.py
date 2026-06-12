"""Database connection helpers for MySQL access."""

from __future__ import annotations

import logging
from contextlib import contextmanager
from typing import Any, Generator

import mysql.connector
from mysql.connector import Error, pooling

try:
    from .config import Config
except ImportError:  # pragma: no cover - allows running `python database.py` from backend/
    from config import Config

logger = logging.getLogger(__name__)

_connection_pool: pooling.MySQLConnectionPool | None = None


class DatabaseConnectionError(RuntimeError):
    """Raised when a database connection cannot be established."""


def initialize_connection_pool() -> pooling.MySQLConnectionPool | None:
    """Create the connection pool lazily so the API can still boot without the DB online."""

    global _connection_pool

    if _connection_pool is not None:
        return _connection_pool

    try:
        _connection_pool = pooling.MySQLConnectionPool(
            pool_name=Config.DB_POOL_NAME,
            pool_size=Config.DB_POOL_SIZE,
            pool_reset_session=True,
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=Config.DB_PORT,
        )
        logger.info("MySQL connection pool initialized successfully.")
    except Error as exc:
        logger.warning("MySQL connection pool could not be created: %s", exc)
        _connection_pool = None

    return _connection_pool


def get_connection() -> mysql.connector.connection_cext.CMySQLConnection | mysql.connector.connection.MySQLConnection:
    """Return a reusable MySQL connection, preferring the pool when available."""

    pool = initialize_connection_pool()

    try:
        if pool is not None:
            return pool.get_connection()

        return mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            port=Config.DB_PORT,
        )
    except Error as exc:
        logger.warning("Failed to create MySQL connection: %s", exc)
        raise DatabaseConnectionError("Unable to connect to the MySQL database") from exc


@contextmanager
def connection_cursor(dictionary: bool = False) -> Generator[tuple[Any, Any], None, None]:
    """Yield a connection and cursor, then clean them up safely afterward."""

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=dictionary)
        yield connection, cursor
    finally:
        if cursor is not None:
            try:
                cursor.close()
            except Error:
                logger.debug("Cursor cleanup failed", exc_info=True)
        if connection is not None and connection.is_connected():
            connection.close()


def close_resources(connection: Any | None = None, cursor: Any | None = None) -> None:
    """Best-effort cleanup for code paths that manage resources manually."""

    try:
        if cursor is not None:
            try:
                cursor.close()
            except Error:
                logger.debug("Cursor cleanup failed", exc_info=True)
    finally:
        if connection is not None and getattr(connection, "is_connected", lambda: False)():
            connection.close()

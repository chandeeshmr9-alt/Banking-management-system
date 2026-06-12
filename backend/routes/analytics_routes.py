"""Analytics routes for the Banking Management System."""

from __future__ import annotations
import logging
from flask import Blueprint, jsonify
try:
    from ..database import connection_cursor
except ImportError:
    from database import connection_cursor

logger = logging.getLogger(__name__)
analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.get("/summary")
def get_summary():
    """Get high-level KPIs for the dashboard."""
    try:
        with connection_cursor(dictionary=True) as (connection, cursor):
            # Total Balance
            cursor.execute("SELECT SUM(balance) as total_balance FROM Account")
            total_balance = cursor.fetchone()["total_balance"] or 0
            
            # Total Loans
            cursor.execute("SELECT SUM(amount) as total_loans FROM Loan WHERE status = 'Active'")
            total_loans = cursor.fetchone()["total_loans"] or 0
            
            # Active Customers
            cursor.execute("SELECT COUNT(*) as active_customers FROM Customer")
            active_customers = cursor.fetchone()["active_customers"]
            
            # Total Transactions (last 30 days)
            cursor.execute("SELECT COUNT(*) as recent_tx FROM Transactions WHERE transaction_date > DATE_SUB(NOW(), INTERVAL 30 DAY)")
            recent_tx = cursor.fetchone()["recent_tx"]

            return jsonify({
                "success": True,
                "data": {
                    "totalBalance": float(total_balance),
                    "totalLoans": float(total_loans),
                    "activeCustomers": active_customers,
                    "recentTransactions": recent_tx
                }
            })
    except Exception as e:
        logger.exception("Error fetching analytics summary")
        return jsonify({"success": False, "message": str(e)}), 500

@analytics_bp.get("/branch-performance")
def get_branch_performance():
    """Get performance data per branch."""
    try:
        with connection_cursor(dictionary=True) as (connection, cursor):
            cursor.execute("SELECT * FROM Branch_Performance_View")
            rows = cursor.fetchall()
            # Convert decimal to float for JSON serialization
            for row in rows:
                row["total_deposits"] = float(row["total_deposits"] or 0)
                row["monthly_inflow"] = float(row["monthly_inflow"] or 0)
            return jsonify({"success": True, "data": rows})
    except Exception as e:
        logger.exception("Error fetching branch performance")
        return jsonify({"success": False, "message": str(e)}), 500

@analytics_bp.get("/customer-tiers")
def get_customer_tiers():
    """Get distribution of customer tiers."""
    try:
        with connection_cursor(dictionary=True) as (connection, cursor):
            cursor.execute("SELECT customer_tier, COUNT(*) as count FROM Customer_Portfolio_View GROUP BY customer_tier")
            return jsonify({"success": True, "data": cursor.fetchall()})
    except Exception as e:
        logger.exception("Error fetching customer tiers")
        return jsonify({"success": False, "message": str(e)}), 500

@analytics_bp.get("/transaction-trends")
def get_transaction_trends():
    """Get monthly transaction volume trends."""
    try:
        with connection_cursor(dictionary=True) as (connection, cursor):
            query = """
                SELECT 
                    MONTHNAME(transaction_date) as month,
                    SUM(amount) as volume
                FROM Transactions
                WHERE transaction_date > DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY MONTH(transaction_date), MONTHNAME(transaction_date)
                ORDER BY MIN(transaction_date)
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                row["volume"] = float(row["volume"] or 0)
            return jsonify({"success": True, "data": rows})
    except Exception as e:
        logger.exception("Error fetching transaction trends")
        return jsonify({"success": False, "message": str(e)}), 500

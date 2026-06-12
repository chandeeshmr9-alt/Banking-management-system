# Banking Management System

A full-stack Banking Management System developed using MySQL, Python, Flask, React, and TypeScript. The project manages customers, accounts, transactions, cards, loans, branches, and employees, providing a robust platform for modern banking operations.

---

## Features

### Database Management
- Customer Management
- Account Management
- Transaction Tracking
- Card Issuance & Security
- Loan Processing & Disbursement
- Branch & Employee Management

### SQL Operations
- CRUD Operations
- INNER JOIN (Customer & Account details)
- LEFT JOIN (Customers without accounts)
- GROUP BY & HAVING (Branch performance analysis)
- Subqueries (Top transaction identification)
- Correlated Subqueries (Balance comparisons)
- Stored Procedures (Fund Transfers, Loan Disbursement)
- Triggers (Automatic Balance Updates, Audit Logging)

### Frontend
- Responsive Admin Dashboard
- Real-time Financial Analytics
- Transaction History Viewer
- Card Status Control Center
- Automated Audit Log Monitor
- Performance Trend Charts

---

## Database Schema

### Customer
| Column | Type |
|----------|----------|
| customer_id | INT (PK) |
| name | VARCHAR |
| email | VARCHAR |
| phone | VARCHAR |
| address | TEXT |

### Account
| Column | Type |
|----------|----------|
| account_id | INT (PK) |
| customer_id | INT (FK) |
| account_type | VARCHAR |
| balance | DECIMAL |
| branch_id | INT (FK) |

### Transaction
| Column | Type |
|----------|----------|
| transaction_id | INT (PK) |
| account_id | INT (FK) |
| transaction_type| VARCHAR |
| amount | DECIMAL |
| timestamp | DATETIME |

### Card
| Column | Type |
|----------|----------|
| card_id | INT (PK) |
| account_id | INT (FK) |
| card_number | VARCHAR |
| card_type | VARCHAR |
| status | VARCHAR |

### Loan
| Column | Type |
|----------|----------|
| loan_id | INT (PK) |
| customer_id | INT (FK) |
| amount | DECIMAL |
| loan_type | VARCHAR |
| status | VARCHAR |

---

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts (Analytics)

### Backend
- Python 3.x
- Flask
- Flask-CORS

### Database
- MySQL

### Tools
- MySQL Workbench
- VS Code
- Git & GitHub
- Postman

---

## Project Structure

```text
BankingManagementSystem/
│
├── backend/
│   ├── app.py (Flask Server)
│   ├── database.py (Connection Pool)
│   ├── config.py
│   ├── routes/ (API Endpoints)
│   └── venv/
│
├── src/ (Frontend)
│   ├── pages/ (Dashboard Components)
│   ├── components/
│   ├── services/ (API Calls)
│   └── lib/
│
├── banking_management_system.sql (Complete DB Schema)
├── package.json
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/chandeeshmr9-alt/Banking-management-system.git
```

### Navigate to Project

```bash
cd Banking-management-system
```

### Configure Database

1. Create MySQL database:

```sql
CREATE DATABASE banking_management_system;
```

2. Execute `banking_management_system.sql` in MySQL Workbench to set up tables, procedures, and triggers.

### Setup Backend

1. Navigate to backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Run Server:
```bash
python app.py
```

### Setup Frontend

1. Navigate to root and install:
```bash
npm install
```

2. Run Dashboard:
```bash
npm run dev
```

---

## Implemented Queries

1. Retrieve all registered customers.
2. Display all active accounts for a specific customer.
3. Customer and Account details (INNER JOIN).
4. Full transaction history for an account (Subquery optimization).
5. Total deposits per branch (GROUP BY).
6. Branches with total volume exceeding $1M (HAVING).
7. Identify customers with above-average balances.
8. Customers with no active accounts (LEFT JOIN).
9. High-value transactions within the last 24 hours.
10. System-wide audit log retrieval for security monitoring.

---

## Stored Procedures

### Transfer Funds

```sql
CALL TransferFunds(from_account, to_account, amount);
```
Ensures transaction safety by debiting and crediting accounts simultaneously.

### Disburse Loan

```sql
CALL DisburseLoan(loan_id);
```
Automatically updates loan status and injects approved funds into the customer's account.

---

## Triggers

### Update Balance Trigger

Automatically updates the `balance` in the `Accounts` table whenever a new `Transaction` is inserted.

### System Audit Trigger

Captures all `INSERT`, `UPDATE`, and `DELETE` operations and logs them into the `Audit_Logs` table for real-time security tracking.

---

## Future Enhancements

- Multi-factor Authentication (MFA)
- Mobile App Integration (React Native)
- AI-based Fraud Detection
- Real-time SMS/Email Notifications
- Investment Portfolio Management
- Cryptocurrency Support

---

## Learning Outcomes

- Advanced Relational Database Design
- Transaction Safety & ACID Compliance
- Stored Procedure & Trigger Implementation
- Full-Stack API Integration
- Real-time Data Visualization
- Enterprise Security Logging

---

## Author

**Chandeesh M R**

Banking Management System Project for Advanced DBMS Laboratory.

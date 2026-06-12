# 🏛️ Advanced Banking Management System (DBMS Project)

A sophisticated, full-stack banking platform designed to demonstrate advanced Database Management System (DBMS) concepts, including complex schema design, stored procedures, database triggers, and real-time analytics.

---

## 📖 Table of Contents
- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Database Design (The DBMS Core)](#database-design)
  - [Schema Overview](#schema-overview)
  - [Triggers (Automated Logic)](#triggers)
  - [Stored Procedures](#stored-procedures)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)

---

## 🌟 Project Overview
This system is built to manage the day-to-day operations of a modern bank. It handles everything from customer onboarding and account management to high-stakes operations like loan disbursements and card security.

**The highlight of this project is its Database Layer**, which uses native MySQL features to ensure data integrity and automate business logic without relying solely on the application code.

---

## 🏗️ System Architecture
The application follows a standard **Client-Server Architecture**:
- **Frontend**: A modern, responsive React Dashboard built with TypeScript and Tailwind CSS.
- **Backend**: A Python Flask REST API that handles business logic and communicates with the database.
- **Database**: A MySQL relational database where the "heavy lifting" (triggers/procedures) happens.

---

## 🚀 Key Features

### 🏦 Core Banking
- **Customer Onboarding**: Create and manage customer profiles with automated ID generation.
- **Multi-Account Support**: Manage Savings and Current accounts with real-time balance tracking.
- **Transactions**: Secure Deposits, Withdrawals, and Fund Transfers with automatic validation.

### 💳 Card Management
- **Debit & Credit Cards**: Issue new cards, block/unblock for security, and manage expiration.
- **Card Security**: Real-time status management directly from the dashboard.

### 💰 Loan Management System
- **Applications**: Customers can apply for various loan types (Home, Personal, etc.).
- **Automated Disbursement**: An integrated workflow that, upon approval, automatically credits the customer's account using a stored procedure.

### 📊 Real-time Analytics
- **Branch Performance**: View which branches are handling the most volume.
- **Transaction Trends**: Visual charts showing daily/monthly transaction patterns.
- **Customer Tiers**: Automatic categorization of customers based on their balances.

---

## 🛡️ Database Design (The DBMS Core)

### 📊 Schema Overview
The system consists of the following primary tables:
- `Customers`: Stores personal and contact information.
- `Accounts`: Linked to customers, stores current balances and account types.
- `Transactions`: Detailed ledger of every financial move.
- `Cards`: Management of physical/virtual cards linked to accounts.
- `Loans`: Tracks loan applications, status, and repayment.
- `Branches & Employees`: Management of the physical bank infrastructure.
- `Audit_Logs`: A system-wide table populated by triggers.

### ⚡ Triggers (Automated Logic)
- **`Update_Balance_Trigger`**: Automatically increases/decreases account balances whenever a record is added to the `Transactions` table.
- **`System_Audit_Trigger`**: Captures every `INSERT`, `UPDATE`, and `DELETE` action across the database and logs it into a central `Audit_Logs` table for security compliance.
- **`Loan_Security_Trigger`**: Prevents the deletion of active loans.

### ⚙️ Stored Procedures
- **`Transfer_Funds`**: A transaction-safe procedure that handles the simultaneous debit of one account and credit of another, ensuring that money is never lost in transit.
- **`Calculate_Interest`**: Iterates through savings accounts and applies monthly interest rates.
- **`Disburse_Loan`**: Handles the entire logic of switching a loan to 'Active' and injecting the funds into the customer's account.

---

## 🛠️ Tech Stack
| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Python 3.x, Flask, MySQL Connector |
| **Database** | MySQL 8.0 |
| **State Management** | React Context API |

---

## 📥 Installation & Setup

### 1. Database Configuration
1. Install MySQL Server.
2. Create a database: `CREATE DATABASE banking_management_system;`.
3. Import the schema: `mysql -u root -p banking_management_system < banking_management_system.sql`.

### 2. Backend Configuration
1. `cd backend`
2. `python -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. Create a `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=banking_management_system
   ```
5. `python app.py`

### 3. Frontend Configuration
1. `npm install`
2. `npm run dev`

---

## 🖥️ Usage Guide
1. **Login**: Use the default administrator credentials (Username: `admin`, Password: `admin`).
2. **Onboarding**: Start by adding a new customer, then create an account for them.
3. **Operations**: Use the "Transactions" or "Procedures" tab to move money.
4. **Security**: Monitor the "Audit Logs" to see how the database triggers are tracking your actions in real-time.

---
*Developed for Advanced DBMS Project - 2026*

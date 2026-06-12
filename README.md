# Banking Management System

A comprehensive, full-stack Banking Management System built with a focus on advanced DBMS features, modern UI, and robust backend logic.

## 🚀 Features

### 1. Core Banking Operations
*   **Customer Management**: Registration and profile management.
*   **Account Management**: Create and manage different types of bank accounts.
*   **Transaction System**: Real-time deposits, withdrawals, and history tracking.

### 2. Advanced DBMS Integrations
*   **Stored Procedures**: Automated logic for fund transfers and interest calculations.
*   **Database Triggers**: Real-time balance updates and automated system audit logging.
*   **Complex Queries**: Perspective-driven analytics for business insights.

### 3. Management Modules
*   **Card Management**: Issue and manage Debit/Credit cards (Activate, Block, Delete).
*   **Loan Workflow**: Complete loan application and automated approval/disbursement system.
*   **Employee & Branch Operations**: Manage bank staff and branch locations.

### 4. Security & Monitoring
*   **Audit Logs**: A dedicated viewer to monitor every database change (INSERT/UPDATE/DELETE).
*   **Authentication**: Secure login system for administrative access.

## 🛠️ Tech Stack
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide React (Icons).
*   **Backend**: Python, Flask, MySQL Connector.
*   **Database**: MySQL (with Triggers, Procedures, and Views).

## 📥 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   MySQL Server

### Database Setup
1. Create a database named `banking_management_system` in MySQL.
2. Execute the provided `banking_management_system.sql` file to set up tables, triggers, and procedures.

### Backend Setup
1. Navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `source venv/bin/activate` (Mac/Linux) or `.\venv\Scripts\activate` (Windows).
4. Install dependencies: `pip install -r requirements.txt`.
5. Create a `.env` file based on `.env.example` and add your MySQL credentials.
6. Run the server: `python app.py`.

### Frontend Setup
1. Navigate to the root folder.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.

## 📝 License
This project is for educational purposes.

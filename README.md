# Banking Management System

A modern, comprehensive Banking Management System dashboard featuring a responsive React frontend and a Flask + MySQL database backend. This application is designed to manage various banking operations, including customers, accounts, cards, loans, transactions, branches, and employees, alongside advanced database features like stored procedures, triggers, and audit logs.

## 🚀 Key Features

*   **Dashboard**: Overview of key banking statistics, recent activities, and metrics.
*   **Customer Management**: Full CRUD operations for customer profiles.
*   **Account Management**: Open, close, and monitor savings, checking, and loan accounts.
*   **Card Services**: Issue, block, and manage debit/credit cards.
*   **Transactions**: Record deposits, withdrawals, and bank transfers with real-time feedback.
*   **Database Procedures & Triggers**: Interactive interface to invoke stored database procedures and view active MySQL triggers.
*   **Audit Logging**: Detailed security and operation log tracing all database updates.
*   **Loan Management**: View and process customer loan requests.
*   **Employees & Branches**: Browse banking branch locations and assigned staff.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (v18) + TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS + Radix UI (Avatar, Dialog, Label, Separator, Slot)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Routing**: React Router DOM
*   **Toasts**: Sonner

### Backend
*   **Framework**: Flask (Python)
*   **Database Driver**: MySQL Connector/Python
*   **CORS**: Flask-Cors

### Database
*   **DBMS**: MySQL Server
*   **Schema**: Custom schema including tables, triggers, views, and stored procedures defined in `banking_management_system.sql`.

---

## 💻 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or newer)
*   [Python](https://www.python.org/) (v3.11 or newer)
*   [MySQL Server](https://www.mysql.com/)

---

### Step 1: Database Setup

1.  Start your MySQL server.
2.  Create a database named `banking_management_system`:
    ```sql
    CREATE DATABASE banking_management_system;
    ```
3.  Import the database schema and sample data using the provided `banking_management_system.sql` file:
    ```bash
    mysql -u your_username -p banking_management_system < banking_management_system.sql
    ```

---

### Step 2: Backend Setup

1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a Python virtual environment:
    ```bash
    # On macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # On Windows
    python -m venv venv
    venv\Scripts\activate
    ```
3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment variables:
    *   Copy `.env.example` to `.env`
    *   Open `.env` and fill in your MySQL database credentials (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, etc.).
5.  Start the Flask server:
    ```bash
    python app.py
    ```
    The API will run locally at `http://127.0.0.1:5000`.

---

### Step 3: Frontend Setup

1.  Navigate to the project root directory:
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```text
├── backend/                       # Flask API & MySQL logic
│   ├── models/                    # Database models
│   ├── routes/                    # API route handlers
│   ├── app.py                     # Entry point for Flask app
│   └── requirements.txt           # Python dependencies
├── src/                           # React frontend codebase
│   ├── components/                # Reusable UI components
│   ├── pages/                     # Dashboard page views
│   ├── services/                  # API communication services
│   ├── App.tsx                    # Main App router and layout
│   └── main.tsx                   # Frontend entry point
├── banking_management_system.sql  # Database dump (Tables, Triggers, Procedures)
├── package.json                   # Frontend configuration & scripts
└── README.md                      # Documentation
```

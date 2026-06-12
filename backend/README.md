# Banking Management System Backend

Flask + MySQL backend foundation for the Banking Management System.

## Requirements

- Python 3.11 or newer
- MySQL Server
- The `banking_management_system` database imported from `banking_management_system.sql`

## Setup

1. Create and activate a virtual environment inside `backend/`.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` if needed and update the database password.
4. Import `banking_management_system.sql` into MySQL.
5. Start the API:

```bash
python app.py
```

The server runs on port `5000` by default.

## API Overview

- `GET /health`
- `GET /api/customers`
- `GET /api/customers/<id>`
- `POST /api/customers`
- `PUT /api/customers/<id>`
- `DELETE /api/customers/<id>`

Other modules are scaffolded and return placeholder responses until they are expanded.

## Customer table schema

The existing SQL dump defines the customer table as:

- `customer_id` INT AUTO_INCREMENT PRIMARY KEY
- `name` VARCHAR(100) NOT NULL
- `phone` VARCHAR(20) NOT NULL UNIQUE
- `address` VARCHAR(255) NOT NULL

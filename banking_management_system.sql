-- ==========================================================
-- BANKING MANAGEMENT SYSTEM - ADVANCED DBMS PROJECT
-- ==========================================================

-- 1. Database Creation
DROP DATABASE IF EXISTS banking_management_system;
CREATE DATABASE banking_management_system;
USE banking_management_system;

-- Clear existing tables (Safe rerun)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Audit_Logs`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `Cards`;
DROP TABLE IF EXISTS `Transactions`;
DROP TABLE IF EXISTS `Loan`;
DROP TABLE IF EXISTS `Employee`;
DROP TABLE IF EXISTS `Account`;
DROP TABLE IF EXISTS `Customer`;
DROP TABLE IF EXISTS `Branch`;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Master Tables

-- Branch Table
CREATE TABLE `Branch` (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_branch_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer Table
CREATE TABLE `Customer` (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    dob DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_customer_phone (phone),
    UNIQUE KEY uk_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Authentication Table
CREATE TABLE `Users` (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Manager', 'Customer') NOT NULL DEFAULT 'Customer',
    customer_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    CONSTRAINT fk_user_customer FOREIGN KEY (customer_id) REFERENCES `Customer`(customer_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Banking Operation Tables

-- Account Table
CREATE TABLE `Account` (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    branch_id INT NOT NULL,
    account_type ENUM('Savings', 'Current', 'Salary', 'Fixed Deposit') NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('Active', 'Dormant', 'Frozen', 'Closed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_account_customer_id (customer_id),
    KEY idx_account_branch_id (branch_id),
    CONSTRAINT fk_account_customer FOREIGN KEY (customer_id) REFERENCES `Customer` (customer_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_account_branch FOREIGN KEY (branch_id) REFERENCES `Branch` (branch_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions Table
CREATE TABLE `Transactions` (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    transaction_type ENUM('Deposit', 'Withdrawal', 'Transfer', 'Interest', 'Fee') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    reference_id VARCHAR(50),
    KEY idx_transactions_account_id (account_id),
    KEY idx_transactions_date (transaction_date),
    CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES `Account` (account_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Loan Table
CREATE TABLE `Loan` (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL DEFAULT 8.50,
    loan_type VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Active', 'Closed') NOT NULL DEFAULT 'Pending',
    start_date DATE,
    end_date DATE,
    KEY idx_loan_customer_id (customer_id),
    CONSTRAINT fk_loan_customer FOREIGN KEY (customer_id) REFERENCES `Customer` (customer_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cards Table
CREATE TABLE `Cards` (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    card_number VARCHAR(16) NOT NULL UNIQUE,
    card_type ENUM('Debit', 'Credit') NOT NULL,
    expiry_date DATE NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    status ENUM('Active', 'Blocked', 'Expired') DEFAULT 'Active',
    CONSTRAINT fk_card_account FOREIGN KEY (account_id) REFERENCES `Account`(account_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Employee Table
CREATE TABLE `Employee` (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    branch_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary DECIMAL(12,2),
    hire_date DATE,
    KEY idx_employee_branch_id (branch_id),
    CONSTRAINT fk_employee_branch FOREIGN KEY (branch_id) REFERENCES `Branch` (branch_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit Logs Table
CREATE TABLE `Audit_Logs` (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Advanced Analytical Views

-- View: Branch Performance Dashboard
CREATE VIEW Branch_Performance_View AS
SELECT 
    b.branch_name,
    b.location,
    COUNT(DISTINCT a.account_id) as total_accounts,
    SUM(a.balance) as total_deposits,
    (SELECT COUNT(*) FROM Employee e WHERE e.branch_id = b.branch_id) as staff_count,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'Deposit' THEN t.amount ELSE 0 END), 0) as monthly_inflow
FROM Branch b
LEFT JOIN Account a ON b.branch_id = a.branch_id
LEFT JOIN Transactions t ON a.account_id = t.account_id AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY b.branch_id;

-- View: Customer Portfolio Overview
CREATE VIEW Customer_Portfolio_View AS
SELECT 
    c.customer_id,
    c.name,
    c.phone,
    COUNT(DISTINCT a.account_id) as account_count,
    SUM(DISTINCT a.balance) as total_cash_balance,
    COALESCE(SUM(DISTINCT l.amount), 0) as total_loan_obligation,
    CASE 
        WHEN SUM(DISTINCT a.balance) > 500000 THEN 'Platinum'
        WHEN SUM(DISTINCT a.balance) > 100000 THEN 'Gold'
        ELSE 'Standard'
    END as customer_tier
FROM Customer c
LEFT JOIN Account a ON c.customer_id = a.customer_id
LEFT JOIN Loan l ON c.customer_id = l.customer_id AND l.status = 'Active'
GROUP BY c.customer_id, c.name, c.phone;

-- 5. Stored Procedures & Triggers

DELIMITER $$

-- Procedure: Process Loan Approval with Automatic Account Credit
CREATE PROCEDURE ApproveLoan(IN p_loan_id INT)
BEGIN
    DECLARE v_customer_id INT;
    DECLARE v_amount DECIMAL(15,2);
    DECLARE v_account_id INT;
    
    SELECT customer_id, amount INTO v_customer_id, v_amount FROM Loan WHERE loan_id = p_loan_id;
    
    -- Find primary savings account to credit
    SELECT account_id INTO v_account_id FROM Account WHERE customer_id = v_customer_id AND account_type = 'Savings' LIMIT 1;
    
    IF v_account_id IS NOT NULL THEN
        START TRANSACTION;
        UPDATE Loan SET status = 'Active', start_date = CURDATE() WHERE loan_id = p_loan_id;
        INSERT INTO Transactions (account_id, transaction_type, amount, description) 
        VALUES (v_account_id, 'Deposit', v_amount, 'Loan Disbursement');
        COMMIT;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No savings account found for disbursement';
    END IF;
END$$

-- Trigger: Audit Transaction Inserts
CREATE TRIGGER trg_audit_transaction
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Logs (action, table_name, record_id, new_value)
    VALUES ('INSERT', 'Transactions', NEW.transaction_id, CONCAT('Type: ', NEW.transaction_type, ', Amount: ', NEW.amount));
END$$

-- Trigger: Enforce Minimum Balance on Withdrawal
CREATE TRIGGER trg_min_balance_check
BEFORE INSERT ON Transactions
FOR EACH ROW
BEGIN
    DECLARE v_balance DECIMAL(15,2);
    IF NEW.transaction_type = 'Withdrawal' THEN
        SELECT balance INTO v_balance FROM Account WHERE account_id = NEW.account_id;
        IF (v_balance - NEW.amount) < 500 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction rejected: Minimum balance of 500 required.';
        END IF;
    END IF;
END$$

-- Trigger: Update Account Balance after Transaction
CREATE TRIGGER trg_update_balance
AFTER INSERT ON Transactions
FOR EACH ROW
BEGIN
    IF NEW.transaction_type IN ('Deposit', 'Interest') THEN
        UPDATE Account SET balance = balance + NEW.amount WHERE account_id = NEW.account_id;
    ELSEIF NEW.transaction_type IN ('Withdrawal', 'Fee') THEN
        UPDATE Account SET balance = balance - NEW.amount WHERE account_id = NEW.account_id;
    END IF;
END$$

-- Procedure: Transfer Funds between accounts
CREATE PROCEDURE TransferFunds(
    IN p_from_account_id INT,
    IN p_to_account_id INT,
    IN p_amount DECIMAL(15,2)
)
BEGIN
    DECLARE v_from_balance DECIMAL(15,2);
    
    -- Start Transaction
    START TRANSACTION;
    
    -- 1. Check source account and lock for update
    SELECT balance INTO v_from_balance FROM Account 
    WHERE account_id = p_from_account_id FOR UPDATE;
    
    IF v_from_balance IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Source account not found';
    END IF;
    
    -- 2. Check for sufficient funds
    IF (v_from_balance - p_amount) < 500 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient funds: Minimum balance of 500 required';
    END IF;
    
    -- 3. Check destination account
    IF NOT EXISTS (SELECT 1 FROM Account WHERE account_id = p_to_account_id) THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Destination account not found';
    END IF;
    
    -- 4. Insert Withdrawal Transaction (Trigger will update balance)
    INSERT INTO Transactions (account_id, transaction_type, amount, description)
    VALUES (p_from_account_id, 'Withdrawal', p_amount, CONCAT('Transfer to Account ', p_to_account_id));
    
    -- 5. Insert Deposit Transaction (Trigger will update balance)
    INSERT INTO Transactions (account_id, transaction_type, amount, description)
    VALUES (p_to_account_id, 'Deposit', p_amount, CONCAT('Transfer from Account ', p_from_account_id));
    
    COMMIT;
END$$

DELIMITER ;

-- 6. Advanced SQL Queries (Perspective Driven)

-- [CRM] Identify High Net Worth Individuals (HNIs) for specialized marketing
-- Perspective: Marketing team needs customers with > 200k balance
SELECT name, phone, total_cash_balance, customer_tier
FROM Customer_Portfolio_View
WHERE total_cash_balance > 200000
ORDER BY total_cash_balance DESC;

-- [Risk] Detect Potential Money Laundering (Rapid consecutive large transactions)
-- Perspective: Compliance team looking for multiple > 50k transactions in a single day
SELECT account_id, COUNT(*) as large_tx_count, SUM(amount) as total_vol
FROM Transactions
WHERE amount > 50000 AND transaction_date > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY account_id
HAVING COUNT(*) > 2;

-- [Financials] Daily Branch Liquidity Ratio
-- Perspective: CFO evaluating branch health
SELECT 
    branch_name, 
    total_deposits,
    (total_deposits / (SELECT SUM(balance) FROM Account)) * 100 as network_share_percentage
FROM Branch_Performance_View;

-- [Operational] Dormant Account Identification
-- Perspective: Operations team identifying accounts with no activity for 6 months
SELECT a.account_id, c.name, a.balance, a.status
FROM Account a
JOIN Customer c ON a.customer_id = c.customer_id
WHERE NOT EXISTS (
    SELECT 1 FROM Transactions t 
    WHERE t.account_id = a.account_id AND t.transaction_date > DATE_SUB(NOW(), INTERVAL 6 MONTH)
);

-- [Analytics] Monthly Transaction Trend (Using Window Functions)
-- Perspective: Data Analyst tracking growth
SELECT 
    MONTHNAME(transaction_date) as month,
    SUM(amount) as monthly_volume,
    AVG(SUM(amount)) OVER (ORDER BY MIN(transaction_date) ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as 3_month_moving_avg
FROM Transactions
GROUP BY MONTH(transaction_date), MONTHNAME(transaction_date);

-- 7. Sample Data (Enhanced)

INSERT INTO Branch (branch_name, location) VALUES
('Global Heights', 'Mumbai'), ('Capital Square', 'Delhi'), ('Tech Park', 'Bengaluru');

INSERT INTO Customer (name, phone, address, email, dob) VALUES
('Arjun Mehta', '9876543210', 'Mehta Villa, Mumbai', 'arjun@example.com', '1985-05-12'),
('Sana Khan', '9876543211', 'Skyline Apt, Delhi', 'sana@example.com', '1992-08-24'),
('Robert D\'souza', '9876543212', 'Garden City, Bengaluru', 'robert@example.com', '1978-11-30');

-- Standard password hash for 'password123' (Example for demo)
INSERT INTO Users (username, password_hash, role, customer_id) VALUES
('admin', '$2b$12$Ex.m...admin...hash...', 'Admin', NULL),
('arjun_m', '$2b$12$Ex.m...user...hash...', 'Customer', 1);

INSERT INTO Account (customer_id, branch_id, account_type, balance) VALUES
(1, 1, 'Savings', 250000.00),
(1, 1, 'Current', 50000.00),
(2, 2, 'Savings', 12000.00),
(3, 3, 'Savings', 450000.00);

INSERT INTO Transactions (account_id, transaction_type, amount, description) VALUES
(1, 'Deposit', 10000.00, 'Initial Setup'),
(1, 'Deposit', 60000.00, 'Monthly Salary'),
(4, 'Deposit', 100000.00, 'Inheritance'),
(2, 'Withdrawal', 5000.00, 'ATM Cash');

INSERT INTO Loan (customer_id, amount, loan_type, status) VALUES
(1, 1000000.00, 'Home Loan', 'Active'),
(2, 50000.00, 'Personal Loan', 'Pending');

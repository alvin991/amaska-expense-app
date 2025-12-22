CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (username, email) VALUES ('alvin', 'alvin@amaska.ca');
INSERT INTO users (username, email) VALUES ('abbie', 'abbie@amaska.ca');
INSERT INTO users (username, email) VALUES ('annabelle', 'annabelle@amaska.ca');

CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7),
    icon VARCHAR(100)
);
INSERT INTO expense_categories (name, description, color, icon) VALUES ('PERSONAL', 'PERSONAL EXPENSES', 'pink', 'personal');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('DINE OUT', 'DINE OUT EXPENSES', 'teal', 'dining');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('GROCERY', 'GROCERY EXPENSES', 'green', 'grocery');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('CAR', 'CAR EXPENSES', 'grey', 'car');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('PET', 'PET EXPENSES', 'orange', 'pets');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('ANNABELLE', 'ANNABELLE EXPENSES', 'purple', 'bebe');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('HOUSEHOLD', 'HOUSEHOLD EXPENSES', 'brown', 'household');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('ENTERTAINMENT', 'ENTERTAINMENT EXPENSES', NULL, NULL);
INSERT INTO expense_categories (name, description, color, icon) VALUES ('CHURCH', 'CHURCH EXPENSES', '#e5e51c', 'church');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('BUSINESS', 'BUSINESS EXPENSES', 'blue', 'business');
INSERT INTO expense_categories (name, description, color, icon) VALUES ('MISCELLANEOUS', 'MISCELLANEOUS EXPENSES', 'white', 'miscellaneous');

CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);
INSERT INTO payment_methods (name, description) VALUES ('Cash', 'Cash Payment');
INSERT INTO payment_methods (name, description) VALUES ('Debit', 'Debit Payment');
INSERT INTO payment_methods (name, description) VALUES ('Alvin AVION (6776)', 'RBC Avion VISA (6776) - Household fixed expenses');
INSERT INTO payment_methods (name, description) VALUES ('Ahbee AVION', 'RBC Avion VISA - Personal buying');
INSERT INTO payment_methods (name, description) VALUES ('Alvin Walmart (5457/1523)', 'CIBC MASTER (5457/1523) - Dine out');
INSERT INTO payment_methods (name, description) VALUES ('Ahbee Walmart (4830/4024/9598)', 'CIBC MASTER (4830/4024)- Groceries');
INSERT INTO payment_methods (name, description) VALUES ('Bebe WestJet (3315)', 'WestJet MASTER (3315) - All her expenses');
INSERT INTO payment_methods (name, description) VALUES ('Costco (5021)', 'CIBC MASTER (5021) - Costco & gas');

CREATE TABLE IF NOT EXISTS expense_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_amount DECIMAL(10, 2), -- planned amount at generation time
    amount DECIMAL(10, 2) NOT NULL, -- actual amount (can be edited later)
    notes VARCHAR(255),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    project_category_id INTEGER, -- planned category at generation time
    category_id INTEGER NOT NULL,
    merchant VARCHAR(100),
    project_payment_method_id INTEGER, -- planned payment method at generation time
    payment_method_id INTEGER,
    recurring_expense_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (project_category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (project_payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (recurring_expense_id) REFERENCES recurring_expenses(id) ON DELETE SET NULL
);

-- Recurring expenses: template of future transactions
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_amount DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255),
    merchant VARCHAR(100) NOT NULL,
    project_category_id INTEGER NOT NULL,
    project_payment_method_id INTEGER NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    interval INTEGER NOT NULL DEFAULT 1, -- every N days/weeks/months/years
    start_date DATE NOT NULL,
    end_date DATE,
    next_run_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (project_payment_method_id) REFERENCES payment_methods(id)
);
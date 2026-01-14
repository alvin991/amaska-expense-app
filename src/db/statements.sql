CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    settings TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP
);
INSERT INTO users (username, email) VALUES ('alvin', 'alvin@amaska.ca');
INSERT INTO users (username, email) VALUES ('abbie', 'abbie@amaska.ca');
INSERT INTO users (username, email) VALUES ('annabelle', 'annabelle@amaska.ca');

CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7),
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (modified_by) REFERENCES users(id)
);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('PERSONAL', 'PERSONAL EXPENSES', 'pink', 'personal', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('DINE OUT', 'DINE OUT EXPENSES', 'teal', 'dining', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('GROCERY', 'GROCERY EXPENSES', 'green', 'grocery', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('CAR', 'CAR EXPENSES', 'grey', 'car', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('PET', 'PET EXPENSES', 'orange', 'pets', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('ANNABELLE', 'ANNABELLE EXPENSES', 'purple', 'bebe', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('HOUSEHOLD', 'HOUSEHOLD EXPENSES', 'brown', 'household', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('ENTERTAINMENT', 'ENTERTAINMENT EXPENSES', NULL, NULL, 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('CHURCH', 'CHURCH EXPENSES', '#e5e51c', 'church', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('BUSINESS', 'BUSINESS EXPENSES', 'blue', 'business', 1);
INSERT INTO expense_categories (name, description, color, icon, created_by) VALUES ('MISCELLANEOUS', 'MISCELLANEOUS EXPENSES', 'white', 'miscellaneous', 1);

CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (modified_by) REFERENCES users(id)
);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Cash', 'Cash Payment', 1);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Debit', 'Debit Payment', 1);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Alvin AVION (6776)', 'RBC Avion VISA (6776) - Household fixed expenses', 1);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Ahbee AVION', 'RBC Avion VISA - Personal buying', 1);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Alvin Walmart (5457/1523)', 'CIBC MASTER (5457/1523) - Dine out', 1);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Ahbee Walmart (4830/4024/9598)', 'CIBC MASTER (4830/4024)- Groceries', 1);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Bebe WestJet (3315)', 'WestJet MASTER (3315) - All her expenses', 1);
INSERT INTO payment_methods (name, description, created_by) VALUES ('Costco (5021)', 'CIBC MASTER (5021) - Costco & gas', 1);

CREATE TABLE IF NOT EXISTS expense_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projected_amount DECIMAL(10, 2), -- planned amount at generation time
    amount DECIMAL(10, 2) NOT NULL, -- actual amount (can be edited later)
    notes VARCHAR(255),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    projected_transaction_date TIMESTAMP, -- planned date at generation time
    category_id INTEGER NOT NULL,
    merchant VARCHAR(100),
    payment_method_id INTEGER,
    recurring_template_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (recurring_template_id) REFERENCES recurring_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (modified_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS recurring_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT 1,
    projected_amount DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255),
    merchant VARCHAR(100) NOT NULL,
    projected_category_id INTEGER NOT NULL,
    projected_payment_method_id INTEGER NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'
    interval INTEGER NOT NULL DEFAULT 1, -- every N days/weeks/months/years
    start_date DATE NOT NULL,
    end_date DATE,
    next_run_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    modified_at TIMESTAMP,
    modified_by INTEGER,
    FOREIGN KEY (projected_category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (projected_payment_method_id) REFERENCES payment_methods(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (modified_by) REFERENCES users(id)
);
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES ('alvin', 'alvin@amaska.com');
INSERT INTO users (username, email) VALUES ('abbie', 'abbie@amaska.com');
INSERT INTO users (username, email) VALUES ('annabelle', 'annabelle@amaska.com');

UPDATE users SET email = 'alvin@amaska.ca' WHERE username = 'alvin';
UPDATE users SET email = 'abbie@amaska.ca' WHERE username = 'abbie';
UPDATE users SET email = 'annabelle@amaska.ca' WHERE username = 'annabelle';

SELECT * FROM users;

CREATE TABLE expense_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE expense_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id INTEGER NOT NULL,
    merchant VARCHAR(100),
    payment_method_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)
);

INSERT INTO expense_transactions (user_id, amount, notes, transaction_date, category_id, merchant, payment_method_id) VALUES (1, 50.00, 'Grocery shopping', '2025-11-06 18:00:00', 3, 'Walmart', 6);
INSERT INTO expense_transactions (user_id, amount, notes, transaction_date, category_id, merchant, payment_method_id) VALUES (1, 90.00, 'Dinner at restaurant', '2025-11-05 20:00:00', 2, 'Kinjo', 5);

SELECT 
    t.id AS transaction_id,
    t.amount,
    t.notes,
    t.transaction_date,
    t.merchant,
    u.id AS user_id,
    u.username,
    u.email,
    u.created_at AS user_created_at,
    c.id AS category_id,
    c.name AS category_name,
    c.description AS category_description,
    p.id AS payment_method_id,
    p.name AS payment_method_name,
    p.description AS payment_method_description
FROM expense_transactions t
JOIN users u ON t.user_id = u.id
JOIN expense_categories c ON t.category_id = c.id
JOIN payment_methods p ON t.payment_method_id = p.id;

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

ALTER TABLE expense_categories ADD COLUMN color VARCHAR(7);
ALTER TABLE expense_categories ADD COLUMN icon VARCHAR(100);

UPDATE expense_categories SET color = 'pink', icon = 'personal' WHERE name = 'PERSONAL';
UPDATE expense_categories SET color = 'teal', icon = 'dining' WHERE name = 'DINE OUT';
UPDATE expense_categories SET color = 'green', icon = 'grocery' WHERE name = 'GROCERY';
UPDATE expense_categories SET color = 'grey', icon = 'car' WHERE name = 'CAR';
UPDATE expense_categories SET color = 'orange', icon = 'pets' WHERE name = 'PET';
UPDATE expense_categories SET color = 'purple', icon = 'bebe' WHERE name = 'ANNABELLE';
UPDATE expense_categories SET color = 'brown', icon = 'household' WHERE name = 'HOUSEHOLD';
UPDATE expense_categories SET color = NULL, icon = NULL WHERE name = 'ENTERTAINMENT';
UPDATE expense_categories SET color = '#e5e51c', icon = 'church' WHERE name = 'CHURCH';
UPDATE expense_categories SET color = 'blue', icon = 'business' WHERE name = 'BUSINESS';
UPDATE expense_categories SET color = 'white', icon = 'miscellaneous' WHERE name = 'MISCELLANEOUS';

DROP TABLE if exists payment_method;
CREATE TABLE payment_methods (
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

UPDATE payment_methods SET name = 'Alvin AVION (6776)' WHERE id = 3;
UPDATE payment_methods SET name = 'Alvin Walmart (5457/1523)' WHERE id = 5;
UPDATE payment_methods SET name = 'Ahbee Walmart (4830/4024/9598)' WHERE id = 6;
UPDATE payment_methods SET name = 'Bebe WestJet (3315)' WHERE id = 7;
UPDATE payment_methods SET name = 'Costco (5021)' WHERE id = 8;
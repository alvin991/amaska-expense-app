CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email) VALUES ('alvin', 'alvin@amaska.com');
INSERT INTO users (username, email) VALUES ('abbie', 'abbie@amaska.com');
INSERT INTO users (username, email) VALUES ('annabelle', 'annabelle@amaska.com');

UPDATE users set email = 'alvin@amaska.ca' where username = 'alvin';
UPDATE users set email = 'abbie@amaska.ca' where username = 'abbie';
UPDATE users set email = 'annabelle@amaska.ca' where username = 'annabelle';

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

INSERT INTO expense_categories (name, description) VALUES ('PERSONAL', 'PERSONAL EXPENSES');
INSERT INTO expense_categories (name, description) VALUES ('DINE OUT', 'DINE OUT EXPENSES');
INSERT INTO expense_categories (name, description) VALUES ('GROCERY', 'GROCERY EXPENSES');
INSERT INTO expense_categories (name, description) VALUES ('CAR', 'CAR EXPENSES');
INSERT INTO expense_categories (name, description) VALUES ('PET', 'PET EXPENSES');
INSERT INTO expense_categories (name, description) VALUES ('ANNABELLE', 'ANNABELLE EXPENSES');
INSERT INTO expense_categories (name, description) VALUES ('HOUSEHOLD', 'HOUSEHOLD EXPENSES');
INSERT INTO expense_categories (name, description) VALUES ('ENTERTAINMENT', 'ENTERTAINMENT EXPENSES');

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

update payment_methods set name = 'Alvin AVION (6776)' where id = 3;
update payment_methods set name = 'Alvin Walmart (5457/1523)' where id = 5;
update payment_methods set name = 'Ahbee Walmart (4830/4024/9598)' where id = 6;
update payment_methods set name = 'Bebe WestJet (3315)' where id = 7;
update payment_methods set name = 'Costco (5021)' where id = 8;
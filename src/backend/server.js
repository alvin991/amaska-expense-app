const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173', // Adjust this to your frontend's origin
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.get('/api/users', (req, res) => {
    const db = new sqlite3.Database('./../db/database.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            res.status(500).json({ error: 'Failed to connect to the database' });
            return;
        }

        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).json({ error: 'Failed to retrieve data' });
            } else {
                res.json(rows);
            }
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                }
            });
        });
    });
});

app.get('/api/categories', (req, res) => {
    const db = new sqlite3.Database('./../db/database.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            res.status(500).json({ error: 'Failed to connect to the database' });
            return;
        }

        db.all('SELECT * FROM expense_categories', [], (err, rows) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).json({ error: 'Failed to retrieve data' });
            } else {
                res.json(rows);
            }
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                }
            });
        });
    });
});

app.get('/api/payment_methods', (req, res) => {
    const db = new sqlite3.Database('./../db/database.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            res.status(500).json({ error: 'Failed to connect to the database' });
            return;
        }

        db.all('SELECT * FROM payment_methods', [], (err, rows) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).json({ error: 'Failed to retrieve data' });
            } else {
                res.json(rows);
            }
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                }
            });
        });
    });
});

app.get('/api/transactions', (req, res) => {
    const db = new sqlite3.Database('./../db/database.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            res.status(500).json({ error: 'Failed to connect to the database' });
            return;
        }

        db.all(`SELECT 
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
                JOIN payment_methods p ON t.payment_method_id = p.id
                ORDER BY t.transaction_date DESC, t.id DESC;`, [], (err, rows) => {
            if (err) {
                console.error('Error executing query:', err.message);
                res.status(500).json({ error: 'Failed to retrieve data' });
            } else {
                res.json(rows);
            }
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                }
            });
        });
    });
});

// Create new transaction
app.post('/api/transactions', (req, res) => {
    const { user_id, amount, notes, transaction_date, merchant, category_id, payment_method_id } = req.body;
    
    const db = new sqlite3.Database('./../db/database.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Failed to connect to the database' });
        }

        const sql = `
            INSERT INTO expense_transactions 
            (user_id, amount, notes, transaction_date, merchant, category_id, payment_method_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [user_id, amount, notes, transaction_date, merchant, category_id, payment_method_id], 
            function(err) {
                if (err) {
                    console.error('Error creating transaction:', err.message);
                    res.status(500).json({ error: 'Failed to create transaction' });
                } else {
                    res.status(201).json({ 
                        message: 'Transaction created successfully',
                        id: this.lastID 
                    });
                }
                db.close();
            }
        );
    });
});

// Update existing transaction
app.put('/api/transactions/:id', (req, res) => {
    const { amount, notes, transaction_date, merchant, category_id, payment_method_id } = req.body;
    const transactionId = req.params.id;
    
    const db = new sqlite3.Database('./../db/database.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Failed to connect to the database' });
        }

        const sql = `
            UPDATE expense_transactions 
            SET amount = ?,
                notes = ?,
                transaction_date = ?,
                merchant = ?,
                category_id = ?,
                payment_method_id = ?
            WHERE id = ?
        `;
        
        db.run(sql, [amount, notes, transaction_date, merchant, category_id, payment_method_id, transactionId], 
            function(err) {
                if (err) {
                    console.error('Error updating transaction:', err.message);
                    res.status(500).json({ error: 'Failed to update transaction' });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'Transaction not found' });
                } else {
                    res.json({ 
                        message: 'Transaction updated successfully',
                        changes: this.changes 
                    });
                }
                db.close();
            }
        );
    });
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
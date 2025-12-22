const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database file path: can be overridden via DB_PATH in .env or environment
const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, './../db/database.db');
const sqlPath = path.join(__dirname, './../db/statements.sql');

// If database does not exist, create and initialize it
if (!fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath);
  const initSql = fs.readFileSync(sqlPath, 'utf8');
  db.exec(initSql, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully.');
    }
    db.close();
  });
}

const app = express();

// Ensure recurring-related tables/columns exist for older databases
(() => {
    const db = new sqlite3.Database(dbPath);
    const createSql = `
        CREATE TABLE IF NOT EXISTS recurring_expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            project_amount DECIMAL(10, 2) NOT NULL,
            notes VARCHAR(255),
            merchant VARCHAR(100) NOT NULL,
            project_category_id INTEGER NOT NULL,
            project_payment_method_id INTEGER NOT NULL,
            frequency VARCHAR(20) NOT NULL,
            interval INTEGER NOT NULL DEFAULT 1,
            start_date DATE NOT NULL,
            end_date DATE,
            next_run_date DATE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (project_category_id) REFERENCES expense_categories(id),
            FOREIGN KEY (project_payment_method_id) REFERENCES payment_methods(id)
        );
    `;

    db.exec(createSql, (err) => {
        if (err) {
                console.error('Error ensuring recurring_expenses table exists:', err);
        }

        // Try to add recurring_expense_id column to expense_transactions for older schemas.
        // If the table doesn't exist or the column already exists, ignore the error.
        const alterSql = 'ALTER TABLE expense_transactions ADD COLUMN recurring_expense_id INTEGER';
        db.run(alterSql, (alterErr) => {
            const msg = String(alterErr && alterErr.message || '');
            if (alterErr && !msg.includes('duplicate column name') && !msg.includes('no such table')) {
                console.error('Error adding recurring_expense_id column:', alterErr.message);
            }
            db.close();
        });
    });
})();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'http://localhost:8080'
    : 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Utility to advance a YYYY-MM-DD date string by a given frequency/interval
function addPeriod(dateStr, frequency, interval) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);

    switch (frequency) {
        case 'daily':
            d.setDate(d.getDate() + interval);
            break;
        case 'weekly':
            d.setDate(d.getDate() + 7 * interval);
            break;
        case 'monthly':
            d.setMonth(d.getMonth() + interval);
            break;
        case 'yearly':
            d.setFullYear(d.getFullYear() + interval);
            break;
        default:
            d.setDate(d.getDate() + interval);
            break;
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Generate recurring transactions up to (and including) a given date
function applyRecurringExpenses(upToDate, callback) {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database for recurring expenses:', err.message);
            callback(err);
        }
    });

    const targetDate = upToDate;

    db.all('SELECT * FROM recurring_expenses', [], (err, rows) => {
        if (err) {
            console.error('Error reading recurring_expenses:', err.message);
            db.close();
            return callback(err);
        }

        const processNext = (index) => {
            if (index >= rows.length) {
                db.close();
                return callback(null);
            }

            const rec = rows[index];
            let { next_run_date: nextRunDate } = rec;

            const shouldContinue = () => {
                if (!nextRunDate) return false;
                if (nextRunDate > targetDate) return false;
                if (rec.end_date && nextRunDate > rec.end_date) return false;
                return true;
            };

            const insertOne = () => {
                if (!shouldContinue()) {
                    // update next_run_date in DB and move to next template
                    const updateSql = 'UPDATE recurring_expenses SET next_run_date = ? WHERE id = ?';
                    db.run(updateSql, [nextRunDate, rec.id], (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating next_run_date:', updateErr.message);
                        }
                        processNext(index + 1);
                    });
                    return;
                }

                const insertSql = `
                    INSERT INTO expense_transactions
                    (user_id, project_amount, amount, notes, transaction_date, merchant, project_category_id, category_id, project_payment_method_id, payment_method_id, recurring_expense_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(
                    insertSql,
                    [
                        rec.user_id,
                        rec.project_amount, // planned amount snapshot
                        rec.project_amount, // initial actual amount equals planned
                        rec.notes,
                        nextRunDate,
                        rec.merchant,


                        rec.project_category_id,
                        rec.project_category_id,
                        rec.project_payment_method_id,
                        rec.project_payment_method_id,
                        rec.id,
                    ],
                    (insertErr) => {
                        if (insertErr) {
                            console.error('Error inserting recurring transaction:', insertErr.message);
                            // Skip further inserts for this template
                            processNext(index + 1);
                            return;
                        }

                        // advance nextRunDate and loop
                        nextRunDate = addPeriod(nextRunDate, rec.frequency, rec.interval || 1);
                        insertOne();
                    }
                );
            };

            insertOne();
        };

        processNext(0);
    });
}

app.get('/api/users', (req, res) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
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
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
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

// Create new Category
app.post('/api/categories', (req, res) => {
    console.log(`POST /api/categories called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { name, description, color, icon } = req.body;
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Failed to connect to the database' });
        }

        const sql = `
            INSERT INTO expense_categories 
            (name, description, color, icon)
            VALUES (?, ?, ?, ?)
        `;
        
        db.run(sql, [name, description, color, icon], 
            function(err) {
                if (err) {
                    console.error('Error creating category:', err.message);
                    res.status(500).json({ error: err.message || 'Failed to create category' });
                } else {
                    res.status(201).json({ 
                        message: 'Category created successfully',
                        id: this.lastID 
                    });
                }
                db.close();
            }
        );
    });
});

// Update existing Category
app.put('/api/categories/:id', (req, res) => {
    console.log(`PUT /api/categories/${req.params.id} called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { name, description, color, icon } = req.body;
    const categoryId = req.params.id;
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Failed to connect to the database' });
        }

        const sql = `
            UPDATE expense_categories 
            SET name = ?,
                description = ?,
                color = ?,
                icon = ?
            WHERE id = ?
        `;
        
        db.run(sql, [name, description, color, icon, categoryId], 
            function(err) {
                if (err) {
                    console.error('Error updating category:', err.message);
                    res.status(500).json({ error: 'Failed to update category' });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'Category not found' });
                } else {
                    res.json({ 
                        message: 'Category updated successfully',
                        changes: this.changes 
                    });
                }
                db.close();
            }
        );
    });
});

// Delete existing Category
app.delete('/api/categories/:id', (req, res) => {
    console.log(`DELETE /api/categories/${req.params.id} called`);
  const categoryId = req.params.id;
  
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    const sql = 'DELETE FROM expense_categories WHERE id = ?';
    
    db.run(sql, [categoryId], function(err) {
      if (err) {
        console.error('Error deleting category:', err.message);
        res.status(500).json({ error: 'Failed to delete category' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Category not found' });
      } else {
        res.json({ message: 'Category deleted successfully' });
      }
      db.close();
    });
  });
});

app.get('/api/payment_methods', (req, res) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
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

// Recurring expenses CRUD
app.get('/api/recurring_expenses', (req, res) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            res.status(500).json({ error: 'Failed to connect to the database' });
            return;
        }

        db.all('SELECT * FROM recurring_expenses', [], (err2, rows) => {
            if (err2) {
                console.error('Error fetching recurring_expenses:', err2.message);
                res.status(500).json({ error: 'Failed to retrieve recurring expenses' });
            } else {
                res.json(rows);
            }
            db.close();
        });
    });
});

app.post('/api/recurring_expenses', (req, res) => {
    const {
        user_id = 1,
        project_amount,
        notes,
        merchant,
        project_category_id,
        project_payment_method_id,
        frequency,
        interval = 1,
        start_date,
        end_date,
    } = req.body;

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Failed to connect to the database' });
        }

        const sql = `
            INSERT INTO recurring_expenses
            (user_id, project_amount, notes, merchant, project_category_id, project_payment_method_id, frequency, interval, start_date, end_date, next_run_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const nextRun = start_date;

        db.run(
            sql,
            [
                user_id,
                project_amount,
                notes,
                merchant,
                project_category_id,
                project_payment_method_id,
                frequency,
                interval,
                start_date,
                end_date || null,
                nextRun,
            ],
            function (insertErr) {
                if (insertErr) {
                    console.error('Error creating recurring expense:', insertErr.message);
                    res.status(500).json({ error: 'Failed to create recurring expense' });
                } else {
                    res.status(201).json({ message: 'Recurring expense created', id: this.lastID });
                }
                db.close();
            }
        );
    });
});

app.put('/api/recurring_expenses/:id', (req, res) => {
    const { id } = req.params;
    const {
        user_id = 1,
        project_amount,
        notes,
        merchant,
        project_category_id,
        project_payment_method_id,
        frequency,
        interval = 1,
        start_date,
        end_date,
        next_run_date,
    } = req.body;

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Failed to connect to the database' });
        }

        const sql = `
            UPDATE recurring_expenses
            SET user_id = ?, project_amount = ?, notes = ?, merchant = ?, project_category_id = ?, project_payment_method_id = ?,
                frequency = ?, interval = ?, start_date = ?, end_date = ?, next_run_date = ?
            WHERE id = ?
        `;

        db.run(
            sql,
            [
                user_id,
                project_amount,
                notes,
                merchant,
                project_category_id,
                project_payment_method_id,
                frequency,
                interval,
                start_date,
                end_date || null,
                next_run_date || start_date,
                id,
            ],
            function (updateErr) {
                if (updateErr) {
                    console.error('Error updating recurring expense:', updateErr.message);
                    res.status(500).json({ error: 'Failed to update recurring expense' });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'Recurring expense not found' });
                } else {
                    res.json({ message: 'Recurring expense updated', changes: this.changes });
                }
                db.close();
            }
        );
    });
});

app.delete('/api/recurring_expenses/:id', (req, res) => {
    const { id } = req.params;

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Failed to connect to database' });
        }

        const sql = 'DELETE FROM recurring_expenses WHERE id = ?';

        db.run(sql, [id], function (deleteErr) {
            if (deleteErr) {
                console.error('Error deleting recurring expense:', deleteErr.message);
                res.status(500).json({ error: 'Failed to delete recurring expense' });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Recurring expense not found' });
            } else {
                res.json({ message: 'Recurring expense deleted' });
            }
            db.close();
        });
    });
});

// Manually trigger application of recurring expenses up to a given date (defaults to today)
app.post('/api/recurring_expenses/apply', (req, res) => {
    const { upToDate } = req.body || {};
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const target = upToDate || `${yyyy}-${mm}-${dd}`;

    applyRecurringExpenses(target, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to apply recurring expenses' });
        }
        res.json({ message: 'Recurring expenses applied', upToDate: target });
    });
});

app.get('/api/transactions', (req, res) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            res.status(500).json({ error: 'Failed to connect to the database' });
            return;
        }
        const { start_date, end_date } = req.query;
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
                WHERE t.transaction_date BETWEEN ? AND ?
                ORDER BY t.transaction_date DESC, t.id DESC;`, [start_date, end_date], (err, rows) => {
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
    console.log(`POST /api/transactions called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { user_id, amount, notes, transaction_date, merchant, category_id, payment_method_id } = req.body;
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
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
    console.log(`PUT /api/transactions/${req.params.id} called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { amount, notes, transaction_date, merchant, category_id, payment_method_id } = req.body;
    const transactionId = req.params.id;
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
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

// Delete existing transaction
app.delete('/api/transactions/:id', (req, res) => {
    console.log(`DELETE /api/transactions/${req.params.id} called`);
  const transactionId = req.params.id;
  
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    const sql = 'DELETE FROM expense_transactions WHERE id = ?';
    
    db.run(sql, [transactionId], function(err) {
      if (err) {
        console.error('Error deleting transaction:', err.message);
        res.status(500).json({ error: 'Failed to delete transaction' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Transaction not found' });
      } else {
        res.json({ message: 'Transaction deleted successfully' });
      }
      db.close();
    });
  });
});

// Serve static files under /amaska-app
app.use('/amaska-app', express.static(path.join(__dirname, 'public')));

// SPA fallback for client-side routing
app.get('/amaska-app/*rest', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
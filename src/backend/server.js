const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cron = require('node-cron');
const recurringCron = process.env.RECURRING_CRON || '0 2 * * *';

// Database file path: can be overridden via DB_PATH in .env or environment
const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, './../db/database.db');
const sqlPath = path.join(__dirname, './../db/statements.sql');

// If database does not exist, create and initialize it
if (!fs.existsSync(dbPath)) {
    const initDb = new sqlite3.Database(dbPath);
  const initSql = fs.readFileSync(sqlPath, 'utf8');
    initDb.exec(initSql, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully.');
    }
        initDb.close();
  });
}

// Shared SQLite connection for the whole process
const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
                console.error('Error opening shared database connection:', err.message);
        } else {
                console.log('Shared database connection opened.');
        }
});

// Ensure foreign keys (including ON DELETE SET NULL) are enforced
db.run('PRAGMA foreign_keys = ON');

const app = express();
const apiRouter = express.Router();

// --- Auth / JWT setup ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-change-me';

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            console.error('JWT verify error:', err.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = payload; // { userId, username }
        next();
    });
}

// after applyRecurringExpenses is defined:
cron.schedule(recurringCron, () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const target = `${yyyy}-${mm}-${dd}`;
    
    console.log('[cron] Applying recurring expenses up to', target);
    applyRecurringExpenses(target, (err) => {
        if (err) console.error('[cron] Failed:', err.message);
        else console.log('[cron] Done');
    });
});

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'http://localhost:8080'
    : 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// --- Auth routes ---
// NOTE: for learning purposes this uses only username (no password storage yet).
// You can later extend the users table with a password hash and verify it here.
apiRouter.post('/auth/login', (req, res) => {
    const { username } = req.body || {};

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, user) => {
        if (err) {
            console.error('Error looking up user for login:', err.message);
            return res.status(500).json({ error: 'Login failed' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    });
});

// All routes defined on apiRouter after this point require a valid JWT
apiRouter.use(authenticateJWT);

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
    const targetDate = upToDate;

    db.all('SELECT * FROM recurring_expenses', [], (err, rows) => {
        if (err) {
            console.error('Error reading recurring_expenses:', err.message);
            return callback(err);
        }

        const processNext = (index) => {
            if (index >= rows.length) {
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
                    (projected_amount, amount, notes, transaction_date, merchant, projected_category_id, category_id, projected_payment_method_id, payment_method_id, recurring_expense_id, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.run(
                    insertSql,
                    [
                        rec.projected_amount, // planned amount snapshot
                        rec.projected_amount, // initial actual amount equals planned
                        rec.notes,
                        nextRunDate,
                        rec.merchant,
                        rec.projected_category_id,
                        rec.projected_category_id,
                        rec.projected_payment_method_id,
                        rec.projected_payment_method_id,
                        rec.id,
                        'SYSTEM',
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

apiRouter.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

apiRouter.get('/categories', (req, res) => {
    db.all('SELECT * FROM expense_categories', [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

// Create new Category
apiRouter.post('/categories', (req, res) => {
    console.log(`POST /api/categories called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { name, description, color, icon } = req.body;
    const userId = req.user.userId;
    
    const sql = `
        INSERT INTO expense_categories 
        (name, description, color, icon, created_by)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [name, description, color, icon, userId || null], 
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
        }
    );
});

// Update existing Category
apiRouter.put('/categories/:id', (req, res) => {
    console.log(`PUT /api/categories/${req.params.id} called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { name, description, color, icon } = req.body;
    const userId = req.user.userId;
    const categoryId = req.params.id;
    
    const sql = `
        UPDATE expense_categories 
        SET name = ?,
            description = ?,
            color = ?,
            icon = ?,
            modified_at = CURRENT_TIMESTAMP,
            modified_by = ?
        WHERE id = ?
    `;
    
    db.run(sql, [name, description, color, icon, userId || null, categoryId], 
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
        }
    );
});

// Delete existing Category
apiRouter.delete('/categories/:id', (req, res) => {
    console.log(`DELETE /api/categories/${req.params.id} called`);
  const categoryId = req.params.id;
  
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
    });
});

apiRouter.get('/payment_methods', (req, res) => {
    db.all('SELECT * FROM payment_methods', [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

// Create new payment method
apiRouter.post('/payment_methods', (req, res) => {
    console.log(`POST /api/payment_methods called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { name, description } = req.body;
    const userId = req.user.userId;

    const sql = `
        INSERT INTO payment_methods 
        (name, description, created_by)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, description, userId || null], function (err) {
        if (err) {
            console.error('Error creating payment method:', err.message);
            res.status(500).json({ error: err.message || 'Failed to create payment method' });
        } else {
            res.status(201).json({
                message: 'Payment method created successfully',
                id: this.lastID,
            });
        }
    });
});

// Update existing payment method
apiRouter.put('/payment_methods/:id', (req, res) => {
    console.log(`PUT /api/payment_methods/${req.params.id} called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { name, description } = req.body;
    const userId = req.user.userId;
    const paymentMethodId = req.params.id;

    const sql = `
        UPDATE payment_methods 
        SET name = ?,
            description = ?,
            modified_at = CURRENT_TIMESTAMP,
            modified_by = ?
        WHERE id = ?
    `;

    db.run(sql, [name, description, userId || null, paymentMethodId], function (err) {
        if (err) {
            console.error('Error updating payment method:', err.message);
            res.status(500).json({ error: 'Failed to update payment method' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Payment method not found' });
        } else {
            res.json({
                message: 'Payment method updated successfully',
                changes: this.changes,
            });
        }
    });
});

// Delete existing payment method
apiRouter.delete('/payment_methods/:id', (req, res) => {
    console.log(`DELETE /api/payment_methods/${req.params.id} called`);
    const paymentMethodId = req.params.id;

    const sql = 'DELETE FROM payment_methods WHERE id = ?';

    db.run(sql, [paymentMethodId], function (err) {
        if (err) {
            console.error('Error deleting payment method:', err.message);
            res.status(500).json({ error: 'Failed to delete payment method' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Payment method not found' });
        } else {
            res.json({ message: 'Payment method deleted successfully' });
        }
    });
});

// Recurring expenses CRUD
apiRouter.get('/recurring_expenses', (req, res) => {
    db.all('SELECT * FROM recurring_expenses', [], (err2, rows) => {
        if (err2) {
            console.error('Error fetching recurring_expenses:', err2.message);
            res.status(500).json({ error: 'Failed to retrieve recurring expenses' });
        } else {
            res.json(rows);
        }
    });
});
apiRouter.get('/recurring_expenses_related_transactions/:id', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM expense_transactions WHERE recurring_expense_id = ?', [id], (err2, rows) => {
        if (err2) {
            console.error('Error fetching related transactions:', err2.message);
            res.status(500).json({ error: 'Failed to retrieve related transactions' });
        } else {
            res.json(rows);
        }
    });
});
apiRouter.post('/recurring_expenses', (req, res) => {
    const {
        name,
        projected_amount,
        notes,
        merchant,
        projected_category_id,
        projected_payment_method_id,
        frequency,
        interval = 1,
        start_date,
        end_date,
    } = req.body;
    const userId = req.user.userId;

    const sql = `
        INSERT INTO recurring_expenses
        (name, projected_amount, notes, merchant, projected_category_id, projected_payment_method_id, frequency, interval, start_date, end_date, next_run_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const nextRun = start_date;

    db.run(
        sql,
        [
            name,
            projected_amount,
            notes,
            merchant,
            projected_category_id,
            projected_payment_method_id,
            frequency,
            interval,
            start_date,
            end_date || null,
            nextRun,
            userId,
        ],
        function (insertErr) {
            if (insertErr) {
                console.error('Error creating recurring expense:', insertErr.message);
                res.status(500).json({ error: 'Failed to create recurring expense' });
            } else {
                res.status(201).json({ message: 'Recurring expense created', id: this.lastID });
            }
        }
    );
});

apiRouter.put('/recurring_expenses/:id', (req, res) => {
    const { id } = req.params;
    const {
        name,
        projected_amount,
        notes,
        merchant,
        projected_category_id,
        projected_payment_method_id,
        frequency,
        interval = 1,
        start_date,
        end_date,
    } = req.body;
    const userId = req.user.userId;

    const sql = `
        UPDATE recurring_expenses
        SET name = ?, projected_amount = ?, notes = ?, merchant = ?, projected_category_id = ?, projected_payment_method_id = ?,
            frequency = ?, interval = ?, start_date = ?, end_date = ?, modified_at = CURRENT_TIMESTAMP, modified_by = ?
        WHERE id = ?
    `;
    db.run(
        sql,
        [
            name,
            projected_amount,
            notes,
            merchant,
            projected_category_id,
            projected_payment_method_id,
            frequency,
            interval,
            start_date,
            end_date || null,
            userId,
            id
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
        }
    );
});

apiRouter.delete('/recurring_expenses/:id', (req, res) => {
    const { id } = req.params;

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
    });
});

// Manually trigger application of recurring expenses up to a given date (defaults to today)
apiRouter.post('/recurring_expenses/apply', (req, res) => {
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

apiRouter.get('/transactions', (req, res) => {
    const { start_date, end_date } = req.query;
            db.all(`SELECT 
                t.id AS transaction_id, 
                t.amount, 
                t.notes, 
                t.transaction_date, 
                t.merchant, 
                t.created_at AS transaction_created_at,
                t.created_by AS transaction_created_by,
                t.modified_at AS transaction_modified_at,
                t.modified_by AS transaction_modified_by,
                c.id AS category_id, 
                c.name AS category_name, 
                c.description AS category_description, 
                p.id AS payment_method_id, 
                p.name AS payment_method_name, 
                p.description AS payment_method_description 
            FROM expense_transactions t 
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
    });
});


// Create new transaction
apiRouter.post('/transactions', (req, res) => {
    console.log(`POST /api/transactions called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { amount, notes, transaction_date, merchant, category_id, payment_method_id } = req.body;
    const userId = req.user.userId;
    
    const sql = `
        INSERT INTO expense_transactions 
        (amount, notes, transaction_date, merchant, category_id, payment_method_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [amount, notes, transaction_date, merchant, category_id, payment_method_id, userId], 
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
        }
    );
});

// Update existing transaction
apiRouter.put('/transactions/:id', (req, res) => {
    console.log(`PUT /api/transactions/${req.params.id} called with body: ${JSON.stringify(req.body, null, 2)}`);
    const { amount, notes, transaction_date, merchant, category_id, payment_method_id } = req.body;
    const userId = req.user.userId;
    const transactionId = req.params.id;
    
    const sql = `
        UPDATE expense_transactions 
        SET amount = ?,
            notes = ?,
            transaction_date = ?,
            merchant = ?,
            category_id = ?,
            payment_method_id = ?,
            modified_at = CURRENT_TIMESTAMP,
            modified_by = ?
        WHERE id = ?
    `;
    
    db.run(sql, [amount, notes, transaction_date, merchant, category_id, payment_method_id, userId, transactionId], 
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
        }
    );
});

// Delete existing transaction
apiRouter.delete('/transactions/:id', (req, res) => {
    console.log(`DELETE /api/transactions/${req.params.id} called`);
  const transactionId = req.params.id;
  
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
        });
});

// Mount API router under /api
app.use('/api', apiRouter);

// Serve static files under /amaska-app
app.use('/amaska-app', express.static(path.join(__dirname, 'public')));

// SPA fallback for client-side routing
app.get('/amaska-app/*rest', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
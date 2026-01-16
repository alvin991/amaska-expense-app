const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

router.get('/', (req, res) => {
    const { start_date, end_date } = req.query;
    db.all(`SELECT 
        t.id AS transaction_id, 
        t.projected_amount,
        t.amount, 
        t.notes, 
        t.transaction_date, 
        t.projected_transaction_date,
        t.merchant, 
        t.recurring_template_id,
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
        AND t.recurring_template_id IS NULL
        ORDER BY t.transaction_date DESC, t.id DESC;`, [start_date, end_date], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
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

module.exports = router;

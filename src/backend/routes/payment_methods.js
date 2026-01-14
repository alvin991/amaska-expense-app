const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

router.get('/', (req, res) => {
    db.all('SELECT * FROM payment_methods', [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
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

module.exports = router;

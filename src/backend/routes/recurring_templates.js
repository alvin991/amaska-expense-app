const express = require('express');
const { db } = require('../config/database');
const { applyRecurringTemplates } = require('../services/recurringTemplateService');

const router = express.Router();

router.get('/', (req, res) => {
    db.all('SELECT * FROM recurring_templates', [], (err, rows) => {
        if (err) {
            console.error('Error fetching recurring_templates:', err.message);
            res.status(500).json({ error: 'Failed to retrieve Recurring Templates' });
        } else {
            res.json(rows);
        }
    });
});

router.get('/:id/related_transactions', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM expense_transactions WHERE recurring_template_id = ?', [id], (err, rows) => {
        if (err) {
            console.error('Error fetching related transactions:', err.message);
            res.status(500).json({ error: 'Failed to retrieve related transactions' });
        } else {
            res.json(rows);
        }
    });
});

router.post('/', (req, res) => {
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
        INSERT INTO recurring_templates
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
                console.error('Error creating Recurring Template:', insertErr.message);
                res.status(500).json({ error: 'Failed to create Recurring Template' });
            } else {
                res.status(201).json({ message: 'Recurring Template created', id: this.lastID });
            }
        }
    );
});

router.put('/:id', (req, res) => {
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
        enabled,
    } = req.body;
    const userId = req.user.userId;

    const sql = `
        UPDATE recurring_templates
        SET name = ?, projected_amount = ?, notes = ?, merchant = ?, projected_category_id = ?, projected_payment_method_id = ?,
            frequency = ?, interval = ?, start_date = ?, end_date = ?, enabled = ?, modified_at = CURRENT_TIMESTAMP, modified_by = ?
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
            enabled ? 1 : 0,
            userId,
            id
        ],
        function (updateErr) {
            if (updateErr) {
                console.error('Error updating Recurring Template:', updateErr.message);
                res.status(500).json({ error: 'Failed to update Recurring Template' });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Recurring Template not found' });
            } else {
                res.json({ message: 'Recurring Template updated', changes: this.changes });
            }
        }
    );
});

// Manually trigger application of Recurring Templates up to a given date (defaults to today)
router.post('/apply', (req, res) => {
    const { upToDate } = req.body || {};
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const target = upToDate || `${yyyy}-${mm}-${dd}`;

    applyRecurringTemplates(target, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to apply Recurring Templates' });
        }
        res.json({ message: 'Recurring Templates applied', upToDate: target });
    });
});

module.exports = router;

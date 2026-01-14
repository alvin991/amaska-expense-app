const express = require('express');
const { db } = require('../config/database');

const router = express.Router();

router.get('/', (req, res) => {
    db.all('SELECT * FROM expense_categories', [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows);
        }
    });
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
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

module.exports = router;

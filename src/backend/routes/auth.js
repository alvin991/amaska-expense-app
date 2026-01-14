const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../config/auth');

const router = express.Router();

router.post('/login', (req, res) => {
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
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                settings: user.settings 
            },
        });
    });
});

module.exports = router;

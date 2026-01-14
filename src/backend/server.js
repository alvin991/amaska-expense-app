const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import configuration
const { db, getSystemUserId } = require('./config/database');
const { authenticateJWT } = require('./config/auth');

// Import services
const { initializeCronJobs, recurringCron } = require('./services/cronService');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const paymentMethodsRoutes = require('./routes/payment_methods');
const recurringTemplatesRoutes = require('./routes/recurring_templates');
const transactionsRoutes = require('./routes/transactions');

const app = express();
const apiRouter = express.Router();

// CORS configuration
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
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                settings: user.settings 
            },
        });
    });
});

// All routes defined on apiRouter after this point require a valid JWT
apiRouter.use(authenticateJWT);

// Public auth routes (no authentication required)
apiRouter.use('/auth', authRoutes);

// Test endpoint to check cron status (requires auth)
apiRouter.get('/cron/status', authenticateJWT, (req, res) => {
    res.json({
        pattern: recurringCron,
        systemUserId: getSystemUserId(),
        serverTime: new Date().toLocaleString()
    });
});

// Protected routes (require authentication)
apiRouter.use(authenticateJWT);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/categories', categoriesRoutes);
apiRouter.use('/payment_methods', paymentMethodsRoutes);
apiRouter.use('/recurring_templates', recurringTemplatesRoutes);
apiRouter.use('/recurring_template_related_transactions', (req, res) => {
    // Legacy endpoint redirect
    const id = req.path.substring(1);
    res.redirect(`/api/recurring_templates/${id}/related_transactions`);
});
apiRouter.use('/transactions', transactionsRoutes);

// Mount API router under /api
app.use('/api', apiRouter);

// Serve static files under /amaska-app
app.use('/amaska-app', express.static(path.join(__dirname, 'public')));

// SPA fallback for client-side routing
app.get('/amaska-app/*rest', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize cron jobs
initializeCronJobs();

// Start server
app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path: can be overridden via DB_PATH in .env or environment
const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, './../../db/database.db');
const sqlPath = path.join(__dirname, './../../db/statements.sql');

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

// Global variable to store SYSTEM user ID
let systemUserId = null;

// Get or create SYSTEM user for automated transactions
function initializeSystemUser() {
    const systemUsername = 'SYSTEM';
    
    db.get('SELECT id FROM users WHERE username = ?', [systemUsername], (err, user) => {
        if (err) {
            console.error('Error checking for SYSTEM user:', err.message);
            return;
        }
        
        if (user) {
            systemUserId = user.id;
            console.log('SYSTEM user found with ID:', systemUserId);
            return;
        }
        
        // User doesn't exist, create it
        const insertSql = 'INSERT INTO users (username, email) VALUES (?, ?)';
        db.run(insertSql, [systemUsername, 'system@automated'], function(insertErr) {
            if (insertErr) {
                console.error('Error creating SYSTEM user:', insertErr.message);
                return;
            }
            systemUserId = this.lastID;
            console.log('Created SYSTEM user with ID:', systemUserId);
        });
    });
}

// Initialize SYSTEM user
initializeSystemUser();

function getSystemUserId() {
    return systemUserId;
}

module.exports = { db, getSystemUserId };

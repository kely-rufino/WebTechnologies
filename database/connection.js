const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'community_portal.db');

// Create database connection with better configuration
const db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Configure WAL mode for better performance
db.pragma('journal_mode = WAL');

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
process.on('SIGTERM', () => {
    db.close();
    process.exit(0);
});

module.exports = db;
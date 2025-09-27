const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'community_portal.db');

// Initialize database
const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

console.log('Initializing database...');

// Create categories table
const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

// Create events table with foreign key relationship to categories
const createEventsTable = `
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        image_url TEXT,
        location TEXT,
        date DATE,
        start_time TIME,
        end_time TIME,
        address TEXT,
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
`;

try {
    // Execute table creation
    db.exec(createCategoriesTable);
    console.log('✓ Categories table created/verified');
    
    db.exec(createEventsTable);
    console.log('✓ Events table created/verified');
    
    // Insert default categories if table is empty
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    
    if (categoryCount.count === 0) {
        const insertCategory = db.prepare(`
            INSERT INTO categories (name, description, image_url)
            VALUES (?, ?, ?)
        `);
        
        const defaultCategories = [
            ['Sports & Recreation', 'Local sports clubs, fitness classes, recreational activities, and community leagues', '/images/sports.jpg'],
            ['Health & Wellness', 'Healthcare services, wellness programmes, and health-focused community initiatives', '/images/health.jpg'],
            ['Education & Learning', 'Educational programmes, workshops, tutoring services, and lifelong learning opportunities', '/images/education.jpg'],
            ['Arts & Culture', 'Cultural events, art classes, music programmes, and creative community initiatives', '/images/arts.jpg'],
            ['Environment & Sustainability', 'Environmental initiatives, community gardens, and sustainability programmes', '/images/environment.jpg'],
            ['Social Services', 'Community support services, volunteer opportunities, and social assistance programmes', '/images/social.jpg'],
            ['Shop Safe, Shop Local', 'Support local businesses, shop safely, and connect with neighbourhood sellers and services', '/images/local-business.jpg']
        ];
        
        defaultCategories.forEach(category => {
            insertCategory.run(category);
        });
        
        console.log('✓ Default categories inserted');
    }
    
    console.log('Database initialization completed successfully!');
    
} catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
} finally {
    db.close();
}
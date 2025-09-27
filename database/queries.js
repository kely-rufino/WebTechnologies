const db = require('./connection');

// Category queries
const categoryQueries = {
    // Get all categories
    getAllCategories: db.prepare(`
        SELECT * FROM categories 
        ORDER BY name ASC
    `),
    
    // Get category by ID
    getCategoryById: db.prepare(`
        SELECT * FROM categories 
        WHERE id = ?
    `),
    
    // Create new category
    createCategory: db.prepare(`
        INSERT INTO categories (name, description, image_url)
        VALUES (?, ?, ?)
    `),
    
    // Update category
    updateCategory: db.prepare(`
        UPDATE categories 
        SET name = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `),
    
    // Delete category
    deleteCategory: db.prepare(`
        DELETE FROM categories 
        WHERE id = ?
    `),
    
    // Get events count by category
    getCategoryEventCount: db.prepare(`
        SELECT category_id, COUNT(*) as event_count
        FROM events
        WHERE category_id = ?
        GROUP BY category_id
    `)
};

// Event queries
const eventQueries = {
    // Get all events with category information
    getAllEvents: db.prepare(`
        SELECT e.*, c.name as category_name, c.description as category_description
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        ORDER BY e.date ASC, e.start_time ASC
    `),
    
    // Get event by ID with category information
    getEventById: db.prepare(`
        SELECT e.*, c.name as category_name, c.description as category_description
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.id = ?
    `),
    
    // Get events by category
    getEventsByCategory: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.category_id = ?
        ORDER BY e.date ASC, e.start_time ASC
    `),
    
    // Get upcoming events by category
    getUpcomingEventsByCategory: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.category_id = ? AND e.date >= DATE('now')
        ORDER BY e.date ASC, e.start_time ASC
    `),
    
    // Get upcoming events
    getUpcomingEvents: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.date >= DATE('now')
        ORDER BY e.date ASC, e.start_time ASC
        LIMIT ?
    `),
    
    // Get all upcoming events (no limit)
    getAllUpcomingEvents: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.date >= DATE('now')
        ORDER BY e.date ASC, e.start_time ASC
    `),
    
    // Get featured events
    getFeaturedEvents: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.is_featured = 1 AND e.date >= DATE('now')
        ORDER BY e.date ASC, e.start_time ASC
    `),
    
    // Search events by title or description
    searchEvents: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.title LIKE ? OR e.description LIKE ? OR e.content LIKE ?
        ORDER BY e.date ASC, e.start_time ASC
    `),
    
    // Create new event
    createEvent: db.prepare(`
        INSERT INTO events (title, description, content, image_url, location, date, start_time, end_time, address, category_id, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    
    // Update event
    updateEvent: db.prepare(`
        UPDATE events 
        SET title = ?, description = ?, content = ?, image_url = ?, location = ?, 
            date = ?, start_time = ?, end_time = ?, address = ?, category_id = ?, is_featured = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `),
    
    // Delete event
    deleteEvent: db.prepare(`
        DELETE FROM events 
        WHERE id = ?
    `),
    
    // Get events by date range
    getEventsByDateRange: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.date BETWEEN ? AND ?
        ORDER BY e.date ASC, e.start_time ASC
    `),
    
    // Get events by location
    getEventsByLocation: db.prepare(`
        SELECT e.*, c.name as category_name
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.location LIKE ? OR e.address LIKE ?
        ORDER BY e.date ASC, e.start_time ASC
    `)
};

// Contact message queries
const contactMessageQueries = {
    // Get all contact messages
    getAllMessages: db.prepare(`
        SELECT * FROM contact_messages 
        ORDER BY created_at DESC
    `),
    
    // Get contact message by ID
    getMessageById: db.prepare(`
        SELECT * FROM contact_messages 
        WHERE id = ?
    `),
    
    // Create new contact message
    createMessage: db.prepare(`
        INSERT INTO contact_messages (name, email, phone, subject, area, message, newsletter)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    
    // Get messages with limited info for API (sanitized)
    getMessagesForAPI: db.prepare(`
        SELECT id, subject, area, created_at 
        FROM contact_messages 
        ORDER BY created_at DESC
    `),
    
    // Delete contact message
    deleteMessage: db.prepare(`
        DELETE FROM contact_messages 
        WHERE id = ?
    `)
};

// Utility queries
const utilityQueries = {
    // Get database statistics
    getStats: db.prepare(`
        SELECT 
            (SELECT COUNT(*) FROM events) as total_events,
            (SELECT COUNT(*) FROM categories) as total_categories,
            (SELECT COUNT(*) FROM events WHERE date >= DATE('now')) as upcoming_events,
            (SELECT COUNT(*) FROM events WHERE date < DATE('now')) as past_events,
            (SELECT COUNT(*) FROM contact_messages) as total_messages
    `),
    
    // Check if foreign key constraints are enabled
    checkForeignKeys: db.prepare(`PRAGMA foreign_keys`),
    
    // Get table info
    getTableInfo: (tableName) => db.prepare(`PRAGMA table_info(${tableName})`).all()
};

module.exports = {
    categoryQueries,
    eventQueries,
    contactMessageQueries,
    utilityQueries,
    db
};
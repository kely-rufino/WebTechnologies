# Database Setup - Better-SQLite3

This project uses Better-SQLite3 as the database solution for storing events and categories.

## Database Structure

### Tables

#### `categories`
- `id` - INTEGER PRIMARY KEY (auto-increment)
- `name` - TEXT NOT NULL UNIQUE
- `description` - TEXT
- `image_url` - TEXT
- `created_at` - DATETIME (default: CURRENT_TIMESTAMP)
- `updated_at` - DATETIME (default: CURRENT_TIMESTAMP)

#### `events`
- `id` - INTEGER PRIMARY KEY (auto-increment)
- `title` - TEXT NOT NULL
- `description` - TEXT
- `content` - TEXT
- `image_url` - TEXT
- `location` - TEXT
- `date` - DATE
- `start_time` - TIME
- `end_time` - TIME
- `address` - TEXT
- `category_id` - INTEGER (Foreign Key to categories.id)
- `created_at` - DATETIME (default: CURRENT_TIMESTAMP)
- `updated_at` - DATETIME (default: CURRENT_TIMESTAMP)

### Foreign Key Relationships
- `events.category_id` references `categories.id` with ON DELETE SET NULL

## Available Scripts

- `npm run db:init` - Initialize database and create tables with default categories
- `npm run db:seed` - Populate database with sample events data
- `npm run db:reset` - Delete database file and recreate with fresh data

## Usage

### Basic Usage

```javascript
const DatabaseService = require('./database/service');

// Get all events
const events = DatabaseService.getAllEvents();

// Get event by ID
const event = DatabaseService.getEventById(1);

// Get events by category
const categoryEvents = DatabaseService.getEventsByCategory(2);

// Search events
const searchResults = DatabaseService.searchEvents('community');

// Get upcoming events
const upcomingEvents = DatabaseService.getUpcomingEvents(5);
```

### Direct Query Usage

```javascript
const { eventQueries, categoryQueries } = require('./database/queries');

// Use prepared statements directly
const events = eventQueries.getAllEvents.all();
const categories = categoryQueries.getAllCategories.all();
```

### Creating New Events

```javascript
const eventData = {
    title: 'New Community Event',
    description: 'A great community event',
    content: 'Full event details...',
    imageUrl: '/images/event.jpg',
    location: 'Community Center',
    date: '2024-06-01',
    startTime: '10:00',
    endTime: '12:00',
    address: '123 Main St',
    categoryId: 1
};

const newEvent = DatabaseService.createEvent(eventData);
```

### Error Handling

All database methods include error handling and will throw descriptive errors:

```javascript
try {
    const events = DatabaseService.getAllEvents();
    // Handle success
} catch (error) {
    console.error('Database error:', error.message);
    // Handle error appropriately
}
```

## Database File Location

The SQLite database file is stored at: `database/community_portal.db`

## Features

- ✅ Prepared statements for performance and security
- ✅ Foreign key constraints enabled
- ✅ WAL mode for better performance
- ✅ Graceful shutdown handling
- ✅ Comprehensive error handling
- ✅ Sample data seeding
- ✅ Database health checks
- ✅ Search functionality
- ✅ Date range queries
- ✅ Location-based queries

## Integration with Express

See `database/example-routes.js` for complete examples of how to integrate the database service into your Express routes.
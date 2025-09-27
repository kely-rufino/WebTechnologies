// Example of how to integrate the database service into your Express routes
// This is a reference file - you can copy these patterns into your main app.js

const DatabaseService = require('./database/service');

// Example route handlers using the DatabaseService

// Get all events for the events page
app.get('/events', (req, res) => {
    try {
        const events = DatabaseService.getAllEvents();
        const categories = DatabaseService.getAllCategories();
        
        res.render('events', { 
            events, 
            categories,
            title: 'Community Events'
        });
    } catch (error) {
        console.error('Error loading events page:', error);
        res.status(500).render('404', { 
            title: 'Error',
            message: 'Failed to load events'
        });
    }
});

// Get events by category
app.get('/events/category/:categoryId', (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        const events = DatabaseService.getEventsByCategory(categoryId);
        const category = DatabaseService.getCategoryById(categoryId);
        const categories = DatabaseService.getAllCategories();
        
        if (!category) {
            return res.status(404).render('404', { 
                title: 'Category Not Found',
                message: 'The requested category could not be found'
            });
        }
        
        res.render('events', { 
            events, 
            categories,
            selectedCategory: category,
            title: `${category.name} Events`
        });
    } catch (error) {
        console.error('Error loading category events:', error);
        res.status(500).render('404', { 
            title: 'Error',
            message: 'Failed to load category events'
        });
    }
});

// Get single event details
app.get('/events/:id', (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const event = DatabaseService.getEventById(eventId);
        
        if (!event) {
            return res.status(404).render('404', { 
                title: 'Event Not Found',
                message: 'The requested event could not be found'
            });
        }
        
        res.render('event-detail', { 
            event,
            title: event.title
        });
    } catch (error) {
        console.error('Error loading event details:', error);
        res.status(500).render('404', { 
            title: 'Error',
            message: 'Failed to load event details'
        });
    }
});

// Search events
app.get('/search', (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        const events = searchTerm ? DatabaseService.searchEvents(searchTerm) : [];
        const categories = DatabaseService.getAllCategories();
        
        res.render('events', { 
            events, 
            categories,
            searchTerm,
            title: `Search Results: ${searchTerm}`
        });
    } catch (error) {
        console.error('Error searching events:', error);
        res.status(500).render('404', { 
            title: 'Error',
            message: 'Failed to search events'
        });
    }
});

// Get upcoming events for homepage
app.get('/', (req, res) => {
    try {
        const upcomingEvents = DatabaseService.getUpcomingEvents(6);
        const categories = DatabaseService.getAllCategories();
        const stats = DatabaseService.getDatabaseStats();
        
        res.render('index', { 
            upcomingEvents,
            categories,
            stats,
            title: 'Community Portal'
        });
    } catch (error) {
        console.error('Error loading homepage:', error);
        res.status(500).render('404', { 
            title: 'Error',
            message: 'Failed to load homepage'
        });
    }
});

// API endpoints for AJAX requests

// API: Get all categories
app.get('/api/categories', (req, res) => {
    try {
        const categories = DatabaseService.getAllCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch categories' 
        });
    }
});

// API: Get events with filters
app.get('/api/events', (req, res) => {
    try {
        const { category, location, date_from, date_to, search } = req.query;
        
        let events;
        
        if (search) {
            events = DatabaseService.searchEvents(search);
        } else if (category) {
            events = DatabaseService.getEventsByCategory(parseInt(category));
        } else if (location) {
            events = DatabaseService.getEventsByLocation(location);
        } else if (date_from && date_to) {
            events = DatabaseService.getEventsByDateRange(date_from, date_to);
        } else {
            events = DatabaseService.getAllEvents();
        }
        
        res.json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching events API:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch events' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    try {
        const health = DatabaseService.checkDatabaseHealth();
        res.json(health);
    } catch (error) {
        res.status(500).json({ 
            healthy: false, 
            error: error.message 
        });
    }
});
// Import required modules
const express = require('express');           // Web framework for Node.js
const path = require('path');                 // Path utilities for file operations
const DatabaseService = require('./database/service'); // Database service for categories and events
const app = express();                        // Create Express application
const port = 5000;                            // Port number for server to listen on

// Database service is now used for all data operations
// JSON files have been replaced with SQLite database

// Database initialization is handled by database/init.js and database/seed.js

// Helper functions removed - now using database service

// Set up EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', async (req, res) => {
  try {
    const allEvents = DatabaseService.getAllUpcomingEvents();
    const featuredEvents = DatabaseService.getFeaturedEvents();
    const areas = DatabaseService.getAllCategories();
    
    // Get upcoming events for each category to show relevant activities
    const communityAreas = areas.map(area => {
      try {
        const categoryEvents = DatabaseService.getUpcomingEventsByCategory(area.id);
        // Get only upcoming events (limit to 2 for homepage)
        const upcomingEvents = categoryEvents.slice(0, 2);
        return {
          ...area,
          upcomingEvents
        };
      } catch (error) {
        console.error(`Error fetching events for category ${area.id}:`, error);
        return { ...area, upcomingEvents: [] };
      }
    });
    
    // Pass all featured events to the template
    // For upcoming events, show regular events (limit to 6 for homepage)
    const upcomingEvents = allEvents.slice(0, 6);
    
    res.render('index', { 
      featuredEvents, 
      upcomingEvents, 
      communityAreas,
      title: 'Local Community Portal - Your Gateway to Community Life'
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.status(500).send('Error loading page');
  }
});

app.get('/events', async (req, res) => {
  try {
    const categoryId = req.query.category;
    let events;
    let pageTitle = 'Events - Local Community Portal';
    let categoryInfo = null;
    
    if (categoryId) {
      // Get upcoming events for specific category (filtered at DB level)
      events = DatabaseService.getUpcomingEventsByCategory(parseInt(categoryId));
      
      // Get category information for the page title
      try {
        categoryInfo = DatabaseService.getCategoryById(parseInt(categoryId));
        if (categoryInfo) {
          pageTitle = `${categoryInfo.name} Events - Local Community Portal`;
        }
      } catch (error) {
        console.error('Error fetching category info:', error);
      }
    } else {
      // Get all upcoming events
      events = DatabaseService.getAllUpcomingEvents();
    }
    
    res.render('events', { 
      events,
      categoryInfo,
      title: pageTitle
    });
  } catch (error) {
    console.error('Error loading events:', error);
    res.status(500).send('Error loading events');
  }
});

app.get('/areas', async (req, res) => {
  try {
    const areas = DatabaseService.getAllCategories();
    // Get upcoming events for each category to show relevant activities
    const areasWithEvents = areas.map(area => {
      try {
        const events = DatabaseService.getEventsByCategory(area.id);
        // Get only upcoming events (limit to 3)
        const upcomingEvents = events
          .filter(event => new Date(event.date) >= new Date())
          .slice(0, 3);
        return {
          ...area,
          upcomingEvents
        };
      } catch (error) {
        console.error(`Error fetching events for category ${area.id}:`, error);
        return { ...area, upcomingEvents: [] };
      }
    });
    
    res.render('areas', { 
      areas: areasWithEvents,
      title: 'Community Areas - Local Community Portal'
    });
  } catch (error) {
    console.error('Error loading areas:', error);
    res.status(500).send('Error loading areas');
  }
});

app.get('/faq', (req, res) => {
  res.render('faq', {
    title: 'FAQ - Local Community Portal'
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us - Local Community Portal'
  });
});

app.post('/contact', async (req, res) => {
  const { name, email, phone, subject, area, message, newsletter } = req.body;
  
  try {
    const newMessage = DatabaseService.createContactMessage({
      name,
      email,
      phone: phone || null,
      subject,
      area: area || null,
      message,
      newsletter: newsletter ? true : false
    });
    
    res.json({ success: true, message: 'Thank you for your message! We\'ll get back to you within 24 hours.' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, message: 'There was an error sending your message. Please try again.' });
  }
});

// API endpoints for dynamic content
app.get('/api/events', async (req, res) => {
  try {
    const events = DatabaseService.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error loading events API:', error);
    res.status(500).json({ error: 'Error loading events' });
  }
});

// Search API endpoint with AJAX support
app.get('/api/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    let results = [];
    
    if (q && q.length > 0) {
      // Search events using database service
      const eventResults = DatabaseService.searchEvents(q);
      
      // Filter by category if specified
      const filteredEvents = category ? 
        eventResults.filter(event => event.category_id == category) : 
        eventResults;
      
      // Add type field for frontend
      const eventsWithType = filteredEvents.map(event => ({
        ...event,
        type: 'event'
      }));
      
      // Search community areas/categories
      const areas = DatabaseService.getAllCategories();
      const searchTerm = q.toLowerCase();
      const areaResults = areas.filter(area => {
        return area.name.toLowerCase().includes(searchTerm) ||
               area.description.toLowerCase().includes(searchTerm);
      }).map(area => ({
        ...area,
        type: 'area'
      }));
      
      results = [...eventsWithType, ...areaResults];
    }
    
    // Simulate slight delay for realistic AJAX experience
    setTimeout(() => {
      res.json({
        query: q,
        category: category,
        total: results.length,
        results: results
      });
    }, 300);
    
  } catch (error) {
    console.error('Error in search API:', error);
    res.status(500).json({ error: 'Search temporarily unavailable' });
  }
});

app.get('/api/areas', async (req, res) => {
  try {
    const areas = DatabaseService.getAllCategories();
    res.json(areas);
  } catch (error) {
    console.error('Error loading areas API:', error);
    res.status(500).json({ error: 'Error loading areas' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = DatabaseService.getContactMessagesForAPI();
    res.json(messages);
  } catch (error) {
    console.error('Error loading messages API:', error);
    res.status(500).json({ error: 'Error loading messages' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found - Local Community Portal'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Community Portal server running at http://localhost:${port}`);
  console.log('Data storage: SQLite database in ./database/community_portal.db');
});
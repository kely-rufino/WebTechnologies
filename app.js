// Import required modules
const express = require('express');           // Web framework for Node.js
const fs = require('fs').promises;            // File system module (with promises)
const path = require('path');                 // Path utilities for file operations
const DatabaseService = require('./database/service'); // Database service for categories and events
const app = express();                        // Create Express application
const port = 5000;                            // Port number for server to listen on

// Define file paths for data storage (JSON files instead of database)
const dataDir = path.join(__dirname, 'data');                    // Data directory
const eventsFile = path.join(dataDir, 'events.json');           // Events data file
const messagesFile = path.join(dataDir, 'contact_messages.json'); // Contact form submissions
const areasFile = path.join(dataDir, 'community_areas.json');    // Community areas data

// Function to initialize data files and create sample data
// This runs when server starts and creates JSON files if they don't exist
async function initializeData() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(dataDir, { recursive: true });
    
    // Initialize events data if file doesn't exist
    try {
      await fs.access(eventsFile);  // Check if file exists
    } catch {
      const initialEvents = [
        {
          id: 1,
          title: 'Annual Local Community Fair',
          description: 'Join us for our biggest community celebration of the year! Features local vendors, live music, food trucks, kids\' activities, and much more. Free admission for all residents.',
          date: '2025-08-15',
          time: '10:00 AM - 8:00 PM',
          location: 'Excel Centre',
          category: 'community',
          featured: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Community Movie Night',
          description: 'Indoor screening of family-friendly movies',
          date: '2025-08-18',
          time: '6:00 PM - 8:00 PM',
          location: 'Community Center',
          category: 'entertainment',
          featured: false,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Farmers Market',
          description: 'Fresh local produce and handmade goods',
          date: '2025-08-20',
          time: '8:00 AM - 2:00 PM',
          location: 'Stratford Shopping Centre',
          category: 'market',
          featured: false,
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          title: 'Art Workshop',
          description: 'Learn watercolor painting techniques',
          date: '2025-08-25',
          time: '2:00 PM - 5:00 PM',
          location: 'Arts Center',
          category: 'education',
          featured: false,
          created_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(eventsFile, JSON.stringify(initialEvents, null, 2));
    }

    // Initialize community areas data if it doesn't exist
    try {
      await fs.access(areasFile);
    } catch {
      const initialAreas = [
        {
          id: 1,
          name: 'Sports & Recreation',
          description: 'Local sports clubs, fitness classes, recreational activities, and community leagues',
          icon: '⚽',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Health & Wellness',
          description: 'Healthcare services, wellness programs, and health-focused community initiatives',
          icon: '🏥',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Education & Learning',
          description: 'Educational programs, workshops, tutoring services, and lifelong learning opportunities',
          icon: '📚',
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Arts & Culture',
          description: 'Cultural events, art classes, music programs, and creative community initiatives',
          icon: '🎨',
          created_at: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Environment & Sustainability',
          description: 'Environmental initiatives, community gardens, and sustainability programs',
          icon: '🌱',
          created_at: new Date().toISOString()
        },
        {
          id: 6,
          name: 'Social Services',
          description: 'Community support services, volunteer opportunities, and social assistance programs',
          icon: '🤝',
          created_at: new Date().toISOString()
        },
        {
          id: 7,
          name: 'Shop Safe, Shop Local',
          description: 'Support local businesses, shop safely, and connect with neighborhood sellers and services',
          icon: '🛍️',
          created_at: new Date().toISOString()
        }
      ];
      await fs.writeFile(areasFile, JSON.stringify(initialAreas, null, 2));
    }

    // Initialize contact messages file if it doesn't exist
    try {
      await fs.access(messagesFile);
    } catch {
      await fs.writeFile(messagesFile, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Helper functions for data operations
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

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
    const events = await readJsonFile(eventsFile);
    const areas = DatabaseService.getAllCategories();
    
    // Get upcoming events for each category to show relevant activities
    const communityAreas = areas.map(area => {
      try {
        const categoryEvents = DatabaseService.getEventsByCategory(area.id);
        // Get only upcoming events (limit to 2 for homepage)
        const upcomingEvents = categoryEvents
          .filter(event => new Date(event.date) >= new Date())
          .slice(0, 2);
        return {
          ...area,
          upcomingEvents
        };
      } catch (error) {
        console.error(`Error fetching events for category ${area.id}:`, error);
        return { ...area, upcomingEvents: [] };
      }
    });
    
    const featuredEvent = events.find(event => event.featured);
    const upcomingEvents = events.filter(event => !event.featured).slice(0, 3);
    
    res.render('index', { 
      featuredEvent, 
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
    const messages = await readJsonFile(messagesFile);
    
    const newMessage = {
      id: messages.length + 1,
      name,
      email,
      phone: phone || null,
      subject,
      area: area || null,
      message,
      newsletter: newsletter ? true : false,
      created_at: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    const success = await writeJsonFile(messagesFile, messages);
    
    if (success) {
      res.json({ success: true, message: 'Thank you for your message! We\'ll get back to you within 24 hours.' });
    } else {
      res.status(500).json({ success: false, message: 'There was an error saving your message. Please try again.' });
    }
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, message: 'There was an error sending your message. Please try again.' });
  }
});

// API endpoints for dynamic content
app.get('/api/events', async (req, res) => {
  try {
    const events = await readJsonFile(eventsFile);
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
    const events = await readJsonFile(eventsFile);
    const areas = await readJsonFile(areasFile);
    
    let results = [];
    
    if (q && q.length > 0) {
      const searchTerm = q.toLowerCase();
      
      // Search events
      const eventResults = events.filter(event => {
        const matchesText = 
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || event.category === category;
        
        return matchesText && matchesCategory;
      }).map(event => ({
        ...event,
        type: 'event'
      }));
      
      // Search community areas
      const areaResults = areas.filter(area => {
        return area.name.toLowerCase().includes(searchTerm) ||
               area.description.toLowerCase().includes(searchTerm);
      }).map(area => ({
        ...area,
        type: 'area'
      }));
      
      results = [...eventResults, ...areaResults];
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
    const messages = await readJsonFile(messagesFile);
    // Don't expose email addresses and sensitive data in API
    const sanitizedMessages = messages.map(msg => ({
      id: msg.id,
      subject: msg.subject,
      area: msg.area,
      created_at: msg.created_at
    }));
    res.json(sanitizedMessages);
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

// Initialize data and start server
initializeData().then(() => {
  app.listen(port, () => {
    console.log(`Community Portal server running at http://localhost:${port}`);
    console.log('Data storage: JSON files in ./data directory');
  });
}).catch(error => {
  console.error('Failed to initialize data:', error);
  process.exit(1);
});
const { categoryQueries, eventQueries, contactMessageQueries, utilityQueries } = require('./queries');

/**
 * Database service layer providing high-level methods for database operations
 */
class DatabaseService {
    
    // Category methods
    static getAllCategories() {
        try {
            return categoryQueries.getAllCategories.all();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }

    static getCategoryById(id) {
        try {
            return categoryQueries.getCategoryById.get(id);
        } catch (error) {
            console.error('Error fetching category by ID:', error);
            throw new Error('Failed to fetch category');
        }
    }

    static createCategory(name, description, imageUrl) {
        try {
            const result = categoryQueries.createCategory.run(name, description, imageUrl);
            return { id: result.lastInsertRowid, name, description, imageUrl };
        } catch (error) {
            console.error('Error creating category:', error);
            throw new Error('Failed to create category');
        }
    }

    // Event methods
    static getAllEvents() {
        try {
            return eventQueries.getAllEvents.all();
        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error('Failed to fetch events');
        }
    }

    static getEventById(id) {
        try {
            return eventQueries.getEventById.get(id);
        } catch (error) {
            console.error('Error fetching event by ID:', error);
            throw new Error('Failed to fetch event');
        }
    }

    static getEventsByCategory(categoryId) {
        try {
            return eventQueries.getEventsByCategory.all(categoryId);
        } catch (error) {
            console.error('Error fetching events by category:', error);
            throw new Error('Failed to fetch events by category');
        }
    }

    static getUpcomingEventsByCategory(categoryId) {
        try {
            return eventQueries.getUpcomingEventsByCategory.all(categoryId);
        } catch (error) {
            console.error('Error fetching upcoming events by category:', error);
            throw new Error('Failed to fetch upcoming events by category');
        }
    }

    static getUpcomingEvents(limit = 10) {
        try {
            return eventQueries.getUpcomingEvents.all(limit);
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
            throw new Error('Failed to fetch upcoming events');
        }
    }

    static getAllUpcomingEvents() {
        try {
            return eventQueries.getAllUpcomingEvents.all();
        } catch (error) {
            console.error('Error fetching all upcoming events:', error);
            throw new Error('Failed to fetch all upcoming events');
        }
    }

    static searchEvents(searchTerm) {
        try {
            const likePattern = `%${searchTerm}%`;
            return eventQueries.searchEvents.all(likePattern, likePattern, likePattern);
        } catch (error) {
            console.error('Error searching events:', error);
            throw new Error('Failed to search events');
        }
    }

    static createEvent(eventData) {
        try {
            const {
                title, description, content, imageUrl, location,
                date, startTime, endTime, address, categoryId
            } = eventData;
            
            const result = eventQueries.createEvent.run(
                title, description, content, imageUrl, location,
                date, startTime, endTime, address, categoryId
            );
            
            return { 
                id: result.lastInsertRowid, 
                ...eventData 
            };
        } catch (error) {
            console.error('Error creating event:', error);
            throw new Error('Failed to create event');
        }
    }

    static updateEvent(id, eventData) {
        try {
            const {
                title, description, content, imageUrl, location,
                date, startTime, endTime, address, categoryId
            } = eventData;
            
            const result = eventQueries.updateEvent.run(
                title, description, content, imageUrl, location,
                date, startTime, endTime, address, categoryId, id
            );
            
            if (result.changes === 0) {
                throw new Error('Event not found');
            }
            
            return this.getEventById(id);
        } catch (error) {
            console.error('Error updating event:', error);
            throw new Error('Failed to update event');
        }
    }

    static deleteEvent(id) {
        try {
            const result = eventQueries.deleteEvent.run(id);
            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw new Error('Failed to delete event');
        }
    }

    static getEventsByDateRange(startDate, endDate) {
        try {
            return eventQueries.getEventsByDateRange.all(startDate, endDate);
        } catch (error) {
            console.error('Error fetching events by date range:', error);
            throw new Error('Failed to fetch events by date range');
        }
    }

    static getEventsByLocation(locationSearch) {
        try {
            const likePattern = `%${locationSearch}%`;
            return eventQueries.getEventsByLocation.all(likePattern, likePattern);
        } catch (error) {
            console.error('Error fetching events by location:', error);
            throw new Error('Failed to fetch events by location');
        }
    }

    // Contact message methods
    static getAllContactMessages() {
        try {
            return contactMessageQueries.getAllMessages.all();
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            throw new Error('Failed to fetch contact messages');
        }
    }

    static getContactMessageById(id) {
        try {
            return contactMessageQueries.getMessageById.get(id);
        } catch (error) {
            console.error('Error fetching contact message by ID:', error);
            throw new Error('Failed to fetch contact message');
        }
    }

    static createContactMessage(messageData) {
        try {
            const { name, email, phone, subject, area, message, newsletter } = messageData;
            const result = contactMessageQueries.createMessage.run(
                name, 
                email, 
                phone || null, 
                subject, 
                area || null, 
                message, 
                newsletter ? 1 : 0  // Convert boolean to integer for SQLite
            );
            return { id: result.lastInsertRowid, ...messageData };
        } catch (error) {
            console.error('Error creating contact message:', error);
            throw new Error('Failed to create contact message');
        }
    }

    static getContactMessagesForAPI() {
        try {
            return contactMessageQueries.getMessagesForAPI.all();
        } catch (error) {
            console.error('Error fetching contact messages for API:', error);
            throw new Error('Failed to fetch contact messages for API');
        }
    }

    static deleteContactMessage(id) {
        try {
            const result = contactMessageQueries.deleteMessage.run(id);
            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting contact message:', error);
            throw new Error('Failed to delete contact message');
        }
    }

    // Utility methods
    static getDatabaseStats() {
        try {
            return utilityQueries.getStats.get();
        } catch (error) {
            console.error('Error fetching database stats:', error);
            throw new Error('Failed to fetch database statistics');
        }
    }

    static checkDatabaseHealth() {
        try {
            const foreignKeysEnabled = utilityQueries.checkForeignKeys.get();
            const stats = this.getDatabaseStats();
            
            return {
                healthy: true,
                foreignKeysEnabled: foreignKeysEnabled.foreign_keys === 1,
                ...stats
            };
        } catch (error) {
            console.error('Database health check failed:', error);
            return {
                healthy: false,
                error: error.message
            };
        }
    }
}

module.exports = DatabaseService;
# Local Community Portal

A Node.js web application for discovering and managing local community events and activities.

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation Steps
1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Initialize the database:
   ```bash
   npm run db:init
   ```
5. Populate with sample data:
   ```bash
   npm run db:seed
   ```
6. Start the application:
   ```bash
   npm start
   ```
7. Open your browser and visit `http://localhost:5000`

## Project Structure

```
├── app.js                    # Main Express application
├── package.json             # Dependencies and scripts
├── database/                # Database layer
│   ├── community_portal.db  # SQLite database file
│   ├── connection.js        # Database connection
│   ├── service.js           # Database queries and operations
│   ├── init.js              # Database initialization
│   └── seed.js              # Sample data seeding
├── public/                  # Static assets
│   ├── css/                 # Stylesheets
│   │   ├── global.css       # Global styles
│   │   ├── shared.css       # Shared component styles
│   │   └── *.css            # Page-specific styles
│   ├── images/              # Community area icons
│   └── js/
│       └── script.js        # Client-side JavaScript with AJAX
└── views/                   # EJS templates
    ├── *.ejs                # Page templates
    └── partials/            # Reusable template components
```

## Key Features

### AJAX Implementation
The application includes two main AJAX features:

1. **Real-time Search** (`/api/search`)
   - Live search functionality on the homepage
   - Searches events by title, description, and location
   - Category filtering support
   - Results displayed without page reload

2. **Contact Form Submission** (`/api/contact`)
   - Asynchronous form submission
   - Real-time validation and feedback
   - Success/error messages without page refresh

### Other Features
- Community event browsing by category
- Detailed event pages with full information
- FAQ section with expandable questions
- Responsive design for all devices
- Professional styling and navigation

## Database Structure

The application uses SQLite with Better-SQLite3 and includes two main tables:

### Categories Table
- `id` - Primary key (auto-increment)
- `name` - Category name (unique)
- `description` - Category description
- `image_url` - Icon/image path
- `created_at` / `updated_at` - Timestamps

### Events Table
- `id` - Primary key (auto-increment)
- `title` - Event name
- `description` - Short description
- `content` - Full event details
- `location` - Venue name
- `address` - Full address
- `date` - Event date
- `start_time` / `end_time` - Event times
- `category_id` - Foreign key to Categories
- `created_at` / `updated_at` - Timestamps

### Relationships
- Events belong to Categories (many-to-one)
- Foreign key constraint with ON DELETE SET NULL

## Available Scripts

- `npm start` - Start the application
- `npm run dev` - Start in development mode
- `npm run db:init` - Initialize database with tables and categories
- `npm run db:seed` - Add sample events data
- `npm run db:reset` - Reset database completely (removes all data)

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite with Better-SQLite3
- **Templates**: EJS (Embedded JavaScript)
- **Frontend**: Vanilla JavaScript with AJAX
- **Styling**: Pure CSS (no frameworks)

## Development Notes

The application follows a modular CSS architecture with:
- Global styles for shared elements
- Page-specific stylesheets
- Shared component styles
- Responsive design patterns

AJAX endpoints return JSON data and handle errors gracefully with appropriate HTTP status codes.
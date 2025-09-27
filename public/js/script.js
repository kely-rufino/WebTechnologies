// Community Portal JavaScript - Main functionality with AJAX features

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeFAQ();
    initializeContactForm();
    initializeScrollEffects();
    initializeEventHandlers();
    initializeSearch(); // New AJAX search functionality
    initializeEventRefresh(); // New AJAX event refresh
    initializeHeaderSearch(); // New header search functionality
});

// AJAX Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const clearBtn = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    const searchLoading = document.getElementById('searchLoading');
    
    if (!searchInput) return; // Search only exists on homepage
    
    let searchTimeout;
    
    // Perform search function
    async function performSearch() {
        const query = searchInput.value.trim();
        const category = categoryFilter.value;
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        try {
            // Show loading indicator
            searchLoading.style.display = 'block';
            searchResults.innerHTML = '';
            
            // Make AJAX request to search API
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
            
            if (!response.ok) {
                throw new Error('Search request failed');
            }
            
            const data = await response.json();
            
            // Hide loading indicator
            searchLoading.style.display = 'none';
            
            // Display results
            displaySearchResults(data);
            
        } catch (error) {
            console.error('Search error:', error);
            searchLoading.style.display = 'none';
            searchResults.innerHTML = '<div class="search-error">Search temporarily unavailable. Please try again later.</div>';
        }
    }
    
    // Display search results
    function displaySearchResults(data) {
        if (data.total === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <h3>No results found</h3>
                    <p>No events or activities match "${data.query}". Try different keywords or browse our community areas.</p>
                </div>
            `;
            return;
        }
        
        let resultsHTML = `
            <div class="search-header">
                <h3>Search Results (${data.total} found)</h3>
                <p>Results for "${data.query}"</p>
            </div>
            <div class="results-grid">
        `;
        
        data.results.forEach(result => {
            if (result.type === 'event') {
                resultsHTML += `
                    <div class="result-card event-result">
                        <div class="result-type">📅 Event</div>
                        <h4>${result.title}</h4>
                        <p class="result-meta">${result.date} • ${result.time}</p>
                        <p class="result-location">📍 ${result.location}</p>
                        <p class="result-description">${result.description}</p>
                    </div>
                `;
            } else if (result.type === 'area') {
                resultsHTML += `
                    <div class="result-card area-result">
                        <div class="result-type">${result.icon} Community Area</div>
                        <h4>${result.name}</h4>
                        <p class="result-description">${result.description}</p>
                    </div>
                `;
            }
        });
        
        resultsHTML += '</div>';
        searchResults.innerHTML = resultsHTML;
    }
    
    // Event listeners for search
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 500); // Debounce search
    });
    
    searchBtn.addEventListener('click', performSearch);
    
    categoryFilter.addEventListener('change', function() {
        if (searchInput.value.trim().length >= 2) {
            performSearch();
        }
    });
    
    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        categoryFilter.value = '';
        searchResults.innerHTML = '';
        searchInput.focus();
    });
    
    // Enter key support
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// AJAX Event Refresh functionality
function initializeEventRefresh() {
    const refreshBtn = document.getElementById('refreshEvents');
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsLoading = document.getElementById('eventsLoading');
    
    if (!refreshBtn) return; // Refresh only exists on homepage
    
    async function refreshEvents() {
        try {
            // Show loading state
            eventsLoading.style.display = 'block';
            refreshBtn.disabled = true;
            refreshBtn.querySelector('.refresh-icon').style.animation = 'spin 1s linear infinite';
            
            // Fetch latest events via AJAX
            const response = await fetch('/api/events');
            
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            
            const events = await response.json();
            const upcomingEvents = events.filter(event => !event.featured).slice(0, 3);
            
            // Update events grid
            updateEventsGrid(upcomingEvents);
            
            // Hide loading state
            eventsLoading.style.display = 'none';
            refreshBtn.disabled = false;
            refreshBtn.querySelector('.refresh-icon').style.animation = 'none';
            
            // Show success feedback
            showNotification('Events refreshed successfully!', 'success');
            
        } catch (error) {
            console.error('Error refreshing events:', error);
            eventsLoading.style.display = 'none';
            refreshBtn.disabled = false;
            refreshBtn.querySelector('.refresh-icon').style.animation = 'none';
            showNotification('Failed to refresh events. Please try again.', 'error');
        }
    }
    
    // Update events grid with new data
    function updateEventsGrid(events) {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                           "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        
        let eventsHTML = '';
        
        events.forEach(event => {
            const eventDate = new Date(event.date);
            eventsHTML += `
                <div class="event-card fade-in-element">
                    <div class="event-date-badge">
                        <span class="month">${monthNames[eventDate.getMonth()]}</span>
                        <span class="day">${eventDate.getDate()}</span>
                    </div>
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p class="event-time">${event.time}</p>
                        <p class="event-location">${event.location}</p>
                        <p>${event.description}</p>
                    </div>
                </div>
            `;
        });
        
        eventsGrid.innerHTML = eventsHTML;
        
        // Re-apply fade-in animations
        document.querySelectorAll('.fade-in-element').forEach(el => {
            el.classList.add('fade-in');
        });
    }
    
    refreshBtn.addEventListener('click', refreshEvents);
}

// Show notification messages
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        padding: 1rem 1.5rem;
        border-radius: 6px;
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        font-weight: 600;
        max-width: 300px;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlight based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

// FAQ page functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        if (question && answer) {
            // If there's no explicit question/answer structure, create it
            if (!question && !answer) {
                const h3 = item.querySelector('h3');
                const content = item.querySelector('p, ul, div');
                
                if (h3 && content) {
                    h3.addEventListener('click', function() {
                        item.classList.toggle('active');
                        
                        if (item.classList.contains('active')) {
                            content.style.maxHeight = content.scrollHeight + 'px';
                        } else {
                            content.style.maxHeight = '0';
                        }
                    });
                }
            } else {
                question.addEventListener('click', function() {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other FAQ items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherToggle = otherItem.querySelector('.faq-toggle');
                            if (otherAnswer) otherAnswer.style.maxHeight = '0';
                            if (otherToggle) otherToggle.textContent = '+';
                        }
                    });
                    
                    // Toggle current item
                    item.classList.toggle('active');
                    
                    if (!isActive) {
                        answer.style.maxHeight = answer.scrollHeight + 60 + 'px';
                        if (toggle) toggle.textContent = '−';
                    } else {
                        answer.style.maxHeight = '0';
                        if (toggle) toggle.textContent = '+';
                    }
                });
            }
        }
    });
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const formData = new FormData(contactForm);
            const formValues = Object.fromEntries(formData);
            
            // Check required fields
            const requiredFields = ['name', 'email', 'subject', 'message', 'privacy'];
            let isValid = true;
            let errorMessages = [];
            
            requiredFields.forEach(field => {
                const input = contactForm.querySelector(`[name="${field}"]`);
                if (!formValues[field] || formValues[field].trim() === '') {
                    isValid = false;
                    if (input) {
                        input.classList.add('error');
                        input.addEventListener('input', () => input.classList.remove('error'));
                    }
                    errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                }
            });
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formValues.email && !emailRegex.test(formValues.email)) {
                isValid = false;
                errorMessages.push('Please enter a valid email address');
                const emailInput = contactForm.querySelector('[name="email"]');
                if (emailInput) {
                    emailInput.classList.add('error');
                    emailInput.addEventListener('input', () => emailInput.classList.remove('error'));
                }
            }
            
            // Privacy policy acceptance
            if (!formValues.privacy) {
                isValid = false;
                errorMessages.push('You must accept the privacy policy to continue');
            }
            
            if (isValid) {
                // Show loading state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                // Simulate form submission (replace with actual server submission)
                setTimeout(() => {
                    showFormStatus('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }, 1500);
                
                // In a real application, you would send the data to your Express server:
                // fetch('/contact', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify(formValues)
                // })
                // .then(response => response.json())
                // .then(data => {
                //     if (data.success) {
                //         showFormStatus('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
                //         contactForm.reset();
                //     } else {
                //         showFormStatus('error', 'There was an error sending your message. Please try again.');
                //     }
                // })
                // .catch(error => {
                //     showFormStatus('error', 'There was an error sending your message. Please try again.');
                // })
                // .finally(() => {
                //     submitButton.textContent = originalText;
                //     submitButton.disabled = false;
                // });
                
            } else {
                showFormStatus('error', errorMessages.join('. ') + '.');
            }
        });
        
        // Reset button functionality
        const resetButton = contactForm.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                contactForm.querySelectorAll('.error').forEach(input => {
                    input.classList.remove('error');
                });
                if (formStatus) {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }
            });
        }
    }
}

// Show form status messages
function showFormStatus(type, message) {
    const formStatus = document.getElementById('form-status');
    if (formStatus) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }, 5000);
        }
    }
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Fade-in animation for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in animation
    document.querySelectorAll('.area-card, .event-card, .quick-link-card, .faq-item').forEach(el => {
        el.classList.add('fade-in-element');
        observer.observe(el);
    });
}

// General event handlers
function initializeEventHandlers() {
    // CTA button smooth scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            const areasSection = document.getElementById('areas');
            if (areasSection) {
                areasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    
    // Event action buttons - Get Directions
    const getDirectionsButtons = document.querySelectorAll('.get-directions-btn');
    console.log('Found Get Directions buttons:', getDirectionsButtons.length);
    
    getDirectionsButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button);
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Get Directions button clicked!');
            
            const eventAddress = this.getAttribute('data-address');
            const eventName = this.getAttribute('data-event-name');
            
            console.log('Event address:', eventAddress);
            console.log('Event name:', eventName);
            
            if (eventAddress) {
                getDirectionsToEvent(eventAddress, eventName);
            } else {
                alert('Address not available for this event.');
            }
        });
    });
    
    // Event action buttons - View Schedule
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        if (button.textContent.includes('View Schedule')) {
            button.addEventListener('click', function() {
                alert('Community Fair Schedule:\n\n10:00 AM - Opening Ceremony\n11:00 AM - Local Vendors Open\n12:00 PM - Live Music Begins\n1:00 PM - Kids Activities Start\n3:00 PM - Community Awards\n5:00 PM - Food Trucks Arrive\n7:00 PM - Evening Entertainment\n8:00 PM - Closing Ceremony');
            });
        }
    });
    
    // Back to top functionality
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.title = 'Back to top';
    document.body.appendChild(backToTopButton);
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
}

// Utility functions
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(date).toLocaleDateString('en-GB', options);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Opens Google Maps with directions from user's current location to event address
 * @param {string} eventAddress - The destination address
 * @param {string} eventName - The name of the event (for display)
 */
function getDirectionsToEvent(eventAddress, eventName) {
    console.log('getDirectionsToEvent called with:', eventAddress, eventName);
    
    // Check if geolocation is supported
    if (navigator.geolocation) {
        // Show loading message
        const loadingMessage = `Getting your location to provide directions to ${eventName}...`;
        
        // Create a temporary notification
        showLocationMessage(loadingMessage, 'info');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                // Success - got user's location
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Create Google Maps URL with directions from current location to event
                const mapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${encodeURIComponent(eventAddress)}`;
                
                // Open in new tab
                window.open(mapsUrl, '_blank');
                
                // Remove loading message
                hideLocationMessage();
            },
            function(error) {
                // Error getting location - fall back to directions without origin
                console.warn('Geolocation error:', error);
                hideLocationMessage();
                
                let errorMessage = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Opening directions from general area.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable. Opening directions from general area.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Opening directions from general area.';
                        break;
                    default:
                        errorMessage = 'Unable to get your location. Opening directions from general area.';
                        break;
                }
                
                showLocationMessage(errorMessage, 'warning');
                
                // Fall back to just the destination address
                const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(eventAddress)}`;
                window.open(mapsUrl, '_blank');
                
                // Hide message after 3 seconds
                setTimeout(hideLocationMessage, 3000);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000, // 10 seconds
                maximumAge: 300000 // 5 minutes
            }
        );
    } else {
        // Geolocation not supported - just open the destination
        showLocationMessage('Geolocation not supported. Opening event location.', 'warning');
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(eventAddress)}`;
        window.open(mapsUrl, '_blank');
        
        setTimeout(hideLocationMessage, 3000);
    }
}

/**
 * Shows a temporary message to the user about location services
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('info', 'warning', 'error')
 */
function showLocationMessage(message, type = 'info') {
    // Remove any existing message
    hideLocationMessage();
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'location-message';
    messageDiv.className = `location-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-icon">${type === 'info' ? '📍' : type === 'warning' ? '⚠️' : '❌'}</span>
            <span class="message-text">${message}</span>
        </div>
    `;
    
    // Add styles
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'info' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#F44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 14px;
        max-width: 400px;
        text-align: center;
        animation: slideInFromTop 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
}

/**
 * Hides the location message
 */
function hideLocationMessage() {
    const existing = document.getElementById('location-message');
    if (existing) {
        existing.remove();
    }
}

/**
 * Initialize header search functionality
 */
function initializeHeaderSearch() {
    const searchInput = document.getElementById('header-search');
    const searchDropdown = document.getElementById('search-results-dropdown');
    
    if (!searchInput || !searchDropdown) return;
    
    let searchTimeout;
    
    // Perform header search function
    async function performHeaderSearch() {
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            searchDropdown.classList.remove('show');
            return;
        }
        
        try {
            // Make AJAX request to query API
            const response = await fetch(`/query?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error('Search request failed');
            }
            
            const events = await response.json();
            displayHeaderSearchResults(events);
            
        } catch (error) {
            console.error('Header search error:', error);
            searchDropdown.innerHTML = '<div class="no-results">Search temporarily unavailable</div>';
            searchDropdown.classList.add('show');
        }
    }
    
    // Display search results in dropdown
    function displayHeaderSearchResults(events) {
        if (events.length === 0) {
            searchDropdown.innerHTML = '<div class="no-results">No events found</div>';
        } else {
            const resultsHTML = events.map(event => `
                <div class="search-result-item" onclick="navigateToEvent(${event.id})">
                    <div class="search-result-title">${escapeHtml(event.title)}</div>
                    <div class="search-result-description">${escapeHtml(event.description)}</div>
                    <div class="search-result-date">${formatDate(event.date)} • ${escapeHtml(event.location)}</div>
                </div>
            `).join('');
            
            searchDropdown.innerHTML = resultsHTML;
        }
        
        searchDropdown.classList.add('show');
    }
    
    // Navigate to event (make it global so onclick can access it)
    window.navigateToEvent = function(eventId) {
        window.location.href = `/events#event-${eventId}`;
    };
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Event listeners
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performHeaderSearch, 300);
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.classList.remove('show');
        }
    });
    
    // Show dropdown when focusing on input (if there's content)
    searchInput.addEventListener('focus', function() {
        if (searchInput.value.trim().length >= 2) {
            performHeaderSearch();
        }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchDropdown.classList.remove('show');
            searchInput.blur();
        }
    });
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeFAQ,
        initializeContactForm,
        validateEmail,
        formatDate,
        getDirectionsToEvent,
        showLocationMessage,
        hideLocationMessage
    };
}
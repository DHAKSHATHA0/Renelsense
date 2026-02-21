// Main JavaScript file with enhanced animations and interactivity

// Global server configuration
// NOTE: Default IPs will be overridden by config.json loaded from server
let serverConfig = {
    serverIP: window.location.hostname,
    serverPort: 3000,
    mlApiIP: window.location.hostname,
    mlApiPort: 5000,
    getWebSocketURL: function() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${this.serverIP}:${this.serverPort}`;
    },
    getAPIURL: function() {
        return `http://${this.serverIP}:${this.serverPort}`;
    },
    getMLApiURL: function() {
        return `http://${this.mlApiIP}:${this.mlApiPort}`;
    }
};

// Load server configuration from config.json
async function loadServerConfig() {
    try {
        const response = await fetch('/config.json');
        if (response.ok) {
            const config = await response.json();
            serverConfig.serverIP = config.serverIP;
            serverConfig.serverPort = config.serverPort;
            serverConfig.mlApiIP = config.mlApiIP || 'localhost';
            serverConfig.mlApiPort = config.mlApiPort || 5000;
            console.log(`Server configured: ${config.serverIP}:${config.serverPort}`);
            console.log(`ML API configured: ${serverConfig.mlApiIP}:${serverConfig.mlApiPort}`);
        }
    } catch (error) {
        console.log('Using default server configuration (localhost:3000)');
        console.log('Using default ML API configuration (localhost:5000)');
    }
}

// Initialize server config on page load
loadServerConfig();

document.addEventListener('DOMContentLoaded', function() {
    console.log('Renal Sense - Professional Kidney Monitoring System loaded');
    
    // Initialize authentication UI
    initAuthUI();
    
    // Initialize all features
    initSmoothScroll();
    initScrollAnimations();
    initNavigation();
    initNewsletter();
    initButtons();
    initParallaxEffect();
    initCounterAnimation();
    
});

// Smooth scrolling for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Active navigation highlighting based on current page
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Normalize comparison: handle index.html, /, and empty strings
        const isCurrentPage = (currentPage === '' || currentPage === 'index.html') && (href === 'index.html' || href === '/' || href === '');
        const isOtherPage = currentPage === href;
        
        if (isCurrentPage || isOtherPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Scroll animations for elements
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all feature cards and stat cards
    document.querySelectorAll('.feature-card, .stat-card, .step-item, .snapshot-card').forEach(el => {
        observer.observe(el);
    });
}

// Parallax effect for hero section
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            const heroElements = hero.querySelectorAll('.kidney-animation-container');
            
            heroElements.forEach(el => {
                el.style.transform = `translateY(${scrollPosition * 0.5}px)`;
            });
        });
    }
}

// Counter animation for statistics
function initCounterAnimation() {
    const statCards = document.querySelectorAll('.stat-card');
    
    const countUp = (element, target, duration = 1000) => {
        let current = 0;
        const increment = target / (duration / 50);
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 50);
    };
    
    // Trigger on scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                // Add animation trigger here if needed
            }
        });
    });
    
    statCards.forEach(card => observer.observe(card));
}

// Add hover effects to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.02)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add ripple effect to buttons
function createRipple(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

// Scroll reveal animation for sections
function revealOnScroll() {
    const reveals = document.querySelectorAll('[data-reveal]');
    
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('reveal');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
    .stat-card,
    .feature-card,
    .step-item {
        opacity: 0;
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .stat-card {
        animation-delay: 0s;
    }
    
    .stat-card:nth-child(2) {
        animation-delay: 0.1s;
    }
    
    .stat-card:nth-child(3) {
        animation-delay: 0.2s;
    }
    
    .stat-card:nth-child(4) {
        animation-delay: 0.3s;
    }
    
    .feature-card {
        animation-delay: 0s;
    }
    
    .feature-card:nth-child(2) {
        animation-delay: 0.1s;
    }
    
    .feature-card:nth-child(3) {
        animation-delay: 0.2s;
    }
    
    .feature-card:nth-child(4) {
        animation-delay: 0.3s;
    }
    
    .feature-card:nth-child(5) {
        animation-delay: 0.4s;
    }
    
    .feature-card:nth-child(6) {
        animation-delay: 0.5s;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleAnimation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes rippleAnimation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

// Newsletter functionality
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Show success message
            const button = this.querySelector('button');
            const originalText = button.textContent;
            button.textContent = '✓ Subscribed!';
            button.style.backgroundColor = '#28a745';
            
            // Reset after 3 seconds
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
                this.reset();
            }, 3000);
        });
    }
}

// Button enhancements
function initButtons() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize authentication UI
function initAuthUI() {
    const authLink = document.getElementById('authLink');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (authLink) {
        if (currentUser) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        } else {
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
        }
    }
}



document.head.appendChild(style);
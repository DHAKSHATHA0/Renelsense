// ========================================
// AUTHENTICATION LOGIC
// Login & Signup Functionality with Server Integration
// ========================================

class AuthManager {
    constructor() {
        this.currentUser = this.loadUser();
        this.serverURL = this.getServerURL();
    }

    getServerURL() {
        // Get server URL from config if available, otherwise use default
        if (typeof serverConfig !== 'undefined' && serverConfig.getServerURL) {
            return serverConfig.getServerURL();
        }
        return window.location.origin || 'http://localhost:3000';
    }

    // Save user to localStorage (for client-side session)
    saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    // Load current user from localStorage
    loadUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Register new user via API
    async register(firstName, lastName, email, phone, password, confirmPassword) {
        try {
            // Validate inputs
            if (!firstName || !lastName || !email || !password) {
                return { success: false, message: 'Please provide all required fields' };
            }

            if (password !== confirmPassword) {
                return { success: false, message: 'Passwords do not match' };
            }

            if (password.length < 8) {
                return { success: false, message: 'Password must be at least 8 characters' };
            }

            if (!this.isValidEmail(email)) {
                return { success: false, message: 'Invalid email address' };
            }

            // Send registration request to server
            const response = await fetch(`${this.serverURL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                // Save user to local session
                this.saveUser(data.user);
                console.log('✅ Registration successful');
                return { success: true, message: 'Account created successfully', user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed: ' + error.message };
        }
    }

    // Login user via API
    async login(email, password) {
        try {
            if (!email || !password) {
                return { success: false, message: 'Email and password required' };
            }

            // Send login request to server
            const response = await fetch(`${this.serverURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Save user to local session
                this.saveUser(data.user);
                console.log('✅ Login successful');
                return { success: true, message: 'Login successful', user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed: ' + error.message };
        }
    }

    // Fetch full user details from DB
    async fetchCurrentUser() {
        try {
            const user = this.loadUser();
            if (!user || !user.id) return null;

            const response = await fetch(`${this.serverURL}/api/auth/me/${user.id}`);
            const data = await response.json();

            if (data.success) {
                // Update localStorage with latest data from DB
                this.saveUser(data.user);
                return data;
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch user from DB:', error);
            return null;
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        console.log('✅ User logged out');
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Wait for DOM to be ready
async function initializeAuth() {
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

            const result = await authManager.login(email, password);

            if (result.success) {
                showToast('Logged in successfully', 'success');
                // Redirect to home page after 1 second
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                showToast(result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });
    }

    // Handle Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            // Show loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            const result = await authManager.register(firstName, lastName, email, phone, password, confirmPassword);

            if (result.success) {
                showToast('Account created! Redirecting...', 'success');
                // Redirect to home page after 1 second
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                showToast(result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

// Check if user is logged in on protected pages
function checkAuth() {
    if (!authManager.isLoggedIn()) {
        window.location.href = '/signup';
    }
}

// Logout function
function logout() {
    authManager.logout();
    window.location.href = '/signup';
}


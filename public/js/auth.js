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

// Show toast notification with pastel red theme and OK button
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    
    // Add icon based on type
    let icon = '';
    if (type === 'success') icon = '✓ ';
    if (type === 'error') icon = '✗ ';
    if (type === 'warning') icon = '⚠ ';
    
    // Create toast content with message and OK button
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px; justify-content: space-between; min-width: 400px;">
            <span>${icon}${message}</span>
            <button id="toastOkBtn" style="
                background: white;
                color: #ff6b6b;
                border: 2px solid white;
                padding: 8px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.9)'" onmouseout="this.style.background='white'" onclick="document.getElementById('toast').classList.remove('show');">
                OK
            </button>
        </div>
    `;
    
    toast.className = `toast show ${type}`;
    toast.style.fontSize = '1.1rem';
    toast.style.fontWeight = '600';

    setTimeout(() => {
        if (toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }, 5000);
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
                    window.location.href = '/';
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
                    window.location.href = '/';
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
    console.log('🚪 Logging out user...');
    try {
        authManager.logout();
        console.log('🚪 AuthManager logged out');
    } catch (error) {
        console.error('Error in authManager logout:', error);
    }
    
    // Clear all user-related data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('users');
    sessionStorage.clear();
    
    console.log('🚪 Cleared localStorage and sessionStorage');
    
    // Redirect to signup page after a small delay to ensure data is cleared
    setTimeout(() => {
        console.log('🚪 Redirecting to signup page');
        window.location.href = '/signup';
    }, 100);
}


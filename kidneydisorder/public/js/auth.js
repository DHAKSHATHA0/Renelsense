// ========================================
// AUTHENTICATION LOGIC
// Login & Signup Functionality
// ========================================

class AuthManager {
    constructor() {
        this.currentUser = this.loadUser();
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }

    // Save user to localStorage
    saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    // Load current user from localStorage
    loadUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // Register new user
    register(firstName, lastName, email, phone, password) {
        // Validate email format
        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Invalid email address' };
        }

        // Check if email already exists
        if (this.users.some(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Validate password strength
        if (!this.isValidPassword(password)) {
            return { success: false, message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers' };
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            phone,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            chatHistory: [],
            testResults: [],
            reports: []
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.saveUser({
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email
        });

        return { success: true, message: 'Account created successfully', user: newUser };
    }

    // Login user
    login(email, password) {
        const user = this.users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Incorrect password' };
        }

        this.saveUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });

        return { success: true, message: 'Login successful', user };
    }

    // Logout user
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    isValidPassword(password) {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    }

    // Simple password hashing (for demo - use proper hashing in production)
    hashPassword(password) {
        return btoa(password); // Base64 encoding for demo only
    }

    // Verify password
    verifyPassword(password, hash) {
        return btoa(password) === hash;
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
function initializeAuth() {
    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            const result = authManager.login(email, password);

            if (result.success) {
                showToast('Logged in successfully', 'success');
                // Redirect to home page after 1 second
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                showToast(result.message, 'error');
            }
        });
    }

    // Handle Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
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

            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }

            const result = authManager.register(firstName, lastName, email, phone, password);

            if (result.success) {
                showToast('Account created! Redirecting...', 'success');
                // Redirect to home page after 1 second
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                showToast(result.message, 'error');
            }
        });
    }

    // Handle Google Sign In/Up
    const googleButtons = document.querySelectorAll('.btn-google');
    googleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // For demo: Generate a mock Google user
            const googleEmail = prompt('Enter email for Google sign-in (demo):');
            
            if (!googleEmail || !googleEmail.includes('@')) {
                showToast('Please enter a valid email', 'error');
                return;
            }

            // Check if user exists
            const existingUser = authManager.users.find(u => u.email === googleEmail);
            
            if (existingUser) {
                // Login existing user
                authManager.saveUser({
                    id: existingUser.id,
                    firstName: existingUser.firstName,
                    lastName: existingUser.lastName,
                    email: existingUser.email
                });
                showToast('Google sign-in successful', 'success');
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                // Create new user with Google email
                const firstName = prompt('Enter your first name:');
                const lastName = prompt('Enter your last name:');
                
                if (!firstName || !lastName) {
                    showToast('First and last name are required', 'error');
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    firstName,
                    lastName,
                    email: googleEmail,
                    phone: '',
                    password: 'google-auth-' + Date.now(), // Google users don't have passwords
                    createdAt: new Date().toISOString(),
                    chatHistory: [],
                    testResults: [],
                    reports: [],
                    googleAuth: true
                };

                authManager.users.push(newUser);
                localStorage.setItem('users', JSON.stringify(authManager.users));
                authManager.saveUser({
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email
                });

                showToast('Google account created successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            }
        });
    });
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


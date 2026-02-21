// ========================================
// MySQL INTEGRATION - JAVASCRIPT EXAMPLES
// ========================================
// This file contains copy-paste ready JavaScript code examples
// for integrating with the MySQL backend API
// Use these as reference or copy directly into your projects

// ========================================
// CONFIGURATION
// ========================================

// Base URL for all API calls
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get API URL
function getAPIEndpoint(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// ========================================
// 1. CREATE/ADD NEW USER
// ========================================

/**
 * Add a new user to the database
 * @param {string} name - User's full name
 * @param {string} email - User's email (must be unique)
 * @param {string} phone - User's phone number (optional)
 * @param {number} age - User's age (optional)
 * @param {string} gender - User's gender (optional)
 * @returns {Promise} Response from server
 */
async function addNewUser(name, email, phone = '', age = null, gender = '') {
    try {
        console.log('📤 Adding new user:', { name, email });

        // Send POST request to add user
        const response = await fetch(getAPIEndpoint('/users'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                age: age ? parseInt(age) : null,
                gender
            })
        });

        // Parse server response
        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add user');
        }

        console.log('✅ User added successfully:', data);
        return data;

    } catch (error) {
        console.error('❌ Error adding user:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Usage Example:
/*
const result = await addNewUser(
    'John Doe',
    'john@example.com',
    '555-1234',
    30,
    'Male'
);

if (result.success) {
    console.log('New user ID:', result.userId);
} else {
    console.log('Error:', result.message);
}
*/

// ========================================
// 2. GET ALL USERS FROM DATABASE
// ========================================

/**
 * Fetch all users from the database
 * @returns {Promise} Array of users
 */
async function getAllUsers() {
    try {
        console.log('📥 Fetching all users...');

        // Send GET request to retrieve all users
        const response = await fetch(getAPIEndpoint('/users'), {
            method: 'GET'
        });

        const data = await response.json();

        // Check if request was successful
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch users');
        }

        console.log('✅ Fetched users:', data.count);
        return data.data; // Return array of users

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        return [];
    }
}

// Usage Example:
/*
const users = await getAllUsers();
users.forEach(user => {
    console.log(`${user.name} - ${user.email}`);
});
*/

// ========================================
// 3. GET SINGLE USER BY ID
// ========================================

/**
 * Fetch a single user by their ID
 * @param {number} userId - User's ID
 * @returns {Promise} User object or null if not found
 */
async function getUserById(userId) {
    try {
        console.log('📥 Fetching user:', userId);

        const response = await fetch(getAPIEndpoint(`/users/${userId}`), {
            method: 'GET'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'User not found');
        }

        console.log('✅ User found:', data.data.name);
        return data.data;

    } catch (error) {
        console.error('❌ Error fetching user:', error);
        return null;
    }
}

// Usage Example:
/*
const user = await getUserById(1);
if (user) {
    console.log('Name:', user.name);
    console.log('Email:', user.email);
} else {
    console.log('User not found');
}
*/

// ========================================
// 4. UPDATE USER
// ========================================

/**
 * Update user information
 * @param {number} userId - User's ID
 * @param {object} updates - Object with fields to update
 * @returns {Promise} Updated user data
 */
async function updateUser(userId, updates) {
    try {
        console.log('📤 Updating user:', userId);

        const response = await fetch(getAPIEndpoint(`/users/${userId}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update user');
        }

        console.log('✅ User updated successfully');
        return data;

    } catch (error) {
        console.error('❌ Error updating user:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Usage Example:
/*
const result = await updateUser(1, {
    name: 'John Updated',
    email: 'john.updated@example.com',
    age: 31
});
*/

// ========================================
// 5. DELETE USER
// ========================================

/**
 * Delete a user from the database
 * @param {number} userId - User's ID
 * @returns {Promise} Response from server
 */
async function deleteUser(userId) {
    try {
        // Ask for confirmation first
        if (!confirm('Are you sure you want to delete this user?')) {
            console.log('❌ Delete cancelled');
            return { success: false, message: 'Cancelled' };
        }

        console.log('📤 Deleting user:', userId);

        const response = await fetch(getAPIEndpoint(`/users/${userId}`), {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete user');
        }

        console.log('✅ User deleted successfully');
        return data;

    } catch (error) {
        console.error('❌ Error deleting user:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Usage Example:
/*
const result = await deleteUser(1);
if (result.success) {
    console.log('User deleted');
}
*/

// ========================================
// 6. SAVE TEST RESULTS
// ========================================

/**
 * Save test results for a user
 * @param {number} userId - User's ID
 * @param {object} testData - Test results data
 * @returns {Promise} Test ID if successful
 */
async function saveTestResult(userId, testData) {
    try {
        console.log('📤 Saving test result for user:', userId);

        const response = await fetch(getAPIEndpoint('/test-results'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                ...testData
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save test result');
        }

        console.log('✅ Test result saved, ID:', data.testId);
        return data;

    } catch (error) {
        console.error('❌ Error saving test result:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Usage Example:
/*
const result = await saveTestResult(1, {
    eGFR: 75.5,
    creatinine: 0.9,
    heartRate: 72,
    spo2: 98.5,
    temperature: 98.6,
    status: 'normal'
});

if (result.success) {
    console.log('Test saved with ID:', result.testId);
}
*/

// ========================================
// 7. GET USER TEST RESULTS
// ========================================

/**
 * Fetch all test results for a user
 * @param {number} userId - User's ID
 * @returns {Promise} Array of test results
 */
async function getUserTestResults(userId) {
    try {
        console.log('📥 Fetching test results for user:', userId);

        const response = await fetch(getAPIEndpoint(`/test-results/user/${userId}`), {
            method: 'GET'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch test results');
        }

        console.log('✅ Fetched', data.count, 'test results');
        return data.data;

    } catch (error) {
        console.error('❌ Error fetching test results:', error);
        return [];
    }
}

// Usage Example:
/*
const testResults = await getUserTestResults(1);
testResults.forEach(test => {
    console.log(`eGFR: ${test.eGFR}, Date: ${test.timestamp}`);
});
*/

// ========================================
// 8. FORM SUBMISSION HELPER
// ========================================

/**
 * Handle form submission with error handling and user feedback
 * @param {string} formId - Form element ID
 * @param {function} submitCallback - Async function to call on submit
 * @param {string} messageElementId - Element ID to display messages
 */
function setupFormHandler(formId, submitCallback, messageElementId) {
    const form = document.getElementById(formId);
    const messageElement = document.getElementById(messageElementId);

    if (!form) {
        console.error('Form not found:', formId);
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Loading...';
            }

            // Show loading message
            if (messageElement) {
                messageElement.textContent = '⏳ Processing...';
                messageElement.className = 'message info';
                messageElement.style.display = 'block';
            }

            // Call the submit callback
            const result = await submitCallback(form);

            // Show result
            if (result.success) {
                if (messageElement) {
                    messageElement.textContent = '✅ ' + (result.message || 'Success!');
                    messageElement.className = 'message success';
                }
                form.reset();
            } else {
                if (messageElement) {
                    messageElement.textContent = '❌ ' + (result.message || 'Error!');
                    messageElement.className = 'message error';
                }
            }

        } catch (error) {
            if (messageElement) {
                messageElement.textContent = '❌ Error: ' + error.message;
                messageElement.className = 'message error';
            }
        } finally {
            // Restore button state
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit';
            }
        }
    });
}

// Usage Example:
/*
setupFormHandler(
    'userForm',
    async (form) => {
        const name = form.querySelector('#userName').value;
        const email = form.querySelector('#userEmail').value;
        return await addNewUser(name, email);
    },
    'messageElement'
);
*/

// ========================================
// 9. DATA TABLE RENDERER
// ========================================

/**
 * Render users data in an HTML table
 * @param {array} users - Array of user objects
 * @param {string} tableBodyId - Table body element ID
 * @param {function} onDelete - Callback when delete button clicked
 */
function renderUsersTable(users, tableBodyId, onDelete = null) {
    const tableBody = document.getElementById(tableBodyId);

    if (!tableBody) {
        console.error('Table body not found:', tableBodyId);
        return;
    }

    // Clear existing rows
    tableBody.innerHTML = '';

    // Check if users array is empty
    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #999;">
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    // Create rows for each user
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.age || '-'}</td>
            <td>
                <button onclick="${onDelete ? `handleDelete(${user.id}, '${user.name}')` : ''}" 
                        style="background: #e74c3c; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    console.log('✅ Rendered', users.length, 'users');
}

// Usage Example:
/*
const users = await getAllUsers();
renderUsersTable(users, 'usersTableBody', () => {
    // Handle delete
});
*/

// ========================================
// 10. ERROR HANDLER UTILITY
// ========================================

/**
 * Display error message to user
 * @param {string} elementId - Element ID to display error
 * @param {string} message - Error message
 * @param {number} duration - Duration to show message (ms)
 */
function showError(elementId, message, duration = 5000) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    element.textContent = '❌ ' + message;
    element.className = 'message error';
    element.style.display = 'block';

    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
}

/**
 * Display success message to user
 * @param {string} elementId - Element ID to display success
 * @param {string} message - Success message
 * @param {number} duration - Duration to show message (ms)
 */
function showSuccess(elementId, message, duration = 3000) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    element.textContent = '✅ ' + message;
    element.className = 'message success';
    element.style.display = 'block';

    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }
}

// Usage Example:
/*
showSuccess('messageElement', 'User added successfully!', 3000);
showError('messageElement', 'Email already exists', 5000);
*/

// ========================================
// EXPORT FUNCTIONS (for use in other files)
// ========================================

// If using ES6 modules
// export {
//     addNewUser,
//     getAllUsers,
//     getUserById,
//     updateUser,
//     deleteUser,
//     saveTestResult,
//     getUserTestResults,
//     setupFormHandler,
//     renderUsersTable,
//     showError,
//     showSuccess
// };

// ========================================
// HOW TO USE THIS FILE
// ========================================

/*
1. Save this file as public/js/mysql-api.js

2. Include it in your HTML:
   <script src="/js/mysql-api.js"></script>

3. Use the functions in your code:
   
   // Add user
   const result = await addNewUser('John', 'john@example.com');
   
   // Get all users
   const users = await getAllUsers();
   
   // Render table
   renderUsersTable(users, 'table-body');
   
   // Show messages
   showSuccess('message', 'Operation completed!');

4. For more examples, see mysql-demo.html
*/

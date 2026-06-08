// Authentication helper functions

/**
 * Show error message
 */
function showError(message, elementId = 'errorMessage') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        element.style.display = 'block';
        setTimeout(() => {
            element.classList.remove('show');
            element.style.display = 'none';
        }, 5000);
    }
}

/**
 * Show success message
 */
function showSuccess(message, elementId = 'successMessage') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        element.style.display = 'block';
        setTimeout(() => {
            element.classList.remove('show');
            element.style.display = 'none';
        }, 5000);
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return apiClient.isAuthenticated();
}

/**
 * Get stored user data
 */
function getStoredUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Store user data
 */
function storeUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear user data
 */
function clearUser() {
    localStorage.removeItem('user');
    apiClient.removeToken();
}

/**
 * Redirect to login
 */
function redirectToLogin() {
    window.location.href = 'index.html';
}

/**
 * Redirect to dashboard
 */
function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

/**
 * Handle login form submission
 */
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Check if already logged in
    if (isAuthenticated() && window.location.pathname.includes('index.html')) {
        redirectToDashboard();
    }
});

/**
 * Handle login
 */
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;

    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const response = await apiClient.login(username, password);

        // Store token and user data
        apiClient.setToken(response.token);
        storeUser(response.user);

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedUsername', username);
        }

        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
            redirectToDashboard();
        }, 1500);
    } catch (error) {
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

/**
 * Handle registration
 */
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        const response = await apiClient.register(username, email, password);
        showSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        showError(error.message || 'Registration failed. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await apiClient.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearUser();
        redirectToLogin();
    }
}

/**
 * Check authentication and redirect if needed
 */
function requireAuth() {
    if (!isAuthenticated()) {
        redirectToLogin();
    }
}

/**
 * Format date/time
 */
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date only
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

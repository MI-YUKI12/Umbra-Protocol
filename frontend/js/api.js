// API Configuration
const API_BASE_URL = localStorage.getItem('apiUrl') || 'http://localhost:5000/api';

class APIClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add authorization token if available
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Request failed',
                    error: data.error
                };
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Get stored authentication token
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Store authentication token
     */
    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    /**
     * Remove authentication token
     */
    removeToken() {
        localStorage.removeItem('authToken');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    // ===== Authentication Endpoints =====
    
    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { username, email, password }
        });
    }

    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { username, password }
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async getProfile() {
        return this.request('/auth/profile');
    }

    async updateTelegramConfig(config) {
        return this.request('/auth/update-telegram-config', {
            method: 'PUT',
            body: config
        });
    }

    // ===== Messages Endpoints =====

    async getMessages(page = 1, perPage = 20, filters = {}) {
        let endpoint = `/messages?page=${page}&per_page=${perPage}`;
        if (filters.type) endpoint += `&type=${filters.type}`;
        if (filters.status) endpoint += `&status=${filters.status}`;
        return this.request(endpoint);
    }

    async sendMessage(content, messageType, targetId) {
        return this.request('/messages/send', {
            method: 'POST',
            body: { content, message_type: messageType, target_id: targetId }
        });
    }

    async scheduleMessage(content, messageType, targetId, scheduledFor) {
        return this.request('/messages/schedule', {
            method: 'POST',
            body: {
                content,
                message_type: messageType,
                target_id: targetId,
                scheduled_for: scheduledFor
            }
        });
    }

    async getMessageStatistics(days = 30) {
        return this.request(`/messages/statistics?days=${days}`);
    }

    async deleteMessage(messageId) {
        return this.request(`/messages/${messageId}`, {
            method: 'DELETE'
        });
    }

    // ===== Members Endpoints =====

    async getMembers(page = 1, perPage = 20, chatType = null) {
        let endpoint = `/members?page=${page}&per_page=${perPage}`;
        if (chatType) endpoint += `&chat_type=${chatType}`;
        return this.request(endpoint);
    }

    async addMember(telegramUserId, firstName, lastName, username, isBot = false, chatType = null) {
        return this.request('/members/add', {
            method: 'POST',
            body: {
                telegram_user_id: telegramUserId,
                first_name: firstName,
                last_name: lastName,
                username: username,
                is_bot: isBot,
                chat_type: chatType
            }
        });
    }

    async removeMember(memberId) {
        return this.request(`/members/${memberId}`, {
            method: 'DELETE'
        });
    }

    async updateMemberPermissions(memberId, permissions, isAdmin = false) {
        return this.request(`/members/${memberId}/permissions`, {
            method: 'PUT',
            body: { permissions, is_admin: isAdmin }
        });
    }

    async banMember(memberId) {
        return this.request(`/members/${memberId}/ban`, {
            method: 'POST'
        });
    }

    async unbanMember(memberId) {
        return this.request(`/members/${memberId}/unban`, {
            method: 'POST'
        });
    }

    // ===== Workflows Endpoints =====

    async getWorkflows(page = 1, perPage = 20, isActive = null) {
        let endpoint = `/workflows?page=${page}&per_page=${perPage}`;
        if (isActive !== null) endpoint += `&is_active=${isActive}`;
        return this.request(endpoint);
    }

    async createWorkflow(name, triggerType, actionType, description = null, triggerValue = null, actionData = null, isActive = true) {
        return this.request('/workflows', {
            method: 'POST',
            body: {
                name,
                description,
                trigger_type: triggerType,
                trigger_value: triggerValue,
                action_type: actionType,
                action_data: actionData,
                is_active: isActive
            }
        });
    }

    async updateWorkflow(workflowId, updates) {
        return this.request(`/workflows/${workflowId}`, {
            method: 'PUT',
            body: updates
        });
    }

    async deleteWorkflow(workflowId) {
        return this.request(`/workflows/${workflowId}`, {
            method: 'DELETE'
        });
    }

    async toggleWorkflow(workflowId) {
        return this.request(`/workflows/${workflowId}/toggle`, {
            method: 'POST'
        });
    }

    // ===== Logs Endpoints =====

    async getLogs(page = 1, perPage = 50, filters = {}) {
        let endpoint = `/logs?page=${page}&per_page=${perPage}`;
        if (filters.action) endpoint += `&action=${filters.action}`;
        if (filters.resourceType) endpoint += `&resource_type=${filters.resourceType}`;
        return this.request(endpoint);
    }

    async searchLogs(query, page = 1, perPage = 50) {
        return this.request(`/logs/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
    }

    async exportLogs(filters = {}) {
        let endpoint = '/logs/export';
        const params = new URLSearchParams();
        if (filters.action) params.append('action', filters.action);
        if (filters.resourceType) params.append('resource_type', filters.resourceType);
        if (params.toString()) endpoint += `?${params.toString()}`;
        return this.request(endpoint);
    }

    async getLogStatistics() {
        return this.request('/logs/statistics');
    }
}

// Create global API client instance
const apiClient = new APIClient();

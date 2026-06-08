// Dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
    requireAuth();
    initializeDashboard();
});

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    // Load user data
    const user = getStoredUser();
    document.getElementById('userDisplay').textContent = user.username;

    // Setup event listeners
    setupEventListeners();

    // Load initial data
    loadDashboardData();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleNavigation);
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Messages
    document.getElementById('sendMessageForm').addEventListener('submit', handleSendMessage);

    // Members
    document.getElementById('addMemberForm').addEventListener('submit', handleAddMember);

    // Workflows
    document.getElementById('createWorkflowForm').addEventListener('submit', handleCreateWorkflow);

    // Logs
    document.getElementById('logSearchBtn').addEventListener('click', handleSearchLogs);
    document.getElementById('logSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSearchLogs();
    });

    // Settings
    document.getElementById('telegramConfigForm').addEventListener('submit', handleSaveTelegramConfig);
}

/**
 * Handle navigation
 */
function handleNavigation(e) {
    e.preventDefault();
    const section = e.currentTarget.getAttribute('data-section');
    switchSection(section);
}

/**
 * Switch to a different section
 */
function switchSection(section) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        }
    });

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        messages: 'Messages',
        members: 'Members',
        workflows: 'Workflows',
        logs: 'Activity Logs',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

    // Update sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');

    // Load section data
    if (section === 'messages') loadMessages();
    if (section === 'members') loadMembers();
    if (section === 'workflows') loadWorkflows();
    if (section === 'logs') loadLogs();
    if (section === 'settings') loadSettings();
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        // Get statistics
        const messagesData = await apiClient.getMessages(1, 5);
        const membersData = await apiClient.getMembers(1, 100);
        const workflowsData = await apiClient.getWorkflows(1, 100, true);
        const logsData = await apiClient.getLogs(1, 100);

        // Update stats
        document.getElementById('totalMessages').textContent = messagesData.total || 0;
        document.getElementById('totalMembers').textContent = membersData.total || 0;
        document.getElementById('activeWorkflows').textContent = workflowsData.total || 0;
        document.getElementById('recentLogs').textContent = logsData.total || 0;

        // Load recent messages
        loadRecentMessages(messagesData.messages);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Load recent messages
 */
function loadRecentMessages(messages) {
    const container = document.getElementById('recentMessagesList');
    container.innerHTML = '';

    if (!messages || messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No messages yet</p>';
        return;
    }

    messages.forEach(message => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${sanitizeHTML(message.content.substring(0, 50))}</div>
                <div class="list-item-meta">${message.message_type} • ${formatDateTime(message.sent_at)}</div>
            </div>
            <span class="badge" style="background: ${message.status === 'sent' ? '#48bb78' : '#ed8936'}; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px;">${message.status}</span>
        `;
        container.appendChild(item);
    });
}

/**
 * Load messages
 */
async function loadMessages(page = 1) {
    try {
        const data = await apiClient.getMessages(page, 20);
        renderMessages(data.messages);
        renderPagination('messagePagination', data.pages, page, () => loadMessages(arguments[0]));
    } catch (error) {
        showError('Failed to load messages');
    }
}

/**
 * Render messages
 */
function renderMessages(messages) {
    const container = document.getElementById('messagesList');
    container.innerHTML = '';

    if (!messages || messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No messages found</p>';
        return;
    }

    messages.forEach(message => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${sanitizeHTML(message.content.substring(0, 100))}</div>
                <div class="list-item-meta">${message.message_type} • ${formatDateTime(message.sent_at)} • Status: ${message.status}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-danger btn-sm" onclick="deleteMessage(${message.id})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Handle send message
 */
async function handleSendMessage(e) {
    e.preventDefault();

    const messageType = document.getElementById('messageType').value;
    const targetId = document.getElementById('targetId').value;
    const content = document.getElementById('messageContent').value;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        await apiClient.sendMessage(content, messageType, targetId);
        showSuccess('Message sent successfully!');
        e.target.reset();
        loadMessages();
    } catch (error) {
        showError(error.message || 'Failed to send message');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
    }
}

/**
 * Delete message
 */
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
        await apiClient.deleteMessage(messageId);
        showSuccess('Message deleted successfully');
        loadMessages();
    } catch (error) {
        showError('Failed to delete message');
    }
}

/**
 * Load members
 */
async function loadMembers(page = 1) {
    try {
        const data = await apiClient.getMembers(page, 20);
        renderMembers(data.members);
        renderPagination('membersPagination', data.pages, page, () => loadMembers(arguments[0]));
    } catch (error) {
        showError('Failed to load members');
    }
}

/**
 * Render members
 */
function renderMembers(members) {
    const container = document.getElementById('membersList');
    container.innerHTML = '';

    if (!members || members.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No members found</p>';
        return;
    }

    members.forEach(member => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${sanitizeHTML(member.first_name || '')} ${sanitizeHTML(member.last_name || '')}</div>
                <div class="list-item-meta">ID: ${member.telegram_user_id} • ${member.is_admin ? 'Admin' : 'Member'}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary btn-sm" onclick="editMember(${member.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="removeMember(${member.id})">Remove</button>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Handle add member
 */
async function handleAddMember(e) {
    e.preventDefault();

    const telegramUserId = document.getElementById('memberId').value;
    const firstName = document.getElementById('memberFirstName').value;
    const lastName = document.getElementById('memberLastName').value;
    const username = document.getElementById('memberUsername').value;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
        await apiClient.addMember(telegramUserId, firstName, lastName, username);
        showSuccess('Member added successfully');
        e.target.reset();
        loadMembers();
    } catch (error) {
        showError(error.message || 'Failed to add member');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add Member';
    }
}

/**
 * Remove member
 */
async function removeMember(memberId) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
        await apiClient.removeMember(memberId);
        showSuccess('Member removed successfully');
        loadMembers();
    } catch (error) {
        showError('Failed to remove member');
    }
}

/**
 * Load workflows
 */
async function loadWorkflows(page = 1) {
    try {
        const data = await apiClient.getWorkflows(page, 20);
        renderWorkflows(data.workflows);
        renderPagination('workflowsPagination', data.pages, page, () => loadWorkflows(arguments[0]));
    } catch (error) {
        showError('Failed to load workflows');
    }
}

/**
 * Render workflows
 */
function renderWorkflows(workflows) {
    const container = document.getElementById('workflowsList');
    container.innerHTML = '';

    if (!workflows || workflows.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No workflows found</p>';
        return;
    }

    workflows.forEach(workflow => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${sanitizeHTML(workflow.name)}</div>
                <div class="list-item-meta">${workflow.trigger_type} → ${workflow.action_type} • ${workflow.is_active ? 'Active' : 'Inactive'}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-secondary btn-sm" onclick="toggleWorkflow(${workflow.id})">${workflow.is_active ? 'Disable' : 'Enable'}</button>
                <button class="btn btn-danger btn-sm" onclick="deleteWorkflow(${workflow.id})">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Handle create workflow
 */
async function handleCreateWorkflow(e) {
    e.preventDefault();

    const name = document.getElementById('workflowName').value;
    const description = document.getElementById('workflowDescription').value;
    const triggerType = document.getElementById('workflowTrigger').value;
    const actionType = document.getElementById('workflowAction').value;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creating...';

    try {
        await apiClient.createWorkflow(name, triggerType, actionType, description);
        showSuccess('Workflow created successfully');
        e.target.reset();
        loadWorkflows();
    } catch (error) {
        showError(error.message || 'Failed to create workflow');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create Workflow';
    }
}

/**
 * Toggle workflow
 */
async function toggleWorkflow(workflowId) {
    try {
        await apiClient.toggleWorkflow(workflowId);
        showSuccess('Workflow updated');
        loadWorkflows();
    } catch (error) {
        showError('Failed to toggle workflow');
    }
}

/**
 * Delete workflow
 */
async function deleteWorkflow(workflowId) {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
        await apiClient.deleteWorkflow(workflowId);
        showSuccess('Workflow deleted successfully');
        loadWorkflows();
    } catch (error) {
        showError('Failed to delete workflow');
    }
}

/**
 * Load logs
 */
async function loadLogs(page = 1) {
    try {
        const data = await apiClient.getLogs(page, 50);
        renderLogs(data.logs);
        renderPagination('logsPagination', data.pages, page, () => loadLogs(arguments[0]));
    } catch (error) {
        showError('Failed to load logs');
    }
}

/**
 * Render logs
 */
function renderLogs(logs) {
    const container = document.getElementById('logsList');
    container.innerHTML = '';

    if (!logs || logs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #718096;">No activity logs found</p>';
        return;
    }

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${sanitizeHTML(log.action)}</div>
                <div class="list-item-meta">${log.resource_type || 'N/A'} • ${formatDateTime(log.created_at)}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Handle search logs
 */
async function handleSearchLogs() {
    const query = document.getElementById('logSearchInput').value;

    if (!query.trim()) {
        loadLogs();
        return;
    }

    try {
        const data = await apiClient.searchLogs(query, 1, 50);
        renderLogs(data.logs);
    } catch (error) {
        showError('Failed to search logs');
    }
}

/**
 * Load settings
 */
async function loadSettings() {
    try {
        const user = await apiClient.getProfile();
        document.getElementById('botToken').value = user.user.telegram_bot_token || '';
        document.getElementById('channelId').value = user.user.telegram_channel_id || '';
        document.getElementById('groupId').value = user.user.telegram_group_id || '';
    } catch (error) {
        showError('Failed to load settings');
    }
}

/**
 * Handle save telegram config
 */
async function handleSaveTelegramConfig(e) {
    e.preventDefault();

    const botToken = document.getElementById('botToken').value;
    const channelId = document.getElementById('channelId').value;
    const groupId = document.getElementById('groupId').value;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        await apiClient.updateTelegramConfig({
            telegram_bot_token: botToken,
            telegram_channel_id: channelId,
            telegram_group_id: groupId
        });
        showSuccess('Configuration saved successfully');
        const user = await apiClient.getProfile();
        storeUser(user.user);
    } catch (error) {
        showError(error.message || 'Failed to save configuration');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Configuration';
    }
}

/**
 * Render pagination
 */
function renderPagination(containerId, pages, currentPage, callback) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (pages <= 1) return;

    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.addEventListener('click', () => callback(currentPage - 1));
        container.appendChild(prevBtn);
    }

    // Page buttons
    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.addEventListener('click', () => callback(i));
        container.appendChild(btn);
    }

    // Next button
    if (currentPage < pages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => callback(currentPage + 1));
        container.appendChild(nextBtn);
    }
}

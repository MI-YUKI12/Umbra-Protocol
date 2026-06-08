# Umbra Protocol 🔐

A powerful **Telegram Management System** built with Flask and modern web technologies. Manage your Telegram bots, channels, and groups with an intuitive web interface.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🤖 Telegram Integration
- **Bot Management** - Control your Telegram bots from a web interface
- **Message Broadcasting** - Send messages to channels, groups, and individual users
- **Message Scheduling** - Schedule messages for later delivery
- **Member Management** - Add, remove, and manage group/channel members
- **Permission Control** - Set granular permissions for members

### 📊 Dashboard
- **Real-time Statistics** - Track message counts, member activity, and workflows
- **Message History** - View all sent and scheduled messages
- **Activity Logs** - Comprehensive audit trail of all actions
- **Quick Actions** - Fast access to common operations

### ⚙️ Workflows
- **Automated Workflows** - Create triggers and actions for automation
- **Multiple Triggers** - Message received, command, schedule-based
- **Flexible Actions** - Send message, add member, remove member, and more
- **Enable/Disable** - Toggle workflows on and off

### 🔐 Security
- **User Authentication** - Secure login with JWT tokens
- **Session Management** - Track and manage user sessions
- **Activity Logging** - Monitor all user actions
- **Input Validation** - Protect against common vulnerabilities
- **CORS Protection** - Configurable cross-origin access

### 📱 User Interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with dark theme support
- **Real-time Updates** - Live data refresh without page reload
- **Search & Filter** - Easily find messages, members, and logs

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- PostgreSQL 12 or higher
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/MI-YUKI12/Umbra-Protocol.git
cd Umbra-Protocol
```

2. **Run the setup script**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Configure environment**
```bash
# Edit .env with your settings
nano .env
```

4. **Start the backend**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

5. **Open the frontend**
- Open `frontend/index.html` in your browser, or
- Run a local server: `python -m http.server 8000` in the frontend directory

## 📚 Documentation

- **[Setup Guide](SETUP.md)** - Detailed installation and configuration instructions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## 🏗️ Project Structure

```
Umbra-Protocol/
├── backend/                      # Flask API Server
│   ├── app.py                   # Main application entry point
│   ├── config.py                # Configuration management
│   ├── models.py                # Database models
│   ├── services.py              # Business logic services
│   ├── routes/                  # API endpoints
│   │   ├── auth.py             # Authentication routes
│   │   ├── messages.py         # Message management
│   │   ├── members.py          # Member management
│   │   ├── workflows.py        # Workflow management
│   │   └── logs.py             # Activity logging
│   └── requirements.txt          # Python dependencies
│
├── frontend/                     # Web Interface
│   ├── index.html               # Login page
│   ├── register.html            # Registration page
│   ├── dashboard.html           # Main dashboard
│   ├── css/                     # Stylesheets
│   │   ├── styles.css          # Global styles
│   │   └── dashboard.css       # Dashboard styles
│   └── js/                      # JavaScript files
│       ├── api.js              # API client
│       ├── auth.js             # Authentication utilities
│       └── dashboard.js        # Dashboard functionality
│
├── database/                     # Database Configuration
│   └── schema.sql               # Database schema
│
├── docs/                        # Documentation
├── SETUP.md                     # Setup instructions
├── CONTRIBUTING.md              # Contribution guidelines
├── README.md                    # This file
├── .env.example                 # Environment variables template
└── setup.sh                     # Automated setup script
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register              # Create new account
POST   /api/auth/login                 # Login user
POST   /api/auth/logout                # Logout user
GET    /api/auth/profile               # Get user profile
PUT    /api/auth/update-telegram-config # Update Telegram settings
```

### Messages
```
GET    /api/messages                   # Get message history
POST   /api/messages/send              # Send message
POST   /api/messages/schedule          # Schedule message
GET    /api/messages/statistics        # Get statistics
DELETE /api/messages/:id               # Delete message
```

### Members
```
GET    /api/members                    # Get members list
POST   /api/members/add                # Add member
DELETE /api/members/:id                # Remove member
PUT    /api/members/:id/permissions    # Update permissions
POST   /api/members/:id/ban            # Ban member
POST   /api/members/:id/unban          # Unban member
```

### Workflows
```
GET    /api/workflows                  # Get workflows
POST   /api/workflows                  # Create workflow
PUT    /api/workflows/:id              # Update workflow
DELETE /api/workflows/:id              # Delete workflow
POST   /api/workflows/:id/toggle       # Toggle active status
```

### Logs
```
GET    /api/logs                       # Get activity logs
GET    /api/logs/search                # Search logs
GET    /api/logs/export                # Export logs
GET    /api/logs/statistics            # Get statistics
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and authentication
- **messages** - Sent and scheduled messages
- **members** - Telegram members/users
- **permissions** - Member-level permissions
- **workflows** - Automated workflow definitions
- **activity_logs** - User action audit trail
- **sessions** - Active user sessions

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/umbra_protocol

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=your_channel_id
TELEGRAM_GROUP_ID=your_group_id

# Flask
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_EXPIRATION=86400

# Scheduler
SCHEDULER_ENABLED=True
SCHEDULER_TIMEZONE=UTC
```

## 🛠️ Development

### Setting up development environment

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Create database
psql -U postgres -f database/schema.sql

# Run tests
pytest

# Start development server
python backend/app.py
```

### Code Style

- Python: PEP 8
- JavaScript: ES6+
- HTML: HTML5
- CSS: BEM naming convention

## 📦 Dependencies

### Backend
- Flask 2.3.3
- SQLAlchemy 2.0.21
- Flask-SQLAlchemy 3.0.5
- Flask-JWT-Extended 4.5.2
- psycopg2 2.9.7
- APScheduler 3.10.4
- python-telegram-bot 20.3

### Frontend
- Vanilla JavaScript (ES6+)
- CSS3
- HTML5

## 🚢 Deployment

### Production Setup

1. Set `FLASK_ENV=production` in `.env`
2. Change `SECRET_KEY` to a secure random value
3. Use a production database
4. Enable HTTPS
5. Set up proper logging
6. Use a production WSGI server (Gunicorn)

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 Check the [documentation](SETUP.md)
- 🐛 Report bugs on [GitHub Issues](https://github.com/MI-YUKI12/Umbra-Protocol/issues)
- 💬 Discuss features on [GitHub Discussions](https://github.com/MI-YUKI12/Umbra-Protocol/discussions)

## 🗺️ Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Message media support (images, videos)
- [ ] Advanced scheduling (recurring messages)
- [ ] User roles and teams
- [ ] API rate limiting
- [ ] Message encryption
- [ ] Admin dashboard
- [ ] Analytics & insights
- [ ] Mobile application
- [ ] Message templates
- [ ] Bulk operations
- [ ] Webhook integrations

## 🙏 Acknowledgments

- [Flask](https://flask.palletsprojects.com/) - Web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM
- [Telegram Bot API](https://core.telegram.org/bots/api) - Bot integration
- [PostgreSQL](https://www.postgresql.org/) - Database

## 📞 Contact

- 👤 Author: **MI-YUKI12**
- 📧 Email: miyu99379@gmail.com
- 🐙 GitHub: [@MI-YUKI12](https://github.com/MI-YUKI12)

---

**Made with ❤️ by MI-YUKI12**

*Last updated: June 8, 2026*

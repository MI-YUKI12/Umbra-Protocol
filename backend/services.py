import os
import logging
from datetime import datetime, timedelta
import requests
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuthService:
    """Authentication service"""
    
    @staticmethod
    def hash_password(password):
        """Hash a password"""
        return generate_password_hash(password)
    
    @staticmethod
    def verify_password(password_hash, password):
        """Verify a password"""
        return check_password_hash(password_hash, password)
    
    @staticmethod
    def generate_token(user_id, username):
        """Generate JWT token"""
        payload = {
            'user_id': user_id,
            'username': username,
            'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token
    
    @staticmethod
    def verify_token(token):
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

class TelegramService:
    """Telegram Bot API service"""
    
    def __init__(self, bot_token):
        self.bot_token = bot_token
        self.api_url = f"https://api.telegram.org/bot{bot_token}"
    
    def send_message(self, chat_id, text, parse_mode='HTML'):
        """Send a message to a chat"""
        try:
            url = f"{self.api_url}/sendMessage"
            payload = {
                'chat_id': chat_id,
                'text': text,
                'parse_mode': parse_mode
            }
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('ok'):
                return {
                    'success': True,
                    'message_id': data['result']['message_id']
                }
            else:
                return {
                    'success': False,
                    'error': data.get('description', 'Unknown error')
                }
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_chat_members(self, chat_id):
        """Get members of a chat"""
        try:
            url = f"{self.api_url}/getChatMember"
            # This is a simplified version - full implementation would paginate
            response = requests.get(url, params={'chat_id': chat_id}, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting chat members: {str(e)}")
            return None
    
    def restrict_chat_member(self, chat_id, user_id, permissions):
        """Restrict a chat member"""
        try:
            url = f"{self.api_url}/restrictChatMember"
            payload = {
                'chat_id': chat_id,
                'user_id': user_id,
                'permissions': permissions
            }
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get('ok', False)
        except Exception as e:
            logger.error(f"Error restricting member: {str(e)}")
            return False
    
    def ban_chat_member(self, chat_id, user_id):
        """Ban a user from a chat"""
        try:
            url = f"{self.api_url}/banChatMember"
            payload = {
                'chat_id': chat_id,
                'user_id': user_id
            }
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get('ok', False)
        except Exception as e:
            logger.error(f"Error banning member: {str(e)}")
            return False
    
    def unban_chat_member(self, chat_id, user_id):
        """Unban a user from a chat"""
        try:
            url = f"{self.api_url}/unbanChatMember"
            payload = {
                'chat_id': chat_id,
                'user_id': user_id
            }
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get('ok', False)
        except Exception as e:
            logger.error(f"Error unbanning member: {str(e)}")
            return False

class SchedulerService:
    """Message scheduler service"""
    
    @staticmethod
    def is_message_ready(scheduled_for):
        """Check if a scheduled message is ready to send"""
        if not scheduled_for:
            return False
        return datetime.utcnow() >= scheduled_for

def token_required(f):
    """Decorator for routes that require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        # Verify token
        payload = AuthService.verify_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Store user info in request context
        request.user_id = payload.get('user_id')
        request.username = payload.get('username')
        
        return f(*args, **kwargs)
    
    return decorated_function

class AnalyticsService:
    """Analytics and statistics service"""
    
    @staticmethod
    def get_message_statistics(user_id, days=30):
        """Get message statistics for a user"""
        from models import Message
        from datetime import datetime, timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        messages = Message.query.filter(
            Message.user_id == user_id,
            Message.created_at >= start_date
        ).all()
        
        # Group by message type
        stats = {
            'total_messages': len(messages),
            'by_type': {},
            'by_status': {},
            'by_date': {}
        }
        
        for message in messages:
            # By type
            msg_type = message.message_type or 'unknown'
            stats['by_type'][msg_type] = stats['by_type'].get(msg_type, 0) + 1
            
            # By status
            status = message.status or 'unknown'
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
            
            # By date
            date_key = message.created_at.date().isoformat()
            stats['by_date'][date_key] = stats['by_date'].get(date_key, 0) + 1
        
        return stats

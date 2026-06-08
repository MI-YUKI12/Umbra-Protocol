from flask import Blueprint, request, jsonify
from models import db, User, Session
from services import AuthService
from datetime import datetime, timedelta
import logging

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 409
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 409
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=AuthService.hash_password(data['password'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Missing username or password'}), 400
        
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not AuthService.verify_password(user.password_hash, data['password']):
            return jsonify({'message': 'Invalid username or password'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'User account is inactive'}), 403
        
        # Generate token
        token = AuthService.generate_token(user.id, user.username)
        
        # Create session
        session = Session(
            user_id=user.id,
            session_token=token,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Login error: {str(e)}")
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        # Remove session
        session = Session.query.filter_by(session_token=token).first()
        if session:
            db.session.delete(session)
            db.session.commit()
        
        return jsonify({'message': 'Logout successful'}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'message': 'Logout failed', 'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    try:
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        payload = AuthService.verify_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({'message': 'Failed to get profile', 'error': str(e)}), 500

@auth_bp.route('/update-telegram-config', methods=['PUT'])
def update_telegram_config():
    """Update Telegram configuration for user"""
    try:
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        payload = AuthService.verify_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'telegram_bot_token' in data:
            user.telegram_bot_token = data['telegram_bot_token']
        if 'telegram_channel_id' in data:
            user.telegram_channel_id = data['telegram_channel_id']
        if 'telegram_group_id' in data:
            user.telegram_group_id = data['telegram_group_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Telegram config updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Update telegram config error: {str(e)}")
        return jsonify({'message': 'Failed to update config', 'error': str(e)}), 500

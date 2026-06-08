import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from config import config
from routes.auth import auth_bp
from routes.messages import messages_bp
from routes.members import members_bp
from routes.workflows import workflows_bp
from routes.logs import logs_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_name=None):
    """Application factory"""
    
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config.get(config_name, config['development']))
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(members_bp)
    app.register_blueprint(workflows_bp)
    app.register_blueprint(logs_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({'message': 'Internal server error'}), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'message': 'Bad request'}), 400
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'message': 'Forbidden'}), 403
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'healthy', 'service': 'Umbra Protocol'}), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'message': 'Umbra Protocol - Telegram Management API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'messages': '/api/messages',
                'members': '/api/members',
                'workflows': '/api/workflows',
                'logs': '/api/logs'
            }
        }), 200
    
    # Create database tables
    with app.app_context():
        db.create_all()
        logger.info("Database initialized")
    
    logger.info(f"Application created with config: {config_name}")
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

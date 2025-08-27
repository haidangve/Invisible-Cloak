import os
import logging

class Config:
    """Application configuration settings"""
    
    # Camera settings
    CAMERA_INDEX = 0
    COLOR_TOLERANCE = 100
    
    # Video settings
    FRAME_WIDTH = 640
    FRAME_HEIGHT = 480
    FPS = 30
    
    # Server settings
    HOST = '0.0.0.0'
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('FLASK_ENV') == 'development'
    
    # Application settings
    BACKGROUND_CAPTURE_DELAY = 3  # seconds
    DEBUG_LOG_INTERVAL = 30  # frames
    
    # Error handling settings
    MAX_RETRY_ATTEMPTS = 3
    CAMERA_TIMEOUT = 5  # seconds
    FRAME_READ_TIMEOUT = 2  # seconds
    
    # User feedback settings
    SHOW_SUCCESS_NOTIFICATIONS = True
    SHOW_ERROR_NOTIFICATIONS = True
    NOTIFICATION_DURATION = 3000  # milliseconds
    
    # File paths
    TEMPLATE_FOLDER = 'templates'
    STATIC_FOLDER = 'static'
    
    # Logging configuration
    LOG_LEVEL = logging.INFO
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = 'invisibility_cloak.log'

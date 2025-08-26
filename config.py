import os

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
    
    # File paths
    TEMPLATE_FOLDER = 'templates'
    STATIC_FOLDER = 'static'

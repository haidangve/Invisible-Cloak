#import libraries
from flask import Flask, render_template, Response, jsonify
from video_streamer import VideoStreamer
from api_routes import APIRoutes
from config import Config
import atexit
import logging

# Set up logging
logging.basicConfig(
    level=Config.LOG_LEVEL, #set logging level
    format=Config.LOG_FORMAT,
    handlers=[
        logging.FileHandler(Config.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask application
app = Flask(__name__)

# Initialize video streamer
video_streamer = VideoStreamer()
api_routes = APIRoutes(video_streamer)

@app.route('/')
def index():
    """Main page route - serves the HTML interface"""
    return render_template('index.html')

@app.route('/test')
def test():
    """Test endpoint to verify server is running"""
    return api_routes.test_connection()

@app.route('/video_feed')
def video_feed():
    """Video streaming route - continuously streams video to the browser"""
    try:
        return Response(
            video_streamer.generate_frames(),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    except Exception as e:
        logger.error(f"Error in video feed: {e}")
        return "Video stream error", 500

@app.route('/capture_background', methods=['POST'])
def capture_background_route():
    """API endpoint to capture the background"""
    return api_routes.capture_background()

@app.route('/set_color', methods=['POST'])
def set_color_route():
    """API endpoint to set the target color"""
    return api_routes.set_color()

@app.route('/reset', methods=['POST'])
def reset_route():
    """API endpoint to reset the application"""
    return api_routes.reset()

@app.route('/status')
def status_route():
    """Get application status"""
    return api_routes.get_status()

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

def cleanup():
    """Cleanup function to release resources on exit"""
    logger.info("Cleaning up application resources")
    video_streamer.cleanup()

# Register cleanup function
atexit.register(cleanup)

if __name__ == '__main__':
    logger.info("Starting Invisibility Cloak application...")
    
    # Initialize camera
    if video_streamer.initialize():
        logger.info("Camera initialized successfully")
    else:
        logger.warning("Failed to initialize camera - app will still run with error display")
    
    # Start the Flask development server
    logger.info(f"Starting server on {Config.HOST}:{Config.PORT}")
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )

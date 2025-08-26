#import libraries
from flask import Flask, render_template, Response
from video_streamer import VideoStreamer
from api_routes import APIRoutes
from config import Config
import atexit

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
    return Response(
        video_streamer.generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

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

def cleanup():
    """Cleanup function to release resources on exit"""
    video_streamer.cleanup()

# Register cleanup function
atexit.register(cleanup)

if __name__ == '__main__':
    # Initialize camera
    if video_streamer.initialize():
        print("Camera initialized successfully")
    else:
        print("Failed to initialize camera - app will still run with error display")
    
    # Start the Flask development server
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )

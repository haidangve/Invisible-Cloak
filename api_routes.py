from flask import request, jsonify
import time
from video_streamer import VideoStreamer

class APIRoutes:
    """Handles all API routes for the invisibility cloak application"""
    
    def __init__(self, video_streamer):
        self.video_streamer = video_streamer
    
    def test_connection(self):
        """Test endpoint to verify server is running"""
        print("Test endpoint called")
        return jsonify({'status': 'Server is running!'})
    
    def capture_background(self):
        """API endpoint to capture the background"""
        print("Background capture endpoint called")
        
        # Set flag to prevent effect application during capture
        self.video_streamer.set_capturing_background(True)
        
        # Wait for user to move out of frame
        time.sleep(3)
        
        # Capture background
        success = self.video_streamer.capture_background()
        
        # Reset flag
        self.video_streamer.set_capturing_background(False)
        
        print(f"Background capture result: {success}")
        return jsonify({'success': success})
    
    def set_color(self):
        """API endpoint to set the target color"""
        print("Set color endpoint called")
        print(f"Request data: {request.get_json()}")
        
        data = request.get_json()
        
        if data and 'color' in data:
            success = self.video_streamer.set_color(data['color'])
            
            if success:
                return jsonify({
                    'success': True,
                    'color': self.video_streamer.processor.target_color.tolist()
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Failed to set color'
                })
        
        return jsonify({
            'success': False,
            'error': 'No color provided'
        })
    
    def reset(self):
        """API endpoint to reset the application"""
        self.video_streamer.reset()
        return jsonify({'success': True})

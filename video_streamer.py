import cv2
import time
from camera_manager import CameraManager
from invisibility_processor import InvisibilityProcessor

class VideoStreamer:
    """Handles video streaming and frame processing"""
    
    def __init__(self):
        self.camera_manager = CameraManager()
        self.processor = InvisibilityProcessor()
        self.is_capturing_background = False
        self.effect_applied = False
        
        # FPS tracking
        self.fps_count = 0
        self.fps_time = time.time()
        self.current_fps = 0
        
    def initialize(self):
        """Initialize the video streamer"""
        return self.camera_manager.initialize()
    
    def generate_frames(self):
        """Generator function that yields video frames for streaming"""
        while True:
            # Check if camera is available
            if not self.camera_manager.is_initialized:
                error_frame = self.camera_manager.create_error_frame()
                yield self._encode_frame(error_frame)
                time.sleep(0.1)
                continue
            
            # Read frame from camera
            frame, success = self.camera_manager.read_frame()
            
            if not success:
                time.sleep(0.1)
                continue
            
            # Apply invisibility effect if ready and not capturing background
            if (self.processor.is_ready() and not self.is_capturing_background):
                frame = self.processor.apply_effect(frame)
                
                # Log effect activation once
                if not self.effect_applied:
                    print("Invisibility effect is now active!")
                    self.effect_applied = True
            
            # Update FPS
            self.fps_count += 1
            if time.time() - self.fps_time >= 1.0:
                self.current_fps = self.fps_count
                self.fps_count = 0
                self.fps_time = time.time()
            
            # Encode and yield frame
            yield self._encode_frame(frame)
    
    def get_fps(self):
        """Get current FPS"""
        return self.current_fps
    
    def _encode_frame(self, frame):
        """Encode frame as JPEG for web streaming"""
        ret, buffer = cv2.imencode('.jpg', frame)
        if ret:
            frame_bytes = buffer.tobytes()
            return (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        return None
    
    def capture_background(self):
        """Capture background frame"""
        frame, success = self.camera_manager.read_frame()
        if success:
            return self.processor.capture_background(frame)
        return False
    
    def set_color(self, rgb_color):
        """Set target color for invisibility effect"""
        return self.processor.set_target_color(rgb_color)
    
    def reset(self):
        """Reset the streamer state"""
        self.processor.reset()
        self.effect_applied = False
    
    def set_capturing_background(self, capturing):
        """Set background capture flag"""
        self.is_capturing_background = capturing
    
    def cleanup(self):
        """Clean up resources"""
        self.camera_manager.release()

import cv2
import numpy as np
import time

class CameraManager:
    """Manages camera operations including initialization, frame capture, and processing"""
    
    def __init__(self):
        self.camera = None
        self.is_initialized = False
        
    def initialize(self):
        """Initialize the camera"""
        try:
            self.camera = cv2.VideoCapture(0)
            
            if self.camera.isOpened():
                print("Camera initialized successfully")
                self.is_initialized = True
                return True
            else:
                print("Failed to open camera")
                return False
                
        except Exception as e:
            print(f"Camera initialization error: {e}")
            self.camera = None
            return False
    
    def read_frame(self):
        """Read a frame from the camera with horizontal flip for front camera"""
        if not self.is_initialized or self.camera is None:
            return None, False
            
        ret, frame = self.camera.read()
        
        if not ret:
            return None, False
            
        # Flip frame horizontally for front camera
        frame = cv2.flip(frame, 1)
        return frame, True
    
    def create_error_frame(self, message="Camera Not Available"):
        """Create an error frame when camera is not available"""
        error_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(error_frame, message, (150, 200), font, 1, (255, 255, 255), 2)
        cv2.putText(error_frame, 'Check camera connection and refresh', (100, 250), font, 0.6, (200, 200, 200), 2)
        return error_frame
    
    def release(self):
        """Release camera resources"""
        if self.camera is not None:
            self.camera.release()
            self.camera = None
            self.is_initialized = False

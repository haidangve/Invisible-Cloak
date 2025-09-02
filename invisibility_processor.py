import cv2
import numpy as np

class InvisibilityProcessor:
    """Handles the invisibility cloak effect processing"""
    
    def __init__(self, color_tolerance=100):
        self.background_frame = None
        self.target_color = None
        self.color_tolerance = color_tolerance
        self.debug_count = 0
        
    def capture_background(self, frame):
        """Capture and store the background frame"""
        if frame is not None:
            self.background_frame = frame.copy()
            print("Background captured successfully")
            return True
        print("Failed to capture background")
        return False
    
    def set_target_color(self, rgb_color):
        """Set the target color for the invisibility effect"""
        try:
            # Convert RGB to HSV
            color_rgb = np.uint8([[rgb_color]])
            color_bgr = cv2.cvtColor(color_rgb, cv2.COLOR_RGB2BGR)
            color_hsv = cv2.cvtColor(color_bgr, cv2.COLOR_BGR2HSV)
            
            self.target_color = color_hsv[0][0]
            print(f"Color set - RGB: {rgb_color}, HSV: {self.target_color.tolist()}")
            return True
        except Exception as e:
            print(f"Error setting color: {e}")
            return False
    
    def apply_effect(self, frame):
        """Apply the invisibility cloak effect to the frame"""
        if self.background_frame is None or self.target_color is None:
            return frame
        
        # Convert frame to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Debug logging
        self._log_debug_info(hsv)
        
        # Create color mask
        mask = self._create_color_mask(hsv)
        
        # Apply invisibility effect
        result = self._apply_mask(frame, mask)
        
        return result
    
    def _create_color_mask(self, hsv):
        """Create a mask for the target color"""
        target_hue = int(self.target_color[0])
        target_sat = int(self.target_color[1])
        target_val = int(self.target_color[2])
        
        # Handle red color wrap-around
        if target_hue <= 10 or target_hue >= 170:
            return self._create_red_mask(hsv, target_sat, target_val)
        else:
            return self._create_standard_mask(hsv, target_hue, target_sat, target_val)
    
    def _create_red_mask(self, hsv, target_sat, target_val):
        """Create mask for red colors (handles hue wrap-around)"""
        # Lower red range
        lower_bound1 = np.array([
            0,
            max(10, target_sat - self.color_tolerance),
            max(10, target_val - self.color_tolerance)
        ])
        upper_bound1 = np.array([
            10,
            min(255, target_sat + self.color_tolerance),
            min(255, target_val + self.color_tolerance)
        ])
        
        # Higher red range
        lower_bound2 = np.array([
            170,
            max(10, target_sat - self.color_tolerance),
            max(10, target_val - self.color_tolerance)
        ])
        upper_bound2 = np.array([
            179,
            min(255, target_sat + self.color_tolerance),
            min(255, target_val + self.color_tolerance)
        ])
        
        mask1 = cv2.inRange(hsv, lower_bound1, upper_bound1)
        mask2 = cv2.inRange(hsv, lower_bound2, upper_bound2)
        
        return cv2.bitwise_or(mask1, mask2)
    
    def _create_standard_mask(self, hsv, target_hue, target_sat, target_val):
        """Create mask for non-red colors"""
        lower_bound = np.array([
            max(0, target_hue - self.color_tolerance),
            max(10, target_sat - self.color_tolerance),
            max(10, target_val - self.color_tolerance)
        ])
        
        upper_bound = np.array([
            min(179, target_hue + self.color_tolerance),
            min(255, target_sat + self.color_tolerance),
            min(255, target_val + self.color_tolerance)
        ])
        
        return cv2.inRange(hsv, lower_bound, upper_bound)
    
    def _apply_mask(self, frame, mask):
        """Apply the mask to create the invisibility effect"""
        mask_inv = cv2.bitwise_not(mask)
        
        # Extract background and foreground
        background = cv2.bitwise_and(self.background_frame, self.background_frame, mask=mask)
        foreground = cv2.bitwise_and(frame, frame, mask=mask_inv)
        
        return cv2.add(background, foreground)
    
    def _log_debug_info(self, hsv):
        """Log debug information periodically"""
        self.debug_count += 1
        
        # Log debug information periodically
        if self.debug_count % 200 == 0:
            center_y, center_x = hsv.shape[0]//2, hsv.shape[1]//2
            center_hsv = hsv[center_y, center_x]
            print(f"Frame center HSV: {center_hsv.tolist()}")
            
            #Add HSV tolerance logging
            if self.target_color is not None:
                target_hue = int(self.target_color[0])
                target_sat = int(self.target_color[1])
                target_val = int(self.target_color[2])

                print(f"Target Color HSV: [(target_hue, target_sat, target_val)]")
                print(f"Tolerance Range: ±{self.color_tolerance}")

                #Show actual bounds being used
                if target_hue <= 10 or target_hue >= 170:
                    print(f"Red Range 1: [{0}, {max(10, target_sat - self.color_tolerance)}, {max(10, target_val - self.color_tolerance)}] to [{10}, {min(255, target_sat + self.color_tolerance)}, {min(255, target_val + self.color_tolerance)}]")
                    print(f"Red Range 2: [{170}, {max(10, target_sat - self.color_tolerance)}, {max(10, target_val - self.color_tolerance)}] to [{179}, {min(255, target_sat + self.color_tolerance)}, {min(255, target_val + self.color_tolerance)}]")
                else:
                    print(f"Standard Range: [{max(0, target_hue - self.color_tolerance)}, {max(10, target_sat - self.color_tolerance)}, {max(10, target_val - self.color_tolerance)}] to [{min(179, target_hue + self.color_tolerance)}, {min(255, target_sat + self.color_tolerance)}, {min(255, target_val + self.color_tolerance)}]")
                
            mask_pixels = np.sum(self._create_color_mask(hsv) > 0)
            total_pixels = hsv.shape[0] * hsv.shape[1]
            print(f"Mask created - {mask_pixels} pixels detected out of {total_pixels} total ({mask_pixels/total_pixels*100:.1f}%)")
    
    def reset(self):
        """Reset the processor state"""
        self.background_frame = None
        self.target_color = None
        self.debug_count = 0
    
    def is_ready(self):
        """Check if the processor is ready to apply effects"""
        return self.background_frame is not None and self.target_color is not None

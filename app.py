#import libraries
from flask import Flask, render_template, Response, request, jsonify
import cv2
import numpy as np
import threading
import time

#initialize flask application
app = Flask(__name__)

#Set global variables for video processing
#This will store our camera, background and color settings
camera = None
background_frame = None
target_color = None
color_tolerance = 100 #How much color variation we allow (very aggressive for real-world lighting)
is_capturing_background = False #flag to track background capture

def init_camera():
    """
    Initialize the camera and set up the video capture
    Returns: True if camera is successfully opened, False otherwise
    """
    global camera
    try:
        # Simple camera initialization
        camera = cv2.VideoCapture(0)
        
        if camera.isOpened():
            print("✅ Camera initialized successfully")
            return True
        else:
            print("❌ Failed to open camera")
            return False
        
    except Exception as e:
        print(f"❌ Camera initialization error: {e}")
        camera = None
        return False

def capture_background():
    """
    Capture the background frame when no cloak is presented
    This is used to create the invisible effect
    Returns: True if background capture is successful, False otherwise
    """

    global background_frame, camera
    #Check if camera is available
    if camera is None:
        return False
    #Read a frame from the camera
    ret, frame = camera.read()

    #Check if frame was read successfully
    if ret:
        # Flip the frame horizontally to match the video stream orientation
        frame = cv2.flip(frame, 1)
        #Store a copy of the background frame
        background_frame = frame.copy()
        print("Background captured successfully")
        return True
    print("Failed to read frame for background capture")
    return False

def apply_invisibility_cloak(frame):
    """
    Apply the invisibility cloak effect to the frame
    Replaces the target color area with the captured background

    Args:  frame: current video frame to process
    Returns: Processed frame with cloak effect applied
    """

    global background_frame, target_color, color_tolerance
    
    #check if we have both background and target color
    if background_frame is None or target_color is None:
        if background_frame is None:
            print("⚠️ No background captured yet")
        if target_color is None:
            print("⚠️ No target color set yet")
        return frame #return original frame if we don't have the required data

    #convert frame from rgb to hsv color space
    #opencv uses BGR by default but HSV is better for color detection

    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    #Debug: print HSV values at center of frame (only occasionally to avoid spam)
    if not hasattr(apply_invisibility_cloak, 'debug_count'):
        apply_invisibility_cloak.debug_count = 0
    apply_invisibility_cloak.debug_count += 1
    
    if apply_invisibility_cloak.debug_count % 30 == 0:  # Print every 30 frames
        center_y, center_x = hsv.shape[0]//2, hsv.shape[1]//2
        center_hsv = hsv[center_y, center_x]
        print(f"🎭 Frame center HSV: {center_hsv.tolist()}")

    #Create color range for the target color detection
    #For red color, we need to handle the hue wrap-around (red is at both 0 and 179)
    #Also adjust saturation and value bounds for real-world lighting conditions
    
    target_hue = int(target_color[0])
    target_sat = int(target_color[1])
    target_val = int(target_color[2])
    
    #For red color (hue 0), we need to check both ends of the hue range
    if target_hue <= 10 or target_hue >= 170:  # Red color range
        #Lower bound: check both low red (0-10) and high red (170-179)
        #Use extremely permissive bounds for real-world lighting variations
        lower_bound = np.array([
            0,  # Low red
            max(10, target_sat - color_tolerance),  # Very low minimum saturation for shadows
            max(10, target_val - color_tolerance)   # Very low minimum value for shadows
        ])
        
        upper_bound = np.array([
            10,  # High red
            min(255, target_sat + color_tolerance),
            min(255, target_val + color_tolerance)
        ])
        
        #Create two masks and combine them
        mask1 = cv2.inRange(hsv, lower_bound, upper_bound)
        
        #Second range for high red values
        lower_bound2 = np.array([
            170,  # High red
            max(10, target_sat - color_tolerance),  # Very low minimum saturation for shadows
            max(10, target_val - color_tolerance)   # Very low minimum value for shadows
        ])
        
        upper_bound2 = np.array([
            179,  # High red
            min(255, target_sat + color_tolerance),
            min(255, target_val + color_tolerance)
        ])
        
        mask2 = cv2.inRange(hsv, lower_bound2, upper_bound2)
        mask = cv2.bitwise_or(mask1, mask2)
        
    else:
        #For other colors, use normal bounds
        lower_bound = np.array([
            max(0, target_hue - color_tolerance),
            max(10, target_sat - color_tolerance),  # Very low minimum saturation for shadows
            max(10, target_val - color_tolerance)   # Very low minimum value for shadows
        ])
        
        upper_bound = np.array([
            min(179, target_hue + color_tolerance),
            min(255, target_sat + color_tolerance),
            min(255, target_val + color_tolerance)
        ])
        
        mask = cv2.inRange(hsv, lower_bound, upper_bound)
    
    #Debug: print color bounds (only occasionally)
    if apply_invisibility_cloak.debug_count % 30 == 0:
        if target_hue <= 10 or target_hue >= 170:
            print(f"🎨 Red color bounds - Range 1: [{lower_bound}, {upper_bound}], Range 2: [{lower_bound2}, {upper_bound2}]")
        else:
            print(f"🎨 Color bounds - Lower: {lower_bound}, Upper: {upper_bound}")

    #Mask for target color (cloak area)
    #This mask will be white where the target color is present
    mask = cv2.inRange(hsv, lower_bound, upper_bound)
    
    #Debug: print mask statistics (only occasionally)
    mask_pixels = np.sum(mask > 0)
    total_pixels = mask.shape[0] * mask.shape[1]
    if apply_invisibility_cloak.debug_count % 30 == 0:
        print(f"🎭 Mask created - {mask_pixels} pixels detected out of {total_pixels} total ({mask_pixels/total_pixels*100:.1f}%)")

    #Invert the mask to get the cloak area
    #mask_inv is white where the target color is NOT present
    mask_inv = cv2.bitwise_not(mask)

    #Extract background and foreground with mask
    #background: only the background image where cloak should be
    #bitwise_and: keep only the parts of the background that are not the target color
    #arg for bitwise_and: first frame is the background frame
    #second frame is the current frame
    #mask is the mask we created earlier
    background = cv2.bitwise_and(background_frame, background_frame, mask=mask)

    #foreground: Only the current frame where cloak is NOT present
    foreground = cv2.bitwise_and(frame, frame, mask=mask_inv)

    result = cv2.add(background, foreground)

    return result

def generate_frames():
    """
    Generator function that continuously yields video for streaming
    This function runs in a loop, capturing frames and applying invisibility cloak effect
    """

    global camera, target_color, is_capturing_background

    while True:
        #Check if camera is available
        if camera is None:
            # Create an error frame when camera is not available
            error_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            
            # Add simple error text
            font = cv2.FONT_HERSHEY_SIMPLEX
            cv2.putText(error_frame, 'Camera Not Available', (150, 200), font, 1, (255, 255, 255), 2)
            cv2.putText(error_frame, 'Check camera connection and refresh', (100, 250), font, 0.6, (200, 200, 200), 2)
            
            ret, buffer = cv2.imencode('.jpg', error_frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b' --frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.1)
            continue

        #Read a frame from the camera
        #ret: return value (True/False)
        #frame: the actual frame captured
        ret, frame = camera.read()

        #Check if frame was read successfully
        if not ret:
            # Just continue to next iteration instead of showing error
            time.sleep(0.1)
            continue
        
        # Flip the frame horizontally to correct front camera mirroring
        frame = cv2.flip(frame, 1)
        
        # Apply invisibility cloak effect if conditions are met:
        # 1. Background has been captured
        # 2. Target color has been set
        # 3. We're not currently capturing background

        if (background_frame is not None and target_color is not None and not is_capturing_background):
            frame = apply_invisibility_cloak(frame)
            # Debug: print once when effect is applied
            if not hasattr(generate_frames, 'effect_applied'):
                print("✨ Invisibility effect is now active!")
                generate_frames.effect_applied = True

        #Encode the frame as JPEG for web streaming
        #This converts the frame to a format that can be streamed over the web
        ret, buffer = cv2.imencode('.jpg', frame)
        #ret: return value (True/False)
        #buffer: the encoded frame in JPEG format
        #imencode: encode the frame as JPEG

        #check if encoding was successful
        if not ret:
            continue

        #Convert the encoded frame to bytes
        frame_bytes = buffer.tobytes()

        #Yield the frame in the format required by the Flask Response
        #This creates a multipart response that browsers can display as a video stream
        yield (b' --frame\r\n'
        b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        #b' --frame\r\n': start of a new frame
        #b'Content-Type: image/jpeg\r\n\r\n': header for the image
        #frame_bytes: the actual image data
        #b'\r\n': end of the frame

@app.route('/')
def index():
    """
    Main page route - serves the HTML interface
    This is what users see when they visit the website
    """
    return render_template('index.html')

@app.route('/test')
def test():
    """
    Simple test endpoint to verify server is running
    """
    print("🧪 Test endpoint called")
    return jsonify({'status': 'Server is running!'})

@app.route('/video_feed')
def video_feed():
    """
    Video streaming route - continuously streams video to the browser
    This creates a live video feed that the frontend can display
    """
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    

@app.route('/capture_background', methods=['POST'])
def capture_background_route():
    """
    API endpoint to capture the background when no cloak is present
    Called when user clicks 'Capture background' button
    Returns: JSON response indicating success or failure
    """
    global is_capturing_background
    
    print("📸 Background capture endpoint called")

    #set flag to indicate we're capturing background
    #this prevents invisibility effect from being applied
    is_capturing_background = True

    #wait for 3 secs to give user time to move out of the frame
    #this ensures we capture the background properly without the user in the frame
    time.sleep(3)

    #Attempt to capture the background
    success = capture_background()

    #Reset the flag
    is_capturing_background = False

    print(f"📸 Background capture result: {success}")
    #Return JSON response to frontend
    return jsonify({'success': success})

@app.route('/set_color', methods=['POST'])
def set_color():
    """
    API endpoint to set the target color for the invisibility cloak
    Called when user selects a color from the color picker
    Expects: JSON with 'color' field (RGB tuple)
    Returns: JSON response indicating success or failure and HSV
    """

    global target_color
    
    print("🎨 Set color endpoint called")
    print(f"📦 Request data: {request.get_json()}")

    #Get JSON data from the request
    data = request.get_json()

    #Check if color data is present
    if data and 'color' in data:
        #convert RGB to HSV
        #data['color'] is a tuple (R,G,B) from frontend
        #OpenCV expects BGR format, so we need to convert RGB to BGR first
        color_rgb = np.uint8([[data['color']]]) #[[[R,G,B]]]. np.uint8: 8-bit unsigned integer
        color_bgr = cv2.cvtColor(color_rgb, cv2.COLOR_RGB2BGR) #convert RGB to BGR first
        color_hsv = cv2.cvtColor(color_bgr, cv2.COLOR_BGR2HSV) #then convert BGR to HSV

        #Store the HSV color values
        #numpy array: 2D array with 1 row and 1 column
        #color_hsv[0][0]: first row, first column
        target_color = color_hsv[0][0]
        
        #Debug: print the conversion process
        print(f"🎨 Color conversion - RGB: {data['color']} → BGR: {color_bgr[0][0].tolist()} → HSV: {target_color.tolist()}")

        #Debug logging
        print(f"🎨 Color set - RGB: {data['color']}, HSV: {target_color.tolist()}")

        #return success and HSV values
        return jsonify({
            'success': True,
            'color': target_color.tolist() #convert numpy array to list
        })
    
    #return failure if color data is not present
    return jsonify({
        'success': False,
        'error': 'No color provided'
    })

@app.route('/reset', methods=['POST'])
def reset():
    """
    API endpoint to reset the invisibility cloak
    Clears the captured background and target color
    Returns: JSON response indicating success
    """
    global background_frame, target_color
    
    # Clear the captured background
    background_frame = None
    
    # Clear the target color
    target_color = None
    
    # Return success response
    return jsonify({'success': True})

# Main execution block - runs when the script is executed directly
if __name__ == '__main__':
    # Try to initialize the camera, but don't block the app if it fails
    try:
        if init_camera():
            print("✅ Camera initialized successfully")
        else:
            print("❌ Failed to initialize camera - app will still run with test pattern")
            # Create a test pattern camera for development
            camera = None
    except Exception as e:
        print(f"⚠️ Camera initialization error: {e} - app will still run with test pattern")
        camera = None
    
    # Start the Flask development server
    # debug=True: Enables debug mode for development
    # host='0.0.0.0': Makes the server accessible from other devices on the network
    # port=5000: Runs the server on port 5000
    app.run(debug=True, host='0.0.0.0', port=5000)

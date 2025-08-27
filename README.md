# Invisibility Cloak Application

A real-time computer vision application that creates an invisibility cloak effect using OpenCV and Flask. Capture a background image and then hold up an object of a specified color to see it become invisible!

## Features

- **Real-time video processing** with OpenCV
- **Background capture functionality** with 3-second countdown
- **Intuitive color selection** with 50-color grid and Harry Potter themed names
- **Color lock functionality** - click to lock, hover preview disabled when selected
- **Professional error handling** with user-friendly notifications
- **Loading states** and visual feedback for all operations
- **Responsive web interface** with beautiful Harry Potter theme
- **Camera controls** with on/off states and status indicators
- **Input validation** and error recovery
- **Comprehensive logging** for debugging and monitoring

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd invisibility-cloak
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:

   ```bash
   python app.py
   ```

4. **Access the application**:
   - Local: `http://localhost:5000`
   - Network: `http://your-ip:5000`

## Usage

1. **Start the application** and turn on your camera
2. **Click "Capture Background"** and move out of frame for 3 seconds
3. **Click "Choose Cloak Color"** to open the color picker
4. **Browse colors** by hovering over the grid (preview updates in real-time)
5. **Click any color** to lock it (preview stays fixed, checkmark appears)
6. **Click "Apply Color"** to confirm your selection
7. **Hold up an object** of the selected color to see the invisibility effect

## 🛠️ Technical Features

### Frontend

- **Modern JavaScript** with async/await for API calls
- **Responsive CSS Grid** for color selection
- **Smooth animations** and transitions
- **Error handling** with user-friendly notifications
- **Loading states** for all operations

### Backend

- **Flask REST API** with proper error handling
- **OpenCV integration** for real-time video processing
- **Comprehensive logging** system
- **Resource management** with proper cleanup
- **Input validation** and sanitization

## Requirements

- Python 3.7+
- Webcam
- Modern web browser

## Troubleshooting

- **Camera not working**: Ensure no other applications are using the camera
- **Effect not working**: Make sure you've captured the background and selected a color
- **Performance issues**: Try reducing video resolution in `config.py`
- **Color not detected**: Ensure good, balance lighting. Your choice of "cloak" should be as vibrant as possible, with little to no patterns or texture for the best results.

## Project Structure

```
invisibility-cloak/
├── app.py                 # Main Flask application with error handling
├── camera_manager.py      # Camera operations and management
├── invisibility_processor.py  # Image processing and color detection
├── video_streamer.py      # Video streaming and frame generation
├── api_routes.py          # API endpoints and request handling
├── config.py              # Configuration and settings
├── requirements.txt       # Python dependencies
├── static/
│   ├── css/
│   │   ├── base.css       # Base styles and layout
│   │   ├── components.css # Component-specific styles
│   │   ├── header.css     # Header and navigation
│   │   ├── sidebar.css    # Sidebar and controls
│   │   ├── style.css      # Main application styles
│   │   └── video.css      # Video feed styles
│   └── js/
│       └── main.js        # Frontend JavaScript with color picker
└── templates/
    └── index.html         # Main web interface
```

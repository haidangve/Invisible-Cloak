# Invisibility Cloak Application

A real-time computer vision application that creates an invisibility cloak effect using OpenCV and Flask. Capture a background image and then hold up an object of a specified color to see it become invisible!

## Features

- Real-time video processing with OpenCV
- Background capture functionality
- Color selection with visual color swatch
- Responsive web interface with Harry Potter theme
- Camera controls with on/off states

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

1. **Start the application** and ensure your camera is connected
2. **Click "Capture Background"** and move out of frame for 3 seconds
3. **Click "Choose Cloak Color"** and select the color of your cloak
4. **Hold up an object** of the selected color to see the invisibility effect

## Requirements

- Python 3.7+
- Webcam
- Modern web browser

## Troubleshooting

- **Camera not working**: Ensure no other applications are using the camera
- **Effect not working**: Make sure you've captured the background and selected a color
- **Performance issues**: Try reducing video resolution in `config.py`

## Project Structure

```
invisibility-cloak/
├── app.py                 # Main Flask application
├── camera_manager.py      # Camera operations
├── invisibility_processor.py  # Image processing
├── video_streamer.py      # Video streaming
├── api_routes.py          # API endpoints
├── config.py              # Configuration
├── requirements.txt       # Dependencies
├── static/css/            # Modular CSS files
├── static/js/main.js      # Frontend JavaScript
└── templates/index.html   # Web interface
```

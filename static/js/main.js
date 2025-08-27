// Wait for the DOM to be fully loaded before running our JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Get references to DOM elements
  const videoFeed = document.getElementById("videoFeed");
  const captureBackgroundBtn = document.getElementById("captureBackgroundBtn");
  const chooseColorBtn = document.getElementById("chooseColorBtn");
  const resetBtn = document.getElementById("resetBtn");
  const testBtn = document.getElementById("testBtn");
  const statusBanner = document.getElementById("statusBanner");
  const cameraButton = document.getElementById("cameraButton");

  // Color display elements
  const colorSwatch = document.getElementById("colorSwatch");
  const colorName = document.getElementById("colorName");
  const colorHex = document.getElementById("colorHex");

  // State variables
  let backgroundCaptured = false;
  let colorSelected = false;
  let cameraOn = false; // Default to camera off
  let selectedColorHex = null;
  let isLoading = false;

  // Initialize the application
  function init() {
    console.log("Initializing Invisibility Cloak application...");
    cameraOn = false; // Ensure camera starts off
    updateColorDisplay();
    updateCameraButton(); // This will set the correct status banner for camera-off state
  }

  // Show loading state
  function showLoading(button, text = "Loading...") {
    if (isLoading) return; // Prevent multiple loading states

    isLoading = true;
    const originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    button.disabled = true;

    return originalText;
  }

  // Hide loading state
  function hideLoading(button, originalText) {
    isLoading = false;
    button.innerHTML = originalText;
    button.disabled = false;
  }

  // Show notification
  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
          ? "exclamation-circle"
          : "info-circle"
      }"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  // Update camera button appearance
  function updateCameraButton() {
    if (cameraOn) {
      cameraButton.className = "control-button";
      cameraButton.innerHTML = '<i class="fas fa-video"></i>';
      videoFeed.style.display = "block";

      // Update status banner for camera on
      updateStatusBanner(
        'Ready to become invisible? Click "Capture Background" to start.'
      );
    } else {
      cameraButton.className = "control-button camera-off";
      cameraButton.innerHTML = '<i class="fas fa-video-slash"></i>';
      videoFeed.style.display = "none";

      // Update status banner for camera off
      updateStatusBanner(
        "Camera is off. Turn on camera to continue using the invisibility cloak."
      );
    }
  }

  // Update color display section
  function updateColorDisplay() {
    if (selectedColorHex) {
      colorSwatch.style.setProperty("--selected-color", selectedColorHex);
      colorSwatch.className = "color-swatch has-color";
      colorSwatch.innerHTML = '<i class="fas fa-check"></i>';
      colorName.textContent = getColorName(selectedColorHex);
      colorHex.textContent = selectedColorHex.toUpperCase();
    } else {
      colorSwatch.style.removeProperty("--selected-color");
      colorSwatch.className = "color-swatch";
      colorSwatch.innerHTML = '<i class="fas fa-palette"></i>';
      colorName.textContent = "No color selected";
      colorHex.textContent = "";
    }
  }

  // Get color name from hex
  function getColorName(hex) {
    const colorNames = {
      "#ff0000": "Red",
      "#ff4500": "Orange Red",
      "#ff8c00": "Dark Orange",
      "#ffd700": "Gold",
      "#ffff00": "Yellow",
      "#9acd32": "Yellow Green",
      "#32cd32": "Lime Green",
      "#00ff00": "Green",
      "#00fa9a": "Medium Spring Green",
      "#00ffff": "Cyan",
      "#00bfff": "Deep Sky Blue",
      "#0000ff": "Blue",
      "#8a2be2": "Blue Violet",
      "#9932cc": "Dark Orchid",
      "#ff00ff": "Magenta",
      "#ff1493": "Deep Pink",
      "#dc143c": "Crimson",
      "#b22222": "Fire Brick",
      "#8b0000": "Dark Red",
      "#800000": "Maroon",
      "#2f4f4f": "Dark Slate Gray",
      "#696969": "Dim Gray",
      "#808080": "Gray",
      "#a9a9a9": "Dark Gray",
      "#c0c0c0": "Silver",
      "#d3d3d3": "Light Gray",
      "#dda0dd": "Plum",
      "#ee82ee": "Violet",
      "#da70d6": "Orchid",
      "#ba55d3": "Medium Orchid",
      "#9370db": "Medium Purple",
      "#8a2be2": "Blue Violet",
    };
    return colorNames[hex.toLowerCase()] || "Custom Color";
  }

  // Update status banner
  function updateStatusBanner(message) {
    statusBanner.innerHTML = `<i class="fas fa-info-circle"></i><span>${message}</span>`;
  }

  // Make API calls to the backend
  async function makeApiCall(endpoint, method = "GET", data = null) {
    try {
      console.log(`Making API call to: ${endpoint}`);

      const options = {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log(`API response from ${endpoint}:`, result);
      return result;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Capture background function
  async function captureBackground() {
    if (!cameraOn) {
      showNotification("Please turn on the camera first", "error");
      return;
    }

    const originalText = showLoading(captureBackgroundBtn, "Capturing...");

    try {
      updateStatusBanner(
        "Capturing background in 3 seconds... Move out of frame!"
      );

      // Show countdown
      showCountdown(3, "Move out of frame!");

      const result = await makeApiCall("/capture_background", "POST");

      if (result.success) {
        backgroundCaptured = true;
        updateStatusBanner(
          "Background captured successfully! Now choose your cloak color."
        );
        showNotification("Background captured successfully!", "success");
        console.log("Background captured successfully");
      } else {
        updateStatusBanner("Failed to capture background. Please try again.");
        showNotification(
          result.error || "Failed to capture background",
          "error"
        );
        console.error("Background capture failed");
      }
    } catch (error) {
      updateStatusBanner("Error capturing background. Please try again.");
      showNotification("Network error. Please check your connection.", "error");
      console.error("Background capture error:", error);
    } finally {
      hideLoading(captureBackgroundBtn, originalText);
    }
  }

  // Show countdown overlay
  function showCountdown(seconds, message) {
    // Remove existing countdown if any
    const existingCountdown = document.querySelector(".countdown-overlay");
    if (existingCountdown) {
      existingCountdown.remove();
    }

    // Get video container position and size
    const videoContainer = document.querySelector(".video-container");
    const rect = videoContainer.getBoundingClientRect();

    // Create countdown overlay
    const countdownOverlay = document.createElement("div");
    countdownOverlay.className = "countdown-overlay";
    countdownOverlay.style.position = "absolute";
    countdownOverlay.style.top = rect.top + "px";
    countdownOverlay.style.left = rect.left + "px";
    countdownOverlay.style.width = rect.width + "px";
    countdownOverlay.style.height = rect.height + "px";

    const countdownContent = document.createElement("div");
    countdownContent.className = "countdown-content";

    const countdownNumber = document.createElement("div");
    countdownNumber.className = "countdown-number";

    const countdownText = document.createElement("div");
    countdownText.className = "countdown-text";
    countdownText.textContent = message;

    countdownContent.appendChild(countdownNumber);
    countdownContent.appendChild(countdownText);
    countdownOverlay.appendChild(countdownContent);
    document.body.appendChild(countdownOverlay);

    // Start countdown
    let currentSecond = seconds;
    countdownNumber.textContent = currentSecond;

    const countdownInterval = setInterval(() => {
      currentSecond--;
      countdownNumber.textContent = currentSecond;

      if (currentSecond <= 0) {
        clearInterval(countdownInterval);

        // Show "Background captured!" message
        countdownText.textContent = "Background captured!";
        countdownNumber.textContent = "✓";

        // Remove overlay after 2 seconds
        setTimeout(() => {
          countdownOverlay.remove();
        }, 2000);
      }
    }, 1000);
  }

  // Show color picker modal
  function showColorPicker() {
    if (!backgroundCaptured) {
      showNotification("Please capture background first", "error");
      return;
    }

    // Remove existing color picker if any
    const existingPicker = document.querySelector(".color-picker-modal");
    if (existingPicker) {
      existingPicker.remove();
    }

    // Create color picker modal
    const modal = document.createElement("div");
    modal.className = "color-picker-modal";

    const container = document.createElement("div");
    container.className = "color-picker-container";

    // Header
    const header = document.createElement("div");
    header.className = "color-picker-header";
    header.innerHTML = `
            <h3>Choose Cloak Color</h3>
            <button class="close-button" onclick="this.closest('.color-picker-modal').remove()">×</button>
        `;

    // Color grid
    const colorGrid = document.createElement("div");
    colorGrid.className = "color-grid";

    // Predefined colors
    const colors = [
      "#ff0000",
      "#ff4500",
      "#ff8c00",
      "#ffd700",
      "#ffff00",
      "#9acd32",
      "#32cd32",
      "#00ff00",
      "#00fa9a",
      "#00ffff",
      "#00bfff",
      "#0000ff",
      "#8a2be2",
      "#9932cc",
      "#ff00ff",
      "#ff1493",
      "#dc143c",
      "#b22222",
      "#8b0000",
      "#800000",
      "#2f4f4f",
      "#696969",
      "#808080",
      "#a9a9a9",
      "#c0c0c0",
      "#d3d3d3",
      "#dda0dd",
      "#ee82ee",
      "#da70d6",
      "#ba55d3",
      "#9370db",
      "#8a2be2",
    ];

    colors.forEach((color) => {
      const colorOption = document.createElement("div");
      colorOption.className = "color-option";
      colorOption.style.backgroundColor = color;
      colorOption.onclick = () => selectColor(color);
      colorGrid.appendChild(colorOption);
    });

    // Custom color input
    const customColor = document.createElement("div");
    customColor.className = "custom-color";
    customColor.innerHTML = `
            <input type="color" id="customColorInput" value="#ff0000">
            <button onclick="selectCustomColor()">Use Custom</button>
        `;

    container.appendChild(header);
    container.appendChild(colorGrid);
    container.appendChild(customColor);
    modal.appendChild(container);
    document.body.appendChild(modal);
  }

  // Select color function
  async function selectColor(colorHex) {
    const originalText = showLoading(chooseColorBtn, "Setting...");

    try {
      // Convert hex to RGB
      const r = parseInt(colorHex.slice(1, 3), 16);
      const g = parseInt(colorHex.slice(3, 5), 16);
      const b = parseInt(colorHex.slice(5, 7), 16);

      console.log(`Selecting color: ${colorHex} (RGB: ${r}, ${g}, ${b})`);

      const result = await makeApiCall("/set_color", "POST", {
        color: [r, g, b],
      });

      if (result.success) {
        colorSelected = true;
        selectedColorHex = colorHex;
        updateColorDisplay();
        updateStatusBanner(
          `Color selected! Your ${getColorName(
            colorHex
          )} cloak should now be invisible.`
        );
        showNotification(`Color set to ${getColorName(colorHex)}`, "success");
        console.log("Color selected successfully");

        // Close color picker
        const colorPicker = document.querySelector(".color-picker-modal");
        if (colorPicker) {
          colorPicker.remove();
        }
      } else {
        updateStatusBanner("Failed to set color. Please try again.");
        showNotification(result.error || "Failed to set color", "error");
        console.error("Color selection failed");
      }
    } catch (error) {
      updateStatusBanner("Error setting color. Please try again.");
      showNotification("Network error. Please try again.", "error");
      console.error("Color selection error:", error);
    } finally {
      hideLoading(chooseColorBtn, originalText);
    }
  }

  // Select custom color function
  function selectCustomColor() {
    const customColorInput = document.getElementById("customColorInput");
    if (customColorInput) {
      selectColor(customColorInput.value);
    }
  }

  // Reset function
  async function reset() {
    const originalText = showLoading(resetBtn, "Resetting...");

    try {
      const result = await makeApiCall("/reset", "POST");

      if (result.success) {
        backgroundCaptured = false;
        colorSelected = false;
        selectedColorHex = null;
        updateColorDisplay();
        updateStatusBanner("Reset complete! Ready to start over.");
        showNotification("Application reset successfully!", "success");
        console.log("Reset successful");
      } else {
        updateStatusBanner("Failed to reset. Please try again.");
        showNotification(result.error || "Failed to reset", "error");
        console.error("Reset failed");
      }
    } catch (error) {
      updateStatusBanner("Error resetting. Please try again.");
      showNotification("Network error. Please try again.", "error");
      console.error("Reset error:", error);
    } finally {
      hideLoading(resetBtn, originalText);
    }
  }

  // Test connection function
  async function testConnection() {
    const originalText = showLoading(testBtn, "Testing...");

    try {
      const result = await makeApiCall("/test");
      updateStatusBanner(`${result.status}`);
      showNotification("Connection test successful!", "success");
      console.log("Test successful");
    } catch (error) {
      updateStatusBanner("Connection test failed");
      showNotification("Connection test failed", "error");
      console.error("Test error:", error);
    } finally {
      hideLoading(testBtn, originalText);
    }
  }

  // Toggle camera function
  function toggleCamera() {
    cameraOn = !cameraOn;
    updateCameraButton();
    console.log(`Camera ${cameraOn ? "turned on" : "turned off"}`);
  }

  // Event listeners
  captureBackgroundBtn.addEventListener("click", captureBackground);
  chooseColorBtn.addEventListener("click", showColorPicker);
  resetBtn.addEventListener("click", reset);
  testBtn.addEventListener("click", testConnection);
  cameraButton.addEventListener("click", toggleCamera);

  // Make functions globally available for onclick handlers
  window.selectColor = selectColor;
  window.selectCustomColor = selectCustomColor;

  // Initialize the application
  init();
});

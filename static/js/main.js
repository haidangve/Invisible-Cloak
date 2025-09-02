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
  let lockedColor = null; // Track the locked color

  // Initialize the application
  function init() {
    console.log("Initializing Invisibility Cloak application...");
    cameraOn = false; // Ensure camera starts off
    updateColorDisplay();
    updateCameraButton(); // This will set the correct status banner for camera-off state

    //Start FPS monitoring when camera is on
    startFPSMonitoring();
  }

  //FPS monitoring
  function startFPSMonitoring() {
    setInterval(async () => {
      if (cameraOn) {
        await updateFPSDisplay();
      }
    }, 1500);
  }

  async function updateFPSDisplay() {
    try {
      const result = await makeApiCall("/fps");
      if (result.success) {
        const fpsElement = document.getElementById("fpsValue");
        if (fpsElement) {
          fpsElement.textContent = result.fps;
        }
      }
    } catch (error) {
      console.error("Failed to update FPS:", error);
    }
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

    // Create color wheel modal
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

    // Color grid container
    const colorGridContainer = document.createElement("div");
    colorGridContainer.className = "color-grid-container";

    // Create color grid
    const colorGrid = document.createElement("div");
    colorGrid.className = "color-grid";

    // Color preview
    const colorPreview = document.createElement("div");
    colorPreview.className = "color-preview-display";
    colorPreview.innerHTML = `
      <div class="preview-swatch" id="previewSwatch"></div>
      <div class="preview-info">
        <div class="preview-hex" id="previewHex">#FF0000</div>
        <div class="preview-rgb" id="previewRgb">RGB(255, 0, 0)</div>
      </div>
    `;

    // Apply button
    const applyButton = document.createElement("button");
    applyButton.className = "apply-color-btn";
    applyButton.innerHTML = '<i class="fas fa-magic"></i> Apply Color';
    applyButton.onclick = () => applySelectedColor();

    colorGridContainer.appendChild(colorGrid);
    colorGridContainer.appendChild(colorPreview);

    container.appendChild(header);
    container.appendChild(colorGridContainer);
    container.appendChild(applyButton);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Initialize color grid
    initializeColorGrid(colorGrid, colorPreview);
  }

  // Initialize color grid functionality
  function initializeColorGrid(colorGrid, colorPreview) {
    const previewSwatch = colorPreview.querySelector("#previewSwatch");
    const previewHex = colorPreview.querySelector("#previewHex");
    const previewRgb = colorPreview.querySelector("#previewRgb");

    // Define color palette with magical names
    const colorPalette = [
      { hex: "#ff0000", name: "Crimson Red" },
      { hex: "#ff4500", name: "Phoenix Orange" },
      { hex: "#ff8c00", name: "Golden Fire" },
      { hex: "#ffd700", name: "Gryffindor Gold" },
      { hex: "#ffff00", name: "Lumos Yellow" },
      { hex: "#9acd32", name: "Slytherin Green" },
      { hex: "#32cd32", name: "Emerald Green" },
      { hex: "#00ff00", name: "Forbidden Forest" },
      { hex: "#00fa9a", name: "Mermaid Lagoon" },
      { hex: "#00ffff", name: "Ravenclaw Blue" },
      { hex: "#00bfff", name: "Sky Blue" },
      { hex: "#0000ff", name: "Midnight Blue" },
      { hex: "#8a2be2", name: "Purple Haze" },
      { hex: "#9932cc", name: "Amethyst" },
      { hex: "#ff00ff", name: "Magical Pink" },
      { hex: "#ff1493", name: "Rose Petal" },
      { hex: "#dc143c", name: "Blood Red" },
      { hex: "#b22222", name: "Dark Ruby" },
      { hex: "#8b0000", name: "Shadow Red" },
      { hex: "#800000", name: "Vampire Red" },
      { hex: "#ff6347", name: "Tomato Red" },
      { hex: "#ff7f50", name: "Coral Orange" },
      { hex: "#ffa500", name: "Pure Orange" },
      { hex: "#ffd700", name: "Golden Yellow" },
      { hex: "#adff2f", name: "Green Yellow" },
      { hex: "#7fff00", name: "Chartreuse" },
      { hex: "#00ff7f", name: "Spring Green" },
      { hex: "#40e0d0", name: "Turquoise" },
      { hex: "#00ced1", name: "Dark Turquoise" },
      { hex: "#1e90ff", name: "Dodger Blue" },
      { hex: "#4169e1", name: "Royal Blue" },
      { hex: "#8a2be2", name: "Blue Violet" },
      { hex: "#9370db", name: "Medium Purple" },
      { hex: "#ba55d3", name: "Medium Orchid" },
      { hex: "#da70d6", name: "Orchid" },
      { hex: "#ee82ee", name: "Violet" },
      { hex: "#dda0dd", name: "Plum" },
      { hex: "#ff69b4", name: "Hot Pink" },
      { hex: "#ff1493", name: "Deep Pink" },
      { hex: "#c71585", name: "Medium Violet Red" },
      { hex: "#dc143c", name: "Crimson" },
      { hex: "#b22222", name: "Fire Brick" },
      { hex: "#8b0000", name: "Dark Red" },
      { hex: "#800000", name: "Maroon" },
      { hex: "#2f4f4f", name: "Dark Slate Gray" },
      { hex: "#696969", name: "Dim Gray" },
      { hex: "#808080", name: "Gray" },
      { hex: "#a9a9a9", name: "Dark Gray" },
      { hex: "#c0c0c0", name: "Silver" },
      { hex: "#d3d3d3", name: "Light Gray" },
      { hex: "#f5f5dc", name: "Beige" },
      { hex: "#f4a460", name: "Sandy Brown" },
      { hex: "#d2691e", name: "Chocolate" },
      { hex: "#8b4513", name: "Saddle Brown" },
      { hex: "#654321", name: "Dark Brown" },
    ];

    // Create color grid
    colorPalette.forEach((color, index) => {
      const colorSwatch = document.createElement("div");
      colorSwatch.className = "color-swatch-option";
      colorSwatch.style.backgroundColor = color.hex;
      colorSwatch.setAttribute("data-color", color.hex);
      colorSwatch.setAttribute("data-name", color.name);
      colorSwatch.title = color.name;

      // Handle hover for preview (only if no color is locked)
      colorSwatch.addEventListener("mouseenter", function () {
        if (!lockedColor) {
          updateColorPreview(color.hex, false);
        }
      });

      // Handle click to lock color
      colorSwatch.addEventListener("click", function () {
        lockedColor = color.hex;
        updateColorPreview(color.hex, true);
        showLockFeedback();

        // Update visual state of all swatches
        document.querySelectorAll(".color-swatch-option").forEach((swatch) => {
          swatch.classList.remove("selected");
        });
        colorSwatch.classList.add("selected");
      });

      colorGrid.appendChild(colorSwatch);
    });

    // Update color preview
    function updateColorPreview(color, updateSelected = true) {
      previewSwatch.style.backgroundColor = color;
      previewHex.textContent = color.toUpperCase();

      const rgb = hexToRgb(color);
      if (rgb) {
        previewRgb.textContent = `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      }

      // Add visual indicator if color is locked
      if (lockedColor && color === lockedColor) {
        previewSwatch.style.border = "3px solid #c8a951";
        previewSwatch.style.boxShadow = "0 0 10px rgba(200, 169, 81, 0.4)";
      } else {
        previewSwatch.style.border = "3px solid rgba(200, 169, 81, 0.4)";
        previewSwatch.style.boxShadow = "";
      }
    }
  }

  // Apply selected color
  function applySelectedColor() {
    //use locked color if available, otherwise use preview color
    const colorToApply =
      lockedColor || document.querySelector("#previewHex")?.textContent;
    if (colorToApply) {
      selectColor(colorToApply);
      //clear locked color
      lockedColor = null;
    }
  }

  // Utility functions
  function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (1 / 6 <= h && h < 1 / 3) {
      r = x;
      g = c;
      b = 0;
    } else if (1 / 3 <= h && h < 1 / 2) {
      r = 0;
      g = c;
      b = x;
    } else if (1 / 2 <= h && h < 2 / 3) {
      r = 0;
      g = x;
      b = c;
    } else if (2 / 3 <= h && h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else if (5 / 6 <= h && h <= 1) {
      r = c;
      g = 0;
      b = x;
    }

    const rHex = Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, "0");
    const gHex = Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, "0");
    const bHex = Math.round((b + m) * 255)
      .toString(16)
      .padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
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

  // Initialize the application
  init();

  function showLockFeedback() {
    //create a brief visual feedback
    const previewSwatch = document.querySelector("#previewSwatch");
    if (previewSwatch) {
      previewSwatch.style.transform = "scale(1.1)";
      previewSwatch.style.boxShadow = "0 0 20px rgba(200, 169, 81, 0.6)";

      //reset after 0.5 seconds
      setTimeout(() => {
        previewSwatch.style.transform = "scale(1)";
      }, 200);
    }
    showNotification("Color locked!", "success");
  }
});

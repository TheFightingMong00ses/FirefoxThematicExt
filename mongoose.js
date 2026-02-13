/* global browser */
'use strict';

// Listen for messages from popup.js
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  if (request.action === 'changeTheme') {
    const themeId = request.theme;
    console.log('Attempting to change theme to:', themeId);
    
    // Map theme names to actual Firefox theme IDs or custom themes
    if (themeId === 'dark') {
      browser.management.setEnabled('firefox-compact-dark@mozilla.org', true).then(() => {
        console.log('Successfully enabled dark theme');
        sendResponse({ success: true, themeId: 'firefox-compact-dark@mozilla.org' });
      }).catch((error) => {
        console.error('Error enabling theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    } else if (themeId === 'light') {
      browser.management.setEnabled('firefox-compact-light@mozilla.org', true).then(() => {
        console.log('Successfully enabled light theme');
        sendResponse({ success: true, themeId: 'firefox-compact-light@mozilla.org' });
      }).catch((error) => {
        console.error('Error enabling theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    } else if (themeId === 'random') {
      // Apply custom random color theme (solid)
      const color = request.customColor;
      browser.theme.update({
        colors: {
          frame: color,
          tab_background_text: "#ffffff",
          toolbar: color,
          toolbar_text: "#ffffff",
          toolbar_field: "#e0e0e0",
          toolbar_field_text: "#0c0c0d",
          sidebar: "#ffffff",
          sidebar_text: "#0c0c0d",
          popup: "#ffffff",
          popup_text: "#0c0c0d"
        }
      }).then(() => {
        console.log('Successfully applied random color theme:', color);
        sendResponse({ success: true, themeId: 'random-color' });
      }).catch((error) => {
        console.error('Error applying random color theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    } else if (themeId === 'random-gradient') {
      // Apply custom gradient theme
      const color1 = request.gradientColor1;
      const color2 = request.gradientColor2;
      
      // Get the current window to determine screen size
      browser.windows.getCurrent().then((window) => {
        const screenWidth = window.width || 1920; // Default to 1920 if can't detect
        
        // Create a gradient image using canvas matching screen width
        createGradientImage(color1, color2, screenWidth).then(({ frameUrl, toolbarUrl }) => {
          browser.theme.update({
            images: {
              theme_frame: frameUrl,
              additional_backgrounds: [toolbarUrl]
            },
            colors: {
              tab_background_text: "#ffffff",
              toolbar_text: "#ffffff",
              toolbar_field: "#e0e0e0",
              toolbar_field_text: "#0c0c0d",
              sidebar: "#ffffff",
              sidebar_text: "#0c0c0d",
              popup: "#ffffff",
              popup_text: "#0c0c0d",
              bookmark_text: "#ffffff"
            },
            properties: {
              additional_backgrounds_alignment: ["top"],
              additional_backgrounds_tiling: ["no-repeat"]
            }
          }).then(() => {
            console.log('Successfully applied gradient theme:', color1, 'to', color2);
            sendResponse({ success: true, themeId: 'random-gradient' });
          }).catch((error) => {
            console.error('Error applying gradient theme:', error);
            sendResponse({ success: false, error: error.message });
          });
        });
      });
      return true;
      
    } else if (themeId === 'blue') {
      // Apply custom blue theme
      browser.theme.update({
        colors: {
          frame: "#0a84ff",
          tab_background_text: "#ffffff",
          toolbar: "#0060df",
          toolbar_text: "#ffffff",
          toolbar_field: "#e0e0e0",
          toolbar_field_text: "#0c0c0d",
          sidebar: "#ffffff",
          sidebar_text: "#0c0c0d",
          popup: "#ffffff",
          popup_text: "#0c0c0d"
        }
      }).then(() => {
        console.log('Successfully applied custom blue theme');
        sendResponse({ success: true, themeId: 'custom-blue' });
      }).catch((error) => {
        console.error('Error applying custom blue theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
      
    } else if (themeId === 'purple') {
      browser.management.setEnabled('firefox-alpenglow@mozilla.org', true).then(() => {
        console.log('Successfully enabled purple theme');
        sendResponse({ success: true, themeId: 'firefox-alpenglow@mozilla.org' });
      }).catch((error) => {
        console.error('Error enabling theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
  }
});

// Function to create gradient images that match screen width
function createGradientImage(color1, color2, screenWidth) {
  return new Promise((resolve) => {
    // Use screen width, or fallback to a large width
    const width = screenWidth || 5000;
    
    // Create gradient for frame (title bar)
    const frameCanvas = new OffscreenCanvas(width, 200);
    const frameCtx = frameCanvas.getContext('2d');
    
    const frameGradient = frameCtx.createLinearGradient(0, 0, width, 0);
    frameGradient.addColorStop(0, color1);
    frameGradient.addColorStop(1, color2);
    
    frameCtx.fillStyle = frameGradient;
    frameCtx.fillRect(0, 0, width, 200);
    
    // Create gradient for toolbar (bookmark bar)
    const toolbarCanvas = new OffscreenCanvas(width, 200);
    const toolbarCtx = toolbarCanvas.getContext('2d');
    
    const toolbarGradient = toolbarCtx.createLinearGradient(0, 0, width, 0);
    toolbarGradient.addColorStop(0, color1);
    toolbarGradient.addColorStop(1, color2);
    
    toolbarCtx.fillStyle = toolbarGradient;
    toolbarCtx.fillRect(0, 0, width, 200);
    
    // Convert both to data URLs
    Promise.all([
      frameCanvas.convertToBlob({ type: 'image/png' }),
      toolbarCanvas.convertToBlob({ type: 'image/png' })
    ]).then(([frameBlob, toolbarBlob]) => {
      const frameReader = new FileReader();
      const toolbarReader = new FileReader();
      
      let frameUrl, toolbarUrl;
      
      frameReader.onloadend = () => {
        frameUrl = frameReader.result;
        if (toolbarUrl) resolve({ frameUrl, toolbarUrl });
      };
      
      toolbarReader.onloadend = () => {
        toolbarUrl = toolbarReader.result;
        if (frameUrl) resolve({ frameUrl, toolbarUrl });
      };
      
      frameReader.readAsDataURL(frameBlob);
      toolbarReader.readAsDataURL(toolbarBlob);
    });
  });
}

console.log('Mongoose.js background script loaded');
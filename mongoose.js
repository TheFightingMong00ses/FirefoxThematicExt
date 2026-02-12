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
      
      // Create a gradient image using canvas
      createGradientImage(color1, color2).then((dataUrl) => {
        browser.theme.update({
          images: {
            theme_frame: dataUrl
          },
          colors: {
            frame: color1, // Fallback color
            tab_background_text: "#ffffff",
            toolbar: color2, // Use second color for toolbar to show contrast
            toolbar_text: "#ffffff",
            toolbar_field: "#e0e0e0",
            toolbar_field_text: "#0c0c0d",
            sidebar: "#ffffff",
            sidebar_text: "#0c0c0d",
            popup: "#ffffff",
            popup_text: "#0c0c0d"
          }
        }).then(() => {
          console.log('Successfully applied gradient theme:', color1, 'to', color2);
          sendResponse({ success: true, themeId: 'random-gradient' });
        }).catch((error) => {
          console.error('Error applying gradient theme:', error);
          sendResponse({ success: false, error: error.message });
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

// Function to create a gradient image as a data URL
function createGradientImage(color1, color2) {
  return new Promise((resolve) => {
    // Create an offscreen canvas
    const canvas = new OffscreenCanvas(1000, 200);
    const ctx = canvas.getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 1000, 0);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    // Fill canvas with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 200);
    
    // Convert to blob then to data URL
    canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  });
}

console.log('Mongoose.js background script loaded');
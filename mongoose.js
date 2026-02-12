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
      return true; // Keep channel open for async response
      
    } else if (themeId === 'light') {
      browser.management.setEnabled('firefox-compact-light@mozilla.org', true).then(() => {
        console.log('Successfully enabled light theme');
        sendResponse({ success: true, themeId: 'firefox-compact-light@mozilla.org' });
      }).catch((error) => {
        console.error('Error enabling theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async response
      
    } else if (themeId === 'random') {
      // Apply custom random color theme
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
      return true; // Keep channel open for async response
      
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
      return true; // Keep channel open for async response
      
    } else if (themeId === 'purple') {
      browser.management.setEnabled('firefox-alpenglow@mozilla.org', true).then(() => {
        console.log('Successfully enabled purple theme');
        sendResponse({ success: true, themeId: 'firefox-alpenglow@mozilla.org' });
      }).catch((error) => {
        console.error('Error enabling theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true; // Keep channel open for async response
    }
  }
});

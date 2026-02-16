/* global browser */
'use strict';

//Test

// Listen for messages from popup.js
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
 
//Need method to create a group
//Need to add a set group method
//Need to add change group method




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
      
    } else if (themeId === 'light') {
      browser.management.setEnabled('firefox-compact-light@mozilla.org', true).then(() => {
        console.log('Successfully enabled light theme');
        sendResponse({ success: true, themeId: 'firefox-compact-light@mozilla.org' });
      }).catch((error) => {
        console.error('Error enabling theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      
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
      
    } else if (themeId === 'purple') {
      browser.management.setEnabled('firefox-alpenglow@mozilla.org', true).then(() => {
        console.log('Successfully enabled purple theme');
        sendResponse({ success: true, themeId: 'firefox-alpenglow@mozilla.org' });
      }).catch((error) => {
        console.error('Error enabling theme:', error);
        sendResponse({ success: false, error: error.message });
      });
      
    } else {
      // For random themes, pick from all available options
      const themes = ['dark', 'light', 'blue', 'purple'];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      
      // Recursively call this function with the random theme
      const randomRequest = { action: 'changeTheme', theme: randomTheme };
      browser.runtime.onMessage.addListener((req, sen, res) => {
        if (req === randomRequest) {
          res({ success: true });
        }
      });
      
      // Just apply one of the random themes directly
      if (randomTheme === 'blue') {
        browser.theme.update({
          colors: {
            frame: "#0a84ff",
            tab_background_text: "#ffffff",
            toolbar: "#0060df",
            toolbar_text: "#ffffff",
            toolbar_field: "#e0e0e0",
            toolbar_field_text: "#0c0c0d"
          }
        }).then(() => {
          console.log('Successfully applied random custom blue theme');
          sendResponse({ success: true, themeId: 'custom-blue' });
        });
      } else {
        const themeMap = {
          'dark': 'firefox-compact-dark@mozilla.org',
          'light': 'firefox-compact-light@mozilla.org',
          'purple': 'firefox-alpenglow@mozilla.org'
        };
        
        browser.management.setEnabled(themeMap[randomTheme], true).then(() => {
          console.log('Successfully enabled random theme:', themeMap[randomTheme]);
          sendResponse({ success: true, themeId: themeMap[randomTheme] });
        });
      }
    }
    
    return true;
  }
});

console.log('Mongoose.js background script loaded');
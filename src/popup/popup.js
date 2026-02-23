/* global browser */
"use strict";

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {

  // Declare all button variables
  const createGroupBtn = document.getElementById('create-group');
  const darkThemeBtn = document.getElementById('dark-theme');
  const lightThemeBtn = document.getElementById('light-theme');
  const randomThemeBtn = document.getElementById('random-theme');
  const currentThemeDisplay = document.getElementById('current-theme');

  createGroupBtn.addEventListener('click', function(){
    const groupName = prompt("Enter group name:") || "My Group";
    
    // Send message to background script
    browser.runtime.sendMessage({
      action: 'createGroup',
      groupName: groupName
    }).then((response) => {
      console.log('Group created:', response);
    });
  });

  // Dark theme button click
  darkThemeBtn.addEventListener("click", function () {
    applyTheme("dark", "Dark Mode");
  });

  // Light theme button click
  lightThemeBtn.addEventListener("click", function () {
    applyTheme("light", "Light Mode");
  });

  // Random theme button click
  randomThemeBtn.addEventListener("click", function () {
    const themes = ["dark", "light", "blue", "purple"];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    applyTheme(
      randomTheme,
      randomTheme.charAt(0).toUpperCase() + randomTheme.slice(1),
    );
  });

  // Function to apply a theme
  function applyTheme(themeId, themeName) {
    browser.storage.local
      .set({
        currentTheme: themeId,
        currentThemeName: themeName,
      })
      .then(() => {
        // Update the display
        currentThemeDisplay.textContent = themeName;

        // Send message to background script to actually change theme
        browser.runtime.sendMessage({
          action: "changeTheme",
          theme: themeId,
        });

        console.log("Theme changed to: " + themeName);
      })
      .catch((error) => {
        console.error("Error saving theme:", error);
      });
  }

  // Function to load and display current theme
  function loadCurrentTheme() {
    browser.storage.local
      .get("currentThemeName")
      .then((result) => {
        if (result.currentThemeName) {
          currentThemeDisplay.textContent = result.currentThemeName;
        } else {
          currentThemeDisplay.textContent = "Default";
        }
      })
      .catch((error) => {
        console.error("Error loading theme:", error);
      });
  }

  // Load the current theme when popup opens
  loadCurrentTheme();
});
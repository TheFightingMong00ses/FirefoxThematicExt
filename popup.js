 /* global browser */
'use strict';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Get references to all the buttons
  const darkThemeBtn = document.getElementById('dark-theme');
  const lightThemeBtn = document.getElementById('light-theme');
  const randomThemeBtn = document.getElementById('random-theme');
  const settingsLink = document.getElementById('open-settings');
  const currentThemeDisplay = document.getElementById('current-theme');
  const solidModeBtn = document.getElementById('solid-mode');
  const gradientModeBtn = document.getElementById('gradient-mode');
  
  // Track current mode (default is solid)
  let isGradientMode = false;

  // Load and display current theme on popup open
  loadCurrentTheme();
  loadCurrentMode();

  // Solid mode button click
  solidModeBtn.addEventListener('click', function() {
    isGradientMode = false;
    solidModeBtn.classList.add('active');
    gradientModeBtn.classList.remove('active');
    saveMode('solid');
  });

  // Gradient mode button click
  gradientModeBtn.addEventListener('click', function() {
    isGradientMode = true;
    gradientModeBtn.classList.add('active');
    solidModeBtn.classList.remove('active');
    saveMode('gradient');
  });

  // Dark theme button click
  darkThemeBtn.addEventListener('click', function() {
    applyTheme('dark', 'Dark Mode');
  });

  // Light theme button click
  lightThemeBtn.addEventListener('click', function() {
    applyTheme('light', 'Light Mode');
  });

  // Random theme button click with unlimited color possibilities
  randomThemeBtn.addEventListener('click', function() {
    if (isGradientMode) {
      // Generate TWO random colors for gradient
      const color1 = generateRandomColor();
      const color2 = generateRandomColor();
      const colorName1 = describeColor(color1);
      const colorName2 = describeColor(color2);
      applyTheme('random-gradient', `${colorName1} to ${colorName2}`, null, color1, color2);
    } else {
      // Generate ONE random color for solid
      const randomColor = generateRandomColor();
      const colorDescription = describeColor(randomColor);
      applyTheme('random', colorDescription, randomColor);
    }
  });

  // Settings link click
  if (settingsLink) {
    settingsLink.addEventListener('click', function(e) {
      e.preventDefault();
      browser.runtime.openOptionsPage();
    });
  }

  // Function to generate random RGB color
  function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Function to describe a color with VERY specific names based on RGB values
  function describeColor(rgbString) {
    // Extract RGB values from "rgb(r, g, b)" string
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return 'Random Color';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    // Calculate brightness and saturation
    const brightness = (r + g + b) / 3;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    
    // Low saturation = grayscale/neutral colors
    if (saturation < 0.12) {
      if (brightness > 240) return 'Pure White';
      if (brightness > 220) return 'Snow White';
      if (brightness > 200) return 'Ivory';
      if (brightness > 180) return 'Pearl';
      if (brightness > 160) return 'Platinum';
      if (brightness > 140) return 'Silver';
      if (brightness > 120) return 'Light Gray';
      if (brightness > 100) return 'Ash Gray';
      if (brightness > 80) return 'Graphite';
      if (brightness > 60) return 'Slate';
      if (brightness > 40) return 'Charcoal';
      if (brightness > 20) return 'Onyx';
      return 'Midnight Black';
    }
    
    // Determine hue (which color dominates)
    let hue;
    if (max === min) {
      hue = 0;
    } else if (max === r) {
      hue = 60 * (((g - b) / (max - min)) % 6);
    } else if (max === g) {
      hue = 60 * (((b - r) / (max - min)) + 2);
    } else {
      hue = 60 * (((r - g) / (max - min)) + 4);
    }
    if (hue < 0) hue += 360;
    
    // Determine specific color name based on hue, saturation, and brightness
    let colorName = '';
    
    // REDS (345-15 degrees)
    if (hue >= 345 || hue < 15) {
      if (brightness > 220 && saturation < 0.3) colorName = 'Blush';
      else if (brightness > 200 && saturation < 0.5) colorName = 'Baby Pink';
      else if (brightness > 200) colorName = 'Cotton Candy';
      else if (brightness > 180 && saturation < 0.4) colorName = 'Rose Quartz';
      else if (brightness > 180) colorName = 'Strawberry';
      else if (brightness > 160 && saturation < 0.5) colorName = 'Dusty Rose';
      else if (brightness > 160) colorName = 'Watermelon';
      else if (brightness > 140 && saturation < 0.4) colorName = 'Mauve';
      else if (brightness > 140) colorName = 'Salmon';
      else if (brightness > 120 && saturation > 0.7) colorName = 'Cherry Red';
      else if (brightness > 120) colorName = 'Coral';
      else if (brightness > 100 && saturation > 0.8) colorName = 'Fire Engine Red';
      else if (brightness > 100 && saturation > 0.6) colorName = 'Scarlet';
      else if (brightness > 100) colorName = 'Brick Red';
      else if (brightness > 80 && saturation > 0.7) colorName = 'Ruby';
      else if (brightness > 80 && saturation > 0.5) colorName = 'Crimson';
      else if (brightness > 80) colorName = 'Burgundy';
      else if (brightness > 60 && saturation > 0.6) colorName = 'Blood Red';
      else if (brightness > 60) colorName = 'Wine';
      else if (saturation > 0.5) colorName = 'Maroon';
      else colorName = 'Oxblood';
    }
    // RED-ORANGES (15-30 degrees)
    else if (hue >= 15 && hue < 30) {
      if (brightness > 200 && saturation < 0.4) colorName = 'Peach Cream';
      else if (brightness > 200) colorName = 'Peach';
      else if (brightness > 180) colorName = 'Apricot';
      else if (brightness > 160 && saturation > 0.6) colorName = 'Tangerine';
      else if (brightness > 160) colorName = 'Light Coral';
      else if (brightness > 140) colorName = 'Coral';
      else if (brightness > 120 && saturation > 0.7) colorName = 'Vermillion';
      else if (brightness > 120) colorName = 'Persimmon';
      else if (brightness > 100 && saturation > 0.6) colorName = 'Burnt Sienna';
      else if (brightness > 100) colorName = 'Terracotta';
      else if (brightness > 80) colorName = 'Rust';
      else if (saturation > 0.5) colorName = 'Auburn';
      else colorName = 'Chestnut';
    }
    // ORANGES (30-45 degrees)
    else if (hue >= 30 && hue < 45) {
      if (brightness > 200) colorName = 'Papaya';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Bright Orange';
      else if (brightness > 180) colorName = 'Mango';
      else if (brightness > 160) colorName = 'Cantaloupe';
      else if (brightness > 140 && saturation > 0.7) colorName = 'Pumpkin';
      else if (brightness > 140) colorName = 'Amber';
      else if (brightness > 120 && saturation > 0.6) colorName = 'Carrot';
      else if (brightness > 120) colorName = 'Copper';
      else if (brightness > 100 && saturation > 0.6) colorName = 'Burnt Orange';
      else if (brightness > 100) colorName = 'Bronze';
      else if (brightness > 80) colorName = 'Cinnamon';
      else if (saturation > 0.5) colorName = 'Sienna';
      else colorName = 'Mahogany';
    }
    // YELLOW-ORANGES (45-60 degrees)
    else if (hue >= 45 && hue < 60) {
      if (brightness > 220) colorName = 'Vanilla';
      else if (brightness > 200 && saturation > 0.6) colorName = 'Lemon Chiffon';
      else if (brightness > 200) colorName = 'Cream';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Goldenrod';
      else if (brightness > 180) colorName = 'Butterscotch';
      else if (brightness > 160 && saturation > 0.6) colorName = 'Marigold';
      else if (brightness > 160) colorName = 'Honey';
      else if (brightness > 140 && saturation > 0.7) colorName = 'Sunflower';
      else if (brightness > 140) colorName = 'Gold';
      else if (brightness > 120 && saturation > 0.6) colorName = 'Saffron';
      else if (brightness > 120) colorName = 'Caramel';
      else if (brightness > 100) colorName = 'Mustard';
      else if (brightness > 80) colorName = 'Ochre';
      else colorName = 'Dark Khaki';
    }
    // YELLOWS (60-75 degrees)
    else if (hue >= 60 && hue < 75) {
      if (brightness > 220 && saturation > 0.7) colorName = 'Bright Yellow';
      else if (brightness > 220) colorName = 'Pale Yellow';
      else if (brightness > 200 && saturation > 0.7) colorName = 'Canary Yellow';
      else if (brightness > 200) colorName = 'Banana';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Lemon';
      else if (brightness > 180) colorName = 'Butter';
      else if (brightness > 160) colorName = 'Wheat';
      else if (brightness > 140 && saturation > 0.6) colorName = 'Yellow Ochre';
      else if (brightness > 140) colorName = 'Tan';
      else if (brightness > 120) colorName = 'Olive';
      else if (brightness > 100) colorName = 'Olive Drab';
      else if (brightness > 80) colorName = 'Army Green';
      else colorName = 'Dark Olive';
    }
    // YELLOW-GREENS (75-90 degrees)
    else if (hue >= 75 && hue < 90) {
      if (brightness > 200 && saturation > 0.7) colorName = 'Neon Yellow';
      else if (brightness > 200) colorName = 'Pale Lime';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Lime';
      else if (brightness > 180) colorName = 'Key Lime';
      else if (brightness > 160) colorName = 'Pistachio';
      else if (brightness > 140 && saturation > 0.6) colorName = 'Chartreuse';
      else if (brightness > 140) colorName = 'Pear';
      else if (brightness > 120) colorName = 'Moss Green';
      else if (brightness > 100) colorName = 'Olive Green';
      else if (brightness > 80) colorName = 'Avocado';
      else colorName = 'Military Green';
    }
    // GREENS (90-150 degrees)
    else if (hue >= 90 && hue < 150) {
      if (brightness > 220) colorName = 'Honeydew';
      else if (brightness > 200 && saturation > 0.6) colorName = 'Spring Green';
      else if (brightness > 200) colorName = 'Mint Cream';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Lime Green';
      else if (brightness > 180) colorName = 'Mint';
      else if (brightness > 160 && saturation > 0.7) colorName = 'Emerald';
      else if (brightness > 160) colorName = 'Seafoam';
      else if (brightness > 140 && saturation > 0.7) colorName = 'Kelly Green';
      else if (brightness > 140) colorName = 'Sage';
      else if (brightness > 120 && saturation > 0.7) colorName = 'Grass Green';
      else if (brightness > 120) colorName = 'Fern';
      else if (brightness > 100 && saturation > 0.7) colorName = 'Forest Green';
      else if (brightness > 100) colorName = 'Pine';
      else if (brightness > 80 && saturation > 0.6) colorName = 'Jungle Green';
      else if (brightness > 80) colorName = 'Hunter Green';
      else if (brightness > 60) colorName = 'Evergreen';
      else colorName = 'Dark Forest';
    }
    // CYAN-GREENS (150-165 degrees)
    else if (hue >= 150 && hue < 165) {
      if (brightness > 200 && saturation > 0.6) colorName = 'Aquamarine';
      else if (brightness > 200) colorName = 'Powder Aqua';
      else if (brightness > 180) colorName = 'Turquoise';
      else if (brightness > 160 && saturation > 0.6) colorName = 'Bright Teal';
      else if (brightness > 160) colorName = 'Robin Egg Blue';
      else if (brightness > 140) colorName = 'Teal';
      else if (brightness > 120) colorName = 'Peacock';
      else if (brightness > 100) colorName = 'Deep Teal';
      else if (brightness > 80) colorName = 'Ocean Green';
      else colorName = 'Deep Sea';
    }
    // CYANS (165-195 degrees)
    else if (hue >= 165 && hue < 195) {
      if (brightness > 220) colorName = 'Azure';
      else if (brightness > 200 && saturation > 0.7) colorName = 'Electric Blue';
      else if (brightness > 200) colorName = 'Sky Blue';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Cyan';
      else if (brightness > 180) colorName = 'Baby Blue';
      else if (brightness > 160 && saturation > 0.6) colorName = 'Bright Cyan';
      else if (brightness > 160) colorName = 'Powder Blue';
      else if (brightness > 140) colorName = 'Carolina Blue';
      else if (brightness > 120 && saturation > 0.6) colorName = 'Cerulean';
      else if (brightness > 120) colorName = 'Steel Blue';
      else if (brightness > 100) colorName = 'Denim';
      else if (brightness > 80) colorName = 'Prussian Blue';
      else colorName = 'Deep Ocean';
    }
    // BLUES (195-240 degrees)
    else if (hue >= 195 && hue < 240) {
      if (brightness > 220) colorName = 'Alice Blue';
      else if (brightness > 200 && saturation > 0.6) colorName = 'Cornflower';
      else if (brightness > 200) colorName = 'Periwinkle';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Royal Blue';
      else if (brightness > 180) colorName = 'Light Blue';
      else if (brightness > 160 && saturation > 0.7) colorName = 'Sapphire';
      else if (brightness > 160) colorName = 'Slate Blue';
      else if (brightness > 140 && saturation > 0.7) colorName = 'Cobalt';
      else if (brightness > 140) colorName = 'Dusk Blue';
      else if (brightness > 120 && saturation > 0.7) colorName = 'True Blue';
      else if (brightness > 120) colorName = 'Cadet Blue';
      else if (brightness > 100 && saturation > 0.7) colorName = 'Navy Blue';
      else if (brightness > 100) colorName = 'Blueberry';
      else if (brightness > 80) colorName = 'Navy';
      else if (brightness > 60) colorName = 'Midnight Blue';
      else colorName = 'Abyss';
    }
    // BLUE-PURPLES (240-270 degrees)
    else if (hue >= 240 && hue < 270) {
      if (brightness > 220) colorName = 'Thistle';
      else if (brightness > 200 && saturation > 0.6) colorName = 'Light Purple';
      else if (brightness > 200) colorName = 'Lavender';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Amethyst';
      else if (brightness > 180) colorName = 'Wisteria';
      else if (brightness > 160 && saturation > 0.7) colorName = 'Purple';
      else if (brightness > 160) colorName = 'Lilac';
      else if (brightness > 140 && saturation > 0.7) colorName = 'Iris';
      else if (brightness > 140) colorName = 'Violet';
      else if (brightness > 120 && saturation > 0.7) colorName = 'Royal Purple';
      else if (brightness > 120) colorName = 'Grape';
      else if (brightness > 100 && saturation > 0.6) colorName = 'Deep Purple';
      else if (brightness > 100) colorName = 'Plum';
      else if (brightness > 80) colorName = 'Eggplant';
      else if (brightness > 60) colorName = 'Indigo';
      else colorName = 'Dark Indigo';
    }
    // PURPLES-MAGENTAS (270-300 degrees)
    else if (hue >= 270 && hue < 300) {
      if (brightness > 220) colorName = 'Cotton Candy Pink';
      else if (brightness > 200 && saturation > 0.6) colorName = 'Orchid';
      else if (brightness > 200) colorName = 'Pale Orchid';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Bright Magenta';
      else if (brightness > 180) colorName = 'Pink Lavender';
      else if (brightness > 160 && saturation > 0.7) colorName = 'Fuchsia';
      else if (brightness > 160) colorName = 'Mauve';
      else if (brightness > 140 && saturation > 0.7) colorName = 'Hot Magenta';
      else if (brightness > 140) colorName = 'Heather';
      else if (brightness > 120 && saturation > 0.6) colorName = 'Magenta';
      else if (brightness > 120) colorName = 'Mulberry';
      else if (brightness > 100) colorName = 'Berry';
      else if (brightness > 80) colorName = 'Blackberry';
      else colorName = 'Dark Berry';
    }
    // MAGENTAS-PINKS (300-330 degrees)
    else if (hue >= 300 && hue < 330) {
      if (brightness > 220) colorName = 'Baby Pink';
      else if (brightness > 200 && saturation > 0.7) colorName = 'Hot Pink';
      else if (brightness > 200) colorName = 'Bubblegum';
      else if (brightness > 180 && saturation > 0.7) colorName = 'Neon Pink';
      else if (brightness > 180) colorName = 'Pink';
      else if (brightness > 160 && saturation > 0.6) colorName = 'Raspberry';
      else if (brightness > 160) colorName = 'Rose Pink';
      else if (brightness > 140) colorName = 'Cerise';
      else if (brightness > 120 && saturation > 0.6) colorName = 'Crimson Pink';
      else if (brightness > 120) colorName = 'Dusty Pink';
      else if (brightness > 100) colorName = 'Cranberry';
      else if (brightness > 80) colorName = 'Raspberry Wine';
      else colorName = 'Deep Rose';
    }
    // PINKS-REDS (330-345 degrees)
    else if (hue >= 330 && hue < 345) {
      if (brightness > 220) colorName = 'Seashell Pink';
      else if (brightness > 200 && saturation > 0.6) colorName = 'Carnation Pink';
      else if (brightness > 200) colorName = 'Pale Rose';
      else if (brightness > 180) colorName = 'Pink Lemonade';
      else if (brightness > 160 && saturation > 0.6) colorName = 'Watermelon Pink';
      else if (brightness > 160) colorName = 'Tea Rose';
      else if (brightness > 140) colorName = 'Rose';
      else if (brightness > 120 && saturation > 0.6) colorName = 'Red Rose';
      else if (brightness > 120) colorName = 'Old Rose';
      else if (brightness > 100) colorName = 'Burgundy Rose';
      else if (brightness > 80) colorName = 'Wine Red';
      else colorName = 'Deep Burgundy';
    }
    
    return colorName;
  }

  // Function to apply a theme
  function applyTheme(themeId, themeName, customColor, gradientColor1, gradientColor2) {
    // Store the current theme
    browser.storage.local.set({ 
      currentTheme: themeId,
      currentThemeName: themeName 
    }).then(() => {
      // Update the display
      currentThemeDisplay.textContent = themeName;
      
      // Send message to background script to actually change theme
      browser.runtime.sendMessage({
        action: 'changeTheme',
        theme: themeId,
        customColor: customColor,
        gradientColor1: gradientColor1,
        gradientColor2: gradientColor2
      });
      
      console.log('Theme changed to: ' + themeName);
    }).catch((error) => {
      console.error('Error saving theme:', error);
    });
  }

  // Function to load and display current theme
  function loadCurrentTheme() {
    browser.storage.local.get('currentThemeName').then((result) => {
      if (result.currentThemeName) {
        currentThemeDisplay.textContent = result.currentThemeName;
      } else {
        currentThemeDisplay.textContent = 'Default';
      }
    }).catch((error) => {
      console.error('Error loading theme:', error);
    });
  }

  // Function to save the current mode
  function saveMode(mode) {
    browser.storage.local.set({ colorMode: mode }).catch((error) => {
      console.error('Error saving mode:', error);
    });
  }

  // Function to load the current mode
  function loadCurrentMode() {
    browser.storage.local.get('colorMode').then((result) => {
      if (result.colorMode === 'gradient') {
        isGradientMode = true;
        gradientModeBtn.classList.add('active');
        solidModeBtn.classList.remove('active');
      } else {
        isGradientMode = false;
        solidModeBtn.classList.add('active');
        gradientModeBtn.classList.remove('active');
      }
    }).catch((error) => {
      console.error('Error loading mode:', error);
    });
  }

});
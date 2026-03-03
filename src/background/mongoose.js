"use strict";

// group_class.js is loaded before this script via manifest.json
// so Group is available globally — no import needed for MV2

// Storage for groups as array (in memory, mirrored to browser.storage.local)
const groups = [];

// Load groups from storage when background script starts
async function loadGroupsFromStorage() {
  try {
    const result = await browser.storage.local.get("groups");
    groups.length = 0; // Clear existing groups array before loading
    if (result.groups && Array.isArray(result.groups)) {
      result.groups.forEach((savedGroup) => {
        const group = new Group(savedGroup.name, savedGroup.groupList);
        groups.push(group);
      });
      console.log("Groups loaded from storage:", groups.length);
    }
  } catch (error) {
    console.error("Error loading groups from storage:", error);
  }
}

// Load groups on startup
loadGroupsFromStorage();

// Apply default theme on browser startup
browser.runtime.onStartup.addListener(async () => {
  try {
    const result = await browser.storage.local.get("popupSettings");
    const settings = result.popupSettings || {};
    if (settings.defaultTheme) {
      const dt = settings.defaultTheme;
      // Re-use the changeTheme path by sending an internal message
      browser.runtime
        .sendMessage({
          action: "changeTheme",
          theme: dt.themeId,
          customColor: dt.customColor || null,
          gradientColor1: dt.gradientColor1 || null,
          gradientColor2: dt.gradientColor2 || null,
        })
        .catch(() => {});
      // Also persist as currentTheme so popup shows the right name
      await browser.storage.local.set({
        currentTheme: dt.themeId,
        currentThemeName: dt.name,
        currentCustomColor: dt.customColor || null,
        currentGradientColor1: dt.gradientColor1 || null,
        currentGradientColor2: dt.gradientColor2 || null,
      });
      console.log("Default theme applied on startup:", dt.name);
    }
  } catch (e) {
    console.error("Error applying default theme on startup:", e);
  }
});

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("Message received:", request);
  if (request.action === "createGroup") {
    const groupName = request.groupName;
    const newGroup = new Group(groupName);
    groups.push(newGroup);
    console.log("Group created:", groupName);
    console.log("Total groups:", groups.length);
    const result = await browser.storage.local.get("groups");
    const stored = result.groups || [];
    stored.push({ name: groupName, groupList: [] });
    await browser.storage.local.set({ groups: stored });
    return { success: true };
  }

  if (request.action === "getGroups") {
    // Read directly from storage to avoid timing issues on startup
    browser.storage.local
      .get("groups")
      .then((result) => {
        const savedGroups = result.groups || [];
        sendResponse({ success: true, groups: savedGroups });
      })
      .catch((error) => {
        console.error("Error getting groups:", error);
        sendResponse({ success: false, groups: [] });
      });
    return true;
  }

  if (request.action === "deleteGroup") {
    const groupToRemove = request.deleteGroup;
    const index = groups.findIndex((group) => group.name === groupToRemove);
    if (index > -1) {
      groups.splice(index, 1);
      console.log(groupToRemove, " was deleted");
      const result = await browser.storage.local.get("groups");
      const stored = result.groups || [];
      const storedIndex = stored.findIndex((g) => g.name === groupToRemove);
      if (storedIndex > -1) stored.splice(storedIndex, 1);
      await browser.storage.local.set({ groups: stored });
      sendResponse({ success: true });
    } else {
      console.log("Entered name was not found");
      sendResponse({ success: false, error: "Group not found" });
    }
    return true;
  }
  if (request.action === "changeTheme") {
    const themeId = request.theme;
    console.log("Attempting to change theme to:", themeId);

    if (themeId === "dark") {
      // Update custom theme to dark colors first, then switch to managed dark theme
      browser.theme
        .update({
          colors: {
            frame: "#1a1a1a",
            tab_background_text: "#ffffff",
            toolbar: "#2a2a2a",
            toolbar_text: "#ffffff",
            toolbar_field: "#3a3a3a",
            toolbar_field_text: "#ffffff",
          },
        })
        .then(() =>
          browser.management.setEnabled(
            "firefox-compact-dark@mozilla.org",
            true,
          ),
        )
        .then(() => {
          console.log("Successfully enabled dark theme");
          sendResponse({
            success: true,
            themeId: "firefox-compact-dark@mozilla.org",
          });
        })
        .catch((error) => {
          console.error("Error enabling theme:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    } else if (themeId === "light") {
      // Update custom theme to light colors first, then switch to managed light theme
      browser.theme
        .update({
          colors: {
            frame: "#f5f5f5",
            tab_background_text: "#000000",
            toolbar: "#ffffff",
            toolbar_text: "#000000",
            toolbar_field: "#ffffff",
            toolbar_field_text: "#000000",
          },
        })
        .then(() =>
          browser.management.setEnabled(
            "firefox-compact-light@mozilla.org",
            true,
          ),
        )
        .then(() => {
          console.log("Successfully enabled light theme");
          sendResponse({
            success: true,
            themeId: "firefox-compact-light@mozilla.org",
          });
        })
        .catch((error) => {
          console.error("Error enabling theme:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    } else if (themeId === "random") {
      // Apply solid random color theme
      const color = request.customColor;
      browser.theme
        .update({
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
            popup_text: "#0c0c0d",
          },
        })
        .then(() => {
          console.log("Successfully applied random color theme:", color);
          sendResponse({ success: true, themeId: "random-color" });
        })
        .catch((error) => {
          console.error("Error applying random color theme:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    } else if (themeId === "random-gradient") {
      // Apply custom gradient theme
      const color1 = request.gradientColor1;
      const color2 = request.gradientColor2;

      browser.windows.getCurrent().then((window) => {
        const screenWidth = window.width || 1920;

        createCombinedGradientImage(color1, color2, screenWidth).then(
          (gradientUrl) => {
            browser.theme
              .update({
                images: {
                  theme_frame: gradientUrl,
                },
                colors: {
                  tab_background_text: "#ffffff",
                  toolbar: "transparent",
                  toolbar_text: "#ffffff",
                  toolbar_field: "#e0e0e0",
                  toolbar_field_text: "#0c0c0d",
                  sidebar: "#ffffff",
                  sidebar_text: "#0c0c0d",
                  popup: "#ffffff",
                  popup_text: "#0c0c0d",
                  bookmark_text: "#ffffff",
                },
              })
              .then(() => {
                console.log(
                  "Successfully applied gradient theme:",
                  color1,
                  "to",
                  color2,
                );
                sendResponse({ success: true, themeId: "random-gradient" });
              })
              .catch((error) => {
                console.error("Error applying gradient theme:", error);
                sendResponse({ success: false, error: error.message });
              });
          },
        );
      });
      return true;
    } else if (themeId === "blue") {
      browser.theme
        .update({
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
            popup_text: "#0c0c0d",
          },
        })
        .then(() => {
          console.log("Successfully applied custom blue theme");
          sendResponse({ success: true, themeId: "custom-blue" });
        })
        .catch((error) => {
          console.error("Error applying custom blue theme:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    } else if (themeId === "purple") {
      // Update custom theme to purple colors first, then switch to managed purple theme
      browser.theme
        .update({
          colors: {
            frame: "#5b3fa6",
            tab_background_text: "#ffffff",
            toolbar: "#7b5fbf",
            toolbar_text: "#ffffff",
            toolbar_field: "#ffffff",
            toolbar_field_text: "#000000",
          },
        })
        .then(() =>
          browser.management.setEnabled("firefox-alpenglow@mozilla.org", true),
        )
        .then(() => {
          console.log("Successfully enabled purple theme");
          sendResponse({
            success: true,
            themeId: "firefox-alpenglow@mozilla.org",
          });
        })
        .catch((error) => {
          console.error("Error enabling theme:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    } else {
      // Random theme: pick one and apply directly (no recursive listener)
      const themes = ["dark", "light", "blue", "purple"];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      console.log("Random theme selected:", randomTheme);

      if (randomTheme === "blue") {
        browser.theme
          .update({
            colors: {
              frame: "#0a84ff",
              tab_background_text: "#ffffff",
              toolbar: "#0060df",
              toolbar_text: "#ffffff",
              toolbar_field: "#e0e0e0",
              toolbar_field_text: "#0c0c0d",
            },
          })
          .then(() => {
            console.log("Successfully applied random custom blue theme");
            sendResponse({ success: true, themeId: "custom-blue" });
          })
          .catch((error) => {
            console.error("Error applying random blue theme:", error);
            sendResponse({ success: false, error: error.message });
          });
      } else {
        const themeMap = {
          dark: "firefox-compact-dark@mozilla.org",
          light: "firefox-compact-light@mozilla.org",
          purple: "firefox-alpenglow@mozilla.org",
        };
        browser.management
          .setEnabled(themeMap[randomTheme], true)
          .then(() => {
            console.log(
              "Successfully enabled random theme:",
              themeMap[randomTheme],
            );
            sendResponse({ success: true, themeId: themeMap[randomTheme] });
          })
          .catch((error) => {
            console.error("Error enabling random theme:", error);
            sendResponse({ success: false, error: error.message });
          });
      }
      return true;
    }
  }
});

// Creates a tall gradient image covering both frame and toolbar areas
function createCombinedGradientImage(color1, color2, screenWidth) {
  return new Promise((resolve) => {
    const width = screenWidth || 5000;
    const height = 500;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    canvas.convertToBlob({ type: "image/png" }).then((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  });
}

console.log("Mongoose.js background script loaded");


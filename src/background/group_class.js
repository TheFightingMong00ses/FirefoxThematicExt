/* eslint-disable no-unused-vars */
"use strict";

class Group {
  constructor(name) {
    this.name = name;
    this.groupList = []; // list of theme IDs belonging to this group
  }

  // Gets the current theme name from storage
  async currentTheme() {
    const result = await browser.storage.local.get("currentThemeName");
    return result.currentThemeName;
  }

  // Adds the current theme to this group
  async addTheme() {
    const currentTheme = await this.currentTheme();
    this.groupList.push(currentTheme);
    console.log("Theme added:", currentTheme);
  }

  // Removes the current theme from this group
  async removeTheme() {
    const currentTheme = await this.currentTheme(); // FIX: was missing await
    const index = this.groupList.findIndex((theme) => theme === currentTheme); // FIX: was using wrong variable groupsList
    if (index > -1) {
      this.groupList.splice(index, 1);
      console.log("Theme removed:", currentTheme);
    } else {
      console.log("Theme not found:", currentTheme);
    }
  }

  // Cycles to the next theme in the list
  async cycleNextTheme() {
    const currentTheme = await this.currentTheme(); // FIX: was missing await
    const index = this.groupList.findIndex((theme) => theme === currentTheme); // FIX: was using wrong variable
    if (index === -1 || this.groupList.length === 0) {
      console.log("Current theme not in group or group is empty");
      return;
    }
    const nextIndex = (index + 1) % this.groupList.length; // FIX: wraps around instead of going out of bounds
    const newTheme = this.groupList[nextIndex];
    browser.management.setEnabled(newTheme, true);
    console.log("Cycled to next theme:", newTheme);
  }

  // Cycles to the previous theme in the list
  async cycleBackTheme() {
    const currentTheme = await this.currentTheme(); // FIX: was missing await
    const index = this.groupList.findIndex((theme) => theme === currentTheme); // FIX: was using wrong variable
    if (index === -1 || this.groupList.length === 0) {
      console.log("Current theme not in group or group is empty");
      return;
    }
    const prevIndex =
      (index - 1 + this.groupList.length) % this.groupList.length; // FIX: wraps around instead of going negative
    const newTheme = this.groupList[prevIndex];
    browser.management.setEnabled(newTheme, true);
    console.log("Cycled to previous theme:", newTheme);
  }

  // Cycles to a random theme in the list
  async cycleRandomTheme() {
    if (this.groupList.length === 0) {
      console.log("Group is empty");
      return;
    }
    const randomIndex = Math.floor(Math.random() * this.groupList.length);
    const newTheme = this.groupList[randomIndex];
    browser.management.setEnabled(newTheme, true);
    console.log("Cycled to random theme:", newTheme);
  }

  // Clears all themes from this group
  async removeGroup() {
    this.groupList = [];
    console.log("Group cleared:", this.name);
  }

  // Debug helper
  async testGroupContents() {
    console.log("Group:", this.name, "| Themes:", this.groupList);
  }
}

console.log("Group class loaded");

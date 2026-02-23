/* Global Browser */
"use strict";

export class Group {
     constructor (name) {
        this.name = name;
        this.groupList = [];
    }
    groupList = [];

    async currentTheme() {
        //Method that gets the current theme
         const result = await browser.storage.local.get('currentThemeName');
        return result.currentThemeName;
    }

    async addTheme() {
        //Method to store the current theme in the group
        const currentTheme = await this.currentTheme();
        this.groupList.push(currentTheme);
        console.log('Theme added:', currentTheme);
    }

    async removeTheme() {
        //Method that removes current theme
        //const currentTheme = this.currentTheme();
    }

    async cycleNextTheme() {
        //Method that cycles to next theme in list
        //browser.management.setEnabled(this.groupList)
    }

    async cycleBackTheme() {
        /*
        Method that cycles to previous theme in list
        */
    }

    async cycleRandomTheme() {
        /*
        Method that cycles to previous theme in list
        */
    }
    
    async removeGroup() {
        /*
        Method that removes entire group
        */
    }

    async testGroup() {
        const test = this.groupList[1];
        console.log(test)
    }
}

// Make sure it's available globally
console.log('Group class loaded');
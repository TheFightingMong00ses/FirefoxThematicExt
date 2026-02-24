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
        const currentTheme = this.currentTheme();
        const index = groupsList.findIndex(groupList => groupList.name === currentTheme);
        if (index > -1){
            this.groupList.splice(index,1);
        }
        else {
            console.log('Theme not found')
        }
    }

    async cycleNextTheme() {
        //Method that cycles to next theme in list
        const currentTheme = this.currentTheme();
        const index = groupsList.findIndex(groupList => groupList.name === currentTheme);
        const newTheme = this.groupList[index+1];
        browser.management.setEnabled(newTheme, true)
    }

    async cycleBackTheme() {
        //Method that cycles to previous theme in list
        const currentTheme = this.currentTheme();
        const index = groupsList.findIndex(groupList => groupList.name === currentTheme);
        const newTheme = this.groupList[index-1];
        browser.management.setEnabled(newTheme, true)
    }

    async cycleRandomTheme() {
        //Method that cycles to previous theme in list


    }

    checkDupeTheme() {
        const currentTheme = this.currentTheme();
        
    }

    async testGroupContents() {
        const test = this.groupList[1];
        console.log(test)
    }
}

// Make sure it's available globally
console.log('Group class loaded');
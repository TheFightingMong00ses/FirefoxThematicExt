class Group {
    constructor (name) {
        this.name = name;
    }

    groupList = [];

    currentTheme() {
        //Method that gets the current theme
        const currentTheme = browser.storage.local.get('currentThemeName')
        return currentTheme;
    }

    addTheme() {
        //Method to store the current theme in the group
        const currentTheme = this.currentTheme();
        this.groupList.push(currentTheme);
    }

    removeTheme() {
        //Method that removes current theme
        //const currentTheme = this.currentTheme();
    }

    cycleNextTheme() {
        //Method that cycles to next theme in list
        //browser.management.setEnabled(this.groupList)
    }

    cycleBackTheme() {
        /*
        Method that cycles to previous theme in list
        */
    }

    cycleRandomTheme() {
        /*
        Method that cycles to previous theme in list
        */
    }
    
    removeGroup() {
        /*
        Method that removes entire group
        */
    }

    testGroup() {
        const test = this.groupList[1];
        console.log(test)
    }
}
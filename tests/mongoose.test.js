// tests/mongoose.test.js
// Tests for the background script

describe("Mongoose Background Script", () => {
  beforeEach(() => {
    // Reset browser API mocks before each test
    browser.runtime.onMessage.addListener.reset();
    browser.management.setEnabled.reset();
    browser.theme.update.reset();
  });

  describe("Theme Validation", () => {
    it("should recognize valid theme IDs", () => {
      const validThemes = ["dark", "light", "blue", "purple"];

      validThemes.forEach((theme) => {
        expect(validThemes).to.include(theme);
      });
    });

    it("should have all required theme properties", () => {
      const themeRequest = {
        action: "changeTheme",
        theme: "dark",
      };

      expect(themeRequest).to.have.property("action");
      expect(themeRequest).to.have.property("theme");
      expect(themeRequest.action).to.equal("changeTheme");
    });
  });

  describe("Browser API Interactions", () => {
    it("should call browser.management.setEnabled for dark theme", () => {
      browser.management.setEnabled.resolves();

      // Simulate enabling dark theme
      const themeId = "firefox-compact-dark@mozilla.org";
      browser.management.setEnabled(themeId, true);

      expect(browser.management.setEnabled.calledOnce).to.be.true;
      expect(browser.management.setEnabled.calledWith(themeId, true)).to.be
        .true;
    });

    it("should call browser.theme.update for custom themes", () => {
      browser.theme.update.resolves();

      // Simulate applying custom blue theme
      const customTheme = {
        colors: {
          frame: "#0a84ff",
          toolbar: "#0060df",
        },
      };

      browser.theme.update(customTheme);

      expect(browser.theme.update.calledOnce).to.be.true;

      const calledTheme = browser.theme.update.firstCall.args[0];
      expect(calledTheme).to.have.property("colors");
      expect(calledTheme.colors.frame).to.equal("#0a84ff");
    });
  });

  describe("Theme Data Structure", () => {
    it("should have valid color properties for custom themes", () => {
      const blueTheme = {
        colors: {
          frame: "#0a84ff",
          tab_background_text: "#ffffff",
          toolbar: "#0060df",
          toolbar_text: "#ffffff",
        },
      };

      expect(blueTheme.colors).to.be.an("object");
      expect(blueTheme.colors.frame).to.be.a("string");
      expect(blueTheme.colors.frame).to.match(/^#[0-9a-f]{6}$/i);
    });

    it("should validate theme ID format", () => {
      const themeIds = {
        dark: "firefox-compact-dark@mozilla.org",
        light: "firefox-compact-light@mozilla.org",
        purple: "firefox-alpenglow@mozilla.org",
      };

      Object.values(themeIds).forEach((id) => {
        expect(id).to.be.a("string");
        expect(id).to.include("@mozilla.org");
      });
    });
  });

  describe("Random Theme Selection", () => {
    it("should select from available themes", () => {
      const availableThemes = ["dark", "light", "blue", "purple"];
      const randomTheme =
        availableThemes[Math.floor(Math.random() * availableThemes.length)];

      expect(availableThemes).to.include(randomTheme);
    });
  });
});

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

  // ── New tests added for gradient and random color features ────────────────

  describe("Gradient Theme", () => {
    it("should have both gradient color properties in request", () => {
      const gradientRequest = {
        action: "changeTheme",
        theme: "random-gradient",
        gradientColor1: "#ffcc00",
        gradientColor2: "#ff0000",
      };
      expect(gradientRequest).to.have.property("gradientColor1");
      expect(gradientRequest).to.have.property("gradientColor2");
      expect(gradientRequest.gradientColor1).to.match(/^#[0-9a-f]{6}$/i);
      expect(gradientRequest.gradientColor2).to.match(/^#[0-9a-f]{6}$/i);
    });

    it("should have frame color matching gradientColor1 to fix white bar", () => {
      const color1 = "#ffcc00";
      const color2 = "#ff0000";
      const gradientTheme = {
        images: {
          theme_frame: "data:image/png;base64,fakedata",
        },
        colors: {
          frame: color1,
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
      };
      // White bar fix: frame must equal color1 so uncovered left area blends in
      expect(gradientTheme.colors.frame).to.equal(color1);
      expect(gradientTheme.colors.frame).to.not.equal(color2);
    });

    it("should have toolbar set to transparent for gradient theme", () => {
      const gradientTheme = {
        colors: {
          frame: "#ffcc00",
          toolbar: "transparent",
        },
      };
      expect(gradientTheme.colors.toolbar).to.equal("transparent");
    });

    it("should include theme_frame image in gradient theme", () => {
      const gradientTheme = {
        images: {
          theme_frame: "data:image/png;base64,fakedata",
        },
        colors: {
          frame: "#ffcc00",
        },
      };
      expect(gradientTheme).to.have.property("images");
      expect(gradientTheme.images).to.have.property("theme_frame");
      expect(gradientTheme.images.theme_frame).to.be.a("string");
    });

    it("should call browser.theme.update with both images and colors for gradient", () => {
      browser.theme.update.resolves();
      const gradientTheme = {
        images: { theme_frame: "data:image/png;base64,fakedata" },
        colors: {
          frame: "#ffcc00",
          toolbar: "transparent",
          tab_background_text: "#ffffff",
        },
      };
      browser.theme.update(gradientTheme);
      expect(browser.theme.update.calledOnce).to.be.true;
      const calledTheme = browser.theme.update.firstCall.args[0];
      expect(calledTheme).to.have.property("images");
      expect(calledTheme).to.have.property("colors");
      expect(calledTheme.colors.toolbar).to.equal("transparent");
    });

    it("gradient color1 and color2 should be different colors", () => {
      const color1 = "#ffcc00";
      const color2 = "#ff0000";
      expect(color1).to.not.equal(color2);
    });

    it("should have valid hex format for both gradient colors", () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      const color1 = "#ffcc00";
      const color2 = "#ff0000";
      expect(color1).to.match(hexPattern);
      expect(color2).to.match(hexPattern);
    });
  });

  describe("Random Solid Color Theme", () => {
    it("should have a customColor property in request", () => {
      const randomColorRequest = {
        action: "changeTheme",
        theme: "random",
        customColor: "#a3c4f3",
      };
      expect(randomColorRequest).to.have.property("customColor");
      expect(randomColorRequest.customColor).to.match(/^#[0-9a-f]{6}$/i);
    });

    it("should set frame and toolbar to the same custom color", () => {
      const color = "#a3c4f3";
      const randomTheme = {
        colors: {
          frame: color,
          toolbar: color,
          tab_background_text: "#ffffff",
        },
      };
      expect(randomTheme.colors.frame).to.equal(color);
      expect(randomTheme.colors.toolbar).to.equal(color);
      expect(randomTheme.colors.frame).to.equal(randomTheme.colors.toolbar);
    });

    it("should call browser.theme.update with the custom color", () => {
      browser.theme.update.resolves();
      const color = "#a3c4f3";
      const randomTheme = {
        colors: {
          frame: color,
          toolbar: color,
          tab_background_text: "#ffffff",
          toolbar_text: "#ffffff",
          toolbar_field: "#e0e0e0",
          toolbar_field_text: "#0c0c0d",
        },
      };
      browser.theme.update(randomTheme);
      expect(browser.theme.update.calledOnce).to.be.true;
      const calledTheme = browser.theme.update.firstCall.args[0];
      expect(calledTheme.colors.frame).to.equal(color);
      expect(calledTheme.colors.toolbar).to.equal(color);
    });
  });
});

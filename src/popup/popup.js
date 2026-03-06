"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // ── Element refs ─────────────────────────────────────────────────
  const darkThemeBtn = document.getElementById("dark-theme");
  const lightThemeBtn = document.getElementById("light-theme");
  const randomThemeBtn = document.getElementById("random-theme");
  const currentThemeDisplay = document.getElementById("current-theme");
  const solidModeBtn = document.getElementById("solid-mode");
  const gradientModeBtn = document.getElementById("gradient-mode");
  const modeToggleRow = document.getElementById("mode-toggle-row");

  const editGroupsBtn = document.getElementById("edit-groups-btn");
  const groupCountBadge = document.getElementById("group-count-badge");
  const groupsPanel = document.getElementById("groups-panel");
  const groupsBackBtn = document.getElementById("groups-back-btn");

  const settingsBtn = document.getElementById("settings-btn");
  const settingsPanel = document.getElementById("settings-panel");
  const settingsBackBtn = document.getElementById("settings-back-btn");

  const viewMenu = document.getElementById("groups-view-menu");
  const viewDetail = document.getElementById("groups-view-detail");
  const viewTransfer = document.getElementById("groups-view-transfer");

  const addGroupBtn = document.getElementById("add-group-btn");
  const openGroupBtn = document.getElementById("open-group-btn");
  const renameGroupBtn = document.getElementById("rename-group-btn");
  const removeGroupBtn = document.getElementById("remove-group-btn");

  const detailGroupName = document.getElementById("detail-group-name");
  const detailThemesList = document.getElementById("detail-themes-list");
  const detailSurpriseBtn = document.getElementById("detail-surprise-btn");
  const detailAddThemeBtn = document.getElementById("detail-add-theme-btn");
  const detailRemoveThemeBtn = document.getElementById(
    "detail-remove-theme-btn",
  );
  const detailCopyThemeBtn = document.getElementById("detail-copy-theme-btn");
  const detailMoveThemeBtn = document.getElementById("detail-move-theme-btn");
  const detailEditNameBtn = document.getElementById("detail-edit-name-btn");
  const detailBackBtn = document.getElementById("detail-back-btn");

  const transferTitle = document.getElementById("transfer-title");
  const transferPickerList = document.getElementById("transfer-picker-list");
  const confirmTransferBtn = document.getElementById("confirm-transfer-btn");
  const cancelTransferBtn = document.getElementById("cancel-transfer-btn");

  const applyConfirmBar = document.getElementById("apply-confirm-bar");
  const applyConfirmName = document.getElementById("apply-confirm-name");
  const applyConfirmYes = document.getElementById("apply-confirm-yes");
  const applyConfirmNo = document.getElementById("apply-confirm-no");

  const sizeControl = document.getElementById("size-control");
  const schemeControl = document.getElementById("scheme-control");
  const accentControl = document.getElementById("accent-control");
  const customBgControl = document.getElementById("custom-bg-control");
  const customTextControl = document.getElementById("custom-text-control");
  const compactToggle = document.getElementById("compact-toggle");
  const showModeToggleEl = document.getElementById("show-mode-toggle");
  const applyOnClickToggle = document.getElementById("apply-on-click-toggle");
  const rememberGroupToggle = document.getElementById("remember-group-toggle");
  const resetDefaultsBtn = document.getElementById("reset-defaults-btn");

  // Default theme / banner elements
  const defaultThemeBanner = document.getElementById("default-theme-banner");
  const bannerLinkBtn = document.getElementById("banner-link-btn");
  const bannerDismissBtn = document.getElementById("banner-dismiss-btn");
  const selectDefaultThemeBtn = document.getElementById(
    "select-default-theme-btn",
  );
  const defaultThemeDisplay = document.getElementById("default-theme-display");
  const bannerDismissedToggle = document.getElementById(
    "banner-dismissed-toggle",
  );
  // Sub-view: group list
  const dtViewGroups = document.getElementById("dt-view-groups");
  const dtGroupsBackBtn = document.getElementById("dt-groups-back-btn");
  const dtGroupsList = document.getElementById("dt-groups-list");
  const dtClearBtn = document.getElementById("dt-clear-btn");
  // Sub-view: theme list
  const dtViewThemes = document.getElementById("dt-view-themes");
  const dtThemesBackBtn = document.getElementById("dt-themes-back-btn");
  const dtThemesTitle = document.getElementById("dt-themes-title");
  const dtThemesList = document.getElementById("dt-themes-list");
  // (settingsBody no longer needed — dt sub-views are now top-level panels)

  // ── Defaults ──────────────────────────────────────────────────────
  const DEFAULT_SETTINGS = {
    size: "medium",
    scheme: "blue",
    accent: "#5b8dd9",
    customBg: "#f0ede8",
    customText: "#1e2029",
    compact: false,
    showModeToggle: true,
    applyOnClick: true,
    rememberGroup: false,
    defaultTheme: null,
    bannerDismissed: false,
  };
  let settings = { ...DEFAULT_SETTINGS };

  // ── App state ─────────────────────────────────────────────────────
  let isGradientMode = false;
  let selectedGroupName = null;
  let selectedThemeName = null;
  let transferMode = null;
  let transferDestGroup = null;
  let pendingTheme = null;

  // ── Init ──────────────────────────────────────────────────────────
  loadSettings().then(() => {
    loadCurrentTheme();
    loadCurrentMode();
    updateGroupCountBadge();
  });

  // ── Settings persistence ──────────────────────────────────────────
  async function loadSettings() {
    const result = await browser.storage.local.get("popupSettings");
    settings = { ...DEFAULT_SETTINGS, ...(result.popupSettings || {}) };
    applySettings();
    syncSettingsUI();
  }

  async function saveSettings() {
    await browser.storage.local.set({ popupSettings: settings });
    applySettings();
    syncSettingsUI();
  }

  function applySettings() {
    const body = document.body;
    body.classList.remove("size-small", "size-medium", "size-large");
    body.classList.add(`size-${settings.size}`);
    body.classList.toggle("compact", settings.compact);
    body.classList.remove("scheme-blue", "scheme-dark", "scheme-light");
    body.classList.add(`scheme-${settings.scheme}`);
    body.dataset.scheme = settings.scheme;
    // Always apply the user's chosen accent color on top of any scheme
    document.documentElement.style.setProperty("--accent", settings.accent);
    document.documentElement.style.setProperty(
      "--accent-dark",
      darkenHex(settings.accent, 22),
    );
    // Apply custom bg/text colors when on Custom scheme
    if (settings.scheme === "blue") {
      const bg = settings.customBg || DEFAULT_SETTINGS.customBg;
      const text = settings.customText || DEFAULT_SETTINGS.customText;
      document.documentElement.style.setProperty("--bg",       bg);
      document.documentElement.style.setProperty("--bg2",      darkenHex(bg, 6));
      document.documentElement.style.setProperty("--surface",  lightenHex(bg, 5));
      document.documentElement.style.setProperty("--surface2", darkenHex(bg, 3));
      document.documentElement.style.setProperty("--text",     text);
      document.documentElement.style.setProperty("--text-sub", blendHex(text, bg, 0.55));
    } else {
      document.documentElement.style.removeProperty("--bg");
      document.documentElement.style.removeProperty("--bg2");
      document.documentElement.style.removeProperty("--surface");
      document.documentElement.style.removeProperty("--surface2");
      document.documentElement.style.removeProperty("--text");
      document.documentElement.style.removeProperty("--text-sub");
    }
    modeToggleRow.classList.toggle("hidden", !settings.showModeToggle);
  }

  function syncSettingsUI() {
    sizeControl
      .querySelectorAll(".seg-btn")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.value === settings.size),
      );
    schemeControl
      .querySelectorAll(".scheme-btn")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.value === settings.scheme),
      );
    accentControl
      .querySelectorAll(".accent-swatch")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.color === settings.accent),
      );
    compactToggle.checked = settings.compact;
    showModeToggleEl.checked = settings.showModeToggle;
    applyOnClickToggle.checked = settings.applyOnClick;
    rememberGroupToggle.checked = settings.rememberGroup;
    // Sync custom color swatch grids
    customBgControl.querySelectorAll(".accent-swatch").forEach((b) =>
      b.classList.toggle("active", b.dataset.color === settings.customBg),
    );
    customTextControl.querySelectorAll(".accent-swatch").forEach((b) =>
      b.classList.toggle("active", b.dataset.color === settings.customText),
    );
    // Default theme display
    defaultThemeDisplay.textContent = settings.defaultTheme
      ? settings.defaultTheme.name
      : "None selected";
    // If a default theme is now set, auto-reset bannerDismissed so the
    // toggle goes back to unchecked if the default is later cleared.
    if (settings.defaultTheme && settings.bannerDismissed) {
      settings.bannerDismissed = false;
      browser.storage.local.set({ popupSettings: settings });
    }
    // Toggle: checked = reminder turned OFF. Unchecked = reminder active.
    // When no default is set it must be unchecked unless user explicitly turned it off.
    bannerDismissedToggle.checked = !!settings.bannerDismissed;
    // Banner: show if no default and not dismissed
    const showBanner = !settings.defaultTheme && !settings.bannerDismissed;
    defaultThemeBanner.classList.toggle("hidden", !showBanner);
  }

  // ── Settings panel ────────────────────────────────────────────────
  settingsBtn.addEventListener("click", () => {
    showPanel("settings");
  });
  settingsBackBtn.addEventListener("click", () => {
    hidePanel();
  });

  // Size
  sizeControl.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeControl
        .querySelectorAll(".seg-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      settings.size = btn.dataset.value;
      saveSettings();
    });
  });

  // Scheme
  schemeControl.querySelectorAll(".scheme-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      schemeControl
        .querySelectorAll(".scheme-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      settings.scheme = btn.dataset.value;
      saveSettings();
    });
  });

  // Accent swatches
  accentControl.querySelectorAll(".accent-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      accentControl
        .querySelectorAll(".accent-swatch")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      settings.accent = btn.dataset.color;
      saveSettings();
    });
  });

  // Custom background swatches
  customBgControl.querySelectorAll(".accent-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      customBgControl.querySelectorAll(".accent-swatch")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      settings.customBg = btn.dataset.color;
      saveSettings();
    });
  });

  // Custom text swatches
  customTextControl.querySelectorAll(".accent-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      customTextControl.querySelectorAll(".accent-swatch")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      settings.customText = btn.dataset.color;
      saveSettings();
    });
  });

  // Toggles
  compactToggle.addEventListener("change", () => {
    settings.compact = compactToggle.checked;
    saveSettings();
  });
  showModeToggleEl.addEventListener("change", () => {
    settings.showModeToggle = showModeToggleEl.checked;
    saveSettings();
  });
  applyOnClickToggle.addEventListener("change", () => {
    settings.applyOnClick = applyOnClickToggle.checked;
    if (settings.applyOnClick) applyConfirmBar.classList.add("hidden");
    saveSettings();
  });
  rememberGroupToggle.addEventListener("change", () => {
    settings.rememberGroup = rememberGroupToggle.checked;
    saveSettings();
  });

  // Reset to defaults
  resetDefaultsBtn.addEventListener("click", async () => {
    const confirmed = await showConfirm(
      "Reset all settings to defaults?\n\nThis cannot be undone.",
      "Reset",
      true,
    );
    if (!confirmed) return;
    settings = { ...DEFAULT_SETTINGS };
    await saveSettings();
    syncSettingsUI();
  });

  // ── Banner ────────────────────────────────────────────────────────
  bannerLinkBtn.addEventListener("click", () => {
    dtShowGroups();
  });

  bannerDismissBtn.addEventListener("click", async () => {
    defaultThemeBanner.classList.add("hidden");
    settings.bannerDismissed = true;
    await saveSettings();
  });

  bannerDismissedToggle.addEventListener("change", async () => {
    settings.bannerDismissed = bannerDismissedToggle.checked;
    await saveSettings();
    syncSettingsUI();
  });

  // ── Default theme picker — three views: main body / groups / themes ─
  // Which sub-view is showing: null | 'groups' | 'themes'
  function dtHideAll() {
    showPanel("settings");
  }

  function dtShowGroups() {
    showPanel("dt-groups");
    renderDtGroups();
  }

  function dtShowThemes(group) {
    showPanel("dt-themes");
    dtThemesTitle.textContent = group.name;
    renderDtThemes(group);
  }

  selectDefaultThemeBtn.addEventListener("click", dtShowGroups);
  dtGroupsBackBtn.addEventListener("click", dtHideAll);
  dtThemesBackBtn.addEventListener("click", dtShowGroups);

  dtClearBtn.addEventListener("click", async () => {
    settings.defaultTheme = null;
    await saveSettings();
    syncSettingsUI();
    renderDtGroups();
  });

  async function renderDtGroups() {
    const groups = await getGroupsFromStorage();
    dtGroupsList.innerHTML = "";
    if (groups.length === 0) {
      dtGroupsList.innerHTML =
        '<p class="no-groups-msg">No groups created yet</p>';
      const goBtn = document.createElement("button");
      goBtn.className = "button button-secondary";
      goBtn.textContent = "→ Go to Edit Groups";
      goBtn.style.marginTop = "8px";
      goBtn.addEventListener("click", () => {
        showPanel("groups");
        showView("menu");
        selectedGroupName = null;
        setGroupActionBtnsEnabled(false);
        renderYourGroups();
      });
      dtGroupsList.appendChild(goBtn);
      return;
    }
    const withThemes = groups.filter((g) => g.groupList.length > 0);
    if (withThemes.length === 0) {
      dtGroupsList.innerHTML =
        '<p class="no-groups-msg">No themes saved in any group yet</p>';
      const goBtn = document.createElement("button");
      goBtn.className = "button button-secondary";
      goBtn.textContent = "→ Go to Edit Groups";
      goBtn.style.marginTop = "8px";
      goBtn.addEventListener("click", () => {
        showPanel("groups");
        showView("menu");
        selectedGroupName = null;
        setGroupActionBtnsEnabled(false);
        renderYourGroups();
      });
      dtGroupsList.appendChild(goBtn);
      return;
    }
    withThemes.forEach((group) => {
      const btn = document.createElement("button");
      btn.className = "dt-item";
      // Indicate if current default is inside this group
      const hasActive =
        settings.defaultTheme &&
        group.groupList.some(
          (t) => (t.name || t) === settings.defaultTheme.name,
        );
      btn.textContent = group.name + (hasActive ? " ✓" : "");
      if (hasActive) btn.classList.add("active");
      btn.addEventListener("click", () => dtShowThemes(group));
      dtGroupsList.appendChild(btn);
    });
  }

  function renderDtThemes(group) {
    dtThemesList.innerHTML = "";
    group.groupList.forEach((theme) => {
      const name = theme.name || theme;
      const btn = document.createElement("button");
      btn.className = "dt-item";
      btn.textContent = name;
      const isActive =
        settings.defaultTheme && settings.defaultTheme.name === name;
      if (isActive) btn.classList.add("active");
      btn.addEventListener("click", async () => {
        // Apply the theme immediately so the user can preview it
        commitApplyTheme(
          theme.themeId || theme,
          name,
          theme.customColor || null,
          theme.gradientColor1 || null,
          theme.gradientColor2 || null,
        );
        // Then confirm whether to save it as the default
        const confirmed = await showConfirm(
          `Select "${name}" as default theme on startup?`,
          "Select",
          false,
        );
        if (!confirmed) return;
        settings.defaultTheme = {
          themeId: theme.themeId || theme,
          name,
          customColor: theme.customColor || null,
          gradientColor1: theme.gradientColor1 || null,
          gradientColor2: theme.gradientColor2 || null,
        };
        await saveSettings();
        syncSettingsUI();
        renderDtThemes(group);
        dtShowGroups();
      });
      dtThemesList.appendChild(btn);
    });
  }

  // ── Mode toggle ───────────────────────────────────────────────────
  solidModeBtn.addEventListener("click", () => {
    isGradientMode = false;
    solidModeBtn.classList.add("active");
    gradientModeBtn.classList.remove("active");
    saveMode("solid");
  });
  gradientModeBtn.addEventListener("click", () => {
    isGradientMode = true;
    gradientModeBtn.classList.add("active");
    solidModeBtn.classList.remove("active");
    saveMode("gradient");
  });

  // ── Theme buttons ─────────────────────────────────────────────────
  darkThemeBtn.addEventListener("click", () => {
    settings.scheme = "dark";
    saveSettings();
    applyTheme("dark", "Dark Mode");
  });
  lightThemeBtn.addEventListener("click", () => {
    settings.scheme = "light";
    saveSettings();
    applyTheme("light", "Light Mode");
  });
  randomThemeBtn.addEventListener("click", () => {
    settings.scheme = "dark";
    saveSettings();
    if (isGradientMode) {
      const c1 = generateRandomColor(),
        c2 = generateRandomColor();
      applyTheme(
        "random-gradient",
        `${describeColor(c1)} to ${describeColor(c2)}`,
        null,
        c1,
        c2,
      );
    } else {
      const c = generateRandomColor();
      applyTheme("random", describeColor(c), c);
    }
  });

  // ── Edit Groups ───────────────────────────────────────────────────
  editGroupsBtn.addEventListener("click", async () => {
    showPanel("groups");
    showView("menu");
    if (settings.rememberGroup) {
      const r = await browser.storage.local.get("lastOpenedGroup");
      selectedGroupName = r.lastOpenedGroup || null;
    } else {
      selectedGroupName = null;
    }
    setGroupActionBtnsEnabled(!!selectedGroupName);
    renderYourGroups();
  });
  groupsBackBtn.addEventListener("click", hidePanel);

  // ── Menu: Add Group ───────────────────────────────────────────────
  addGroupBtn.addEventListener("click", async () => {
    const name = await showPrompt(
      "Enter a name for the new group:",
      "Group name",
    );
    if (!name) return;
    browser.runtime
      .sendMessage({ action: "createGroup", groupName: name })
      .then(async () => {
        await showAlert(`Group "${name}" created!`);
        selectedGroupName = null;
        setGroupActionBtnsEnabled(false);
        renderYourGroups();
        updateGroupCountBadge();
      });
  });

  // ── Menu: Open Group ──────────────────────────────────────────────
  openGroupBtn.addEventListener("click", async () => {
    if (!selectedGroupName) return;
    const groups = await getGroupsFromStorage();
    const group = groups.find((g) => g.name === selectedGroupName);
    if (!group) return;
    if (settings.rememberGroup)
      await browser.storage.local.set({ lastOpenedGroup: selectedGroupName });
    openDetailView(group);
  });

  // ── Menu: Rename Group ────────────────────────────────────────────
  renameGroupBtn.addEventListener("click", async () => {
    if (!selectedGroupName) return;
    const newName = await showPrompt(
      `Rename "${selectedGroupName}" to:`,
      "New group name",
    );
    if (!newName || newName === selectedGroupName) return;
    const groups = await getGroupsFromStorage();
    if (groups.some((g) => g.name === newName)) {
      await showAlert(`A group named "${newName}" already exists.`);
      return;
    }
    const group = groups.find((g) => g.name === selectedGroupName);
    if (!group) return;
    group.name = newName;
    await browser.storage.local.set({ groups });
    selectedGroupName = newName;
    await showAlert(`Group renamed to "${newName}"!`);
    renderYourGroups();
  });

  // ── Menu: Remove Group (with confirmation) ────────────────────────
  removeGroupBtn.addEventListener("click", async () => {
    if (!selectedGroupName) return;
    const confirmed = await showConfirm(
      `Delete group "${selectedGroupName}"?\n\nAll themes in this group will be removed.`,
      "Delete",
      true,
    );
    if (!confirmed) return;
    browser.runtime
      .sendMessage({ action: "deleteGroup", deleteGroup: selectedGroupName })
      .then(async (response) => {
        await showAlert(
          response.success
            ? `Group "${selectedGroupName}" deleted.`
            : `Group "${selectedGroupName}" not found.`,
        );
        selectedGroupName = null;
        setGroupActionBtnsEnabled(false);
        renderYourGroups();
        updateGroupCountBadge();
      });
  });

  // ── Detail: Surprise Me ──────────────────────────────────────────
  detailSurpriseBtn.addEventListener("click", () => {
    settings.scheme = "dark";
    saveSettings();
    if (isGradientMode) {
      const c1 = generateRandomColor(),
        c2 = generateRandomColor();
      applyTheme(
        "random-gradient",
        `${describeColor(c1)} to ${describeColor(c2)}`,
        null,
        c1,
        c2,
      );
    } else {
      const c = generateRandomColor();
      applyTheme("random", describeColor(c), c);
    }
  });

  // ── Detail: Add Theme ─────────────────────────────────────────────
  detailAddThemeBtn.addEventListener("click", async () => {
    const result = await browser.storage.local.get([
      "currentThemeName",
      "currentTheme",
      "currentCustomColor",
      "currentGradientColor1",
      "currentGradientColor2",
    ]);
    const currentThemeName = result.currentThemeName || "Default";
    const groups = await getGroupsFromStorage();
    const targetGroup = groups.find((g) => g.name === selectedGroupName);
    if (!targetGroup) return;
    if (targetGroup.groupList.some((t) => t.name === currentThemeName)) {
      await showAlert(`"${currentThemeName}" is already in this group.`);
      return;
    }
    targetGroup.groupList.push({
      name: currentThemeName,
      themeId: result.currentTheme || "default",
      customColor: result.currentCustomColor || null,
      gradientColor1: result.currentGradientColor1 || null,
      gradientColor2: result.currentGradientColor2 || null,
    });
    await browser.storage.local.set({ groups });
    await showAlert(`"${currentThemeName}" added to "${selectedGroupName}"!`);
    openDetailView(targetGroup);
  });

  // ── Detail: Remove Theme (with confirmation) ──────────────────────
  detailRemoveThemeBtn.addEventListener("click", async () => {
    if (!selectedThemeName) return;
    const confirmed = await showConfirm(
      `Remove "${selectedThemeName}" from this group?`,
      "Remove",
      true,
    );
    if (!confirmed) return;
    const groups = await getGroupsFromStorage();
    const targetGroup = groups.find((g) => g.name === selectedGroupName);
    if (!targetGroup) return;
    const idx = targetGroup.groupList.findIndex(
      (t) => t.name === selectedThemeName,
    );
    if (idx === -1) return;
    targetGroup.groupList.splice(idx, 1);
    await browser.storage.local.set({ groups });
    selectedThemeName = null;
    setThemeActionBtnsEnabled(false);
    applyConfirmBar.classList.add("hidden");
    openDetailView(targetGroup);
  });

  // ── Detail: Copy Theme ────────────────────────────────────────────
  detailCopyThemeBtn.addEventListener("click", async () => {
    if (!selectedThemeName) return;
    const groups = await getGroupsFromStorage();
    const others = groups.filter((g) => g.name !== selectedGroupName);
    if (others.length === 0) {
      await showAlert("You need at least two groups to copy a theme.");
      return;
    }
    transferMode = "copy";
    transferDestGroup = null;
    confirmTransferBtn.disabled = true;
    transferTitle.textContent = "Select a Group to Copy to";
    renderTransferPicker(others);
    showView("transfer");
  });

  // ── Detail: Move Theme ────────────────────────────────────────────
  detailMoveThemeBtn.addEventListener("click", async () => {
    if (!selectedThemeName) return;
    const groups = await getGroupsFromStorage();
    const others = groups.filter((g) => g.name !== selectedGroupName);
    if (others.length === 0) {
      await showAlert("You need at least two groups to move a theme.");
      return;
    }
    transferMode = "move";
    transferDestGroup = null;
    confirmTransferBtn.disabled = true;
    transferTitle.textContent = "Select a Group to Move to";
    renderTransferPicker(others);
    showView("transfer");
  });

  // ── Detail: Edit Name ─────────────────────────────────────────────
  detailEditNameBtn.addEventListener("click", async () => {
    if (!selectedThemeName) return;
    const newName = await showPrompt(
      `Rename "${selectedThemeName}" to:`,
      "New theme name",
    );
    if (!newName || newName === selectedThemeName) return;
    const groups = await getGroupsFromStorage();
    const targetGroup = groups.find((g) => g.name === selectedGroupName);
    if (!targetGroup) return;
    const theme = targetGroup.groupList.find(
      (t) => t.name === selectedThemeName,
    );
    if (!theme) return;
    const stored = await browser.storage.local.get("currentThemeName");
    if (stored.currentThemeName === selectedThemeName)
      await browser.storage.local.set({ currentThemeName: newName });
    theme.name = newName;
    await browser.storage.local.set({ groups });
    selectedThemeName = newName;
    await showAlert(`Theme renamed to "${newName}"!`);
    openDetailView(targetGroup);
  });

  // ── Detail: Back ──────────────────────────────────────────────────
  detailBackBtn.addEventListener("click", () => {
    selectedThemeName = null;
    applyConfirmBar.classList.add("hidden");
    showView("menu");
    renderYourGroups();
  });

  // ── Transfer ──────────────────────────────────────────────────────
  cancelTransferBtn.addEventListener("click", () => showView("detail"));
  confirmTransferBtn.addEventListener("click", async () => {
    if (!transferDestGroup || !selectedThemeName) return;
    const groups = await getGroupsFromStorage();
    const sourceGroup = groups.find((g) => g.name === selectedGroupName);
    const targetGroup = groups.find((g) => g.name === transferDestGroup);
    if (!sourceGroup || !targetGroup) return;
    if (targetGroup.groupList.some((t) => t.name === selectedThemeName)) {
      await showAlert(
        `"${selectedThemeName}" is already in "${targetGroup.name}".`,
      );
      return;
    }
    const sourceIdx = sourceGroup.groupList.findIndex(
      (t) => t.name === selectedThemeName,
    );
    const themeObject = sourceGroup.groupList[sourceIdx];
    if (transferMode === "copy") {
      targetGroup.groupList.push({ ...themeObject });
      await browser.storage.local.set({ groups });
      await showAlert(
        `"${selectedThemeName}" copied to "${targetGroup.name}"!`,
      );
      showView("detail");
    } else {
      sourceGroup.groupList.splice(sourceIdx, 1);
      targetGroup.groupList.push(themeObject);
      await browser.storage.local.set({ groups });
      selectedThemeName = null;
      setThemeActionBtnsEnabled(false);
      await showAlert(`"${themeObject.name}" moved to "${targetGroup.name}"!`);
      openDetailView(sourceGroup);
    }
  });

  // ── Apply-on-confirm bar ──────────────────────────────────────────
  applyConfirmYes.addEventListener("click", () => {
    if (!pendingTheme) return;
    const t = pendingTheme;
    pendingTheme = null;
    applyConfirmBar.classList.add("hidden");
    commitApplyTheme(
      t.themeId,
      t.themeName,
      t.customColor,
      t.gradientColor1,
      t.gradientColor2,
    );
  });
  applyConfirmNo.addEventListener("click", () => {
    pendingTheme = null;
    applyConfirmBar.classList.add("hidden");
    document
      .querySelectorAll(".detail-theme-item")
      .forEach((el) => el.classList.remove("selected"));
    selectedThemeName = null;
    setThemeActionBtnsEnabled(false);
  });

  // ── Panel / view helpers ──────────────────────────────────────────
  function showPanel(name) {
    document.getElementById("popup-content").classList.add("hidden-view");
    groupsPanel.classList.toggle("hidden", name !== "groups");
    settingsPanel.classList.toggle("hidden", name !== "settings");
    dtViewGroups.classList.toggle("hidden", name !== "dt-groups");
    dtViewThemes.classList.toggle("hidden", name !== "dt-themes");
  }
  function hidePanel() {
    groupsPanel.classList.add("hidden");
    settingsPanel.classList.add("hidden");
    dtViewGroups.classList.add("hidden");
    dtViewThemes.classList.add("hidden");
    document.getElementById("popup-content").classList.remove("hidden-view");
  }
  function showView(name) {
    [viewMenu, viewDetail, viewTransfer].forEach((v) =>
      v.classList.add("hidden"),
    );
    if (name === "menu") viewMenu.classList.remove("hidden");
    if (name === "detail") viewDetail.classList.remove("hidden");
    if (name === "transfer") viewTransfer.classList.remove("hidden");
  }

  function setGroupActionBtnsEnabled(on) {
    openGroupBtn.disabled =
      renameGroupBtn.disabled =
      removeGroupBtn.disabled =
        !on;
  }
  function setThemeActionBtnsEnabled(on) {
    detailRemoveThemeBtn.disabled =
      detailCopyThemeBtn.disabled =
      detailMoveThemeBtn.disabled =
      detailEditNameBtn.disabled =
        !on;
  }

  async function updateGroupCountBadge() {
    const groups = await getGroupsFromStorage();
    if (groups.length === 0) {
      groupCountBadge.classList.add("hidden");
    } else {
      groupCountBadge.textContent = `[${groups.length}]`;
      groupCountBadge.classList.remove("hidden");
    }
  }

  async function renderYourGroups() {
    const groups = await getGroupsFromStorage();
    const list = document.getElementById("your-groups-list");
    list.innerHTML = "";
    if (groups.length === 0) {
      list.innerHTML = '<p class="no-groups-msg">No groups created</p>';
      setGroupActionBtnsEnabled(false);
      return;
    }
    groups.forEach((group) => {
      const item = document.createElement("div");
      item.className = "your-groups-item";
      if (group.name === selectedGroupName) {
        item.classList.add("selected");
        setGroupActionBtnsEnabled(true);
      }
      const nameEl = document.createElement("span");
      nameEl.className = "group-item-name";
      nameEl.textContent = group.name;
      const badge = document.createElement("span");
      badge.className = "theme-count-badge";
      badge.textContent = `[${group.groupList.length}]`;
      item.append(nameEl, badge);
      item.addEventListener("click", () => {
        const was = item.classList.contains("selected");
        document
          .querySelectorAll(".your-groups-item")
          .forEach((el) => el.classList.remove("selected"));
        if (!was) {
          item.classList.add("selected");
          selectedGroupName = group.name;
          setGroupActionBtnsEnabled(true);
        } else {
          selectedGroupName = null;
          setGroupActionBtnsEnabled(false);
        }
      });
      list.appendChild(item);
    });
  }

  function openDetailView(group) {
    selectedGroupName = group.name;
    selectedThemeName = null;
    setThemeActionBtnsEnabled(false);
    applyConfirmBar.classList.add("hidden");
    detailGroupName.textContent = group.name;
    detailThemesList.innerHTML = "";
    if (group.groupList.length === 0) {
      detailThemesList.innerHTML =
        '<p class="no-groups-msg">No themes in this group yet.</p>';
    } else {
      group.groupList.forEach((theme, index) => {
        const row = document.createElement("div");
        row.className = "theme-row";

        const btn = document.createElement("button");
        btn.className = "detail-theme-item";
        btn.textContent = theme.name || theme;
        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".detail-theme-item")
            .forEach((el) => el.classList.remove("selected"));
          btn.classList.add("selected");
          selectedThemeName = theme.name || theme;
          setThemeActionBtnsEnabled(true);
          if (settings.applyOnClick) {
            applyConfirmBar.classList.add("hidden");
            commitApplyTheme(
              theme.themeId || theme,
              theme.name || theme,
              theme.customColor || null,
              theme.gradientColor1 || null,
              theme.gradientColor2 || null,
            );
          } else {
            pendingTheme = {
              themeId: theme.themeId || theme,
              themeName: theme.name || theme,
              customColor: theme.customColor || null,
              gradientColor1: theme.gradientColor1 || null,
              gradientColor2: theme.gradientColor2 || null,
            };
            applyConfirmName.textContent = `Apply "${theme.name || theme}"?`;
            applyConfirmBar.classList.remove("hidden");
          }
        });

        const upBtn = document.createElement("button");
        upBtn.className = "order-btn";
        upBtn.title = "Move up";
        upBtn.textContent = "▲";
        upBtn.disabled = index === 0;
        upBtn.addEventListener("click", async () => {
          const groups = await getGroupsFromStorage();
          const g = groups.find((gr) => gr.name === selectedGroupName);
          if (!g || index === 0) return;
          [g.groupList[index - 1], g.groupList[index]] = [
            g.groupList[index],
            g.groupList[index - 1],
          ];
          await browser.storage.local.set({ groups });
          openDetailView(g);
          selectedThemeName = theme.name || theme;
          const nb = detailThemesList.querySelectorAll(".detail-theme-item");
          if (nb[index - 1]) nb[index - 1].classList.add("selected");
          setThemeActionBtnsEnabled(true);
        });

        const downBtn = document.createElement("button");
        downBtn.className = "order-btn";
        downBtn.title = "Move down";
        downBtn.textContent = "▼";
        downBtn.disabled = index === group.groupList.length - 1;
        downBtn.addEventListener("click", async () => {
          const groups = await getGroupsFromStorage();
          const g = groups.find((gr) => gr.name === selectedGroupName);
          if (!g || index === g.groupList.length - 1) return;
          [g.groupList[index], g.groupList[index + 1]] = [
            g.groupList[index + 1],
            g.groupList[index],
          ];
          await browser.storage.local.set({ groups });
          openDetailView(g);
          selectedThemeName = theme.name || theme;
          const nb = detailThemesList.querySelectorAll(".detail-theme-item");
          if (nb[index + 1]) nb[index + 1].classList.add("selected");
          setThemeActionBtnsEnabled(true);
        });

        row.append(upBtn, btn, downBtn);
        detailThemesList.appendChild(row);
      });
    }
    showView("detail");
  }

  function renderTransferPicker(groups) {
    transferPickerList.innerHTML = "";
    groups.forEach((group) => {
      const item = document.createElement("div");
      item.className = "picker-item";
      item.textContent = group.name;
      item.addEventListener("click", () => {
        document
          .querySelectorAll("#transfer-picker-list .picker-item")
          .forEach((el) => el.classList.remove("selected"));
        item.classList.add("selected");
        transferDestGroup = group.name;
        confirmTransferBtn.disabled = false;
      });
      transferPickerList.appendChild(item);
    });
  }

  async function getGroupsFromStorage() {
    const result = await browser.storage.local.get("groups");
    return result.groups || [];
  }

  // ── Theme application ─────────────────────────────────────────────
  function applyTheme(
    themeId,
    themeName,
    customColor,
    gradientColor1,
    gradientColor2,
  ) {
    commitApplyTheme(
      themeId,
      themeName,
      customColor,
      gradientColor1,
      gradientColor2,
    );
  }
  function commitApplyTheme(
    themeId,
    themeName,
    customColor,
    gradientColor1,
    gradientColor2,
  ) {
    browser.storage.local
      .set({
        currentTheme: themeId,
        currentThemeName: themeName,
        currentCustomColor: customColor || null,
        currentGradientColor1: gradientColor1 || null,
        currentGradientColor2: gradientColor2 || null,
      })
      .then(() => {
        currentThemeDisplay.textContent = themeName;
        browser.runtime.sendMessage({
          action: "changeTheme",
          theme: themeId,
          customColor,
          gradientColor1,
          gradientColor2,
        });
      })
      .catch((err) => console.error("Error saving theme:", err));
  }

  function loadCurrentTheme() {
    browser.storage.local.get("currentThemeName").then((r) => {
      currentThemeDisplay.textContent = r.currentThemeName || "Default";
    });
  }
  function saveMode(mode) {
    browser.storage.local.set({ colorMode: mode });
  }
  function loadCurrentMode() {
    browser.storage.local.get("colorMode").then((r) => {
      if (r.colorMode === "gradient") {
        isGradientMode = true;
        gradientModeBtn.classList.add("active");
        solidModeBtn.classList.remove("active");
      } else {
        isGradientMode = false;
        solidModeBtn.classList.add("active");
        gradientModeBtn.classList.remove("active");
      }
    });
  }

  // ── Modal helpers ─────────────────────────────────────────────────
  function showAlert(message) {
    return new Promise((resolve) => {
      const overlay = document.getElementById("modal-overlay");
      document.getElementById("modal-message").textContent = message;
      document.getElementById("modal-input").classList.add("hidden");
      document.getElementById("modal-cancel").classList.add("hidden");
      const confirmBtn = document.getElementById("modal-confirm");
      confirmBtn.classList.remove("danger");
      confirmBtn.textContent = "OK";
      overlay.classList.remove("hidden");
      confirmBtn.onclick = () => {
        overlay.classList.add("hidden");
        resolve();
      };
    });
  }

  function showPrompt(message, placeholder) {
    return new Promise((resolve) => {
      const overlay = document.getElementById("modal-overlay");
      const input = document.getElementById("modal-input");
      const confirmBtn = document.getElementById("modal-confirm");
      const cancelBtn = document.getElementById("modal-cancel");
      document.getElementById("modal-message").textContent = message;
      confirmBtn.classList.remove("danger");
      confirmBtn.textContent = "OK";
      input.value = "";
      input.placeholder = placeholder || "";
      input.classList.remove("hidden");
      cancelBtn.classList.remove("hidden");
      overlay.classList.remove("hidden");
      input.focus();
      confirmBtn.onclick = () => {
        overlay.classList.add("hidden");
        resolve(input.value.trim() || null);
      };
      cancelBtn.onclick = () => {
        overlay.classList.add("hidden");
        resolve(null);
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter") confirmBtn.click();
        if (e.key === "Escape") cancelBtn.click();
      };
    });
  }

  // showConfirm — danger=true makes the OK button red
  function showConfirm(message, confirmLabel, danger) {
    return new Promise((resolve) => {
      const overlay = document.getElementById("modal-overlay");
      const confirmBtn = document.getElementById("modal-confirm");
      const cancelBtn = document.getElementById("modal-cancel");
      document.getElementById("modal-message").textContent = message;
      document.getElementById("modal-input").classList.add("hidden");
      confirmBtn.textContent = confirmLabel || "OK";
      confirmBtn.classList.toggle("danger", !!danger);
      cancelBtn.classList.remove("hidden");
      overlay.classList.remove("hidden");
      confirmBtn.onclick = () => {
        overlay.classList.add("hidden");
        resolve(true);
      };
      cancelBtn.onclick = () => {
        overlay.classList.add("hidden");
        resolve(false);
      };
    });
  }

  // ── Color helpers ─────────────────────────────────────────────────
  function generateRandomColor() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
  }
  function describeColor(rgb) {
    const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return "Random Color";
    const r = +m[1],
      g = +m[2],
      b = +m[3];
    const br = (r + g + b) / 3,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat < 0.12) {
      if (br > 220) return "White";
      if (br > 160) return "Silver";
      if (br > 80) return "Gray";
      return "Black";
    }
    let hue;
    if (max === min) hue = 0;
    else if (max === r) hue = 60 * (((g - b) / (max - min)) % 6);
    else if (max === g) hue = 60 * ((b - r) / (max - min) + 2);
    else hue = 60 * ((r - g) / (max - min) + 4);
    if (hue < 0) hue += 360;
    if (hue >= 345 || hue < 15) return br > 100 ? "Scarlet" : "Crimson";
    if (hue < 45) return br > 180 ? "Apricot" : "Amber";
    if (hue < 75) return br > 200 ? "Lemon" : "Yellow";
    if (hue < 150) return br > 160 ? "Emerald" : "Forest Green";
    if (hue < 195) return br > 180 ? "Turquoise" : "Teal";
    if (hue < 240) return br > 160 ? "Sapphire" : "Navy Blue";
    if (hue < 270) return br > 160 ? "Amethyst" : "Deep Purple";
    return br > 160 ? "Fuchsia" : "Magenta";
  }
  function darkenHex(hex, amt) {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (n >> 16) - amt),
      g = Math.max(0, ((n >> 8) & 0xff) - amt),
      b = Math.max(0, (n & 0xff) - amt);
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  function lightenHex(hex, amt) {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, (n >> 16) + amt),
      g = Math.min(255, ((n >> 8) & 0xff) + amt),
      b = Math.min(255, (n & 0xff) + amt);
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  // Blend two hex colors: t=0 returns a, t=1 returns b
  function blendHex(a, b, t) {
    const an = parseInt(a.replace("#", ""), 16);
    const bn = parseInt(b.replace("#", ""), 16);
    const r = Math.round((an >> 16) * (1 - t) + (bn >> 16) * t),
      g = Math.round(((an >> 8) & 0xff) * (1 - t) + ((bn >> 8) & 0xff) * t),
      bv = Math.round((an & 0xff) * (1 - t) + (bn & 0xff) * t);
    return "#" + [r, g, bv].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
});

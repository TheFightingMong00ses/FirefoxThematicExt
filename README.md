# Firefox Theme Manager

> A Firefox extension by **The Fighting Mong00ses** — Project 1  
> Initialized January 22, 2026 · Version 0.0.1

A browser extension that lets Firefox users organize installed themes into named groups, switch between them instantly, and set a default theme that applies automatically on browser startup.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Data Model](#data-model)
- [Storage Schema](#storage-schema)
- [Permissions](#permissions)
- [Getting Started](#getting-started)
- [Development Scripts](#development-scripts)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [UI & Theming](#ui--theming)
- [Known Limitations](#known-limitations)
- [Documentation](#documentation)

---

## Features

- **Dark / Light / Surprise Me** — one-click quick-switch to Firefox's built-in dark and light themes, or a randomly generated solid or gradient color theme
- **Theme Groups** — create named collections of themes, browse them, reorder entries, and apply any theme from within a group
- **Default Theme on Startup** — designate any theme (or group theme) as the default; the background script applies it automatically every time Firefox starts
- **Popup UI Scheme** — the popup's own interface mirrors the active theme context: it switches to dark mode when Dark Mode or Surprise Me is selected, and restores to the user's saved scheme when Light Mode is selected. This state persists across popup opens.
- **Solid / Gradient Mode** — toggle between applying flat custom colors and two-color gradient themes
- **Configurable UI** — three popup size options (small / medium / large), compact mode, and an accent color picker (when on the Blue scheme)
- **Persistent State** — all groups, settings, and the current theme are stored locally via `browser.storage.local` and survive browser restarts

---

## Architecture

The extension follows the standard WebExtensions two-process model:

```
┌──────────────────────────────────────────────────────┐
│                   Firefox Browser                    │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │             Popup Process                     │   │
│  │  popup.html / popup.css / popup.js            │   │
│  │  · UI rendering & user interactions           │   │
│  │  · Reads/writes browser.storage.local         │   │
│  │  · Sends messages to background               │   │
│  └─────────────────────┬─────────────────────────┘   │
│                        │ browser.runtime.sendMessage  │
│  ┌─────────────────────▼─────────────────────────┐   │
│  │           Background Process                  │   │
│  │  group_class.js · mongoose.js                 │   │
│  │  · In-memory group state (mirrors storage)    │   │
│  │  · Applies themes via browser.theme API       │   │
│  │  · Applies default theme on browser startup   │   │
│  └───────────────────────────────────────────────┘   │
│                        │                             │
│           browser.theme / browser.management         │
│                        │                             │
│  ┌─────────────────────▼─────────────────────────┐   │
│  │           Firefox Theme Engine                │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Background Scripts

**`group_class.js`** — defines the `Group` class. Each instance holds a `name` and a `groupList` array of theme name strings. Provides instance methods for adding, removing, cycling (next / previous / random), and clearing themes. Loaded first so `Group` is globally available to the next script.

**`mongoose.js`** — the background script that:
- Loads persisted groups from `browser.storage.local` into an in-memory `groups` array on extension startup
- Applies the user's designated default theme on `browser.runtime.onStartup`
- Listens for messages from the popup and dispatches group CRUD operations (`createGroup`, `getGroups`, `renameGroup`, `deleteGroup`, `addThemeToGroup`, `removeThemeFromGroup`, `moveTheme`, `reorderTheme`) and theme application (`changeTheme`)
- Applies themes via `browser.theme.update()` for custom colors/gradients, or `browser.management.setEnabled()` for installed Firefox themes

### Popup

**`popup.html`** — the extension popup markup. Contains the main view (mode toggle, theme status pill, action buttons), the Settings panel, and the Groups panel (menu → group detail → theme picker / transfer views).

**`popup.js`** — all popup logic in a single DOMContentLoaded closure. Responsibilities:
- Loading and saving settings (`browser.storage.local`)
- Applying UI scheme classes to `document.body` (`scheme-blue`, `scheme-dark`, `scheme-light`, size and compact variants)
- Managing the `surpriseActive` transient flag that forces the popup into dark mode when Dark Mode or Surprise Me is active, and restores the saved scheme when Light Mode is selected
- All group panel views: list, detail, add/rename/delete, theme picker, copy/move transfer
- Modal dialog (shared prompt/confirm/alert)
- Default theme selection sub-views

**`popup.css`** — GX-inspired visual design. Key characteristics:
- Sharp geometry (`--radius: 2px`) echoing Opera GX's aesthetic
- Left-side accent bars on structural elements using `::before` pseudo-elements with a blue-to-gold gradient derived from the extension icon's color palette
- CSS custom properties for full theming (`--accent`, `--bg`, `--surface`, `--border`, `--text`, etc.) with `@media (prefers-color-scheme: dark)` auto-switching and explicit `scheme-*` body class overrides
- Rajdhani (display) + DM Sans (body) Google Fonts
- Staggered `btnIn` entrance animations, glowing accent dot in the theme status pill, panel slide-in transitions

---

## File Structure

```
/
├── manifest.json              # Extension manifest (MV2)
├── package.json               # Dev tooling dependencies & npm scripts
├── api.js                     # (Utility — see inline docs)
├── icons/
│   ├── icon.png               # Original icon
│   └── icon-redux.png         # Active icon (used in manifest)
├── src/
│   ├── background/
│   │   ├── group_class.js     # Group class definition
│   │   └── mongoose.js        # Background script & message router
│   └── popup/
│       ├── popup.html         # Popup markup
│       ├── popup.js           # Popup logic
│       └── popup.css          # Popup styles (GX edition)
├── test/
│   ├── mongoose.test.js       # Mocha unit tests for background logic
│   └── setup.js               # Test environment setup (sinon-chrome)
└── Documentation/
    ├── ProjectPlan.txt
    ├── SYSTEM_DESIGN.md
    ├── GIT_WORKFLOW.md
    ├── CI-CD-PIPELINE-GUIDE.md
    └── FIXING-ESLINT-ERRORS.md
```

---

## Data Model

### Group (in-memory, `group_class.js`)

```javascript
{
  name: String,       // Display name for the group
  groupList: [String] // Ordered array of theme name strings
}
```

### Stored Group (serialized to `browser.storage.local`)

```javascript
{
  name: String,
  groupList: [{ name: String, themeId: String }]
}
```

---

## Storage Schema

All data lives under `browser.storage.local`. Keys used by the extension:

| Key | Type | Description |
|-----|------|-------------|
| `popupSettings` | Object | User preferences (see below) |
| `groups` | Array | Serialized group objects |
| `currentTheme` | String | Theme ID of the last applied theme |
| `currentThemeName` | String | Display name of the last applied theme |
| `currentCustomColor` | String \| null | Hex color for the last custom solid theme |
| `currentGradientColor1` | String \| null | First gradient color |
| `currentGradientColor2` | String \| null | Second gradient color |
| `colorMode` | String | `"solid"` or `"gradient"` |
| `popupForceDark` | Boolean | Whether the popup should open in dark mode (true unless last applied theme was Light Mode) |

### `popupSettings` object

```javascript
{
  size: "small" | "medium" | "large",  // Popup width/font scale
  scheme: "blue" | "dark" | "light",   // Popup color scheme
  accent: String,                       // Hex accent color (blue scheme only)
  compact: Boolean,                     // Tighter padding mode
  showModeToggle: Boolean,              // Show/hide Solid/Gradient toggle
  applyOnClick: Boolean,                // Apply theme immediately on group item click
  rememberGroup: Boolean,               // Re-open last viewed group on launch
  defaultTheme: Object | null,          // { name, themeId, customColor, ... }
  bannerDismissed: Boolean              // Whether the "select default theme" banner was dismissed
}
```

---

## Permissions

Declared in `manifest.json`:

| Permission | Why it's needed |
|-----------|-----------------|
| `storage` | Persist groups, settings, and current theme state |
| `theme` | Apply custom color/gradient themes via `browser.theme.update()` |
| `management` | Enable installed Firefox themes via `browser.management.setEnabled()` |

---

## Getting Started

### Prerequisites

- Firefox (any recent release)
- Node.js v24.x
- npm v11.x

### Install dev dependencies

```bash
npm install
```

This also installs the Husky pre-commit hooks automatically via the `prepare` script.

### Load the extension in Firefox

```bash
npm run ext:run
```

This uses `web-ext` to launch a temporary Firefox profile with the extension loaded. Alternatively, load it manually:

1. Navigate to `about:debugging` in Firefox
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `manifest.json` from the project root

### Run all checks before committing

```bash
npm run check
```

This runs ESLint, Prettier format check, and `web-ext lint` in sequence.

---

## Development Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| Run extension | `npm run ext:run` | Launch Firefox with extension via web-ext |
| Lint | `npm run lint` | ESLint across all JS/MJS files |
| Lint + fix | `npm run lint:fix` | ESLint with auto-fix |
| Format | `npm run format` | Prettier write (auto-formats) |
| Format check | `npm run format:check` | Prettier read-only check (used in CI) |
| Extension lint | `npm run ext:lint` | web-ext lint (manifest + structure validation) |
| All checks | `npm run check` | lint + format:check + ext:lint |
| Tests | `npm test` | Mocha unit tests |

---

## Git Workflow

The team follows a feature-branch workflow. `main` is always deployable.

```bash
# Start new work
git checkout main
git pull origin main
git checkout -b your-feature-name

# Before pushing — sync with main first
git checkout main && git pull origin main
git checkout your-feature-name && git merge main

# Push and open a PR
git push origin your-feature-name
```

Pull requests require at least one teammate review. Merge via **Squash and merge** on GitHub, then delete the branch. See [`Documentation/GIT_WORKFLOW.md`](Documentation/GIT_WORKFLOW.md) for the full guide including conflict resolution and hotfix procedures.

### Branch naming conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/group-reorder` |
| Bug fix | `fix/short-description` | `fix/popup-gap` |
| Cosmetic / UI | `cosmetic-description` | `cosmetic-popup-redesign` |
| Hotfix | `hotfix/short-description` | `hotfix/storage-crash` |

---

## Testing

Tests live in `test/` and run via Mocha with sinon-chrome for browser API mocking.

```bash
npm test
```

Coverage is collected via `c8`. The test setup in `test/setup.js` configures the sinon-chrome environment so background script logic can be tested without a real browser runtime.

---

## UI & Theming

The popup supports three explicit color schemes selectable in Settings, plus automatic dark/light switching:

| Scheme | Body class | Behavior |
|--------|-----------|----------|
| Blue (default) | `scheme-blue` | Accent colors from icon palette; follows `prefers-color-scheme` for surfaces |
| Dark | `scheme-dark` | Forces full dark palette regardless of system preference |
| Light | `scheme-light` | Forces full light palette regardless of system preference |

The popup also has a transient dark-mode override (`surpriseActive` flag in `popup.js`) that applies `scheme-dark` visually whenever the user applies a Dark Mode or Surprise Me theme, without permanently changing the saved scheme. This state is persisted as `popupForceDark` in storage so it survives the popup being closed and reopened. It resets to `false` when the user applies Light Mode.

Three popup sizes are available (small / medium / large) and a compact mode for tighter padding. These are applied as body classes (`size-small`, `size-medium`, `size-large`, `compact`) and drive CSS custom property overrides for font sizes, padding, gap, and popup width.

---

## Known Limitations

- **Manifest V2** — the extension uses MV2, which Firefox still fully supports. Future migration to MV3 will require reworking the background scripts to a service-worker model.
- **No cloud sync** — all data is stored locally via `browser.storage.local`. Groups and settings do not sync across devices or profiles.
- **Theme creation** — the extension manages and switches between existing installed Firefox themes; it does not create themes from scratch.
- **Mobile** — designed and tested for Firefox desktop only.

---

## Documentation

| Document | Location | Description |
|----------|----------|-------------|
| System Design | [`Documentation/SYSTEM_DESIGN.md`](Documentation/SYSTEM_DESIGN.md) | Full architecture, data models, and design decisions |
| Git Workflow | [`Documentation/GIT_WORKFLOW.md`](Documentation/GIT_WORKFLOW.md) | Branching strategy, PR process, conflict resolution |
| CI/CD Pipeline | [`Documentation/CI-CD-PIPELINE-GUIDE.md`](Documentation/CI-CD-PIPELINE-GUIDE.md) | GitHub Actions setup and pipeline guide |
| ESLint Guide | [`Documentation/FIXING-ESLINT-ERRORS.md`](Documentation/FIXING-ESLINT-ERRORS.md) | Common lint errors and how to resolve them |
| Project Plan | [`Documentation/ProjectPlan.txt`](Documentation/ProjectPlan.txt) | Original project scope and milestone plan |

---

*The Fighting Mong00ses · Spring 2026*

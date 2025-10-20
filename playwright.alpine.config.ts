import { defineConfig } from "@playwright/test"
import baseConfig, { getWebServer } from "./playwright.config"

process.env.FRAMEWORK = process.env.FRAMEWORK || "alpine"
const webServer = getWebServer()

export default defineConfig({
  ...baseConfig,
  webServer,
  use: {
    baseURL: webServer.url,
  },

  testMatch: [
    "**/accordion.e2e.ts",
    "**/angle-slider.e2e.ts",
    "**/avatar.e2e.ts",
    "**/bottom-sheet.e2e.ts",
    "**/carousel.e2e.ts",
    "**/checkbox.e2e.ts",
    "**/clipboard.e2e.ts",
    "**/collapsible.e2e.ts",
    "**/color-picker.e2e.ts",
    "**/combobox.e2e.ts",
    "**/context-menu.e2e.ts",
    "**/date-picker.e2e.ts",
    "**/dialog.e2e.ts",
    "**/editable.e2e.ts",
    "**/file-upload.e2e.ts",
    "**/hover-card.e2e.ts",
    // "**/image-cropper.e2e.ts",
    // "**/listbox.e2e.ts",
    // "**/menu-nested.e2e.ts",
    // "**/menu-option.e2e.ts",
    "**/menu.e2e.ts",
    // "**/navigation-menu.e2e.ts",
    "**/number-input.e2e.ts",
    // "**/pagination.e2e.ts",
    "**/password-input.e2e.ts",
    "**/pin-input.e2e.ts",
    "**/popover.e2e.ts",
    "**/radio-group.e2e.ts",
    "**/rating-group.e2e.ts",
    // "**/select.e2e.ts",
    "**/slider.e2e.ts",
    // "**/splitter.e2e.ts",
    "**/switch.e2e.ts",
    "**/tabs.e2e.ts",
    "**/tags-input.e2e.ts",
    // "**/toast.e2e.ts",
    "**/toggle-group.e2e.ts",
    // "**/tooltip.e2e.ts",
    // "**/tour.e2e.ts",
    // "**/tree-view.e2e.ts",
  ],
})

import { expect } from "@playwright/test"
import { test } from "./_test"
import { NavigationMenuModel } from "./models/navigation-menu.model"

let I: NavigationMenuModel

const seeViewportSize = async () => {
  const viewport = I.getViewport()
  await expect(viewport).toHaveCSS("--viewport-width", /\d+px/)
  await expect(viewport).toHaveCSS("--viewport-height", /\d+px/)
}

test.describe("navigation-menu / default value", () => {
  test.beforeEach(async ({ page }) => {
    I = new NavigationMenuModel(page)
    await I.goto("default-value")
  })

  test("should be open on load", async () => {
    await I.seeContent("products")
  })

  test("should measure the viewport on load", async () => {
    await I.seeContent("products")
    await seeViewportSize()
  })

  test("should close when pressing escape", async () => {
    await I.seeContent("products")
    await I.pressKey("Escape")
    await I.dontSeeContent("products")
  })

  test("should close when clicking outside", async () => {
    await I.seeContent("products")
    await I.clickOutside()
    await I.dontSeeContent("products")
  })
})

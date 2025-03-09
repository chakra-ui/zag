import { test } from "@playwright/test"
import { NavigationMenuModel } from "./models/navigation-menu.model"

let I: NavigationMenuModel

test.describe.skip("navigation-menu", () => {
  test.beforeEach(async ({ page }) => {
    I = new NavigationMenuModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("should open on hover", async () => {
    await I.hoverTrigger("products")
    await I.seeContent("products")
  })

  test("should open on click", async () => {
    await I.clickTrigger("products")
    await I.seeContent("products")
  })

  test("should close when clicking outside", async () => {
    await I.clickTrigger("products")
    await I.seeContent("products")
    await I.clickOutside()
    await I.dontSeeContent("products")
  })

  test("should close when pressing escape", async () => {
    await I.clickTrigger("products")
    await I.seeContent("products")
    await I.pressKey("Escape")
    await I.dontSeeContent("products")
  })

  test("trigger switch, using hover", async () => {
    await I.hoverTrigger("products")
    await I.seeContent("products")
    await I.hoverTrigger("company")
    await I.seeContent("company")
    await I.dontSeeContent("products")
  })

  test("trigger switch, using the keyboard", async () => {
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.seeContent("products")
    await I.pressKey("Enter")
    await I.dontSeeContent("products")

    await I.pressKey("Tab")
    await I.pressKey("Enter")
    await I.seeContent("company")
    await I.dontSeeContent("products")
  })

  test("hover + focus should toggle content", async () => {
    await I.hoverTrigger("products")
    await I.seeContent("products")
    await I.clickTrigger("products")
    await I.dontSeeContent("products")

    // hover again (nothing should happen)
    await I.hoverTrigger("products")
    await I.dontSeeContent("products")
  })

  test("focus link on tab", async () => {
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")
  })

  test("tab navigation", async () => {
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab", 7)

    await I.seeTriggerIsFocused("company")
    await I.pressKey("Enter")
    await I.seeContent("company")
    await I.dontSeeContent("products")

    await I.pressKey("Tab", 5)
    await I.seeLinkIsFocused("pricing")

    // focus outside
    await I.pressKey("Tab")
    await I.dontSeeContent("company")
    await I.dontSeeContent("products")
  })
})

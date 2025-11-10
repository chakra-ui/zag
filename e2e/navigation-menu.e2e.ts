import { test } from "@playwright/test"
import { NavigationMenuModel } from "./models/navigation-menu.model"

let I: NavigationMenuModel

test.describe("navigation-menu", () => {
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

  test("hover, click to close, hover out and back in", async () => {
    // hover to open
    await I.hoverTrigger("products")
    await I.seeContent("products")

    // click to close
    await I.clickTrigger("products")
    await I.dontSeeContent("products")

    // keep hovering (should not re-open)
    await I.hoverTrigger("products")
    await I.dontSeeContent("products")

    // hover out
    await I.hoverTrigger("company")
    await I.dontSeeContent("products")

    // hover back in (should open now)
    await I.hoverTrigger("products")
    await I.seeContent("products")
  })

  test("keyboard open, mouse hover, escape close, then continue", async () => {
    // open with keyboard
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.seeContent("products")

    // continue interaction with mouse by hovering
    await I.hoverTrigger("company")
    await I.seeContent("company")
    await I.dontSeeContent("products")

    // close with escape key
    await I.pressKey("Escape")
    await I.dontSeeContent("company")

    // continue interaction with mouse
    await I.hoverTrigger("products")
    await I.seeContent("products")

    // close with escape again
    await I.pressKey("Escape")
    await I.dontSeeContent("products")

    // continue interaction with keyboard
    await I.focusTrigger("company")
    await I.pressKey("Enter")
    await I.seeContent("company")
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

    await I.pressKey("Tab", 6)
    await I.seeLinkIsFocused("pricing")

    // focus outside
    await I.pressKey("Tab")
    await I.dontSeeContent("company")
    await I.dontSeeContent("products")
  })

  test("focus restoration after escape", async () => {
    // open with keyboard and tab into content
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.seeContent("products")
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // close with escape - focus should return to trigger
    await I.pressKey("Escape")
    await I.dontSeeContent("products")
    await I.seeTriggerIsFocused("products")
  })

  test("shift+tab navigation (backwards)", async () => {
    // navigate forward to pricing link
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab", 7)
    await I.seeTriggerIsFocused("company")

    // navigate backwards with Shift+Tab
    await I.pressKey("Shift+Tab", 6)
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // continue backwards
    await I.pressKey("Shift+Tab")
    await I.seeTriggerIsFocused("products")
  })

  test("arrow key navigation between triggers", async () => {
    await I.focusTrigger("products")
    await I.seeTriggerIsFocused("products")

    // arrow right to next trigger
    await I.pressKey("ArrowRight")
    await I.seeTriggerIsFocused("company")

    // arrow right to next trigger
    await I.pressKey("ArrowRight")
    await I.seeLinkIsFocused("pricing")

    // arrow left to previous trigger
    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("company")

    // arrow left to previous trigger
    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("products")
  })

  test("opening with enter vs space key", async () => {
    // open with Enter
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.seeContent("products")
    await I.pressKey("Escape")

    // open with Space
    await I.focusTrigger("products")
    await I.pressKey(" ")
    await I.seeContent("products")
  })
})

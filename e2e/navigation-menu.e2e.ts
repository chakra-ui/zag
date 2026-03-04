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
    await I.pressKey("ArrowRight", 2)
    await I.seeLinkIsFocused("pricing")

    // arrow left to previous trigger
    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("developers")

    // arrow left to previous trigger
    await I.pressKey("ArrowLeft")
    await I.seeTriggerIsFocused("company")
  })

  test("Home and End key navigation on triggers", async () => {
    // start at company trigger (middle)
    await I.focusTrigger("company")
    await I.seeTriggerIsFocused("company")

    // press Home to jump to first trigger
    await I.pressKey("Home")
    await I.seeTriggerIsFocused("products")

    // press End to jump to last element
    await I.pressKey("End")
    await I.seeLinkIsFocused("pricing")

    // press Home again to return to first
    await I.pressKey("Home")
    await I.seeTriggerIsFocused("products")
  })

  test("arrow down navigation within content", async () => {
    // open content and tab to first link
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // navigate down to next link
    await I.pressKey("ArrowDown")
    await I.seeContentLinkIsFocused("products", "Customer Engagement")

    // navigate down to next link
    await I.pressKey("ArrowDown")
    await I.seeContentLinkIsFocused("products", "Marketing Automation")
  })

  test("arrow up navigation within content", async () => {
    // open content and tab to first link, then move down
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.pressKey("ArrowDown", 2)
    await I.seeContentLinkIsFocused("products", "Marketing Automation")

    // navigate up to previous link
    await I.pressKey("ArrowUp")
    await I.seeContentLinkIsFocused("products", "Customer Engagement")

    // navigate up to previous link
    await I.pressKey("ArrowUp")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")
  })

  test("Home and End key navigation in content", async () => {
    // open content and tab to first link, then move to middle
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.pressKey("ArrowDown", 2)
    await I.seeContentLinkIsFocused("products", "Marketing Automation")

    // press Home to jump to first link
    await I.pressKey("Home")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // press End to jump to last link
    await I.pressKey("End")
    await I.seeContentLinkIsFocused("products", "API Documentation")

    // press Home again to return to first
    await I.pressKey("Home")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")
  })

  test("arrow navigation does not loop in content", async () => {
    // open content and tab to first link
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // try to navigate up from first link - should stay on first
    await I.pressKey("ArrowUp")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // navigate to last link
    await I.pressKey("ArrowDown", 5)
    await I.seeContentLinkIsFocused("products", "API Documentation")

    // try to navigate down from last link - should stay on last
    await I.pressKey("ArrowDown")
    await I.seeContentLinkIsFocused("products", "API Documentation")
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

  test("switching menus is instant when one is open", async () => {
    // open first menu with hover
    await I.hoverTrigger("products")
    await I.wait(250)
    await I.seeContent("products")

    // hover to second trigger - should switch instantly (no delay)
    await I.hoverTrigger("company")

    // should immediately see new content (no need to wait for open delay)
    await I.seeContent("company")
    await I.dontSeeContent("products")
  })

  test("focus moves from content to trigger does not close", async () => {
    // open content and tab to link
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // shift+tab back to trigger
    await I.pressKey("Shift+Tab")
    await I.seeTriggerIsFocused("products")

    // content should still be visible
    await I.seeContent("products")
  })

  test("focus moves from trigger to content does not close", async () => {
    // open content with keyboard
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.seeContent("products")

    // tab to content
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // content should still be visible
    await I.seeContent("products")
  })

  test("escape from different positions in content restores focus", async () => {
    // open and navigate to third link
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.pressKey("ArrowDown", 2)
    await I.seeContentLinkIsFocused("products", "Marketing Automation")

    // escape should close and focus trigger
    await I.pressKey("Escape")
    await I.dontSeeContent("products")
    await I.seeTriggerIsFocused("products")
  })

  test("opening multiple menus maintains proper tab order", async () => {
    // open and close products
    await I.focusTrigger("products")
    await I.pressKey("Enter")
    await I.seeContent("products")
    await I.pressKey("Escape")

    // open company
    await I.focusTrigger("company")
    await I.pressKey("Enter")
    await I.seeContent("company")

    // tab through content
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("company", "About Us")

    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("company", "Leadership Team")
  })

  test("hover open and keyboard close restores proper state", async () => {
    // open with hover
    await I.hoverTrigger("products")
    await I.wait(250)
    await I.seeContent("products")

    // tab into content
    await I.focusTrigger("products")
    await I.pressKey("Tab")
    await I.seeContentLinkIsFocused("products", "Analytics Platform")

    // close with escape
    await I.pressKey("Escape")
    await I.dontSeeContent("products")
    await I.seeTriggerIsFocused("products")

    // should be able to open again
    await I.pressKey("Enter")
    await I.seeContent("products")
  })

  test("hover to open, click same trigger twice rapidly", async () => {
    // hover to open
    await I.hoverTrigger("products")
    await I.wait(250)
    await I.seeContent("products")

    // click once to close
    await I.clickTrigger("products")
    await I.dontSeeContent("products")

    // immediately click again - should not reopen
    await I.clickTrigger("products")
    await I.seeContent("products")
  })

  test("escape during close delay cancels the close", async () => {
    // open with click
    await I.clickTrigger("products")
    await I.seeContent("products")

    // hover away to start close delay
    await I.clickOutside()

    // press escape before close delay completes
    await I.wait(100)
    await I.pressKey("Escape")

    // should close immediately
    await I.dontSeeContent("products")
  })

  test("multiple menus rapid switching", async () => {
    // open first
    await I.hoverTrigger("products")
    await I.wait(250)
    await I.seeContent("products")

    // quickly switch multiple times
    await I.hoverTrigger("company")
    await I.seeContent("company")

    await I.hoverTrigger("developers")
    await I.seeContent("developers")

    await I.hoverTrigger("products")
    await I.seeContent("products")

    // verify final state is correct
    await I.seeContent("products")
    await I.dontSeeContent("company")
    await I.dontSeeContent("developers")
  })
})

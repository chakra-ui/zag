import { test } from "@playwright/test"
import { PopoverModel } from "./models/popover.model"

let I: PopoverModel

test.describe("popover", () => {
  test.beforeEach(async ({ page }) => {
    I = new PopoverModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("[autoFocus=true] should move focus inside the popover content to the first focusable element", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeLinkIsFocused()
  })

  test("[autoFocus=false] should not focus the content", async () => {
    await I.controls.bool("autoFocus", false)
    await I.clickTrigger()
    await I.seeContentIsNotFocused()
  })

  test("[keyboard] should open the Popover on press `Enter`", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeContent()
  })

  test("[keyboard] should close the Popover on press `Escape`", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeContent()
    await I.pressKey("Escape")
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("[keyboard / modal] on tab: should trap focus within popover content", async () => {
    await I.controls.bool("modal", true)

    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeLinkIsFocused()
    await I.pressKey("Tab", 3)
    await I.seeLinkIsFocused()
  })

  test("[keyboard / non-modal] on tab outside: should move focus to next tabbable element after button", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeContent()
    await I.pressKey("Tab", 3)
    await I.seeButtonAfterIsFocused()
  })

  test("[keyboard / non-modal] on shift-tab outside: should move focus to trigger", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeContent()
    await I.pressKey("Shift+Tab")
    await I.seeTriggerIsFocused()
    await I.seeContent()
  })

  test("[pointer] close the popover on click close button", async () => {
    await I.clickTrigger()
    await I.clickClose()
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("[pointer] should to open/close a popover on trigger click", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.clickTrigger()
    await I.dontSeeContent()
  })

  test.skip("[pointer] when clicking outside, should re-focus the button", async () => {
    await I.clickTrigger()
    await I.clickOutside()
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("[pointer] when clicking outside on focusable element, should not re-focus the button", async () => {
    await I.clickTrigger()
    await I.clickButtonBefore()
    await I.seeButtonBeforeIsFocused()
    await I.dontSeeContent()
  })
})

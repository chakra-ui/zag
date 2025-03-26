import { test } from "@playwright/test"
import { ClipboardModel } from "./models/clipboard.model"

let I: ClipboardModel

test.describe("clipboard", () => {
  test.beforeEach(async ({ page }) => {
    I = new ClipboardModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("should copy content to clipboard", async () => {
    await I.clickTrigger()
    await I.seeContent("Copied!")
    await I.dontSeeContent("Copy")
  })

  test("should focus on trigger", async () => {
    await I.focusTrigger()
    await I.seeTriggerIsFocused()
  })
})

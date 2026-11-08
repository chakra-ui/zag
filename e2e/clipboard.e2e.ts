import { expect, test } from "./_test"
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

  test("should copy the value to the clipboard", async () => {
    await I.clickTrigger()
    await I.seeCopied()
    expect(await I.readClipboard()).toBe("https://github.com/chakra-ui/zag")
  })

  test("should reset after the timeout and report it", async () => {
    await I.controls.num("timeout", "500")
    await I.clickTrigger()
    await I.seeCopied()
    await I.seeNotCopied()
    await I.seeStatusReports("copied,reset")
  })

  test("should restart the timeout when copying again", async () => {
    await I.controls.num("timeout", "1000")
    await I.clickTrigger()
    await I.wait(700)
    await I.clickTrigger()
    // 1.4s after the first copy, but only 0.7s after the second
    await I.wait(700)
    await I.seeCopied()
  })

  test("should mark a copy from the input as copied", async () => {
    await I.copyFromInput()
    await I.seeCopied()
    expect(await I.readClipboard()).toBe("https://github.com/chakra-ui/zag")
  })

  test("should not show copied when writing fails", async () => {
    await I.denyClipboardWrite()
    await I.clickTrigger()
    await I.seeStatusReports("error")
    await I.seeNotCopied()
  })

  test("should report an error when the Clipboard API is missing", async () => {
    await I.removeClipboardApi()
    await I.clickTrigger()
    await I.seeStatusReports("error")
    await I.seeNotCopied()
  })

  test("should focus on trigger", async () => {
    await I.focusTrigger()
    await I.seeTriggerIsFocused()
  })
})

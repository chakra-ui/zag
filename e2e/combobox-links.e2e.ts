import { expect, test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / links", () => {
  const modKey = process.platform === "darwin" ? "metaKey" : "ctrlKey"

  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/links")
    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeHighlightedItem()
  })

  test("modifier + Enter opens the highlighted link in a new tab", async ({ page }) => {
    const newPage = await I.waitForNewPage(() => I.pressKey("ControlOrMeta+Enter"))

    await expect(newPage).toHaveURL(/\/combobox\/basic$/)
    await expect(page).toHaveURL(/\/combobox\/links$/)
    await I.seeSelection({ itemValue: "/combobox/basic", modifiers: { [modKey]: true, shiftKey: false } })
  })

  test("modifier + click opens the link in a new tab and reports the selection", async ({ page }) => {
    const newPage = await I.waitForNewPage(() => I.clickItemWithModifiers("Basic", ["ControlOrMeta"]))

    await expect(newPage).toHaveURL(/\/combobox\/basic$/)
    await expect(page).toHaveURL(/\/combobox\/links$/)
    await I.seeSelection({ itemValue: "/combobox/basic", modifiers: { [modKey]: true } })
  })

  test("shift + Enter opens the highlighted link in a new window", async ({ page }) => {
    const newPage = await I.waitForNewPage(() => I.pressKey("Shift+Enter"))

    await expect(newPage).toHaveURL(/\/combobox\/basic$/)
    await expect(page).toHaveURL(/\/combobox\/links$/)
    await I.seeSelection({ itemValue: "/combobox/basic", modifiers: { shiftKey: true } })
  })
})

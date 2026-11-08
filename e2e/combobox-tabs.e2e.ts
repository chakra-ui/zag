import { expect, test, type Page } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

const seeTabIsSelectedAndFocused = async (page: Page, name: RegExp) => {
  const tab = page.getByRole("tab", { name })
  await expect(tab).toHaveAttribute("aria-selected", "true")
  await expect(tab).toHaveAttribute("data-focus", "")
}

test.describe("combobox / tabs", () => {
  test.skip(!!process.env.FRAMEWORK && !["react", "preact"].includes(process.env.FRAMEWORK), "React and Preact example")

  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/tabs")
  })

  test("[autoHighlight] highlights first item when the highlighted item is removed while navigating", async () => {
    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Docs")
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Examples")

    // switch to "Page" tab: highlighted item still exists, so highlight is preserved
    await I.pressKey("ArrowRight")
    await I.seeItemIsHighlighted("Examples")

    // switch to "Component" tab: highlighted item is removed, so first item is highlighted
    await I.page.getByRole("tab", { name: /Component/ }).click()
    await I.seeItemIsHighlighted("Select Tabs")
  })

  test("arrow keys move the tabs' virtual focus while the input keeps focus", async () => {
    await I.focusInput()
    await I.pressKey("ArrowDown")
    await I.pressKey("ArrowRight")
    await seeTabIsSelectedAndFocused(I.page, /Page/)
    await I.seeInputIsFocused()

    await I.pressKey("ArrowLeft")
    await seeTabIsSelectedAndFocused(I.page, /All/)
    await I.seeInputIsFocused()
  })
})

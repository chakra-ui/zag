import { expect, test } from "./_test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("context menu", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/context-menu/basic")
  })

  test("should open on right click", async () => {
    await I.clickContextTrigger({ button: "right" })

    await I.seeDropdown()
    await I.seeDropdownIsFocused()

    await I.pressKey("Escape")
    await I.dontSeeDropdown()
  })

  test("keyboard navigation works", async () => {
    await I.clickContextTrigger({ button: "right" })

    await I.seeDropdown()
    await I.seeDropdownIsFocused()

    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Delete")
  })

  test("should reposition when right-clicking at same coordinates", async () => {
    // Right click to open context menu
    await I.clickContextTrigger({ button: "right" })
    await I.seeDropdown()
    await I.seeMenuIsPositioned()

    // Left click to close menu without moving mouse
    await I.clickContextTrigger({ button: "left" })
    await I.dontSeeDropdown()

    // Right click again at same coordinates
    await I.clickContextTrigger({ button: "right" })
    await I.seeDropdown()
    await I.seeMenuIsPositioned()
  })

  test("should open at the touch point on long-press", async () => {
    const point = await I.getContextTriggerPoint()
    await I.longPressContextTrigger(point)

    // the long-press timer opens the menu after 700ms
    await I.seeDropdown()
    await I.seeMenuIsPositionedNear(point)
  })
})

test.describe("context menu / controlled", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/context-menu/controlled")
  })

  test("should not open on tap", async ({ page }) => {
    const point = await I.getContextTriggerPoint()
    await I.tapContextTrigger(point)

    await page.waitForTimeout(1000)
    await I.dontSeeDropdown()
  })
})

for (const example of ["basic", "lazy-mount", "controlled"]) {
  test.describe(`context menu / ${example} / return focus`, () => {
    test.beforeEach(async ({ page }) => {
      I = new MenuModel(page)
      await I.goto(`/context-menu/${example}`)
      await I.openContextMenuWithKeyboard()
      await I.seeDropdownIsFocused()
    })

    test("should return focus to the trigger on escape", async () => {
      await I.pressKey("Escape")
      await I.dontSeeDropdown()
      await I.seeContextTriggerIsFocused()
    })

    test("should return focus to the trigger after keyboard selection", async () => {
      await I.pressKey("ArrowDown")
      await I.pressKey("Enter")
      await I.dontSeeDropdown()
      await I.seeContextTriggerIsFocused()
    })

    test("should keep focus on an outside control that dismisses the menu", async ({ page }) => {
      await page.evaluate(() => {
        const input = document.createElement("input")
        input.id = "outside-input"
        document.querySelector("main")!.append(input)
      })
      await page.click("#outside-input")
      await I.dontSeeDropdown()
      await expect(page.locator("#outside-input")).toBeFocused()
    })
  })
}

test("context menu / should keep focus in the menu when it reopens before focus returns", async ({ page }) => {
  I = new MenuModel(page)
  await I.goto("/context-menu/basic")
  await I.openContextMenuWithKeyboard()
  await I.seeDropdownIsFocused()

  // Close and reopen in the same task, before the deferred focus return runs
  await page.evaluate(() => {
    const content = document.querySelector("[data-menu-content]")!
    const trigger = document.querySelector("[data-menu-context-trigger]")!
    content.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))
    trigger.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: -1 }))
  })

  await I.seeDropdown()
  await I.seeDropdownIsFocused()
})

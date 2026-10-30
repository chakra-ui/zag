import { expect, test } from "./_test"

const triggerSelector = '[data-scope="menu"][data-part="context-trigger"]'
const contentSelector = '[data-scope="menu"][data-part="content"]'

for (const example of ["basic", "lazy-mount", "controlled"]) {
  test.describe(`context menu / ${example} / return focus`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/context-menu/${example}`)
      await page.locator(triggerSelector).evaluate((element) => {
        element.tabIndex = 0
      })
      await page.locator(triggerSelector).focus()
      // macOS does not generate contextmenu for Shift+F10. Dispatch the native
      // event after focusing the trigger to exercise the same opening path.
      await page.locator(triggerSelector).dispatchEvent("contextmenu", { button: -1 })
      await expect(page.locator(contentSelector)).toBeFocused()
    })

    test("returns focus to the context trigger on Escape", async ({ page }) => {
      await page.keyboard.press("Escape")
      await expect(page.locator(contentSelector)).toBeHidden()
      await expect(page.locator(triggerSelector)).toBeFocused()
    })

    test("returns focus after selecting an item with the keyboard", async ({ page }) => {
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
      await expect(page.locator(contentSelector)).toBeHidden()
      await expect(page.locator(triggerSelector)).toBeFocused()
    })

    test("keeps focus on an outside control when it dismisses the menu", async ({ page }) => {
      await page.evaluate(() => {
        const input = document.createElement("input")
        input.id = "outside-control"
        input.setAttribute("aria-label", "Outside control")
        document.querySelector("main")!.append(input)
      })
      await page.locator("#outside-control").click()
      await expect(page.locator(contentSelector)).toBeHidden()
      await expect(page.locator("#outside-control")).toBeFocused()
    })

    if (example !== "controlled") {
      test("keeps focus in the menu when it immediately reopens", async ({ page }) => {
        await page.evaluate(
          ({ triggerSelector, contentSelector }) => {
            document.querySelector(contentSelector)!.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: "Escape",
                bubbles: true,
                cancelable: true,
              }),
            )
            document.querySelector(triggerSelector)!.dispatchEvent(
              new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
                button: -1,
              }),
            )
          },
          { triggerSelector, contentSelector },
        )
        await expect(page.locator(contentSelector)).toBeVisible()
        await expect(page.locator(contentSelector)).toBeFocused()
      })
    }
  })
}

test("returns focus to the active context trigger among multiple triggers", async ({ page }) => {
  await page.goto("/context-menu/multiple-trigger")
  const trigger = page.locator(`${triggerSelector}[data-value="2"]`)
  await trigger.evaluate((element) => {
    element.tabIndex = 0
  })
  await trigger.focus()
  await trigger.dispatchEvent("contextmenu", { button: -1 })
  await expect(page.locator(contentSelector)).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(page.locator(contentSelector)).toBeHidden()
  await expect(trigger).toBeFocused()
})

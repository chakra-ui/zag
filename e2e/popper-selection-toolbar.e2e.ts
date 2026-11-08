import { expect, test } from "./_test"

test.describe("popper selection-toolbar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/popper/selection-toolbar")
  })

  const selectWords = (page: import("@playwright/test").Page) =>
    page.getByTestId("paragraph").evaluate((p) => {
      const text = p.firstChild as Text
      const start = text.data.indexOf("interaction logic")
      const range = document.createRange()
      range.setStart(text, start)
      range.setEnd(text, start + "interaction logic".length)
      const selection = document.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)
      const rect = range.getBoundingClientRect()
      return { top: rect.top, left: rect.left, width: rect.width }
    })

  test("toolbar is hidden until text is selected", async ({ page }) => {
    await expect(page.getByTestId("selection-toolbar")).toBeHidden()
  })

  test("selecting text shows the toolbar above the selection, collapsing hides it", async ({ page }) => {
    const rect = await selectWords(page)
    const toolbar = page.getByTestId("selection-toolbar")
    await expect(toolbar).toBeVisible()

    // placement "top" with a 14px gutter, centered on the selection, fixed strategy
    await expect
      .poll(async () => {
        const box = (await toolbar.boundingBox())!
        return Math.round(rect.top - (box.y + box.height))
      })
      .toBe(14)
    const box = (await toolbar.boundingBox())!
    expect(Math.abs(box.x + box.width / 2 - (rect.left + rect.width / 2))).toBeLessThan(2)
    await expect(toolbar).toHaveCSS("position", "fixed")

    await page.evaluate(() => document.getSelection()!.removeAllRanges())
    await expect(toolbar).toBeHidden()
  })

  test("clicking a toolbar button keeps the selection and reports the action", async ({ page }) => {
    await selectWords(page)
    const toolbar = page.getByTestId("selection-toolbar")
    await expect(toolbar).toBeVisible()
    await toolbar.getByRole("button", { name: "Bold" }).click()
    await expect(page.getByRole("status")).toHaveText("Bold applied")
    await expect(toolbar).toBeVisible()
    expect(await page.evaluate(() => document.getSelection()!.toString())).toBe("interaction logic")
  })

  test("a selection outside the paragraph does not open it", async ({ page }) => {
    await page.locator(".hint").evaluate((el) => document.getSelection()!.selectAllChildren(el))
    await expect(page.getByTestId("selection-toolbar")).toBeHidden()
  })
})

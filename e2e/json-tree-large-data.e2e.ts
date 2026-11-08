import { expect, test } from "./_test"

test.describe("json-tree large-data", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/json-tree/large-data")
  })

  test("should group the 500 events into ranges of 100", async ({ page }) => {
    for (const range of ["[0…99]", "[100…199]", "[200…299]", "[300…399]", "[400…499]"]) {
      await expect(page.getByRole("row", { name: new RegExp(`^${range.replace(/[[\]]/g, "\\$&")}:`) })).toBeVisible()
    }
  })

  test("should preview four properties on the root row", async ({ page }) => {
    await expect(page.getByRole("row").first()).toContainText("events: Array(500)")
  })

  test("should expand a group to show its events", async ({ page }) => {
    const group = page.getByRole("row", { name: /^\[0…99\]:/ })
    await group.click()
    await expect(group).toHaveAttribute("aria-expanded", "true")
    await expect(page.getByRole("row", { name: /^0:/ })).toBeVisible()
    await expect(page.getByRole("row", { name: /^99:/ })).toBeVisible()
  })

  test("should collapse long strings in the object preview", async ({ page }) => {
    const root = page.getByRole("row").first()
    await expect(root).toContainText('notes: "Exported from the production a…"')
    await expect(root).not.toContainText("incident review")
  })

  // json-tree-utils bug: ObjectType.previewText calls getNodeTypeDescription(child) without the preview options,
  // so collapseStringsAfterLength is ignored and the default of 30 always applies (see .superpowers/adapter-bugs.md)
  test.fixme("should honor collapseStringsAfterLength: 40 in the object preview", async ({ page }) => {
    const root = page.getByRole("row").first()
    await expect(root).toContainText('notes: "Exported from the production audit log f…"')
  })
})

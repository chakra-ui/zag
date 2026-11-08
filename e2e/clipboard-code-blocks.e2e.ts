import { expect, test } from "./_test"

const ids = ["install", "import", "usage"]

test.describe("clipboard code-blocks", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {})
    await page.goto("/clipboard/code-blocks")
  })

  test("should only mark the copied block", async ({ page }) => {
    await page.getByTestId("copy-import").click()

    await expect(page.getByTestId("copy-import")).toHaveAttribute("data-copied", "")
    await expect(page.getByTestId("copy-install")).not.toHaveAttribute("data-copied", "")
    await expect(page.getByTestId("copy-usage")).not.toHaveAttribute("data-copied", "")
  })

  test("should reset after the timeout and allow copying another block", async ({ page }) => {
    await page.getByTestId("copy-import").click()
    await expect(page.getByTestId("copy-import")).toHaveAttribute("data-copied", "")
    await expect(page.getByTestId("copy-import")).not.toHaveAttribute("data-copied", "", { timeout: 2500 })

    await page.getByTestId("copy-usage").click()
    await expect(page.getByTestId("copy-usage")).toHaveAttribute("data-copied", "")
    for (const id of ids.filter((id) => id !== "usage")) {
      await expect(page.getByTestId(`copy-${id}`)).not.toHaveAttribute("data-copied", "")
    }
  })

  test("should copy the text of the clicked block", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard-read is chromium only")
    await page.getByTestId("copy-install").click()
    await page.getByTestId("copy-usage").click()
    const text = await page.evaluate(() => navigator.clipboard.readText())
    expect(text).toBe(await page.getByTestId("code-usage").innerText())
  })
})

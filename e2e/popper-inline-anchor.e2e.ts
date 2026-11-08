import { expect, test } from "./_test"

test.describe("popper inline-anchor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/popper/inline-anchor")
  })

  const getLines = (page: import("@playwright/test").Page) =>
    page.getByTestId("inline-term").evaluate((el) =>
      Array.from(el.getClientRects())
        .map((r) => ({ left: r.left, top: r.top, width: r.width, height: r.height }))
        .sort((a, b) => a.top - b.top),
    )

  test("the link wraps across lines and the card is hidden", async ({ page }) => {
    expect((await getLines(page)).length).toBeGreaterThanOrEqual(2)
    await expect(page.getByTestId("inline-card")).toBeHidden()
  })

  test("the card anchors to the clicked line, not the whole link", async ({ page }) => {
    const lines = await getLines(page)
    const card = page.getByTestId("inline-card")
    const term = page.getByTestId("inline-term")

    for (const line of [lines[0], lines[lines.length - 1]]) {
      await term.scrollIntoViewIfNeeded()
      await page.mouse.click(line.left + line.width / 2, line.top + line.height / 2)
      await expect(card).toBeVisible()
      await expect
        .poll(async () => {
          const box = (await card.boundingBox())!
          return {
            gap: Math.round(line.top - (box.y + box.height)),
            center: Math.abs(Math.round(box.x + box.width / 2 - (line.left + line.width / 2))),
          }
        })
        .toEqual({ gap: 12, center: 0 })
    }
  })

  test("escape and outside click close the card", async ({ page }) => {
    const [line] = await getLines(page)
    const card = page.getByTestId("inline-card")
    await page.mouse.click(line.left + line.width / 2, line.top + line.height / 2)
    await expect(card).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(card).toBeHidden()

    await page.mouse.click(line.left + line.width / 2, line.top + line.height / 2)
    await expect(card).toBeVisible()
    await page.mouse.click(5, 5)
    await expect(card).toBeHidden()
  })
})

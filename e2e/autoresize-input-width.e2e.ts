import { expect, test } from "./_test"

const width = (el: { evaluate: (fn: (el: HTMLElement) => number) => Promise<number> }) =>
  el.evaluate((el) => el.getBoundingClientRect().width)

test.describe("autoresize input-width", () => {
  test("the input grows with its text and shrinks back when cleared", async ({ page }) => {
    await page.goto("/autoresize/input-width")
    const input = page.getByRole("textbox", { name: "Board name" })
    await expect(input).toHaveValue("Roadmap")
    await expect.poll(() => width(input)).toBeGreaterThan(0)
    const initial = await width(input)

    await input.fill("Roadmap for the 2027 platform migration")
    await expect.poll(() => width(input)).toBeGreaterThan(initial + 100)

    await input.fill("Roadmap")
    await expect.poll(() => width(input)).toBe(initial)
  })
})

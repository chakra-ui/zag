import { expect, test } from "./_test"

test.describe("popper dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/popper/dropdown")
  })

  test("the list is hidden until the trigger is clicked", async ({ page }) => {
    await expect(page.getByTestId("dropdown-menu")).toBeHidden()
    await expect(page.getByTestId("dropdown-trigger")).toHaveAttribute("aria-expanded", "false")
  })

  test("the list matches the trigger width, sits above it and has a positioned arrow", async ({ page }) => {
    const trigger = page.getByTestId("dropdown-trigger")
    const menu = page.getByTestId("dropdown-menu")
    await trigger.click()
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")

    const t = (await trigger.boundingBox())!
    await expect.poll(async () => Math.round((await menu.boundingBox())!.width)).toBe(Math.round(t.width))
    const m = (await menu.boundingBox())!
    // shifted 32px along the alignment axis
    expect(Math.round(m.x - t.x)).toBe(32)
    // flipped above the trigger: 10px gutter plus half of the 10px arrow
    expect(Math.round(t.y - (m.y + m.height))).toBe(15)
    await expect(menu).toHaveAttribute("data-placement", "top-start")

    const arrow = page.getByTestId("dropdown-arrow")
    await expect(arrow).toHaveCSS("position", "absolute")
    const left = await arrow.evaluate((el) => (el as HTMLElement).style.left)
    expect(left).toMatch(/^\d+(\.\d+)?px$/)
    const a = (await arrow.boundingBox())!
    expect(a.x).toBeGreaterThanOrEqual(m.x)
    expect(a.x + a.width).toBeLessThanOrEqual(m.x + m.width)
    // the arrow straddles the edge facing the trigger
    expect(Math.abs(a.y + a.height / 2 - (m.y + m.height))).toBeLessThan(2)
  })

  test("picking an option updates the trigger and closes the list", async ({ page }) => {
    const trigger = page.getByTestId("dropdown-trigger")
    await trigger.click()
    const menu = page.getByTestId("dropdown-menu")
    await menu.getByRole("button", { name: "Most popular" }).click()
    await expect(menu).toBeHidden()
    await expect(trigger).toHaveAccessibleName("Sort by Most popular")
    await trigger.click()
    await expect(menu.getByRole("button", { name: "Most popular" })).toHaveAttribute("aria-current", "true")
  })

  test("escape and outside click close the list", async ({ page }) => {
    const trigger = page.getByTestId("dropdown-trigger")
    const menu = page.getByTestId("dropdown-menu")
    await trigger.click()
    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await page.mouse.click(5, 5)
    await expect(menu).toBeHidden()
  })

  test("the list slides back inside the viewport padding when the shift pushes it past the edge", async ({ page }) => {
    await page.setViewportSize({ width: 440, height: 720 })
    const menu = page.getByTestId("dropdown-menu")
    await page.getByTestId("dropdown-trigger").click()
    await expect(menu).toBeVisible()
    // 16px overflow padding from the right edge
    await expect
      .poll(async () => {
        const m = (await menu.boundingBox())!
        return Math.round(440 - 16 - (m.x + m.width))
      })
      .toBe(0)
  })
})

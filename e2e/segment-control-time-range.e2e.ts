import { expect, test } from "./_test"

test.describe("segment-control time-range", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/segment-control/time-range")
  })

  test("selecting a range redraws the chart and caption", async ({ page }) => {
    const caption = page.getByTestId("caption")
    const bars = page.getByTestId("bar")
    await expect(page.getByRole("radio", { name: "Week" })).toBeChecked()
    await expect(caption).toHaveText("Page views per day, last 7 days")
    await expect(bars).toHaveCount(7)

    await page.getByTestId("radio-month").click()
    await expect(page.getByRole("radio", { name: "Month" })).toBeChecked()
    await expect(caption).toHaveText("Page views per week, last 4 weeks")
    await expect(bars).toHaveCount(4)

    await page.getByTestId("radio-year").click()
    await expect(caption).toHaveText("Page views per month, last 12 months")
    await expect(bars).toHaveCount(12)
  })

  test("the external button and the control stay in sync", async ({ page }) => {
    await page.getByRole("button", { name: "Jump to Year" }).click()
    await expect(page.getByRole("radio", { name: "Year" })).toBeChecked()
    await expect(page.getByTestId("caption")).toHaveText("Page views per month, last 12 months")
    await expect(page.getByTestId("bar")).toHaveCount(12)

    await page.getByTestId("radio-day").click()
    await expect(page.getByRole("radio", { name: "Year" })).not.toBeChecked()
    await expect(page.getByTestId("caption")).toHaveText("Page views per hour, last 24 hours")
    await expect(page.getByTestId("bar")).toHaveCount(8)
  })

  test("the items lay out in a row", async ({ page }) => {
    await expect(page.getByRole("radiogroup")).toHaveAttribute("data-orientation", "horizontal")
    const day = await page.getByTestId("radio-day").boundingBox()
    const year = await page.getByTestId("radio-year").boundingBox()
    expect(Math.abs(day!.y - year!.y)).toBeLessThan(2)
    expect(year!.x).toBeGreaterThan(day!.x)
  })

  test("arrow keys change the range", async ({ page }) => {
    await page.getByRole("radio", { name: "Week" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("radio", { name: "Month" })).toBeChecked()
    await expect(page.getByTestId("caption")).toHaveText("Page views per week, last 4 weeks")
  })

  test("the indicator moves under the selected item", async ({ page }) => {
    const indicator = page.locator("[data-radio-group-indicator]")
    await expect(indicator).toBeVisible()
    const before = await indicator.boundingBox()
    await page.getByTestId("radio-day").click()
    await expect.poll(async () => (await indicator.boundingBox())!.x).toBeLessThan(before!.x)
  })
})

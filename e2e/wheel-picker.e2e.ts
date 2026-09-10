import { expect, test } from "@playwright/test"
import { a11y, mouseSwipe, part } from "./_utils"

test.skip((process.env.FRAMEWORK ?? "react") !== "react", "The wheel-picker example is currently React-only")

test.describe("wheel-picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/wheel-picker/basic")
    await page.waitForLoadState("networkidle")
  })

  test("has no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test("supports arrow keys and skips disabled items", async ({ page }) => {
    const control = page.locator(part("control"))
    const output = page.getByTestId("value")

    await control.focus()
    await page.keyboard.press("ArrowDown")
    await expect(output).toHaveText("Selected: Vue")

    await page.keyboard.press("ArrowDown")
    await expect(output).toHaveText("Selected: Svelte")
  })

  test("supports home, end, and typeahead", async ({ page }) => {
    const control = page.locator(part("control"))
    const output = page.getByTestId("value")

    await control.focus()
    await page.keyboard.press("End")
    await expect(output).toHaveText("Selected: Lit")

    await page.keyboard.press("Home")
    await expect(output).toHaveText("Selected: React")

    await page.keyboard.press("s")
    await expect(output).toHaveText("Selected: Svelte")
  })

  test("syncs changes from the hidden select", async ({ page }) => {
    await page.locator('select[name="framework"]').selectOption("solid")
    await expect(page.getByTestId("value")).toHaveText("Selected: Solid")
  })

  test("settles to an item after dragging", async ({ page }) => {
    const control = page.locator(part("control"))
    await mouseSwipe(page, control, "up", 90, 300)
    await expect(control).toHaveAttribute("aria-valuetext", /Svelte|Solid|Preact|Qwik|Lit/)
  })
})

test.describe("wheel-picker examples", () => {
  test("supports a controlled value", async ({ page }) => {
    await page.goto("/wheel-picker/controlled")
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: "Select Svelte" }).click()

    await expect(page.getByRole("spinbutton", { name: "Framework" })).toHaveAttribute("aria-valuetext", "Svelte")
    await expect(page.getByTestId("value")).toHaveText("Controlled value: Svelte")
  })

  test("coordinates multiple time pickers", async ({ page }) => {
    await page.goto("/wheel-picker/multiple")
    await page.waitForLoadState("networkidle")

    await page.getByRole("spinbutton", { name: "Hour" }).focus()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowDown")

    await expect(page.getByRole("spinbutton", { name: "Meridiem" })).toBeFocused()
    await expect(page.getByTestId("value")).toHaveText("Selected time: 10:42 PM")
  })

  test("keeps a time input and composed wheel pickers in sync", async ({ page }) => {
    await page.goto("/wheel-picker/time-input")
    await page.waitForLoadState("networkidle")

    const dateInputSegment = (type: string) =>
      page.locator(`[data-scope=date-input][data-part=segment][data-type=${type}]`)

    await dateInputSegment("hour").click()
    await page.keyboard.type("01")
    await dateInputSegment("minute").click()
    await page.keyboard.type("25")
    await dateInputSegment("dayPeriod").click()
    await page.keyboard.press("p")
    await page.getByRole("button", { name: "Open time picker" }).click()

    const wheelPickerGroup = page.getByRole("group", { name: "Time picker" })
    const hourWheel = wheelPickerGroup.getByRole("spinbutton", { name: "Hour" })

    await expect(hourWheel).toHaveAttribute("aria-valuetext", "01")
    await expect(wheelPickerGroup.getByRole("spinbutton", { name: "Minute" })).toHaveAttribute("aria-valuetext", "25")
    await expect(wheelPickerGroup.getByRole("spinbutton", { name: "Day period" })).toHaveAttribute(
      "aria-valuetext",
      "PM",
    )

    await hourWheel.focus()
    await page.keyboard.press("ArrowDown")

    await expect(dateInputSegment("hour")).toHaveText("02")
    await expect(dateInputSegment("minute")).toHaveText("25")
    await expect(dateInputSegment("dayPeriod")).toHaveText("PM")
    await expect(page.getByTestId("value")).toHaveText("Selected time: 02:25 PM")
  })

  test("uses locale-specific time columns", async ({ page }) => {
    await page.goto("/wheel-picker/time-input")
    await page.waitForLoadState("networkidle")

    await page.locator("select").selectOption("en-GB")
    await page.getByRole("button", { name: "Open time picker" }).click()

    const wheelPickerGroup = page.getByRole("group", { name: "Time picker" })
    await expect(wheelPickerGroup.getByRole("spinbutton", { name: "Hour" })).toHaveAttribute("aria-valuemax", "23")
    await expect(wheelPickerGroup.getByRole("spinbutton", { name: "Day period" })).toHaveCount(0)
  })
})

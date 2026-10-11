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
    const control = page.locator(part("wheel-picker", "control"))
    const output = page.getByTestId("value")

    await control.focus()
    await page.keyboard.press("ArrowDown")
    await expect(output).toHaveText("Selected: Vue")

    await page.keyboard.press("ArrowDown")
    await expect(output).toHaveText("Selected: Svelte")
  })

  test("captures wheel scrolling while hovered without requiring focus", async ({ page }) => {
    const control = page.locator(part("wheel-picker", "control"))
    await page.evaluate(() => (document.body.style.minHeight = "200vh"))

    await control.hover()
    await expect(control).not.toBeFocused()

    const scrollY = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 100)

    await expect(control).toHaveAttribute("aria-valuetext", "Vue")
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
  })

  test("supports home, end, and typeahead", async ({ page }) => {
    const control = page.locator(part("wheel-picker", "control"))
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
    const control = page.locator(part("wheel-picker", "control"))
    await mouseSwipe(page, control, "up", 90, 300)
    await expect(control).toHaveAttribute("aria-valuetext", /Svelte|Solid|Preact|Qwik|Lit/)
  })

  test("continues scrolling with momentum after a fast drag", async ({ page }) => {
    const control = page.locator(part("wheel-picker", "control"))
    const itemGroup = page.locator(part("wheel-picker", "item-group"))

    await mouseSwipe(page, control, "up", 30, 50, false)
    const transformAtRelease = await itemGroup.evaluate((element) => getComputedStyle(element).transform)
    await page.mouse.up()

    await expect
      .poll(() => itemGroup.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe(transformAtRelease)
  })

  test("preserves touch inertia when touchend is delayed", async ({ page }) => {
    const control = page.locator(part("wheel-picker", "control"))
    const itemGroupSelector = part("wheel-picker", "item-group")

    const transformAtRelease = await control.evaluate(async (element, selector) => {
      const rect = element.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dispatchTouch = (type: string, y: number) => {
        const touch = { clientX: x, clientY: y }
        const event = new Event(type, { bubbles: true, cancelable: true })
        Object.defineProperties(event, {
          changedTouches: { value: [touch] },
          touches: { value: type === "touchend" ? [] : [touch] },
        })
        element.dispatchEvent(event)
      }

      const delay = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration))

      dispatchTouch("touchstart", centerY + 30)
      await delay(16)
      dispatchTouch("touchmove", centerY)
      await delay(16)
      dispatchTouch("touchmove", centerY - 30)
      await delay(150)
      dispatchTouch("touchend", centerY - 30)

      return getComputedStyle(document.querySelector(selector)!).transform
    }, itemGroupSelector)

    await expect
      .poll(() => page.locator(itemGroupSelector).evaluate((element) => getComputedStyle(element).transform))
      .not.toBe(transformAtRelease)
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
})

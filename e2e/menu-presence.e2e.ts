import { expect, test, type Locator, type Page } from "@playwright/test"

import { holdFrames, releaseFrames } from "./hold-frames"

const trigger = '[data-scope="menu"][data-part="trigger"]'
const content = '[data-scope="menu"][data-part="content"]'
const positioner = '[data-scope="menu"][data-part="positioner"]'

// Clicks by coordinates: locator actions wait for frames, which are held.
async function clickCenter(page: Page, locator: Locator) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
}

test.describe("menu / presence", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React presence example")

  test.beforeEach(async ({ page }) => {
    await page.goto("/menu/presence")
    await page.locator(trigger).focus()
  })

  test("waits for coordinates before showing the menu on opening and reopening", async ({ page }) => {
    const floating = page.locator(positioner)

    for (let opening = 0; opening < 2; opening++) {
      // Open with frames held: the menu mounts but must stay offscreen
      await holdFrames(page)
      await clickCenter(page, page.locator(trigger))
      await expect(page.locator(content)).toBeAttached()

      await expect
        .poll(async () => {
          const box = await floating.boundingBox()
          return box ? box.y + box.height : Infinity
        })
        .toBeLessThanOrEqual(0)

      // Once frames run, the menu sits below the trigger
      await releaseFrames(page)

      await expect
        .poll(async () => {
          const anchor = await page.locator(trigger).boundingBox()
          const box = await floating.boundingBox()
          if (!anchor || !box) return Infinity
          return Math.abs(box.x - anchor.x) + Math.abs(box.y - (anchor.y + anchor.height + 8))
        })
        .toBeLessThanOrEqual(2)

      await page.keyboard.press("Escape")
      await expect(page.locator(content)).not.toBeAttached()
      await expect(page.locator(trigger)).toBeFocused()

      // Move the trigger so reopening needs fresh coordinates
      await page.locator(trigger).evaluate((node, opening) => {
        node.style.marginTop = `${(opening + 1) * 30}px`
      }, opening)
    }
  })

  test("handles Escape before the first frame and reopens on the next click", async ({ page }) => {
    const openState = page.getByTestId("open-state")

    await holdFrames(page)
    await page.keyboard.press("Enter")
    await expect(openState).toHaveText("true")
    await expect(page.locator(content)).toBeAttached()

    await page.keyboard.press("Escape")
    await expect(openState).toHaveText("false")

    await releaseFrames(page)
    await page.locator(trigger).click()
    await expect(page.locator(content)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(openState).toHaveText("false")
    await expect(page.locator(trigger)).toBeFocused()
  })

  test("dismisses on an outside press before the first frame", async ({ page }) => {
    const openState = page.getByTestId("open-state")

    await holdFrames(page)
    await page.keyboard.press("Enter")
    await expect(openState).toHaveText("true")
    await expect(page.locator(content)).toBeAttached()

    await clickCenter(page, page.getByTestId("outside"))
    await releaseFrames(page)
    await expect(openState).toHaveText("false")
  })

  test("honors preventDefault before the first frame", async ({ page }) => {
    const openState = page.getByTestId("open-state")
    const keepOpen = page.getByLabel("Keep open on Escape")

    await keepOpen.check()
    await page.locator(trigger).focus()

    await holdFrames(page)
    await page.keyboard.press("Enter")
    await expect(openState).toHaveText("true")

    await page.keyboard.press("Escape")
    await expect(openState).toHaveText("true")

    await releaseFrames(page)
    await keepOpen.uncheck()
    await page.locator(trigger).click()

    await page.keyboard.press("Escape")
    await expect(openState).toHaveText("false")
  })
})

test("pending select takes Escape ahead of its mounted dialog", async ({ page }) => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React nested select example")

  const selectTrigger = page.getByTestId("select-trigger")

  await page.goto("/select/nested-dialog")
  await page.getByTestId("parent-trigger").click()
  await page.getByTestId("child-trigger").click()

  // Let the dialog activate its focus trap before testing the select's pending layer
  await expect(selectTrigger).toBeFocused()

  await holdFrames(page)
  await page.keyboard.press("Enter")
  await expect(selectTrigger).toHaveAttribute("aria-expanded", "true")

  // Escape closes only the pending select
  await page.keyboard.press("Escape")
  await expect(selectTrigger).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByTestId("child-content")).toHaveAttribute("data-state", "open")
  await expect(page.getByTestId("parent-content")).toHaveAttribute("data-state", "open")

  // The next Escape closes the child dialog, not the parent
  await releaseFrames(page)
  await page.keyboard.press("Escape")
  await expect(page.getByTestId("child-content")).toHaveCount(0)
  await expect(page.getByTestId("parent-content")).toBeVisible()
})

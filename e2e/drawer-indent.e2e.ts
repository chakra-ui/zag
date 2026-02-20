import { expect, test } from "@playwright/test"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer [indent-background]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer-indent-background")
  })

  test("should orchestrate indent/background visual state during swipe", async ({ page }) => {
    const indent = page.getByTestId("drawer-indent")
    const indentBackground = page.getByTestId("drawer-indent-background")

    const getVar = async (name: string) => {
      return indent.evaluate((el, varName) => getComputedStyle(el).getPropertyValue(varName).trim(), name)
    }

    const getIndentTransform = async () => indent.evaluate((el) => getComputedStyle(el).transform)
    const getBackgroundOpacity = async () => indentBackground.evaluate((el) => getComputedStyle(el).opacity)

    await expect(indent).toHaveAttribute("data-inactive", "")
    await expect(indentBackground).toHaveAttribute("data-inactive", "")
    expect(Number.parseFloat(await getVar("--drawer-swipe-progress"))).toBe(0)

    await I.clickTrigger()
    await I.waitForOpenState()

    await expect(indent).toHaveAttribute("data-active", "")
    await expect(indentBackground).toHaveAttribute("data-active", "")

    const restingProgress = Number.parseFloat(await getVar("--drawer-swipe-progress"))
    const restingTransform = await getIndentTransform()
    const restingOpacity = Number.parseFloat(await getBackgroundOpacity())
    const frontmostHeight = await getVar("--drawer-frontmost-height")

    expect(restingProgress).toBe(0)
    expect(frontmostHeight.endsWith("px")).toBe(true)
    expect(Number.parseFloat(frontmostHeight)).toBeGreaterThan(0)

    await I.dragGrabber("down", 120, 300, false)

    const swipingProgress = Number.parseFloat(await getVar("--drawer-swipe-progress"))
    const swipingTransform = await getIndentTransform()
    const swipingOpacity = Number.parseFloat(await getBackgroundOpacity())

    expect(swipingProgress).toBeGreaterThan(0)
    expect(swipingTransform).not.toBe(restingTransform)
    expect(swipingOpacity).toBeLessThan(restingOpacity)

    await page.mouse.up()
    await I.waitForSnapComplete()

    expect(Number.parseFloat(await getVar("--drawer-swipe-progress"))).toBe(0)
    expect(await getIndentTransform()).toBe(restingTransform)

    await I.pressKey("Escape")
    await I.dontSeeContent()

    await expect(indent).toHaveAttribute("data-inactive", "")
    await expect(indentBackground).toHaveAttribute("data-inactive", "")
    expect(Number.parseFloat(await getVar("--drawer-swipe-progress"))).toBe(0)
  })
})

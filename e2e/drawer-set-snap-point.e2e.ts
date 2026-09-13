import { expect, test } from "@playwright/test"

const snapPoint = "[data-testid=snap-point]"
const snapPointLog = "[data-testid=snap-point-log]"

test.describe("drawer / setSnapPoint", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/drawer/set-snap-point")
    await page.click('[data-scope="drawer"][data-part="trigger"]')
    await expect(page.locator("[data-testid=open-state]")).toHaveText("true")
    await page.click("[data-testid=reset]")
  })

  test("should set the snap point through the api", async ({ page }) => {
    await page.click("[data-testid=set-30]")

    await expect(page.locator(snapPoint)).toHaveText("30rem")
    await expect(page.locator(snapPointLog)).toHaveText("30rem")
  })

  test("should keep the last snap point set in the same tick", async ({ page }) => {
    // resolves to the snap point it already has, so nothing should change
    await page.click("[data-testid=set-30-then-20]")

    await expect(page.locator(snapPoint)).toHaveText("20rem")
    await expect(page.locator(snapPointLog)).toHaveText("")
  })

  test("should apply only the last snap point when two are set in the same tick", async ({ page }) => {
    await page.click("[data-testid=set-30-then-full]")

    await expect(page.locator(snapPoint)).toHaveText("1")
    await expect(page.locator(snapPointLog)).toHaveText("1")
  })

  test("should invoke onSnapPointChange once when the same value is set repeatedly", async ({ page }) => {
    await page.click("[data-testid=set-30-repeatedly]")

    await expect(page.locator(snapPoint)).toHaveText("30rem")
    await expect(page.locator(snapPointLog)).toHaveText("30rem")
  })
})

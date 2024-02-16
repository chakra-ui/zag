import { expect, test } from "@playwright/test"
import { TourModel } from "./models/tour.model"

test.describe("tour", () => {
  let tour: TourModel

  test.beforeEach(async ({ page }) => {
    tour = new TourModel(page)
    await tour.goto()
  })

  test("should open tour on click start", async () => {
    await tour.start()
    // first step is centered
    await tour.expectToBeCentered()
    await expect(tour.content).toBeVisible()
  })

  test("should close on escape", async () => {
    await tour.start()
    await tour.esc()
    await expect(tour.content).not.toBeVisible()
  })

  test("should align with spotlight (due to offset)", async () => {
    await tour.start()
    await tour.arrowRight()
    await expect(tour.spotlight).toBeInViewport()

    const targetRect = await tour.getTargetRect()
    const spotlightRect = await tour.getSpotlightRect()

    // spotlight rect to be greater than content rect
    expect(spotlightRect.width).toBeGreaterThan(targetRect.width)
    expect(spotlightRect.height).toBeGreaterThan(targetRect.height)
  })

  test("keyboard navigation", async () => {
    await tour.start()
    await tour.expectToBeCentered()

    await tour.arrowRight()
    await expect(tour.target).toContainText("Step 1")

    // in overflow container
    await tour.arrowRight()
    await expect(tour.spotlight).toBeInViewport()
    await expect(tour.target).toContainText("Step 2")
    await expect(tour.target).toBeInViewport()

    // iframe content
    await tour.arrowRight()
    await expect(tour.spotlight).toBeInViewport()
    await expect(tour.iframeTarget).toBeInViewport()
    await expect(tour.iframeTarget).toContainText("Iframe Content")

    // Close to the bottom
    await tour.arrowRight()
    await expect(tour.spotlight).toBeInViewport()
    await expect(tour.target).toContainText("Step 3")

    // Bottom of the page
    await tour.arrowRight()
    await expect(tour.spotlight).toBeInViewport()
    await expect(tour.target).toContainText("Step 4")

    // final step
    await tour.arrowRight()
    await expect(tour.title).toContainText("all sorted!")
  })

  test("[no keyboard navigation] should do not advance", async () => {
    await tour.controls.bool("keyboardNavigation", false)
    await tour.start()

    await tour.arrowRight() // should not do anything
    await tour.expectToBeCentered() // stay on the first step
  })

  test("[preventInteraction=true] should not allow interacting with target", async () => {
    await tour.start()
    await tour.arrowRight()

    // double click on target to select text
    await tour.target.selectText()

    // check if the window selection is still empty
    const selection = await tour.getSelection()
    expect(selection).toBe("")
  })

  test("[preventInteraction=false] should allow interacting with target", async () => {
    await tour.controls.bool("preventInteraction", false)

    await tour.start()
    await tour.arrowRight()

    // double click on target to select text
    await tour.target.selectText()

    // check if the window selection is still empty
    const selection = await tour.getSelection()
    expect(selection).toContain("Step 1")
  })

  test("should close on interaction outside", async () => {
    await tour.start()
    await tour.clickOutside()
    await expect(tour.content).not.toBeVisible()
  })
})

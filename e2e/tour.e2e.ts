import { expect, test } from "@playwright/test"
import { TourModel } from "./models/tour.model"

let I: TourModel

test.describe("tour", () => {
  test.beforeEach(async ({ page }) => {
    I = new TourModel(page)
    await I.goto()
  })

  test("should open tour on click start", async () => {
    // first step is centered
    await I.clickStart()
    await I.seeContent()
    await I.seeContentIsCentered()
  })

  test("should close on escape", async () => {
    await I.clickStart()
    await I.seeContent()
    await I.pressKey("Escape")
    await I.dontSeeContent()
  })

  test.fixme("should align with spotlight (due to offset)", async () => {
    await I.clickStart()
    await I.pressKey("ArrowRight")
    await I.seeSpotlight()
    await I.seeSpotlightAroundTarget()
  })

  test("keyboard navigation", async () => {
    await I.clickStart()
    await I.seeContentIsCentered()

    await I.pressKey("ArrowRight")
    await I.seeTarget("Step 1")

    // in overflow container
    await I.pressKey("ArrowRight")
    await I.seeSpotlight()
    await I.seeTarget("Step 2")

    // iframe content
    await I.pressKey("ArrowRight")
    await I.seeSpotlight()
    await I.seeIframeTarget("Iframe Content")

    // Close to the bottom
    await I.pressKey("ArrowRight")
    await I.seeSpotlight()
    await I.seeTarget("Step 3")

    // Bottom of the page
    await I.pressKey("ArrowRight")
    await I.seeSpotlight()
    await I.seeTarget("Step 4")

    // final step
    await I.pressKey("ArrowRight")
    await I.seeTitle("all sorted!")
  })

  test("[no keyboard navigation] should do not advance", async () => {
    await I.controls.bool("keyboardNavigation", false)
    await I.clickStart()

    await I.pressKey("ArrowRight") // should not do anything
    await I.seeContentIsCentered() // stay on the first step
  })

  test.fixme("[preventInteraction=true] should not allow interacting with target", async () => {
    await I.clickStart()
    await I.pressKey("ArrowRight")

    // double click on target to select text
    await I.selectTargetText()

    // check if the window selection is still empty
    const selection = await I.checkSelection()
    expect(selection).toBe("")
  })

  test("[preventInteraction=false] should allow interacting with target", async () => {
    await I.controls.bool("preventInteraction", false)

    await I.clickStart()
    await I.pressKey("ArrowRight")

    // double click on target to select text
    await I.selectTargetText()

    // check if the window selection is still empty
    const selection = await I.checkSelection()
    expect(selection).toContain("Step 1")
  })
})

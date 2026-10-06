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
    await I.page.route("https://api.github.com/users/octocat", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          name: "The Octocat",
          login: "octocat",
          id: 583231,
          avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
        }),
      })
    })

    await I.clickStart()
    await I.seeStep("step-0")
    await I.seeContentIsCentered()

    // data fetching step
    await I.pressKey("ArrowRight")
    await I.seeStep("step-1")
    await I.seeSpotlight()
    await I.seeTarget("Step 1")

    // in overflow container
    await I.pressKey("ArrowRight")
    await I.seeStep("step-2")
    await I.seeSpotlight()
    await I.seeTarget("Step 2")

    // iframe content
    await I.pressKey("ArrowRight")
    await I.seeStep("step-2a")
    await I.seeSpotlight()
    await I.seeIframeTarget("Iframe Content")

    // Close to the bottom
    await I.pressKey("ArrowRight")
    await I.seeStep("step-3")
    await I.seeSpotlight()
    await I.seeTarget("Step 3")

    // Bottom of the page
    await I.pressKey("ArrowRight")
    await I.seeStep("step-4")
    await I.seeSpotlight()
    await I.seeTarget("Step 4")

    // final step
    await I.pressKey("ArrowRight")
    await I.seeStep("step-5")
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

  test.fixme("[preventInteraction=false] should allow interacting with target", async () => {
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

test.describe("tour / replaced target", () => {
  test.beforeEach(async ({ page }) => {
    I = new TourModel(page)
    await page.goto("/tour/replaced-target")
  })

  test("should follow a target that is replaced while its step is open", async ({ page }) => {
    await I.clickStart()
    await I.seeSpotlight()

    const originalRect = await I.getTargetRect()

    // dispatched rather than clicked: the tour dims the page, so the backdrop is what a real click
    // would land on. In an app the swap is not a click at all — a sticky header does it on scroll.
    await page.getByRole("button", { name: "Replace target" }).dispatchEvent("click")

    // the highlight moves to the element now carrying the target, and nothing is left on the old one
    await expect(page.locator("[data-tour-highlighted]")).toHaveCount(1)
    await expect(page.getByRole("heading", { name: "Replacement target" })).toHaveAttribute(
      "data-tour-highlighted",
      "",
    )

    // and the spotlight follows it rather than staying on a node that has left the document.
    // Polled, because the position is recomputed asynchronously, on the next update.
    await expect
      .poll(async () => {
        const targetRect = await I.getTargetRect()
        const spotlightRect = await I.getSpotlightRect()
        return (
          targetRect.y !== originalRect.y &&
          spotlightRect.width > targetRect.width &&
          spotlightRect.height > targetRect.height
        )
      })
      .toBe(true)
  })
})

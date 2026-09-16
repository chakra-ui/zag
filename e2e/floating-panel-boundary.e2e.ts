import { test } from "@playwright/test"
import { FloatingPanelModel } from "./models/floating-panel.model"

let I: FloatingPanelModel

test.describe("floating-panel / boundary", () => {
  test.beforeEach(async ({ page }) => {
    I = new FloatingPanelModel(page)
    await I.goto("/floating-panel/boundary")
    await I.clickTrigger()
    await I.seeContent()
  })

  test("should open centered inside the boundary for both strategies", async () => {
    await I.seeStrategy("fixed")
    await I.seeCenteredInBoundary()

    await I.clickButton("Toggle strategy")
    await I.seeStrategy("absolute")
    await I.seeCenteredInBoundary()
  })

  test("should keep its offset within the boundary while scrolling", async () => {
    const offset = await I.getOffsetInBoundary()

    await I.scrollBoundaryTo(1)
    await I.seeOffsetInBoundary(offset)

    await I.scrollBoundaryTo(0.5)
    await I.seeOffsetInBoundary(offset)

    await I.scrollBoundaryTo(0)
    await I.seeOffsetInBoundary(offset)
  })

  test("[absolute] should keep its offset within the boundary while scrolling", async () => {
    await I.clickButton("Toggle strategy")
    await I.seeStrategy("absolute")
    const offset = await I.getOffsetInBoundary()

    await I.scrollBoundaryTo(1)
    await I.seeOffsetInBoundary(offset)

    await I.scrollBoundaryTo(0)
    await I.seeOffsetInBoundary(offset)
  })

  test("should stay visually inside the boundary after scrolling", async () => {
    await I.scrollBoundaryTo(1)
    await I.seeContainedInBoundary()
  })
})

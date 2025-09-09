import { expect, test } from "@playwright/test"
import { CollapsibleModel } from "./models/collapsible.model"

let I: CollapsibleModel

test.describe("collapsible", () => {
  test.beforeEach(async ({ page }) => {
    I = new CollapsibleModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("[toggle] should be open when clicked", async () => {
    await I.clickTrigger()
    await I.seeContent()

    await I.clickTrigger()
    await I.dontSeeContent()
  })

  test("[closed] content should not be reachable via tab key", async () => {
    await I.clickTrigger()
    await I.seeContent()

    await I.clickTrigger()
    await I.dontSeeContent()

    await I.pressKey("Tab")
    await expect(I.host.getByTestId("open-button")).toBeFocused()
  })
})

import { test } from "@playwright/test"
import { NavigationMenuModel } from "./models/navigation-menu.model"

let I: NavigationMenuModel

test.describe("navigation-menu", () => {
  test.beforeEach(async ({ page }) => {
    I = new NavigationMenuModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("should open on hover", async () => {
    await I.hoverTrigger("products")
    await I.seeContent("products")
  })
})

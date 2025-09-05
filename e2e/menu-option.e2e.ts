import { test } from "@playwright/test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("menu option", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/menu-options")
  })

  test("mouse, should check/uncheck radio item", async () => {
    await I.clickTrigger()
    await I.clickItem("Ascending")

    await I.dontSeeDropdown()
    await I.seeItemIsChecked("Ascending")

    await I.clickTrigger()
    await I.clickItem("Descending")

    await I.seeItemIsChecked("Descending")
    await I.seeItemIsNotChecked("Ascending")
  })

  test("keyboard, should check/uncheck radio item", async () => {
    await I.focusTrigger()
    await I.seeTriggerIsFocused()
    await I.pressKey("Enter")
    await I.seeDropdownIsFocused()
    await I.pressKey("Enter")

    await I.dontSeeDropdown()
    await I.seeItemIsChecked("Ascending")

    // navigate the 'Descending' item
    await I.pressKey("Enter")
    await I.seeDropdownIsFocused()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")

    await I.seeItemIsChecked("Descending")
    await I.seeItemIsNotChecked("Ascending")
  })

  test("mouse, should check/uncheck checkbox item", async () => {
    await I.clickTrigger()
    await I.clickItem("Email")

    await I.dontSeeDropdown()
    await I.seeItemIsChecked("Email")

    await I.clickTrigger()
    await I.clickItem("Phone")

    await I.seeItemIsChecked("Phone")
    await I.seeItemIsChecked("Email")
  })

  test("keyboard, should check/uncheck checkbox item", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")

    // navigate the 'Email' item
    await I.pressKey("ArrowDown", 3)
    await I.pressKey("Enter")
    await I.seeItemIsChecked("Email")

    // open the menu
    await I.focusTrigger()
    await I.pressKey("Enter")

    // // navigate the 'Phone' item
    await I.pressKey("ArrowDown", 4)
    await I.pressKey("Enter")

    await I.seeItemIsChecked("Email")
    await I.seeItemIsChecked("Phone")
  })
})

import { test } from "@playwright/test"
import { SelectModel } from "./models/select.model"

let I: SelectModel

test.beforeEach(async ({ page }) => {
  I = new SelectModel(page)
  await I.goto()
})

test.describe("accessibility", () => {
  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("clicking the label should focus control", async () => {
    await I.clickLabel()
    await I.seeTriggerIsFocused()
  })
})

test.describe("pointer", () => {
  test("should toggle select", async () => {
    await I.clickTrigger()
    await I.seeDropdown()

    await I.clickTrigger()
    await I.dontSeeDropdown()
  })

  test("clicking clear trigger should return focus", async () => {
    await I.clickTrigger()

    await I.clickItem("Albania")
    await I.seeTriggerHasText("Albania")

    await I.clickClearTrigger()

    await I.seeTriggerIsFocused()
    await I.seeTriggerHasText("Select option")
  })

  test("should highlight on hover", async () => {
    await I.clickTrigger()
    await I.hoverItem("Albania")
    await I.seeItemIsHighlighted("Albania")

    await I.hoverItem("Algeria")
    await I.seeItemIsHighlighted("Algeria")
  })
})

test.describe("open with keyboard", () => {
  test("should navigate on arrow down", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Afghanistan")
    await I.seeItemInViewport("Afghanistan")
  })

  test("should navigate on arrow up", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowUp", 3)
    await I.seeItemIsHighlighted("South Africa")
    await I.seeItemInViewport("South Africa")
  })

  test("should navigate on home/end", async () => {
    await I.clickTrigger()
    await I.pressKey("End")

    await I.seeItemIsHighlighted("Zimbabwe")
    await I.seeItemInViewport("Zimbabwe")

    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Andorra")
    await I.seeItemInViewport("Andorra")
  })

  test("should navigate on typeahead", async () => {
    await I.clickTrigger()
    await I.type("Cy")
    await I.seeItemIsHighlighted("Cyprus")
    await I.seeItemInViewport("Cyprus")
  })

  test("should loop through the options when loop is enabled", async () => {
    await I.controls.bool("loopFocus")

    await I.focusTrigger()
    await I.pressKey("Enter")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Zimbabwe")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Andorra")
  })
})

test.describe("keyboard / close", () => {
  test("should close on escape", async () => {
    await I.clickTrigger()
    await I.pressKey("Escape")
    await I.dontSeeDropdown()
  })
})

test.describe("keyboard / select", () => {
  test("should select on enter", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.seeItemIsChecked("Andorra")
    await I.seeTriggerHasText("Andorra")
  })

  test("should select on space", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.pressKey(" ")
    await I.seeItemIsChecked("Andorra")
    await I.seeTriggerHasText("Andorra")
  })

  test("should close on select", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.dontSeeDropdown()
  })

  test("should not close on closeOnSelect = false", async () => {
    await I.controls.bool("closeOnSelect", false)
    await I.clickTrigger()
    await I.pressKey("ArrowDown")
    await I.pressKey("Enter")
    await I.seeDropdown()
  })
})

test.describe("open / blur", () => {
  test("should close on outside click", async () => {
    await I.clickTrigger()
    await I.seeDropdown()

    await I.clickOutside()
    await I.dontSeeDropdown()
  })

  test("should close on blur - no selection", async () => {
    await I.clickTrigger()
    await I.pressKey("ArrowDown", 3)
    await I.clickOutside()
    await I.dontSeeDropdown()
    await I.seeTriggerHasText("Select option")
  })
})

test.describe("focused / open", () => {
  test("should open the select with enter key", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeDropdown()
  })

  test("should open the select with space key", async () => {
    await I.focusTrigger()
    await I.pressKey(" ")
    await I.seeDropdown()
  })

  test("should open with down arrow keys + highlight first option", async () => {
    await I.focusTrigger()
    await I.pressKey("ArrowDown")
    await I.seeDropdown()
    await I.seeItemIsHighlighted("Andorra")
  })

  test("should open with up arrow keys  + highlight last option", async () => {
    await I.focusTrigger()
    await I.pressKey("ArrowUp")
    await I.seeDropdown()
    await I.seeItemIsHighlighted("Zimbabwe")
  })
})

test.describe("closed state + keyboard selection", () => {
  test("should select last option on arrow left", async () => {
    await I.focusTrigger()
    await I.pressKey("ArrowLeft")
    await I.seeItemIsChecked("Zimbabwe")
  })

  test("should select first option on arrow right", async () => {
    await I.focusTrigger()
    await I.pressKey("ArrowRight")
    await I.seeItemIsChecked("Andorra")
  })

  test("should select next options on arrow right", async () => {
    await I.focusTrigger()

    await I.pressKey("ArrowRight")
    await I.seeItemIsChecked("Andorra")

    await I.pressKey("ArrowRight")
    await I.seeItemIsChecked("United Arab Emirates")

    await I.pressKey("ArrowRight")
    await I.seeItemIsChecked("Afghanistan")
  })

  test("should select with typeahead", async () => {
    await I.focusTrigger()
    await I.type("Nigeri")
    await I.seeItemIsChecked("Nigeria")
  })

  test("should cycle selected value with typeahead", async ({ page }) => {
    await I.focusTrigger()

    await I.type("P")
    await I.seeItemIsChecked("Panama")

    await I.type("P")
    await I.seeItemIsChecked("Peru")

    await I.type("P")
    await I.seeItemIsChecked("Papua New Guinea")

    await page.waitForTimeout(350)
    await I.type("K")
    await I.seeItemIsChecked("Kenya")
  })
})

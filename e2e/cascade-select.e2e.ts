import { test } from "@playwright/test"
import { CascadeSelectModel } from "./models/cascade-select.model"

let I: CascadeSelectModel

test.beforeEach(async ({ page }) => {
  I = new CascadeSelectModel(page)
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

test.describe("basic functionality", () => {
  test("should toggle dropdown on trigger click", async () => {
    await I.clickTrigger()
    await I.seeDropdown()
    await I.seeLevel(0)

    await I.clickTrigger()
    await I.dontSeeDropdown()
  })

  test("should show clear trigger when value is selected", async () => {
    await I.dontSeeClearTrigger()

    await I.clickTrigger()
    await I.clickItem("Dairy")
    await I.seeTriggerHasText("Dairy")
    await I.seeClearTrigger()
  })

  test("should clear value when clear trigger is clicked", async () => {
    await I.clickTrigger()
    await I.clickItem("Dairy")
    await I.seeTriggerHasText("Dairy")

    await I.clickClearTrigger()
    await I.seeTriggerHasText("Select food category")
    await I.dontSeeClearTrigger()
  })
})

test.describe("navigation and levels", () => {
  test("should show multiple levels when navigating into parent items", async () => {
    await I.clickTrigger()
    await I.seeLevel(0)
    await I.dontSeeLevel(1)

    // Click on Fruits (parent item)
    await I.clickItem("Fruits")
    await I.seeLevel(0)
    await I.seeLevel(1)
    await I.dontSeeLevel(2)

    // Click on Citrus (parent item)
    await I.clickItem("Citrus")
    await I.seeLevel(0)
    await I.seeLevel(1)
    await I.seeLevel(2)
  })

  test("should show item indicators for parent items", async () => {
    await I.clickTrigger()

    // Parent items should have indicators
    await I.seeItemHasIndicator("Fruits")
    await I.seeItemHasIndicator("Vegetables")
    await I.seeItemHasIndicator("Grains")

    // Leaf item should not have indicator
    await I.dontSeeItemHasIndicator("Dairy")
  })
})

test.describe("keyboard navigation", () => {
  test("should open dropdown with Enter and navigate with arrows", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeDropdown()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Fruits")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Vegetables")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Fruits")
  })

  test("should navigate into child level with ArrowRight", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown") // Highlight Fruits
    await I.pressKey("ArrowRight") // Navigate into Fruits

    await I.seeLevel(1)
    await I.seeItemIsHighlighted("Citrus")
  })

  test("should navigate back to parent level with ArrowLeft", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown") // Highlight Fruits
    await I.pressKey("ArrowRight") // Navigate into Fruits
    await I.pressKey("ArrowLeft") // Navigate back

    await I.seeItemIsHighlighted("Fruits")
  })

  test("should close dropdown with Escape", async () => {
    await I.clickTrigger()
    await I.seeDropdown()

    await I.pressKey("Escape")
    await I.dontSeeDropdown()
    await I.seeTriggerIsFocused()
  })

  test("should select item with Enter", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown", 4) // Navigate to Dairy
    await I.pressKey("Enter")

    await I.seeTriggerHasText("Dairy")
    await I.dontSeeDropdown()
  })

  test("should navigate with Home and End keys", async () => {
    await I.clickTrigger()

    await I.pressKey("End")
    await I.seeItemIsHighlighted("Dairy")

    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Fruits")
  })
})

test.describe("click highlighting (default)", () => {
  test("should highlight items on click for navigation", async () => {
    await I.clickTrigger()

    // Click on Fruits should highlight it
    await I.clickItem("Fruits")
    await I.seeItemIsHighlighted("Fruits")
    await I.seeLevel(1)

    // Click on Citrus should highlight it and show next level
    await I.clickItem("Citrus")
    await I.seeItemIsHighlighted("Citrus")
    await I.seeLevel(2)
  })

  test("should not highlight on hover with click trigger", async () => {
    await I.clickTrigger()

    // Hovering should not highlight
    await I.hoverItem("Fruits")
    await I.dontSeeHighlightedItems()

    // Only clicking should highlight
    await I.clickItem("Fruits")
    await I.seeItemIsHighlighted("Fruits")
  })
})

test.describe("hover highlighting", () => {
  test.beforeEach(async () => {
    // Set highlight trigger to hover (no longer the default)
    await I.controls.select("highlightTrigger", "hover")
  })

  test("should highlight parent items on hover", async () => {
    await I.clickTrigger()

    // Hovering over parent item should highlight path
    await I.hoverItem("Fruits")
    await I.seeItemIsHighlighted("Fruits")
    await I.seeLevel(1)

    // Hovering over nested parent should highlight full path
    await I.hoverItem("Citrus")
    await I.seeHighlightedItemsCount(2) // Fruits and Citrus
    await I.seeLevel(2)
  })

  test("should not highlight full path for leaf items", async () => {
    await I.clickTrigger()

    // First navigate to show levels
    await I.hoverItem("Fruits")
    await I.hoverItem("Citrus")

    // Hovering over leaf item should not include itself in highlight
    await I.hoverItem("Orange")
    await I.seeHighlightedItemsCount(2) // Should still be Fruits and Citrus, not Orange
  })

  test("should work with grace area for smooth navigation", async () => {
    await I.clickTrigger()

    // Hover over parent to show submenu
    await I.hoverItem("Fruits")
    await I.seeItemIsHighlighted("Fruits")
    await I.seeLevel(1)

    // Quickly move to submenu item - should maintain highlighting due to grace area
    await I.hoverItem("Citrus")
    await I.seeItemIsHighlighted("Citrus")
    await I.seeLevel(2)
  })

  test("should update highlighting path when navigating between different branches", async () => {
    await I.clickTrigger()

    // Navigate to Fruits -> Citrus
    await I.hoverItem("Fruits")
    await I.hoverItem("Citrus")
    await I.seeHighlightedItemsCount(2)

    // Navigate to Vegetables -> Leafy Greens
    await I.hoverItem("Vegetables")
    await I.hoverItem("Leafy Greens")
    await I.seeHighlightedItemsCount(2) // Should update to new path
    await I.seeItemIsHighlighted("Vegetables")
    await I.seeItemIsHighlighted("Leafy Greens")
  })
})

test.describe("selection behavior", () => {
  test("should select leaf items in single mode", async () => {
    await I.clickTrigger()

    // Navigate and select a leaf item
    await I.clickItem("Fruits")
    await I.clickItem("Apple")

    await I.seeTriggerHasText("Fruits / Apple")
    await I.dontSeeDropdown()
  })

  test("should allow parent selection when enabled", async () => {
    await I.controls.bool("allowParentSelection", true)

    await I.clickTrigger()
    await I.clickItem("Fruits")

    await I.seeTriggerHasText("Fruits")
  })

  test("should support multiple selection", async () => {
    await I.controls.bool("multiple", true)
    await I.controls.bool("closeOnSelect", false)

    await I.clickTrigger()

    // Select first item
    await I.clickItem("Dairy")
    await I.seeSelectedItemsCount(1)

    // Select second item
    await I.clickItem("Fruits")
    await I.clickItem("Apple")
    await I.seeSelectedItemsCount(3)

    await I.seeTriggerHasText("Dairy, Fruits / Apple")
  })

  test("should not close on select when closeOnSelect is false", async () => {
    await I.controls.bool("closeOnSelect", false)

    await I.clickTrigger()
    await I.clickItem("Dairy")

    await I.seeDropdown() // Should remain open
    await I.seeTriggerHasText("Dairy")
  })
})

test.describe("disabled and readonly states", () => {
  test("should not open when disabled", async () => {
    await I.controls.bool("disabled", true)

    // Force click the disabled trigger to test that it doesn't open
    await I.clickTriggerForced()
    await I.dontSeeDropdown()
  })

  test("should not allow selection when readonly", async () => {
    await I.controls.bool("readOnly", true)

    // Readonly should prevent opening the dropdown
    await I.clickTrigger()
    await I.dontSeeDropdown()
    await I.seeTriggerHasText("Select food category") // Should not change
  })
})

test.describe("focus management", () => {
  test("should return focus to trigger after selection", async () => {
    await I.clickTrigger()
    await I.clickItem("Dairy")

    await I.seeTriggerIsFocused()
  })

  test("should return focus to trigger after escape", async () => {
    await I.clickTrigger()
    await I.pressKey("Escape")

    await I.seeTriggerIsFocused()
  })

  test("should maintain focus within dropdown during navigation", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")

    // Content should be focused for keyboard navigation
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Fruits")
  })
})

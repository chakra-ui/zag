import { test, expect } from "@playwright/test"
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
    await I.controls.bool("allowParentSelection", true)
    await I.dontSeeClearTrigger()

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.seeTriggerHasText("Africa")
    await I.seeClearTrigger()
  })

  test("should clear value when clear trigger is clicked", async () => {
    await I.controls.bool("allowParentSelection", true)
    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.seeTriggerHasText("Africa")

    await I.clickClearTrigger()
    await I.seeTriggerHasText("Select a location")
    await I.dontSeeClearTrigger()
  })
})

test.describe("navigation and levels", () => {
  test("should show multiple levels when navigating into parent items", async () => {
    await I.clickTrigger()
    await I.seeLevel(0)
    await I.dontSeeLevel(1)

    // Click on Africa (continent)
    await I.clickItem("Africa")
    await I.seeLevel(0)
    await I.seeLevel(1)
    await I.dontSeeLevel(2)

    // Click on Algeria (country)
    await I.clickItem("Algeria")
    await I.seeLevel(0)
    await I.seeLevel(1)
    await I.seeLevel(2)
  })

  test("should show item indicators for parent items", async () => {
    await I.clickTrigger()

    // Continents should have indicators
    await I.seeItemHasIndicator("Africa")
    await I.seeItemHasIndicator("Asia")

    // Antarctica (disabled continent) should not have indicator
    await I.dontSeeItemHasIndicator("Antarctica")
  })
})

test.describe("keyboard navigation", () => {
  test("should open dropdown with Enter and navigate with arrows", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.seeDropdown()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Africa")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Asia")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Africa")
  })

  test("should navigate into child level with ArrowRight", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown") // Highlight Africa
    await I.pressKey("ArrowRight") // Navigate into Africa

    await I.seeLevel(1)
    await I.seeItemIsHighlighted("Algeria")
  })

  test("should navigate back to parent level with ArrowLeft", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown") // Highlight Africa
    await I.pressKey("ArrowRight") // Navigate into Africa
    await I.pressKey("ArrowLeft") // Navigate back

    await I.seeItemIsHighlighted("Africa")
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
    await I.pressKey("ArrowDown") // Navigate to Africa
    await I.pressKey("ArrowRight") // Navigate into Africa
    // Now we're in Algeria (first country alphabetically)
    await I.pressKey("ArrowRight") // Navigate into Algeria states
    await I.pressKey("Enter") // Select first state (Adrar)

    await I.seeTriggerHasText("Africa / Algeria / Adrar")
    await I.dontSeeDropdown() // Should close when selecting leaf item
  })

  test("should navigate with Home and End keys", async () => {
    await I.clickTrigger()

    // Test Home/End at continent level (first level)
    await I.pressKey("ArrowDown") // This should highlight Africa (first non-disabled item)
    await I.seeItemIsHighlighted("Africa")

    await I.pressKey("End")
    await I.seeItemIsHighlighted("South America") // Should be last continent

    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Africa") // Should go back to first item

    // Now test Home/End at country level (second level)
    await I.pressKey("ArrowRight") // Enter Africa (should highlight Algeria - first country)
    await I.seeItemIsHighlighted("Algeria")

    await I.pressKey("End") // Should go to last country in Africa
    await I.seeItemIsHighlighted("Zimbabwe") // Last country in Africa alphabetically

    await I.pressKey("Home") // Should go back to first country in Africa
    await I.seeItemIsHighlighted("Algeria") // First country in Africa alphabetically
  })

  test("should scroll highlighted items into view during keyboard navigation", async () => {
    await I.clickTrigger()

    // Navigate to Africa and enter it
    await I.pressKey("ArrowDown") // Highlight Africa
    await I.pressKey("ArrowRight") // Enter Africa (Algeria should be highlighted)

    // Use End key to navigate to the last country (Zimbabwe)
    await I.pressKey("End")
    await I.seeItemIsHighlighted("Zimbabwe")

    // Zimbabwe should be scrolled into view
    await I.seeItemInViewport("Zimbabwe")

    // Use Home key to go back to first country (Algeria)
    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Algeria")

    // Algeria should also be in viewport
    await I.seeItemInViewport("Algeria")
  })
})

test.describe("click highlighting (default)", () => {
  test("should highlight items on click for navigation", async () => {
    await I.clickTrigger()

    // Click on Africa should highlight it
    await I.clickItem("Africa")
    await I.seeItemIsHighlighted("Africa")
    await I.seeLevel(1)

    // Click on Algeria should highlight it and show next level
    await I.clickItem("Algeria")
    await I.seeItemIsHighlighted("Algeria")
    await I.seeLevel(2)
  })

  test("should not highlight on hover with click trigger", async () => {
    await I.clickTrigger()

    // Hovering should not highlight
    await I.hoverItem("Africa")
    await I.dontSeeHighlightedItems()

    // Only clicking should highlight
    await I.clickItem("Africa")
    await I.seeItemIsHighlighted("Africa")
  })
})

test.describe("hover highlighting", () => {
  test.beforeEach(async () => {
    // Set highlight trigger to hover
    await I.controls.select("highlightTrigger", "hover")
  })

  test("should highlight parent items on hover", async () => {
    await I.clickTrigger()

    // Hovering over continent should highlight path
    await I.hoverItem("Africa")
    await I.seeItemIsHighlighted("Africa")
    await I.seeLevel(1)

    // Hovering over country should highlight full path
    await I.hoverItem("Algeria")
    await I.seeHighlightedItemsCount(2) // Africa and Algeria
    await I.seeLevel(2)
  })

  test("should not highlight full path for leaf items", async () => {
    await I.clickTrigger()

    // Navigate to states level
    await I.hoverItem("Africa")
    await I.hoverItem("Algeria")

    // Hovering over state (leaf) should only highlight path to parent
    await I.hoverItem("Adrar")
    await I.seeHighlightedItemsCount(2) // Africa and Algeria (not Adrar)
  })

  test("should support grace area for smooth navigation", async () => {
    await I.clickTrigger()

    await I.hoverItem("Africa")
    await I.seeItemIsHighlighted("Africa")

    // Moving mouse outside should keep highlighting due to grace area
    await I.clickOutside()
    await I.seeItemIsHighlighted("Africa")
  })
})

test.describe("selection behavior", () => {
  test("should not allow selection of disabled items", async () => {
    await I.clickTrigger()

    // Antarctica is disabled - force clicking should not select it
    await I.page.locator('[data-part="item"][data-value="antarctica"]').click({ force: true })

    // Should remain at placeholder text since Antarctica can't be selected
    await I.seeTriggerHasText("Select a location")
    await I.seeDropdown() // Should remain open since no selection happened
  })

  test("should select valid continent when parent selection is allowed", async () => {
    await I.controls.bool("allowParentSelection", true)

    await I.clickTrigger()
    await I.clickItem("Africa")

    await I.seeTriggerHasText("Africa")
    await I.seeDropdown() // Should remain open when selecting parent items
  })

  test("should select country when parent selection is allowed", async () => {
    await I.controls.bool("allowParentSelection", true)

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")

    await I.seeTriggerHasText("Africa / Algeria")
    await I.seeDropdown() // Should remain open when selecting parent items
  })

  test("should navigate to state level without parent selection", async () => {
    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar")

    await I.seeTriggerHasText("Africa / Algeria / Adrar")
    await I.dontSeeDropdown() // Should close when selecting final leaf item
  })

  test("should support multiple selection", async () => {
    await I.controls.bool("multiple", true)
    await I.controls.bool("closeOnSelect", false)

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar") // Select leaf item

    await I.clickItem("Asia")
    await I.clickItem("Afghanistan")
    await I.clickItem("Badakhshān") // Select another leaf item

    await I.seeTriggerHasText("Africa / Algeria / Adrar, Asia / Afghanistan / Badakhshān")
    await I.seeDropdown() // Should remain open because closeOnSelect is false
  })
})

test.describe("disabled and readonly states", () => {
  test("should not open dropdown when disabled", async () => {
    await I.controls.bool("disabled", true)
    await I.clickTriggerForced()
    await I.dontSeeDropdown()
  })

  test("should not open dropdown when readonly", async () => {
    await I.controls.bool("readOnly", true)
    await I.clickTrigger()
    await I.dontSeeDropdown()
  })
})

test.describe("focus management", () => {
  test("should maintain focus within dropdown during navigation", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")

    // Content should be focused for keyboard navigation
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Africa")
  })
})

test.describe("separator configuration", () => {
  test("should use default separator in trigger text", async () => {
    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar")

    await I.seeTriggerHasText("Africa / Algeria / Adrar")
  })

  test("should use custom separator in trigger text", async () => {
    await I.controls.num("separator", " → ")

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar")

    await I.seeTriggerHasText("Africa → Algeria → Adrar")
  })

  test("should use custom separator in multiple selection", async () => {
    await I.controls.bool("multiple", true)
    await I.controls.bool("closeOnSelect", false)
    await I.controls.num("separator", " | ")

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar")

    await I.clickItem("Asia")
    await I.clickItem("Afghanistan")
    await I.clickItem("Badakhshān")

    await I.seeTriggerHasText("Africa | Algeria | Adrar, Asia | Afghanistan | Badakhshān")
  })

  test("should use custom separator in nested paths", async () => {
    await I.controls.num("separator", " :: ")

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar")

    await I.seeTriggerHasText("Africa :: Algeria :: Adrar")
  })

  test("should use separator in clear functionality", async () => {
    await I.controls.num("separator", " > ")

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar")

    await I.seeTriggerHasText("Africa > Algeria > Adrar")

    await I.clickClearTrigger()
    await I.seeTriggerHasText("Select a location")
  })

  test("should preserve separator in form values", async () => {
    await I.controls.num("separator", " >> ")

    await I.clickTrigger()
    await I.clickItem("Africa")
    await I.clickItem("Algeria")
    await I.clickItem("Adrar")

    // Verify the hidden select element has the correct value
    const hiddenSelect = await I.page.locator("select").first()
    const value = await hiddenSelect.inputValue()
    expect(value).toContain("africa >> algeria >> adrar")
  })
})

test.describe("disabled items", () => {
  test("should visually indicate disabled items", async () => {
    await I.clickTrigger()

    // Antarctica should have disabled styling
    const antarcticaItem = I.page.locator('[data-part="item"][data-value="antarctica"]')
    await expect(antarcticaItem).toHaveAttribute("data-disabled")
    await expect(antarcticaItem).toHaveAttribute("aria-disabled", "true")
  })

  test("should not respond to clicks on disabled items", async () => {
    await I.clickTrigger()
    await I.seeTriggerHasText("Select a location")

    // Try to force click Antarctica (disabled) - using force to bypass Playwright protection
    await I.page.locator('[data-part="item"][data-value="antarctica"]').click({ force: true })

    // Should not change the trigger text or close dropdown
    await I.seeTriggerHasText("Select a location")
    await I.seeDropdown()
  })

  test("should not respond to hover on disabled items when hover highlighting is enabled", async () => {
    await I.controls.select("highlightTrigger", "hover")
    await I.clickTrigger()

    // Hovering over disabled item should not trigger highlighting
    await I.hoverItem("Antarctica")
    await I.dontSeeHighlightedItems()
  })

  test("should skip disabled items during keyboard navigation", async () => {
    await I.clickTrigger()
    await I.pressKey("Home") // Go to first item
    await I.seeItemIsHighlighted("Africa") // Should be Africa, not Antarctica

    // Navigate down - should skip Antarctica and go to Asia
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Asia") // Should skip Antarctica

    // Navigate up - should go back to Africa, skipping Antarctica
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Africa")
  })
})

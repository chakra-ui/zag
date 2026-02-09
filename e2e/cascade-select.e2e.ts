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
    await I.seeList(0)

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

test.describe("navigation and lists", () => {
  test("should show multiple lists when navigating into parent items", async () => {
    await I.clickTrigger()
    await I.seeList(0)
    await I.dontSeeList(1)

    // Click on Africa (continent)
    await I.clickItem("Africa")
    await I.seeList(0)
    await I.seeList(1)
    await I.dontSeeList(2)

    // Click on Algeria (country)
    await I.clickItem("Algeria")
    await I.seeList(0)
    await I.seeList(1)
    await I.seeList(2)
  })

  test("should show item indicators for parent items", async () => {
    await I.controls.bool("allowParentSelection", true)
    await I.controls.bool("multiple", true)
    await I.controls.bool("closeOnSelect", false)

    await I.clickTrigger()

    // Select parent items to show their indicators
    await I.clickItem("Africa")
    await I.seeItemHasIndicator("Africa")

    await I.clickItem("Asia")
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
    await I.seeItemIsHighlighted("Asia")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Europe")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Asia")
  })

  test("should navigate into child list with ArrowRight", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown") // Highlight Asia
    await I.pressKey("ArrowRight") // Navigate into Asia

    await I.seeList(1)
    await I.seeItemIsHighlighted("Afghanistan")
  })

  test("should navigate back to parent list with ArrowLeft", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")
    await I.pressKey("ArrowDown") // Highlight Asia
    await I.pressKey("ArrowRight") // Navigate into Asia
    await I.pressKey("ArrowLeft") // Navigate back

    await I.seeItemIsHighlighted("Asia")
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
    await I.pressKey("ArrowDown") // Navigate to Asia
    await I.pressKey("ArrowRight") // Navigate into Asia
    // Now we're in Afghanistan (first country alphabetically)
    await I.pressKey("ArrowRight") // Navigate into Afghanistan states
    await I.pressKey("Enter") // Select first state (Badakhshān)

    await I.seeTriggerHasText("Asia / Afghanistan / Badakhshān")
    await I.dontSeeDropdown() // Should close when selecting leaf item
  })

  test("should navigate with Home and End keys", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")

    // Test Home/End at continent list (first list)
    await I.seeItemIsHighlighted("Africa")

    await I.pressKey("End")
    await I.seeItemIsHighlighted("South America") // Should be last continent

    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Africa") // Should go back to first item

    // Now test Home/End at country list (second list)
    await I.pressKey("ArrowRight") // Enter Africa (should highlight Algeria - first country)
    await I.seeItemIsHighlighted("Algeria")

    await I.pressKey("End") // Should go to last country in Africa
    await I.seeItemIsHighlighted("Zimbabwe") // Last country in Africa alphabetically

    await I.pressKey("Home") // Should go back to first country in Africa
    await I.seeItemIsHighlighted("Algeria") // First country in Africa alphabetically
  })

  test("should scroll highlighted items into view during keyboard navigation", async () => {
    await I.focusTrigger()
    await I.pressKey("Enter")

    // Navigate to Africa and enter it
    await I.pressKey("ArrowDown") // Highlight Asia
    await I.pressKey("ArrowRight") // Enter Asia (Afghanistan should be highlighted)

    // Use End key to navigate to the last country (Yemen)
    await I.pressKey("End")
    await I.seeItemIsHighlighted("Yemen")

    // Yemen should be scrolled into view
    await I.seeItemInViewport("Yemen")

    // Use Home key to go back to first country (Afghanistan)
    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Afghanistan")

    // Afghanistan should also be in viewport
    await I.seeItemInViewport("Afghanistan")
  })
})

test.describe("click highlighting (default)", () => {
  test("should highlight items on click for navigation", async () => {
    await I.clickTrigger()

    // Click on Africa should highlight it
    await I.clickItem("Africa")
    await I.seeItemIsHighlighted("Africa")
    await I.seeList(1)

    // Click on Algeria should highlight it and show next list
    await I.clickItem("Algeria")
    await I.seeItemIsHighlighted("Algeria")
    await I.seeList(2)
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
    await I.seeList(1)

    // Hovering over country should highlight full path
    await I.hoverItem("Algeria")
    await I.seeHighlightedItemsCount(2) // Africa and Algeria
    await I.seeList(2)
  })

  test("should not highlight full path for leaf items", async () => {
    await I.clickTrigger()

    // Navigate to states list
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
    await I.hoverOut()
    await I.seeItemIsHighlighted("Africa")
  })
})

test.describe("selection behavior", () => {
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

  test("should navigate to state list without parent selection", async () => {
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

    await I.seeTriggerHasText("Adrar, Badakhshān")
    await I.seeDropdown() // Should remain open because closeOnSelect is false
  })
})

test.describe("advanced selection behavior", () => {
  test.describe("parent selection allowed", () => {
    test.beforeEach(async () => {
      await I.controls.bool("allowParentSelection", true)
    })

    test("should allow selecting parent items and keep them highlighted", async () => {
      await I.clickTrigger()

      // Select continent
      await I.clickItem("Africa")
      await I.seeTriggerHasText("Africa")
      await I.seeItemIsHighlighted("Africa") // Should remain highlighted since it has children
      await I.seeList(1) // Should show countries list

      // Select country
      await I.clickItem("Algeria")
      await I.seeTriggerHasText("Africa / Algeria")
      await I.seeItemIsHighlighted("Algeria") // Should remain highlighted since it has children
      await I.seeList(2) // Should show states list
    })

    test("should clear highlighting when selecting leaf items", async () => {
      await I.clickTrigger()
      await I.clickItem("Africa")
      await I.clickItem("Algeria")

      // Select leaf item (state)
      await I.clickItem("Adrar")
      await I.seeTriggerHasText("Africa / Algeria / Adrar")
      await I.dontSeeHighlightedItems() // Should clear highlighting for leaf items
    })

    test("should resolve parent/child conflicts in multiple mode", async () => {
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // First select a parent (continent)
      await I.clickItem("Africa")
      await I.seeTriggerHasText("Africa")

      // Then select a child (country in that continent)
      await I.clickItem("Algeria")

      // Should only show the child, parent should be removed due to conflict
      await I.seeTriggerHasText("Algeria")
    })

    test("should remove child when parent is selected in multiple mode", async () => {
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // First select a child (country)
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.seeTriggerHasText("Algeria")

      // Go back and select the parent (continent)
      await I.clickItem("Africa") // Navigate back to continent level
      await I.clickItem("Africa") // Select the continent

      // Should only show the parent, child should be removed due to conflict
      await I.seeTriggerHasText("Africa")
    })

    test("should handle multiple non-conflicting selections", async () => {
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Select from Africa
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.seeTriggerHasText("Algeria")

      // Select from Asia (different continent, no conflict)
      await I.clickItem("Asia")
      await I.clickItem("Afghanistan")

      // Should show both selections
      await I.seeTriggerHasText("Algeria, Afghanistan")
    })
  })

  test.describe("parent selection not allowed (default)", () => {
    test("should navigate through parents without selecting them", async () => {
      await I.clickTrigger()

      // Click continent - should navigate, not select
      await I.clickItem("Africa")
      await I.seeTriggerHasText("Select a location") // Should not change trigger text
      await I.seeList(1) // Should show countries list
      await I.seeItemIsHighlighted("Africa") // Should highlight for navigation

      // Click country - should navigate, not select
      await I.clickItem("Algeria")
      await I.seeTriggerHasText("Select a location") // Should still not change trigger text
      await I.seeList(2) // Should show states list
      await I.seeItemIsHighlighted("Algeria") // Should highlight for navigation
    })

    test("should only select leaf items", async () => {
      await I.clickTrigger()
      await I.clickItem("Africa")
      await I.clickItem("Algeria")

      // Click state (leaf item) - should select
      await I.clickItem("Adrar")
      await I.seeTriggerHasText("Africa / Algeria / Adrar") // Should update trigger text
      await I.dontSeeDropdown() // Should close dropdown
    })

    test("should support multiple leaf selections with toggle", async () => {
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Select first leaf
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar")
      await I.seeTriggerHasText("Adrar")

      // Select second leaf from different path
      await I.clickItem("Asia")
      await I.clickItem("Afghanistan")
      await I.clickItem("Badakhshān")
      await I.seeTriggerHasText("Adrar, Badakhshān")

      // Toggle off first selection
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar") // Click again to deselect
      await I.seeTriggerHasText("Badakhshān") // Should only show second selection
    })

    test("should use most recent selection as base for navigation in multiple mode", async () => {
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Make first selection
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar")
      await I.seeTriggerHasText("Adrar")

      // Navigate to different continent - should use most recent path as base
      await I.clickItem("Asia") // Should navigate from current position
      await I.seeList(1) // Should show Asian countries
    })
  })

  test.describe("close on select behavior", () => {
    test("should not close when selecting parent items", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.controls.bool("closeOnSelect", true)
      await I.clickTrigger()

      // Select parent item
      await I.clickItem("Africa")
      await I.seeDropdown() // Should remain open for parent items
    })

    test("should close when selecting leaf items", async () => {
      await I.controls.bool("closeOnSelect", true)
      await I.clickTrigger()

      // Navigate to and select leaf item
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar") // Leaf item
      await I.dontSeeDropdown() // Should close for leaf items
    })

    test("should respect closeOnSelect false for leaf items", async () => {
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Select leaf item
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar")
      await I.seeDropdown() // Should remain open when closeOnSelect is false
    })
  })

  test.describe("value formatting", () => {
    test("should format single selection as full path", async () => {
      await I.clickTrigger()
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar")

      await I.seeTriggerHasText("Africa / Algeria / Adrar")
    })

    test("should format multiple selections as comma-separated leaf names", async () => {
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Select first item
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar")

      // Select second item
      await I.clickItem("Asia")
      await I.clickItem("Afghanistan")
      await I.clickItem("Badakhshān")

      // In multiple mode, should show only leaf names
      await I.seeTriggerHasText("Adrar, Badakhshān")
    })

    test("should format parent selections correctly when allowed", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Select a parent item
      await I.clickItem("Africa")
      await I.seeTriggerHasText("Africa") // Should show full path for parent

      // Select another parent from different continent
      await I.clickItem("Asia")
      await I.seeTriggerHasText("Africa, Asia") // Should show both in multiple mode
    })
  })

  test.describe("edge cases", () => {
    test("should handle rapid selections correctly", async () => {
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Rapid selections
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar")

      await I.clickItem("Asia")
      await I.clickItem("Afghanistan")
      await I.clickItem("Badakhshān")

      await I.clickItem("Europe")
      await I.clickItem("France")
      await I.clickItem("Auvergne")

      // Should handle all selections correctly
      await I.seeTriggerHasText("Adrar, Badakhshān, Auvergne")
    })

    test("should maintain correct highlighting during complex navigation", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.clickTrigger()

      // Select parent, then navigate deeper
      await I.clickItem("Africa")
      await I.seeItemIsHighlighted("Africa")

      await I.clickItem("Algeria")
      await I.seeItemIsHighlighted("Algeria")

      // Navigate to leaf
      await I.clickItem("Adrar")
      await I.dontSeeHighlightedItems() // Should clear highlighting for leaf
    })

    test("should handle conflicting paths correctly in complex scenarios", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Create a complex scenario with nested conflicts
      await I.clickItem("Africa") // Select continent
      await I.seeTriggerHasText("Africa")

      await I.clickItem("Algeria") // Select country (should remove continent)
      await I.seeTriggerHasText("Algeria")

      await I.clickItem("Adrar") // Select state (should remove country)
      await I.seeTriggerHasText("Adrar")

      // Now select a different continent
      await I.clickItem("Asia")
      await I.seeTriggerHasText("Adrar, Asia") // Should have both
    })

    test("should handle same-level selections in multiple mode", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Select multiple countries from the same continent
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.seeTriggerHasText("Algeria")

      // Select another country
      await I.clickItem("Egypt")
      await I.seeTriggerHasText("Algeria, Egypt") // Should have both countries
    })
  })

  test.describe("keyboard selection behavior", () => {
    test("should select items with Enter key respecting parent selection rules", async () => {
      await I.focusTrigger()
      await I.pressKey("Enter")

      // Navigate to item and select with Enter
      await I.pressKey("ArrowDown") // Asia
      await I.pressKey("Enter") // Should not select (parent item, allowParentSelection false)
      await I.seeTriggerHasText("Select a location")

      // Navigate deeper and select leaf
      await I.pressKey("ArrowRight") // Enter Asia
      await I.pressKey("ArrowRight") // Enter Afghanistan
      await I.pressKey("Enter") // Select leaf item
      await I.seeTriggerHasText("Asia / Afghanistan / Badakhshān")
      await I.dontSeeDropdown() // Should close
    })

    test("should allow keyboard selection of parents when enabled", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.focusTrigger()
      await I.pressKey("Enter")

      // Select parent with Enter
      await I.pressKey("ArrowDown") // Asia
      await I.pressKey("Enter") // Should select parent
      await I.seeTriggerHasText("Asia")
    })

    test("should support keyboard multiple selection toggle", async () => {
      await I.controls.bool("multiple", true)
      await I.focusTrigger()
      await I.pressKey("Enter")

      // Select first item
      await I.pressKey("ArrowDown") // Asia
      await I.pressKey("ArrowRight") // Enter Asia
      await I.pressKey("ArrowRight") // Enter Afghanistan
      await I.pressKey("Enter") // Select Badakhshān
      await I.seeTriggerHasText("Badakhshān")

      // Navigate to second item
      await I.pressKey("ArrowLeft") // Back to Afghanistan
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowDown") // China
      await I.pressKey("ArrowRight") // Enter China
      await I.pressKey("Enter") // Select Guangxi
      await I.seeTriggerHasText("Badakhshān, Guangxi")

      // Toggle off first selection
      await I.pressKey("ArrowLeft") // Back to China level
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowUp")
      await I.pressKey("ArrowUp") // Afghanistan
      await I.pressKey("ArrowRight") // Enter Afghanistan
      await I.pressKey("Enter") // Deselect Badakhshān
      await I.seeTriggerHasText("Guangxi")
    })
  })

  test.describe("interaction with other features", () => {
    test("should clear value and maintain consistency", async () => {
      await I.controls.bool("multiple", true)
      await I.clickTrigger()

      // Make multiple selections
      await I.clickItem("Africa")
      await I.clickItem("Algeria")
      await I.clickItem("Adrar")

      await I.clickItem("Asia")
      await I.clickItem("Afghanistan")
      await I.clickItem("Badakhshān")

      await I.seeTriggerHasText("Adrar, Badakhshān")

      // Clear all values
      await I.clickClearTrigger()
      await I.seeTriggerHasText("Select a location")
      await I.dontSeeClearTrigger()
    })

    test("should handle disabled items during selection attempts", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.clickTrigger()

      // Try to select disabled item (should not work)
      await I.getItem("Antarctica").click({ force: true })
      await I.seeTriggerHasText("Select a location") // Should not change

      // Select valid item to confirm selection still works
      await I.clickItem("Africa")
      await I.seeTriggerHasText("Africa")
    })

    test("should maintain selection state when reopening dropdown", async () => {
      await I.controls.bool("allowParentSelection", true)
      await I.clickTrigger()
      await I.clickItem("Africa")
      await I.seeTriggerHasText("Africa")

      // Close and reopen
      await I.clickTrigger() // Close
      await I.dontSeeDropdown()

      await I.clickTrigger() // Reopen
      await I.seeDropdown()
      await I.seeItemIsHighlighted("Africa") // Should restore highlighting
      await I.seeList(1) // Should show the countries list
    })

    test("should handle complex selection with hover highlighting", async () => {
      await I.controls.select("highlightTrigger", "hover")
      await I.controls.bool("allowParentSelection", true)
      await I.controls.bool("multiple", true)
      await I.controls.bool("closeOnSelect", false)
      await I.clickTrigger()

      // Hover should highlight, click should select
      await I.hoverItem("Africa")
      await I.seeItemIsHighlighted("Africa")

      await I.clickItem("Africa") // Select
      await I.seeTriggerHasText("Africa")

      // Hover different item
      await I.hoverItem("Asia")
      await I.seeItemIsHighlighted("Asia")

      await I.clickItem("Asia") // Select second
      await I.seeTriggerHasText("Africa, Asia")
    })
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
    await I.seeItemIsHighlighted("Asia")
  })
})

test.describe("disabled items", () => {
  test("should visually indicate disabled items", async () => {
    await I.clickTrigger()

    // Antarctica should have disabled styling
    const antarcticaItem = I.getItem("Antarctica")
    await expect(antarcticaItem).toHaveAttribute("data-disabled")
    await expect(antarcticaItem).toHaveAttribute("aria-disabled", "true")
  })

  test("should not respond to clicks on disabled items", async () => {
    await I.clickTrigger()
    await I.seeTriggerHasText("Select a location")

    // Try to force click Antarctica (disabled) - using force to bypass Playwright protection
    await I.getItem("Antarctica").click({ force: true })

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

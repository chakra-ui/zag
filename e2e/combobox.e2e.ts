import { expect, test, type Page } from "@playwright/test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel
const swapiPeople = ["Luke Skywalker", "Leia Organa", "Lando Calrissian", "Han Solo"]

const mockSwapiPeople = async (page: Page) => {
  await page.route("https://swapi.py4e.com/api/people/*", async (route) => {
    const search = new URL(route.request().url()).searchParams.get("search")?.toLowerCase() ?? ""
    const people = swapiPeople
      .filter((name) => name.toLowerCase().includes(search))
      .map((name, index) => ({ name, url: `https://swapi.py4e.com/api/people/${index + 1}/` }))

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: people.length,
        next: null,
        previous: null,
        results: people,
      }),
    })
  })
}

test.describe("combobox", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("[pointer] should open combobox menu when arrow is clicked", async () => {
    await I.clickTrigger()
    await I.seeDropdown()
    await I.seeInputIsFocused()
  })

  test("[keyboard] Escape should close content", async () => {
    await I.clickTrigger()
    await I.seeDropdown()
    await I.seeInputIsFocused()
    await I.pressKey("Escape")
    await I.dontSeeDropdown()
  })

  test("[keyboard] should open combobox menu when typing", async () => {
    await I.focusInput()
    await I.type("c")
    await I.seeDropdown()
    await I.seeInputIsFocused()
    await I.type("an")
    await I.seeItemIsHighlighted("Canada")
    await I.seeInputIsFocused()

    await I.pressKey("Enter")
    await I.seeInputHasValue("Canada")
    await I.dontSeeDropdown()
  })

  test("[pointer / selection]", async () => {
    await I.clickTrigger()

    await I.hoverItem("Zambia")
    await I.seeItemIsHighlighted("Zambia")

    await I.clickItem("Zambia")
    await I.seeInputHasValue("Zambia")
    await I.dontSeeDropdown()
  })

  test("[pointer] select and select again", async () => {
    await I.clickTrigger()

    await I.clickItem("Zambia")
    await I.seeInputHasValue("Zambia")

    await I.clickTrigger()
    await I.clickItem("Canada")

    await I.seeInputHasValue("Canada")
  })

  test("[keyboard / loop] on arrow down, open and highlight first enabled option", async () => {
    await I.focusInput()
    await I.pressKey("ArrowDown")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / no-loop] on arrow down, open and highlight first enabled option", async () => {
    await I.controls.bool("loopFocus", false)

    await I.focusInput()
    await I.pressKey("ArrowDown")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Zambia")
  })

  test("[keyboard / loop] on arrow up, open and highlight last enabled option", async () => {
    await I.focusInput()
    await I.pressKey("ArrowUp")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / no-loop] on arrow up, open and highlight last enabled option", async () => {
    await I.controls.bool("loopFocus", false)

    await I.focusInput()
    await I.pressKey("ArrowUp")

    await I.seeDropdown()
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / open] on home and end, when open, focus first and last option", async () => {
    await I.clickTrigger()

    await I.pressKey("ArrowDown", 3)
    await I.seeItemIsHighlighted("Canada")

    await I.pressKey("Home")
    await I.seeItemIsHighlighted("Zambia")

    await I.pressKey("End")
    await I.seeItemIsHighlighted("Tunisia")
  })

  test("[keyboard / closed] on home and end, caret moves to start and end", async () => {
    await I.clickTrigger()
    await I.type("an")
    await I.seeInputHasValue("an")
    await I.pressKey("Escape")

    await I.pressKey("Home")
    await I.seeCaretAt(0)

    await I.pressKey("End")
    await I.seeCaretAt(2)
  })

  test("[keyboard / arrowdown / loop]", async () => {
    await I.type("mal")

    await I.pressKey("ArrowDown", 4)
    await I.seeItemIsHighlighted("Malta")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
  })

  test("[keyboard / arrowdown / no-loop]", async () => {
    await I.controls.bool("loopFocus", false)

    await I.type("mal")
    await I.pressKey("ArrowDown", 4)
    await I.seeItemIsHighlighted("Malta")

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malta")
  })

  test("[keyboard / arrowup / loop]", async () => {
    await I.type("mal")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Malta")
  })

  test("[keyboard / arrowup / no-loop]", async () => {
    await I.controls.bool("loopFocus", false)
    await I.type("mal")
    await I.pressKey("ArrowUp")
    await I.seeItemIsHighlighted("Malawi")
  })

  test("[pointer / open-on-click]", async () => {
    await I.controls.bool("openOnClick", true)
    await I.clickInput()
    await I.seeDropdown()
  })

  test("selects value on click", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeItemIsChecked("Zambia")
  })

  test("can clear value", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.clickTrigger()
    await I.clickClearTrigger()
    await I.seeInputHasValue("")
    await I.seeItemIsNotChecked("Zambia")
  })

  test("should scroll selected option into view", async () => {
    await I.clickTrigger()
    await I.clickItem("Malta")
    await I.clickTrigger()
    await I.seeItemIsHighlighted("Malta")
    await I.seeItemInViewport("Malta")
  })

  test("[selection=clear] should clear input value", async () => {
    await I.controls.select("selectionBehavior", "clear")
    await I.type("mal")
    await I.pressKey("Enter")
    await I.seeInputHasValue("")
  })

  test("[callback] onValueChange should include selected item in items", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeOnValueChangeItems("Zambia")
  })

  test("[callback] onValueChange items should be empty after clearing", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeOnValueChangeItems("Zambia")
    await I.clickTrigger()
    await I.clickClearTrigger()
    await I.seeOnValueChangeItemsIsEmpty()
  })

  test("[callback] onValueChange items should track latest selected item", async () => {
    await I.clickTrigger()
    await I.clickItem("Zambia")
    await I.seeOnValueChangeItems("Zambia")

    await I.clickTrigger()
    await I.clickItem("Canada")
    await I.seeOnValueChangeItems("Canada")
    await expect(I.valueChangeText).not.toContainText("Zambia")
  })

  test("[no value] enter behavior for custom values", async () => {
    await I.controls.select("inputBehavior", "none")
    await I.type("foo")
    await I.pressKey("Enter")
    await I.seeInputHasValue("")
  })

  test("[value] enter reverts the value", async () => {
    await I.controls.select("inputBehavior", "none")
    await I.type("mal")
    await I.clickItem("Malawi")

    await I.pressKey("ControlOrMeta+A")
    await I.type("foo")
    await I.pressKey("Enter")

    await I.seeInputHasValue("Malawi")
  })

  test("[composition] controlled-ignore should keep selectedItems aligned with controlled value", async ({ page }) => {
    await I.goto("/combobox/controlled-ignore")
    await I.clickTrigger()
    await I.clickItem("Vue")

    const selectedItems = page.getByTestId("selected-items")
    await expect(selectedItems).toContainText("React")
    await expect(selectedItems).not.toContainText("Vue")
  })

  test("[composition] external value change should keep item selection in sync", async ({ page }) => {
    await I.goto("/combobox/external-value-change")
    await I.clickInput()
    await I.type("vu")
    await I.seeDropdown()

    await I.pressKey("Escape")
    await page.getByTestId("set-solid-button").click()
    await expect(page.getByTestId("input")).toHaveValue("Solid")
    await I.clickTrigger()
    await expect(page.locator("[data-combobox-item]", { hasText: "Solid" })).toHaveAttribute("data-state", "checked")
  })

  test("[composition] async list should filter server results as user types", async ({ page }) => {
    await mockSwapiPeople(page)

    await I.goto("/combobox/async")
    await I.clickInput()
    await I.type("lan")
    await I.seeDropdown()

    await expect(page.locator("[data-combobox-item]", { hasText: "Lando Calrissian" })).toBeVisible()
    await expect(page.locator("[data-combobox-item]", { hasText: "Leia Organa" })).not.toBeVisible()
    await expect(page.locator("[data-combobox-item]", { hasText: "Luke Skywalker" })).not.toBeVisible()
  })

  test("[composition] async list should select fetched item", async ({ page }) => {
    await mockSwapiPeople(page)

    await I.goto("/combobox/async")
    await I.clickInput()
    await I.type("luk")
    await I.seeDropdown()
    await I.clickItem("Luke Skywalker")

    await I.seeInputHasValue("Luke Skywalker")
    await expect(page.getByTestId("selected-value")).toContainText("Luke Skywalker")
  })
})

test.describe("combobox / autocomplete", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto()
    await I.controls.select("inputBehavior", "autocomplete")
  })

  test("[keyboard] should autocomplete", async () => {
    await I.type("mal")
    await I.dontSeeHighlightedItem()
    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
    await I.pressKey("Enter")
    await I.seeInputHasValue("Malawi")
    await I.dontSeeDropdown()
  })

  test("[keyboard / loop] should loop through the options and previous input value", async () => {
    await I.type("mal")
    await I.pressKey("ArrowDown", 5)
    await I.seeItemIsHighlighted("Malta")

    // at the end of the list, press arrow down to return to previous input value
    await I.pressKey("ArrowDown")
    await I.seeInputHasValue("mal")

    // no option should be selected
    await I.dontSeeHighlightedItem()
  })

  test("[pointer] hovering an option should not update input value", async () => {
    await I.clickTrigger()
    await I.type("mal")

    await I.hoverItem("Malawi")
    await I.seeInputHasValue("mal")
  })
})

test.describe("combobox / multiple", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/multiple")
  })

  test("should toggle the same item", async () => {
    await I.type("mal")
    await I.seeDropdown()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
    await I.pressKey("Enter")

    await I.seeValueText("Malawi")

    await I.pressKey("Enter")
    await I.dontSeeValueText()
  })

  test("[removeSelected=true] should not toggle the same item", async () => {
    await I.controls.bool("removeSelected", true)

    await I.type("mal")
    await I.seeDropdown()

    await I.pressKey("ArrowDown")
    await I.seeItemIsHighlighted("Malawi")
    await I.pressKey("Enter")

    await I.seeValueText("Malawi")

    await I.pressKey("Enter")
    await I.seeValueText("Malawi")
  })
})

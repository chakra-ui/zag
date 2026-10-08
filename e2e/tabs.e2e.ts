import { expect, test } from "@playwright/test"
import { TabsModel } from "./models/tabs.model"

let I: TabsModel

test.describe("tabs", () => {
  test.beforeEach(async ({ page }) => {
    I = new TabsModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("on home key, select first tab", async () => {
    await I.clickTab("agnes")
    await I.pressKey("Home")

    await I.seeTabIsFocused("nils")
    await I.seeTabContent("nils")
  })

  test("on end key, select last tab", async () => {
    await I.clickTab("agnes")
    await I.pressKey("End")

    await I.seeTabIsFocused("joke")
    await I.seeTabContent("joke")
  })

  test("click tab, select tab", async () => {
    await I.clickTab("agnes")
    await I.seeTabContent("agnes")
  })

  test("should deselect", async () => {
    await I.controls.bool("deselectable", true)

    await I.clickTab("agnes")
    await I.seeTabContent("agnes")

    await I.clickTab("agnes")
    await I.dontSeeTabContent("agnes")

    await I.clickTab("agnes")
    await I.seeTabContent("agnes")
  })

  test("automatic: should select the correct tab on click", async () => {
    await I.clickTab("nils")
    await I.seeTabContent("nils")

    await I.clickTab("agnes")
    await I.seeTabContent("agnes")

    await I.clickTab("joke")
    await I.seeTabContent("joke")
  })

  test("automatic: on arrow right, select + focus next tab", async () => {
    await I.clickTab("nils")
    await I.pressKey("ArrowRight")

    await I.seeTabIsFocused("agnes")
    await I.seeTabContent("agnes")
  })

  // @flaky
  test.skip("automatic: on arrow right, loop focus + selection", async () => {
    await I.clickTab("nils")
    await I.pressKey("ArrowRight", 3)

    await I.seeTabIsFocused("nils")
    await I.seeTabContent("nils")
  })

  test("automatic: on arrow left, select + focus the previous tab", async () => {
    await I.clickTab("joke")
    await I.pressKey("ArrowLeft")

    await I.seeTabIsFocused("agnes")
    await I.seeTabContent("agnes")
  })

  test("manual: on arrow right, focus but not select tab", async () => {
    await I.controls.select("activationMode", "manual")

    await I.clickTab("nils")
    await I.pressKey("ArrowRight")

    await I.seeTabIsFocused("agnes")
    await I.dontSeeTabContent("agnes")
  })

  test("manual: on home key, focus but not select tab", async () => {
    await I.controls.select("activationMode", "manual")

    await I.clickTab("agnes")
    await I.pressKey("Home")

    await I.seeTabIsFocused("nils")
    await I.dontSeeTabContent("nils")
  })

  test("manual: on navigate, select on enter", async () => {
    await I.controls.select("activationMode", "manual")

    await I.clickTab("nils")
    await I.seeTabContent("nils")
    await I.pressKey("ArrowRight")

    await I.seeTabIsFocused("agnes")
    await I.pressKey("Enter")
    await I.seeTabContent("agnes")
  })

  test("loopFocus=false", async () => {
    await I.controls.bool("loopFocus", false)

    await I.clickTab("joke")
    await I.pressKey("ArrowRight")

    await I.seeTabIsFocused("joke")
  })

  test("indicator position updates when inactive tab changes size", async () => {
    await I.clickTab("agnes")
    await I.seeTabContent("agnes")

    const agnesTabBefore = await I.getTabRect("agnes")
    const indicatorBefore = await I.getIndicatorRect()

    await I.modifyTabLabel("nils", "Nils Frahm - Very Long Text That Changes Size")

    await I.waitForIndicatorToUpdate("agnes")
    await I.seeIndicatorMovedWithTab("agnes", agnesTabBefore, indicatorBefore)
  })
})

test.describe("tabs / change details", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  test.beforeEach(async ({ page }) => {
    I = new TabsModel(page)
    await I.goto()
  })

  test("onValueChange reports null when a tab is deselected", async ({ page }) => {
    await I.controls.bool("deselectable", true)

    await I.clickTab("agnes")
    await expect(page.getByTestId("value-details")).toHaveText('{"value":"agnes"}')

    await I.clickTab("agnes")
    await expect(page.getByTestId("value-details")).toHaveText('{"value":null}')
  })

  test("onFocusChange reports null when focus leaves the tab list", async ({ page }) => {
    await I.clickTab("agnes")
    await expect(page.getByTestId("focus-details")).toHaveText('{"focusedValue":"agnes"}')

    await page.getByTestId("agnes-tab-panel").getByPlaceholder("Agnes").focus()
    await expect(page.getByTestId("focus-details")).toHaveText('{"focusedValue":null}')
  })
})

import { expect, test } from "./_test"
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

  test("[deselectable] the tablist stays reachable after the selection is cleared", async () => {
    await I.controls.bool("deselectable", true)

    await I.clickTab("nils")
    await I.dontSeeTabContent("nils")
    await I.seeTabIsTabStop("nils")
  })

  test("[deselectable] Home on the selected first tab keeps it selected", async () => {
    await I.controls.bool("deselectable", true)

    await I.focusTab("nils")
    await I.pressKey("Home")
    await I.waitForKeyboardSelection()
    await I.seeTabContent("nils")
  })

  test("[deselectable] End on the selected last tab keeps it selected", async () => {
    await I.controls.bool("deselectable", true)

    await I.clickTab("joke")
    await I.pressKey("End")
    await I.waitForKeyboardSelection()
    await I.seeTabContent("joke")
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

  test("should ignore arrow keys pressed with a modifier", async () => {
    await I.focusTab("nils")
    for (const key of ["Alt+ArrowRight", "Control+ArrowRight", "Meta+ArrowRight", "Shift+ArrowRight"]) {
      await I.pressKey(key)
    }
    await I.seeTabIsFocused("nils")
    await I.seeTabContent("nils")
  })

  test("should expose the direction of the selected tab", async () => {
    await I.seeActivationDirection("none")

    await I.clickTab("joke")
    await I.seeActivationDirection("right")

    await I.clickTab("nils")
    await I.seeActivationDirection("left")
  })

  test("vertical: should expose an up or down direction", async () => {
    await I.controls.select("orientation", "vertical")

    await I.clickTab("joke")
    await I.seeActivationDirection("down")

    await I.clickTab("nils")
    await I.seeActivationDirection("up")
  })

  test("rtl: the direction follows the visual order", async () => {
    await I.controls.select("dir", "rtl")

    await I.focusTab("nils")
    await I.pressKey("ArrowLeft")
    await I.seeTabIsFocused("agnes")
    await I.seeActivationDirection("left")
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

test.describe("tabs [focus frame]", () => {
  test.beforeEach(async ({ page }) => {
    I = new TabsModel(page)
    await page.clock.install()
    await I.goto()
    const now = await page.evaluate(() => Date.now())
    await page.clock.pauseAt(now + 60_000)
  })

  test("Tab right after an arrow key should keep focus out of the tab list", async ({ page }) => {
    await I.focusTab("nils")
    await I.seeTabIsFocused("nils")

    await I.pressKey("ArrowRight")
    await I.pressKey("Tab")
    await page.clock.runFor(32)

    await expect(page.locator("[data-tabs-trigger]:focus")).toHaveCount(0)
  })
})

test.describe("tabs / disabled", () => {
  test.beforeEach(async ({ page }) => {
    I = new TabsModel(page)
    await I.goto("/tabs/disabled")
  })

  test("a tab added and selected at once gets a direction", async () => {
    await I.clickButton("Add a tab")
    await I.seeTabIsSelected("Tab 1")
    await I.seeActivationDirection("right")
  })

  test("disabling the selected tab moves the tab stop to the first enabled tab", async () => {
    await I.seeTabIsTabStop("nils")

    await I.disableSelectedTab()
    await I.seeTabIsTabStop("agnes")
  })
})

test.describe("tabs / animated-panels", () => {
  test.beforeEach(async ({ page }) => {
    I = new TabsModel(page)
    await I.goto("/tabs/animated-panels")
  })

  test("should not animate the selected panel on first render", async () => {
    await I.seePanelIsVisible("Overview")
    await I.seePanelState("Overview", null)
  })

  test("should keep the previous panel visible until its exit animation ends", async () => {
    await I.clickTabByName("Projects")
    await I.seePanelState("Overview", "closed")
    await I.seePanelIsVisible("Overview")
    await I.seePanelState("Projects", "open")

    await I.seePanelIsHidden("Overview")
    await I.seePanelIsVisible("Projects")
  })

  test("should slide in the direction of the selected tab", async () => {
    await I.clickTabByName("Account")
    await I.seeActivationDirection("right")

    await I.clickTabByName("Overview")
    await I.seeActivationDirection("left")
  })
})

import { test } from "@playwright/test"
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

    await I.setTabIsFocused("nils")
    await I.seeTabContent("nils")
  })

  test("on end key, select last tab", async () => {
    await I.clickTab("agnes")
    await I.pressKey("End")

    await I.setTabIsFocused("joke")
    await I.seeTabContent("joke")
  })

  test("click tab, select tab", async () => {
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

    await I.setTabIsFocused("agnes")
    await I.seeTabContent("agnes")
  })

  test("automatic: on arrow right, loop focus + selection", async () => {
    await I.clickTab("nils")
    await I.pressKey("ArrowRight", 3)

    await I.setTabIsFocused("nils")
    await I.seeTabContent("nils")
  })

  test("automatic: on arrow left, select + focus the previous tab", async () => {
    await I.clickTab("joke")
    await I.pressKey("ArrowLeft")

    await I.setTabIsFocused("agnes")
    await I.seeTabContent("agnes")
  })

  test("manual: on arrow right, focus but not select tab", async () => {
    await I.controls.select("activationMode", "manual")

    await I.clickTab("nils")
    await I.pressKey("ArrowRight")

    await I.setTabIsFocused("agnes")
    await I.dontSeeTabContent("agnes")
  })

  test("manual: on home key, focus but not select tab", async () => {
    await I.controls.select("activationMode", "manual")

    await I.clickTab("agnes")
    await I.pressKey("Home")

    await I.setTabIsFocused("nils")
    await I.dontSeeTabContent("nils")
  })

  test("manual: on navigate, select on enter", async () => {
    await I.controls.select("activationMode", "manual")

    await I.clickTab("nils")
    await I.pressKey("ArrowRight")
    await I.pressKey("Enter")

    await I.setTabIsFocused("agnes")
    await I.seeTabContent("agnes")
  })

  test("loopFocus=false", async () => {
    await I.controls.bool("loopFocus", false)

    await I.clickTab("joke")
    await I.pressKey("ArrowRight")

    await I.setTabIsFocused("joke")
  })
})

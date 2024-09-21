import { test } from "@playwright/test"
import { TooltipModel } from "./models/tooltip.model"

let I: TooltipModel

test.describe("tooltip", () => {
  test.beforeEach(async ({ page }) => {
    I = new TooltipModel(page)
    await I.goto()
  })

  test("should open tooltip on hover interaction", async () => {
    await I.hoverTrigger("tip-1")
    await I.seeContent("tip-1")
    await I.hoverOutside()
    await I.dontSeeContent("tip-1")
  })

  test("should show only one tooltip at a time", async () => {
    await I.hoverTrigger("tip-1")
    await I.hoverTrigger("tip-2", { wait: false })
    await I.dontSeeContent("tip-1")
    await I.seeContent("tip-2")
  })

  test("should work with focus/blur", async () => {
    await I.focusPage()
    await I.pressKey("Tab")

    await I.seeContent("tip-1")

    await I.clickOutside()
    await I.dontSeeContent("tip-1")
  })

  test("should work with focus/blur for multiple tooltips", async () => {
    await I.focusPage()
    await I.pressKey("Tab")

    await I.seeContent("tip-1")

    await I.pressKey("Tab")
    await I.seeTriggerIsFocused("tip-2")

    await I.dontSeeContent("tip-1")
    await I.seeContent("tip-2")
  })

  test("closes on pointerdown", async () => {
    await I.hoverTrigger("tip-1")

    await I.seeContent("tip-1")

    await I.pointerdownTrigger("tip-1")
    await I.dontSeeContent("tip-1")
  })

  test("closes on esc press", async () => {
    await I.focusPage()
    await I.pressKey("Tab")

    await I.seeContent("tip-1")

    await I.pressKey("Escape")
    await I.dontSeeContent("tip-1")
  })
})

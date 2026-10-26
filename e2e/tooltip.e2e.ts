import { test } from "./_test"
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

test.describe("tooltip / aria-label", () => {
  test.beforeEach(async ({ page }) => {
    I = new TooltipModel(page)
    await I.goto("/tooltip/aria-label")
  })

  test("should describe the trigger with the aria-label", async () => {
    await I.focusPage()
    await I.pressKey("Tab")

    await I.seeContent("tip-1")
    await I.seeTriggerDescription("tip-1", "Save the document")
  })
})

test.describe("tooltip / disabled", () => {
  test.beforeEach(async ({ page }) => {
    I = new TooltipModel(page)
    await I.goto("/tooltip/disabled")
  })

  test("should open on the first hover after being re-enabled", async ({ page }) => {
    // toggle with the keyboard so the pointer stays on the trigger
    const toggleDisabled = async () => {
      await page.getByTestId("disabled").focus()
      await page.keyboard.press("Space")
    }

    await I.hoverTrigger("tip-1")
    await I.seeContent("tip-1")

    await toggleDisabled()
    await I.dontSeeContent("tip-1")

    await I.hoverOutside()
    await toggleDisabled()

    await I.hoverTrigger("tip-1")
    await I.seeContent("tip-1")
  })

  test("should stay dismissed when disabled is toggled while hovering", async ({ page }) => {
    const toggleDisabled = async () => {
      await page.getByTestId("disabled").focus()
      await page.keyboard.press("Space")
    }

    await I.hoverTrigger("tip-1")
    await I.seeContent("tip-1")

    await page.keyboard.press("Escape")
    await I.dontSeeContent("tip-1")

    await toggleDisabled()
    await toggleDisabled()

    // move within the trigger without leaving it
    await page.getByTestId("tip-1-trigger").hover({ position: { x: 4, y: 4 } })
    await I.wait(1000)
    await I.dontSeeContent("tip-1")
  })
})

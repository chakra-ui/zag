import { test } from "@playwright/test"
import { AccordionModel } from "./models/accordion.model"

let I: AccordionModel

test.describe("accordion", () => {
  test.beforeEach(async ({ page }) => {
    I = new AccordionModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test.describe("single / keyboard", () => {
    test("arrow down, focus next trigger", async () => {
      await I.focusTrigger("home")
      await I.pressKey("ArrowDown")
      await I.seeTriggerIsFocused("about")
    })

    test("arrow up, focus previous trigger", async () => {
      await I.focusTrigger("home")
      await I.pressKey("ArrowDown")
      await I.pressKey("ArrowUp")
      await I.seeTriggerIsFocused("home")
    })

    test("home key, focus first trigger", async () => {
      await I.focusTrigger("about")
      await I.pressKey("Home")
      await I.seeTriggerIsFocused("home")
    })

    test("end key, focus last trigger", async () => {
      await I.focusTrigger("home")
      await I.pressKey("End")
      await I.seeTriggerIsFocused("contact")
    })

    test("[loopFocus=true] arrow down on last trigger, wraps to first", async () => {
      await I.focusTrigger("contact")
      await I.pressKey("ArrowDown")
      await I.seeTriggerIsFocused("home")
    })

    test("[loopFocus=true] arrow up on first trigger, wraps to last", async () => {
      await I.focusTrigger("home")
      await I.pressKey("ArrowUp")
      await I.seeTriggerIsFocused("contact")
    })

    test("[loopFocus=false] arrow down on last trigger, stays on last", async () => {
      await I.controls.bool("loopFocus", false)
      await I.focusTrigger("contact")
      await I.pressKey("ArrowDown")
      await I.seeTriggerIsFocused("contact")
    })

    test("[loopFocus=false] arrow up on first trigger, stays on first", async () => {
      await I.controls.bool("loopFocus", false)
      await I.focusTrigger("home")
      await I.pressKey("ArrowUp")
      await I.seeTriggerIsFocused("home")
    })
  })

  test.describe("single / pointer", () => {
    test("should show content", async () => {
      await I.clickTrigger("home")
      await I.seeContent("home")
    })

    test("then clicking the same trigger again: should not close the content", async () => {
      await I.clickTrigger("home")
      await I.clickTrigger("home")
      await I.seeContent("home")
    })

    test("then clicking another trigger: should close the previous content", async () => {
      await I.clickTrigger("home")
      await I.clickTrigger("about")

      await I.seeContent("about")
      await I.dontSeeContent("home")
    })
  })

  test.describe("multiple / keyboard", () => {
    test("[multiple=true] on arrow down, focus next trigger", async () => {
      await I.controls.bool("multiple")

      await I.focusTrigger("home")
      await I.pressKey("Enter")

      await I.pressKey("ArrowDown")
      await I.pressKey("Enter")

      await I.seeContent("about")
      await I.seeContent("home")
    })

    test("clicking another trigger, should close the previous content", async () => {
      await I.controls.bool("multiple")

      await I.clickTrigger("home")
      await I.clickTrigger("about")

      await I.seeContent("about")
      await I.seeContent("home")
    })
  })
})

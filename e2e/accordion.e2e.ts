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

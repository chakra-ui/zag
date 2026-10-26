import { test } from "./_test"
import { StepsModel } from "./models/steps.model"

let I: StepsModel

test.describe("steps", () => {
  test.beforeEach(async ({ page }) => {
    I = new StepsModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("marks the current step's trigger with aria-current", async () => {
    await I.seeCurrentStep(0)
    await I.seeStepIsNotCurrent(1)
  })

  test("moves aria-current to the next trigger", async () => {
    await I.seeCurrentStep(0)

    await I.clickNext()

    await I.seeCurrentStep(1)
    await I.seeStepIsNotCurrent(0)
  })
})

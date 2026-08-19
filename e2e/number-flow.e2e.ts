import { test } from "@playwright/test"
import { NumberFlowModel } from "./models/number-flow.model"

let I: NumberFlowModel

test.describe("number flow", () => {
  test.beforeEach(async ({ page }) => {
    I = new NumberFlowModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("should render the initial value", async () => {
    await I.seeValue("1,234")
    await I.seeState("idle")
  })

  test("should roll to the new value", async () => {
    await I.clickAndSettle("Increment")
    await I.seeRenderedValueMatchesLabel()
    await I.seeState("idle")
  })

  test("should reset to zero", async () => {
    await I.clickAndSettle("Reset")
    await I.seeValue("0")
  })

  test("should mark the roll direction for the whole roll", async () => {
    await I.clickButton("Increment")
    await I.seeState("rolling")
    await I.seeTrend("up")
    await I.waitForSettled()

    await I.clickButton("Decrement")
    await I.seeState("rolling")
    await I.seeTrend("down")
  })

  test("should report one animation per roll", async () => {
    await I.seeAnimationCounts(0, 0)
    await I.clickAndSettle("Increment")
    await I.seeAnimationCounts(1, 1)
  })

  test("should count a burst of clicks as a single animation", async () => {
    await I.rageClick("Increment", 15)
    await I.seeAnimationCounts(1, 1)
  })

  test.describe("rapid updates", () => {
    test("should never show a blank digit", async () => {
      const report = await I.rageClick("Randomize", 30, 45)
      I.seeNoBlankDigits(report)
      I.seeSettledOn(report)
    })

    test("should never spin back through a whole cycle", async () => {
      const report = await I.rageClick("Increment", 30, 45)
      I.seeNoFullCycleBackspin(report)
      I.seeSettledOn(report)
    })

    test("should hold both under a forced trend", async () => {
      // forcing every digit to roll up is what walks a counter off the end of the strip
      await I.controls.select("trend", "1")
      const report = await I.rageClick("Increment", 40, 45)
      I.seeNoBlankDigits(report)
      I.seeNoFullCycleBackspin(report)
      I.seeSettledOn(report)
    })

    test("should hold when mixing directions", async () => {
      const up = await I.rageClick("Increment", 12, 45)
      I.seeNoBlankDigits(up)
      const down = await I.rageClick("Decrement", 12, 45)
      I.seeNoBlankDigits(down)
      I.seeSettledOn(down)
    })
  })

  test.describe("continuous", () => {
    test.beforeEach(async () => {
      await I.goto("/number-flow/continuous")
    })

    test("should never show a blank digit while spinning through intermediates", async () => {
      // the page drives itself on an interval, so just watch it run
      const report = await I.sample({ settleMs: 10_000 })
      I.seeNoBlankDigits(report)
    })
  })

  test.describe("formatting", () => {
    test.beforeEach(async () => {
      await I.goto("/number-flow/formatting")
    })

    for (const preset of ["usd", "eur", "percent", "arabic", "plain"]) {
      test(`should render what it announces for ${preset}`, async () => {
        await I.selectPreset(preset)
        await I.waitForSettled()
        await I.seeRenderedValueMatchesLabel()

        await I.clickTestIdAndSettle("increase")
        await I.seeRenderedValueMatchesLabel()

        await I.clickTestIdAndSettle("decrease")
        await I.seeRenderedValueMatchesLabel()
      })
    }

    test("should roll non-latin numerals", async () => {
      await I.selectPreset("arabic")
      await I.waitForSettled()
      await I.seeValue("١٬٢٣٤")

      await I.clickTestIdAndSettle("decrease")
      await I.seeValue("١٬١٣٤")
    })
  })
})

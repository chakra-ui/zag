import { test } from "@playwright/test"
import { NumberInputModel } from "./models/number-input.model"

let I: NumberInputModel

test.describe("number input", () => {
  test.beforeEach(async ({ page }) => {
    I = new NumberInputModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("should allow typing empty string value", async () => {
    await I.type("12")
    await I.pressKey("Backspace", 2)
    await I.seeInputHasValue("")
  })

  test("should clamp value when blurred", async () => {
    await I.type("200")
    await I.seeInputIsInvalid()
    await I.clickOutside()
    await I.seeInputHasValue("100")
  })

  test("should clamp value when input is empty", async () => {
    await I.type("5")
    await I.pressKey("Backspace")
    await I.clickOutside()
    await I.seeInputHasValue("")
  })

  test("should increment with arrow up", async () => {
    await I.type("5")
    await I.pressKey("ArrowUp")
    await I.seeInputHasValue("6")
  })

  test("clicking increment", async () => {
    await I.clickInc()
    await I.seeInputHasValue("1")
  })

  test("should decrement the value", async () => {
    await I.type("5")
    await I.pressKey("ArrowDown", 2)
    await I.seeInputHasValue("3")
  })

  test("clicking decrement", async () => {
    await I.type("5")
    await I.clickDec()
    await I.seeInputHasValue("4")
  })

  test("pressing enter should make up/down still work", async () => {
    await I.type("5")
    await I.pressKey("Enter")

    await I.pressKey("ArrowDown")
    await I.seeInputHasValue("4")

    await I.pressKey("ArrowUp")
    await I.seeInputHasValue("5")
  })

  test("should set value to min/max on home/end keys", async () => {
    await I.type("5")
    await I.pressKey("Home")
    await I.seeInputHasValue("0")

    await I.pressKey("End")
    await I.seeInputHasValue("100")
  })

  test("shift+arrowup: should change 10 steps", async () => {
    await I.type("0")

    await I.pressKey("ArrowUp")
    await I.seeInputHasValue("1")

    await I.pressKey("Shift+ArrowUp")
    await I.seeInputHasValue("11")

    await I.pressKey("Shift+ArrowDown")
    await I.seeInputHasValue("1")

    await I.pressKey("ArrowDown")
    await I.seeInputHasValue("0")
  })

  test("ctrl+arrowup: should change for 0.1 steps", async () => {
    await I.controls.num("step", "0.1")

    await I.type("0.10", { delay: 20 })
    await I.pressKey("Control+ArrowUp")
    await I.seeInputHasValue("0.11")

    await I.pressKey("Control+ArrowDown")
    await I.seeInputHasValue("0.1")

    await I.pressKey("ArrowDown")
    await I.seeInputHasValue("0")
  })

  test("inc click: should increment value", async () => {
    await I.clickInc()
    await I.seeInputHasValue("1")
  })

  test("dec click: should increment value", async () => {
    await I.type("5")
    await I.clickDec()
    await I.seeInputHasValue("4")
  })

  test.skip("scrub: should update value on scrubbing", async () => {
    await I.scrubBy(10)
    await I.seeInputHasValue("10")
  })

  test.skip("inc longpress: should spin value upwards", async () => {
    await I.mousedownInc()
    await I.seeInputHasValue("1")
    await I.waitForTick(3)
    await I.mouseup()
    await I.seeInputHasValue("4")
  })

  test("dec longpress: should spin value downwards", async () => {
    await I.type("20")

    await I.mousedownDec()
    await I.seeInputHasValue("19")
    await I.waitForTick(9)

    await I.mouseup()
    await I.seeInputHasValue("10")
  })
})

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
    await I.seeInputHasValue("20")

    await I.mousedownDec()
    await I.seeInputHasValue("19")
    await I.waitForTick(9)

    await I.mouseup()
    await I.seeInputValueIsApprox(9, 1)
  })

  test("should allow negative integer values", async () => {
    await I.type("-12345")
    await I.seeInputIsValid()
  })

  test("should allow positive integer values", async () => {
    await I.type("12345")
    await I.seeInputIsValid()
  })

  test("should allow positive values with decimal point", async () => {
    await I.type("0.30")
    await I.seeInputIsValid()
  })

  test("should allow negative values with decimal point", async () => {
    await I.type("-0.30")
    await I.seeInputIsValid()
  })

  test("[formatOptions] pressing enter trigger format", async () => {
    await I.controls.num("max", "100000")
    await I.controls.select("formatOptions.style", "currency")
    await I.controls.select("formatOptions.currency", "USD")

    await I.type("555")
    await I.pressKey("Enter")
    await I.seeInputHasValue("$555.00")
  })

  test("[formatOptions] blurring should trigger format", async () => {
    await I.controls.num("max", "100000")
    await I.controls.select("formatOptions.style", "currency")
    await I.controls.select("formatOptions.currency", "USD")

    await I.type("555")
    await I.clickOutside()
    await I.seeInputHasValue("$555.00")
  })

  test("[formatOptions] should maintain cursor position", async () => {
    await I.controls.num("max", "100000")
    await I.controls.select("formatOptions.style", "currency")
    await I.controls.select("formatOptions.currency", "USD")

    await I.type("555")
    await I.clickOutside()
    await I.seeInputHasValue("$555.00")

    await I.focusInput()
    await I.moveCaretTo(4)

    await I.typeSequentially("5")
    await I.seeInputHasValue("$5555.00")
    await I.seeCaretAt(5)

    await I.clickOutside()
    await I.seeInputHasValue("$5,555.00")
  })

  test("should not allow non-numeric characters", async () => {
    await I.focusInput()
    await I.typeSequentially("abc")
    await I.seeInputHasValue("")

    await I.typeSequentially("123xyz")
    await I.seeInputHasValue("123")
  })

  test("should allow numeric characters", async () => {
    await I.focusInput()
    await I.typeSequentially("123")
    await I.seeInputHasValue("123")

    await I.typeSequentially(".45")
    await I.seeInputHasValue("123.45")

    // Clear and test negative numbers
    await I.type("-67.89")
    await I.seeInputHasValue("-67.89")
  })

  test("should prevent multiple decimal separators", async () => {
    await I.focusInput()
    await I.typeSequentially("1.23")
    await I.seeInputHasValue("1.23")

    // Try to add another decimal point
    await I.typeSequentially(".45")
    await I.seeInputHasValue("1.2345")

    // Clear and test starting with decimal
    await I.type(".5")
    await I.seeInputHasValue(".5")

    // Try to add another decimal
    await I.typeSequentially(".25")
    await I.seeInputHasValue(".525")
  })

  test("should handle leading zeros correctly", async () => {
    await I.focusInput()

    // Test typing leading zeros
    await I.typeSequentially("007")
    await I.seeInputHasValue("007")

    // Test what happens on blur (should normalize)
    await I.clickOutside()
    await I.seeInputHasValue("7")

    // Test decimal with leading zeros
    await I.type("0.123")
    await I.seeInputHasValue("0.123")
    await I.clickOutside()
    await I.seeInputHasValue("0.123")

    // Test multiple leading zeros with decimal
    await I.type("000.45")
    await I.seeInputHasValue("000.45")
    await I.clickOutside()
    await I.seeInputHasValue("0.45")

    // Test just zeros
    await I.type("000")
    await I.seeInputHasValue("000")
    await I.clickOutside()
    await I.seeInputHasValue("0")
  })

  test("should handle empty string to valid number transitions", async () => {
    await I.focusInput()

    // Type a number, then clear it completely
    await I.type("123")
    await I.seeInputHasValue("123")

    // Clear using type with empty string
    await I.type("")
    await I.seeInputHasValue("")

    // Type a new number
    await I.typeSequentially("456")
    await I.seeInputHasValue("456")

    // Clear again and type decimal number
    await I.type("")
    await I.seeInputHasValue("")

    await I.typeSequentially("7.89")
    await I.seeInputHasValue("7.89")

    // Clear and type negative number
    await I.type("")
    await I.seeInputHasValue("")

    await I.typeSequentially("-10.5")
    await I.seeInputHasValue("-10.5")

    // Clear and type number starting with decimal
    await I.type("")
    await I.seeInputHasValue("")

    await I.typeSequentially(".25")
    await I.seeInputHasValue(".25")
  })

  test("should handle invalid number sequences", async () => {
    await I.focusInput()

    // Test double negative signs
    await I.typeSequentially("--5")
    await I.seeInputHasValue("-5")

    // Clear and test new sequence
    await I.selectInput()
    await I.typeSequentially("1a2b3")
    await I.seeInputHasValue("123")

    // Clear and test decimal with invalid chars
    await I.selectInput()
    await I.typeSequentially("1.5x")
    await I.seeInputHasValue("1.5")

    // Clear and test trailing negative
    await I.selectInput()
    await I.typeSequentially("123-")
    await I.seeInputHasValue("123")

    // Clear and test decimal with trailing invalid
    await I.selectInput()
    await I.typeSequentially("5.-")
    await I.seeInputHasValue("5.")
  })

  test("should handle zero variations", async () => {
    await I.focusInput()

    // Test negative zero - keeps as "-0" (this is valid behavior)
    await I.typeSequentially("-0")
    await I.clickOutside()
    await I.seeInputHasValue("-0")

    // Test positive zero (plus sign typically not allowed in number inputs)
    await I.selectInput()
    await I.typeSequentially("+0")
    await I.clickOutside()
    await I.seeInputHasValue("0")

    // Test decimal zero - should normalize trailing decimal
    await I.selectInput()
    await I.typeSequentially("0.0")
    await I.clickOutside()
    await I.seeInputHasValue("0")

    // Test leading decimal zero
    await I.selectInput()
    await I.typeSequentially(".0")
    await I.clickOutside()
    await I.seeInputHasValue("0")

    // Test multiple trailing zeros
    await I.selectInput()
    await I.typeSequentially("0.00")
    await I.clickOutside()
    await I.seeInputHasValue("0")

    // Test negative decimal zero
    await I.selectInput()
    await I.typeSequentially("-0.0")
    await I.clickOutside()
    await I.seeInputHasValue("-0")
  })

  test.describe("selection and typing replacement", () => {
    test("full selection and replacement", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type initial value
      await I.typeSequentially("123.45")
      await I.seeInputHasValue("123.45")

      // Select all and replace
      await I.selectInput()
      await I.typeSequentially("999")
      await I.seeInputHasValue("999")
    })

    test("full selection replacement with decimal", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Start with empty input, select all (which is nothing), then type
      await I.selectInput()
      await I.typeSequentially("50.25")
      await I.seeInputHasValue("50.25")

      // Select all again and replace with different number
      await I.selectInput()
      await I.typeSequentially("123.45")
      await I.seeInputHasValue("123.45")
    })

    test("partial text selection and replacement", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type initial value
      await I.typeSequentially("100.25")
      await I.seeInputHasValue("100.25")

      // Select partial text and replace
      await I.selectPartialText("100")
      await I.seeSelectedText("100")
      await I.typeSequentially("200")
      await I.seeInputHasValue("200.25")
    })

    test("filter invalid characters during selection replacement", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type initial value
      await I.typeSequentially("123.45")
      await I.seeInputHasValue("123.45")

      // Select partial text and replace with mixed valid/invalid chars
      await I.selectPartialText("123")
      await I.seeSelectedText("123")
      await I.typeSequentially("abc456def")
      await I.seeInputHasValue("456.45")
    })

    test("decimal portion selection and replacement", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type initial value
      await I.typeSequentially("100.25")
      await I.seeInputHasValue("100.25")

      // Select decimal portion and replace
      await I.selectPartialText("25")
      await I.seeSelectedText("25")
      await I.typeSequentially("75")
      await I.seeInputHasValue("100.75")
    })
  })

  test.describe("backspace and delete behavior", () => {
    test("deleting decimal point", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type number with decimal
      await I.typeSequentially("123.45")
      await I.seeInputHasValue("123.45")

      // Move cursor to decimal point and delete it
      await I.moveCaretTo(3) // Position before decimal point
      await I.pressKey("Delete") // Delete the decimal point
      await I.seeInputHasValue("12345")
    })

    test("deleting negative sign", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type negative number
      await I.typeSequentially("-123.45")
      await I.seeInputHasValue("-123.45")

      // Move cursor to beginning and delete negative sign
      await I.moveCaretTo(0)
      await I.pressKey("Delete")
      await I.seeInputHasValue("123.45")
    })

    test("backspacing through decimal point", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type number with decimal
      await I.typeSequentially("123.45")
      await I.seeInputHasValue("123.45")

      // Move cursor after decimal point and backspace
      await I.moveCaretTo(4) // Position after decimal point
      await I.pressKey("Backspace") // Delete the decimal point
      await I.seeInputHasValue("12345")
    })

    test("backspacing negative sign", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type negative number
      await I.typeSequentially("-123")
      await I.seeInputHasValue("-123")

      // Move cursor after negative sign and backspace
      await I.moveCaretTo(1) // Position after negative sign
      await I.pressKey("Backspace")
      await I.seeInputHasValue("123")
    })

    test("deleting digits around decimal", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type number with decimal
      await I.typeSequentially("123.45")
      await I.seeInputHasValue("123.45")

      // Delete digit before decimal point
      await I.moveCaretTo(2) // Position before '3'
      await I.pressKey("Delete")
      await I.seeInputHasValue("12.45")

      // Delete digit after decimal point
      await I.moveCaretTo(3) // Position before '4'
      await I.pressKey("Delete")
      await I.seeInputHasValue("12.5")
    })

    test("backspace on leading zero", async () => {
      await I.focusInput()
      await I.controls.num("max", "1000")

      // Type number with leading zeros
      await I.typeSequentially("007")
      await I.seeInputHasValue("007")

      // Backspace from end
      await I.pressKey("Backspace")
      await I.seeInputHasValue("00")

      await I.pressKey("Backspace")
      await I.seeInputHasValue("0")

      await I.pressKey("Backspace")
      await I.seeInputHasValue("")
    })
  })
})

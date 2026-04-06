import { test } from "@playwright/test"
import { PinInputModel } from "./models/pin-input.model"

let I: PinInputModel

test.describe("pin input", () => {
  test.beforeEach(async ({ page }) => {
    I = new PinInputModel(page)
    await I.goto()
  })

  test("on type: should move focus to the next input", async () => {
    await I.fillInput(1, "1")
    await I.seeInputIsFocused(2)
    await I.fillInput(2, "2")
    await I.seeInputIsFocused(3)
  })

  test("on type: should not allow multiple keys at once", async () => {
    await I.fillInput(1, "12")
    await I.seeInputHasValue(1, "2")
  })

  test("on backspace (empty): should delete prev char and move back", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.seeInputIsFocused(3)

    await I.pressKey("Backspace")
    await I.seeInputIsFocused(2)
    await I.seeInputHasValue(2, "")
  })

  test("on backspace (filled): should clear and move focus back", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.pressKey("Backspace")
    await I.seeInputIsFocused(2)
    await I.seeInputHasValue(3, "")
  })

  test("on arrow: should change focus between inputs", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.pressKey("ArrowLeft")
    await I.seeInputIsFocused(2)
    await I.pressKey("ArrowRight")
    await I.seeInputIsFocused(3)
  })

  test("on clear: should clear values and focus first", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.clickClear()
    await I.seeInputIsFocused(1)
    await I.seeValues("", "", "")
  })

  test("on paste: should autofill all fields", async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await I.focusInput(1)
    await I.paste("123")

    await I.seeValues("1", "2", "3")
    await I.seeInputIsFocused(3)
  })

  test("on paste: should autofill when focused field is not empty", async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await I.fillInput(1, "1")
    await I.focusInput(1)
    await I.paste("123")

    await I.seeValues("1", "2", "3")
    await I.seeInputIsFocused(3)
  })

  test("[different] should allow only single character", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.focusInput(1)
    await I.fillInput(1, "3")
    await I.seeInputHasValue(1, "3")
  })

  test("[same] should allow only single character", async () => {
    await I.fillInput(1, "1")
    await I.focusInput(1)
    await I.fillInput(1, "1")
    await I.seeInputHasValue(1, "1")
  })

  test("[on edit] should allow to edit the existing value", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")
    await I.focusInput(2)
    await I.fillInput(2, "4")
    await I.seeInputHasValue(2, "4")
    await I.seeInputHasValue(3, "3")
    await I.seeInputIsFocused(3)
  })

  test("native delete keyboard behavior", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.focusInput(3)
    await I.pressKey("ControlOrMeta+Backspace")
    await I.seeInputHasValue(3, "")

    await I.fillInput(3, "2")
    await I.focusInput(3)
    await I.pressKey("Home")
    await I.pressKey("Delete")
    await I.seeInputHasValue(3, "")
  })

  // --- Home / End ---

  test("home/end: should navigate to first and last filled", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.pressKey("Home")
    await I.seeInputIsFocused(1)

    await I.pressKey("End")
    await I.seeInputIsFocused(3)
  })

  test("home/end: end with partial fill goes to last filled", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")

    await I.pressKey("Home")
    await I.seeInputIsFocused(1)

    await I.pressKey("End")
    await I.seeInputIsFocused(2)
  })

  // --- No-holes splice+shift ---

  test("delete: should splice and shift values left (no holes)", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.focusInput(2)
    await I.pressKey("Delete")

    await I.seeValues("1", "3", "")
  })

  test("backspace: should splice and shift values left (no holes)", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.focusInput(2)
    await I.pressKey("Backspace")

    await I.seeInputIsFocused(1)
    await I.seeValues("1", "3", "")
  })

  // --- Focus clamping ---

  test("click: should redirect to insertion point when clicking past filled", async () => {
    await I.fillInput(1, "1")
    await I.clickInput(3)
    await I.seeInputIsFocused(2)
  })

  test("click: should allow clicking on filled slots", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.clickInput(1)
    await I.seeInputIsFocused(1)
  })

  test("arrow right: should not go past insertion point", async () => {
    await I.fillInput(1, "1")
    await I.seeInputIsFocused(2)
    await I.pressKey("ArrowRight")
    await I.seeInputIsFocused(2)
  })

  // --- Same-key skip ---

  test("same key: should advance focus without changing value", async () => {
    await I.fillInput(1, "1")
    await I.seeInputIsFocused(2)

    await I.clickInput(1)
    await I.seeInputIsFocused(1)
    await I.pressKey("1")

    await I.seeInputHasValue(1, "1")
    await I.seeInputIsFocused(2)
  })

  // --- Cut ---

  test("cut: should splice and shift values left (no holes)", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.focusInput(2)
    await I.pressKey("ControlOrMeta+a")
    await I.pressKey("ControlOrMeta+x")

    await I.seeValues("1", "3", "")
  })

  // --- Boundary ---

  test("arrow left: should not go before first input", async () => {
    await I.fillInput(1, "1")
    await I.clickInput(1)
    await I.pressKey("ArrowLeft")
    await I.seeInputIsFocused(1)
  })

  // --- Roving tabIndex ---

  test("roving tabindex: tab should skip remaining inputs", async () => {
    await I.fillInput(1, "1")
    await I.seeInputIsFocused(2)

    await I.pressKey("Tab")
    await I.seeClearButtonIsFocused()
  })

  test("roving tabindex: shift+tab should re-enter at insertion point", async () => {
    await I.fillInput(1, "1")
    await I.seeInputIsFocused(2)

    await I.pressKey("Tab")
    await I.seeClearButtonIsFocused()

    await I.pressKey("Shift+Tab")
    await I.seeInputIsFocused(2)
  })

  test("roving tabindex: shift+tab with all filled should land on last input", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.pressKey("Tab")
    await I.seeClearButtonIsFocused()

    await I.pressKey("Shift+Tab")
    await I.seeInputIsFocused(3)
  })

  // --- Accessibility ---

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility("[data-pin-input-root]")
  })

  // --- Paste max length ---

  test("on paste: should truncate to available slots", async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await I.focusInput(1)
    await I.paste("12345")

    await I.seeValues("1", "2", "3")
  })

  // --- Validation ---

  test("non-numeric chars should be rejected in numeric mode", async () => {
    await I.focusInput(1)
    await I.pressKey("a")
    await I.seeInputHasValue(1, "")
    await I.seeInputIsFocused(1)

    await I.pressKey("!")
    await I.seeInputHasValue(1, "")
    await I.seeInputIsFocused(1)
  })

  // --- Boundary edge cases ---

  test("backspace at index 0: should stay at first input", async () => {
    await I.fillInput(1, "1")
    await I.clickInput(1)
    await I.pressKey("Backspace")

    await I.seeInputIsFocused(1)
    await I.seeInputHasValue(1, "")
  })

  test("delete on empty slot: should do nothing", async () => {
    await I.fillInput(1, "1")
    // Focus is on second (empty)
    await I.seeInputIsFocused(2)
    await I.pressKey("Delete")

    await I.seeInputIsFocused(2)
    await I.seeValues("1", "", "")
  })

  // --- Paste mid-sequence ---

  test("on paste: mid-sequence should preserve left values", async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await I.fillInput(1, "1")
    await I.seeInputIsFocused(2)
    await I.paste("89")

    await I.seeValues("1", "8", "9")
  })

  // --- Replace value on complete ---

  test("complete then type: should replace focused value", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    await I.clickInput(2)
    await I.fillInput(2, "9")
    await I.seeInputHasValue(2, "9")
    await I.seeValues("1", "9", "3")
  })

  // --- Alphabetic type ---

  test("alphabetic type: should reject numbers", async () => {
    await I.controls.select("type", "alphabetic")
    await I.focusInput(1)

    await I.pressKey("1")
    await I.seeInputHasValue(1, "")
    await I.seeInputIsFocused(1)

    await I.pressKey("a")
    await I.seeInputHasValue(1, "a")
    await I.seeInputIsFocused(2)
  })

  // --- Blur on complete ---

  test("blurOnComplete: should blur after entering last value", async () => {
    await I.controls.bool("blurOnComplete")
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")
    await I.seeInputIsNotFocused(3)
  })

  test("blurOnComplete: backspace on last input should not blur", async () => {
    await I.controls.bool("blurOnComplete")
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")
    // blurred after complete
    await I.seeInputIsNotFocused(3)

    // click back into the last input and backspace
    await I.clickInput(3)
    await I.pressKey("Backspace")
    // should stay focused on input 2, not blur
    await I.seeInputIsFocused(2)
  })

  // --- RTL ---

  test("rtl: arrow keys should be reversed", async () => {
    await I.controls.select("dir", "rtl")

    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")

    // In RTL, ArrowLeft should go forward (next), ArrowRight should go backward (prev)
    await I.pressKey("ArrowRight")
    await I.seeInputIsFocused(2)
    await I.pressKey("ArrowLeft")
    await I.seeInputIsFocused(3)
  })
})

// --- Controlled ---

test.describe("pin input / controlled", () => {
  test.beforeEach(async ({ page }) => {
    I = new PinInputModel(page)
    await I.goto("/pin-input/controlled")
  })

  test("should update inputs when value is set externally", async () => {
    await I.clickButton("set-value")
    await I.seeValues("1", "2", "3")
  })

  test("should clear inputs when reset externally", async () => {
    await I.clickButton("set-value")
    await I.seeValues("1", "2", "3")

    await I.clickButton("reset-value")
    await I.seeValues("", "", "")
  })

  test("should allow typing after external set", async () => {
    await I.clickButton("set-value")
    await I.seeValues("1", "2", "3")

    await I.clickInput(1)
    await I.fillInput(1, "9")
    await I.seeInputHasValue(1, "9")
  })
})

test.describe("pin input / transform paste", () => {
  test.beforeEach(async ({ page }) => {
    I = new PinInputModel(page)
    await I.goto("/pin-input/transform-paste")
  })

  test("data-filled: should be set on filled inputs", async () => {
    await I.fillInput(1, "1")
    await I.seeInputHasAttribute(1, "data-filled")
    await I.dontSeeInputHasAttribute(2, "data-filled")
  })

  test("enterkeyhint: last input should have 'done', others 'next'", async () => {
    await I.seeInputHasAttribute(1, "enterkeyhint", "next")
    await I.seeInputHasAttribute(2, "enterkeyhint", "next")
    await I.seeInputHasAttribute(3, "enterkeyhint", "done")
  })

  test("auto submit: should submit form when all inputs filled", async () => {
    await I.fillInput(1, "1")
    await I.fillInput(2, "2")
    await I.fillInput(3, "3")
    await I.seeInConsole("test")
  })

  test("sanitize value: should strip dashes before filling", async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await I.focusInput(1)
    await I.paste("1-2-3")

    await I.seeValues("1", "2", "3")
  })
})

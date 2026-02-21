import { test } from "@playwright/test"
import { DateInputModel } from "./models/date-input.model"

let I: DateInputModel

test.describe("date-input [single]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DateInputModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("[focus] clicking a segment focuses it", async () => {
    await I.focusSegment("month")
    await I.seeSegmentFocused("month")
    await I.seeControlFocused()
  })

  test("[focus] clicking outside blurs the segments", async () => {
    await I.focusSegment("month")
    await I.seeControlFocused()
    await I.clickOutsideToBlur()
    await I.seeControlNotFocused()
  })

  test("[keyboard] ArrowRight moves focus to next segment", async () => {
    await I.focusSegment("month")
    await I.seeSegmentFocused("month")
    await I.pressKey("ArrowRight")
    await I.seeSegmentFocused("day")
    await I.pressKey("ArrowRight")
    await I.seeSegmentFocused("year")
  })

  test("[keyboard] ArrowLeft moves focus to previous segment", async () => {
    await I.focusSegment("year")
    await I.seeSegmentFocused("year")
    await I.pressKey("ArrowLeft")
    await I.seeSegmentFocused("day")
    await I.pressKey("ArrowLeft")
    await I.seeSegmentFocused("month")
  })

  test("[keyboard] ArrowLeft on first segment stays on first segment", async () => {
    await I.focusSegment("month")
    await I.pressKey("ArrowLeft")
    await I.seeSegmentFocused("month")
  })

  test("[keyboard] ArrowRight on last segment stays on last segment", async () => {
    await I.focusSegment("year")
    await I.pressKey("ArrowRight")
    await I.seeSegmentFocused("year")
  })

  test("[input] typing a complete month advances to day segment", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.seeSegmentFocused("day")
    await I.seeSegmentText("month", "01")
  })

  test("[input] typing a complete day advances to year segment", async () => {
    await I.focusSegment("day")
    await I.type("25")
    await I.seeSegmentFocused("year")
    await I.seeSegmentText("day", "25")
  })

  test("[input] typing a full date sets the value", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.type("25")
    await I.type("2025")
    await I.seeSegmentText("month", "01")
    await I.seeSegmentText("day", "25")
    await I.seeSegmentText("year", "2025")
    await I.seeSelectedValue("01/25/2025")
  })

  test("[input] typing a high first digit auto-advances (e.g. month=2 pads to 02)", async () => {
    await I.focusSegment("month")
    await I.type("2")
    // 2 followed by 0 would be 20 > 12, so next digit starts fresh
    // but first "2" alone: 20 > 12, so it should set month to 02 and advance
    await I.seeSegmentFocused("day")
    await I.seeSegmentText("month", "02")
  })

  test("[input] ArrowUp increments the segment value", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.focusSegment("month")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "02")
  })

  test("[input] ArrowDown decrements the segment value", async () => {
    await I.focusSegment("month")
    await I.type("03")
    await I.focusSegment("month")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "02")
  })

  test("[input] ArrowUp on placeholder sets the value", async () => {
    await I.focusSegment("month")
    await I.seeSegmentIsPlaceholder("month")
    await I.pressKey("ArrowUp")
    await I.seeSegmentIsNotPlaceholder("month")
  })

  test("[input] Backspace on filled segment clears it to placeholder", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.focusSegment("month")
    await I.seeSegmentIsNotPlaceholder("month")
    await I.pressKey("Backspace")
    await I.seeSegmentIsPlaceholder("month")
    await I.seeSegmentFocused("month")
  })

  test("[input] Backspace on placeholder moves to previous segment", async () => {
    await I.focusSegment("day")
    await I.seeSegmentIsPlaceholder("day")
    await I.pressKey("Backspace")
    await I.seeSegmentFocused("month")
  })

  test("[input] Backspace during partial entry clears it without moving", async () => {
    await I.focusSegment("month")
    await I.type("0")
    // "0" is a partial entry; backspace should clear it and stay on month
    await I.pressKey("Backspace")
    await I.seeSegmentFocused("month")
    await I.seeSegmentIsPlaceholder("month")
  })

  test("[input] Home sets segment to minimum value", async () => {
    await I.focusSegment("month")
    await I.pressKey("Home")
    await I.seeSegmentText("month", "01")
  })

  test("[input] End sets segment to maximum value", async () => {
    await I.focusSegment("month")
    await I.pressKey("End")
    await I.seeSegmentText("month", "12")
  })

  test("[input] Backspace on filled month clears it to placeholder", async () => {
    // Type only month, then clear it
    await I.focusSegment("month")
    await I.type("06")
    await I.seeSegmentText("month", "06")
    await I.seeSegmentIsNotPlaceholder("month")

    await I.focusSegment("month")
    await I.pressKey("Backspace")
    await I.seeSegmentIsPlaceholder("month")
  })

  test("[input] Backspace removes last character (12 -> 1)", async () => {
    await I.focusSegment("month")
    await I.type("12")
    await I.seeSegmentText("month", "12")
    // Typing "12" auto-advances to day, so refocus month
    await I.focusSegment("month")
    await I.pressKey("Backspace")
    // Month 1 displays as "01" in 2-digit format
    await I.seeSegmentText("month", "01")
    await I.seeSegmentFocused("month")
  })

  test("[input] Backspace on first segment when empty stays on first segment", async () => {
    await I.focusSegment("month")
    await I.seeSegmentIsPlaceholder("month")
    await I.pressKey("Backspace")
    await I.seeSegmentFocused("month")
    await I.seeSegmentIsPlaceholder("month")
  })

  test("[input] Backspace twice clears two digits (12 -> 1 -> placeholder)", async () => {
    await I.focusSegment("month")
    await I.type("12")
    await I.seeSegmentText("month", "12")
    await I.focusSegment("month")
    await I.pressKey("Backspace")
    await I.seeSegmentText("month", "01")
    await I.pressKey("Backspace")
    await I.seeSegmentIsPlaceholder("month")
    await I.seeSegmentFocused("month")
  })

  test("[input] Backspace clears day after clearing year", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.type("25")
    await I.type("2025")
    await I.seeSelectedValue("01/25/2025")

    // Clear year
    await I.focusSegment("year")
    await I.pressKey("Backspace", 4)
    await I.seeSegmentIsPlaceholder("year")

    // Hit backspace to go to day segment
    await I.pressKey("Backspace")

    // Now clear day - should work
    await I.pressKey("Backspace", 2)
    await I.seeSegmentIsPlaceholder("day")
    await I.seeSegmentFocused("day")
  })

  test("[input] typing non-numeric input is ignored", async () => {
    await I.focusSegment("month")
    await I.type("abc")
    await I.seeSegmentIsPlaceholder("month")
    await I.seeSegmentFocused("month")
  })

  test("[input] ArrowUp value starts from the placeholder date", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "05")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "06")

    await I.focusSegment("day")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "11")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "12")

    await I.focusSegment("year")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("year", "2020")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("year", "2021")
  })
})

test.describe("date-input [range]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DateInputModel(page)
    await I.goto("/date-input-range")
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("[input] can enter a start date", async () => {
    await I.focusFirstSegment()
    await I.type("01")
    await I.type("15")
    await I.type("2025")
    await I.seeSelectedValue("01/15/2025")
  })

  test("[input] completing start date moves focus to end date, backspace returns focus to start date", async () => {
    await I.focusFirstSegment()
    await I.type("01")
    await I.type("15")
    await I.type("2025")
    await I.seeSegmentInGroupFocused("month", 1)
    // Backspace on empty end date segment moves back to start date year
    await I.pressKey("Backspace")
    await I.seeSegmentInGroupFocused("year", 0)
  })

  test("[issue] backspacing end date should not leave partial values in end date segments", async () => {
    await I.focusFirstSegment()
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSegmentInGroupFocused("month", 1)

    await I.type("11")
    await I.type("11")
    await I.type("1111")

    // delete year
    await I.pressKey("Backspace", 5)

    // delete days
    await I.pressKey("Backspace", 3)

    // delete month
    await I.pressKey("Backspace", 3)

    // delete last number of the first input year
    await I.pressKey("Backspace")

    // second segment month and day and year should not have 11/11/1 value
    await I.seeSegmentInGroupIsPlaceholder("month", 1)
    await I.seeSegmentInGroupIsPlaceholder("day", 1)
    await I.seeSegmentInGroupIsPlaceholder("year", 1)
  })
})

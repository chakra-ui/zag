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

  test("[input] hour granularity", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "hour")

    // Hour segment should be present and focusable
    await I.focusSegment("hour")
    await I.seeSegmentFocused("hour")
    await I.seeSegmentIsPlaceholder("hour")

    // ArrowUp should initialize hour from placeholder
    await I.pressKey("ArrowUp")
    await I.seeSegmentIsNotPlaceholder("hour")
  })

  test("[input] minute granularity", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")

    // Minute segment should be present and focusable
    await I.focusSegment("minute")
    await I.seeSegmentFocused("minute")
    await I.seeSegmentIsPlaceholder("minute")

    // Type 30 for minute - two digits completes the segment
    await I.type("30")
    await I.seeSegmentText("minute", "30")
  })

  test("[input] seconds granularity", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "second")

    // Second segment should be present and focusable
    await I.focusSegment("second")
    await I.seeSegmentFocused("second")
    await I.seeSegmentIsPlaceholder("second")

    // Type 45 for second - two digits completes the segment
    await I.type("45")
    await I.seeSegmentText("second", "45")
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

  test("[input] ArrowDown value starts from the placeholder date", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "03")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "02")

    await I.focusSegment("day")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("day", "09")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("day", "08")

    await I.focusSegment("year")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("year", "2018")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("year", "2017")
  })

  test("[input] changing placeholderValue prop updates the base date for editing", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.controls.date("placeholderValue", "2020-06-15")
    await I.seePlaceholderValue("2020-06-15")

    await I.focusSegment("month")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "07")

    await I.focusSegment("day")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "16")

    await I.focusSegment("year")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("year", "2021")
  })

  test("[input] ArrowDown on year 1 should show 1 BC", async () => {})

  // --- placeholderValue stability (editingValue behaviour) ---

  test("[placeholderValue] is not changed after a complete valid input", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("01")
    await I.type("25")
    await I.type("2025")
    await I.seeSelectedValue("01/25/2025")

    // Committing a value must not mutate the placeholderValue
    await I.seePlaceholderValue("2019-04-10")
  })

  test("[placeholderValue] is not changed while typing partial segments", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    // Type only the month segment – editing accumulator (editingValue) absorbs the partial state
    await I.focusSegment("month")
    await I.type("05")
    await I.seeSegmentText("month", "05")
    // Other segments remain as placeholder text
    await I.seeSegmentIsPlaceholder("day")
    await I.seeSegmentIsPlaceholder("year")
    // The stable placeholderValue must not be affected by the ongoing edit
    await I.seePlaceholderValue("2019-04-10")
  })

  test("[placeholderValue] is not changed after clearing all segments via backspace", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("06")
    await I.type("15")
    await I.type("2022")
    await I.seeSelectedValue("06/15/2022")

    // Clear year (4 digits)
    await I.focusSegment("year")
    await I.pressKey("Backspace", 4)
    await I.seeSegmentIsPlaceholder("year")

    // Backspace on placeholder year moves to day
    await I.pressKey("Backspace")

    // Clear day (15 → 1 → 0 → placeholder)
    await I.pressKey("Backspace", 2)
    await I.seeSegmentIsPlaceholder("day")

    // Backspace on placeholder day moves to month
    await I.pressKey("Backspace")

    // Clear month (06 → 0 → placeholder)
    await I.pressKey("Backspace")
    await I.seeSegmentIsPlaceholder("month")

    // Clearing all segments must not mutate placeholderValue
    await I.seePlaceholderValue("2019-04-10")
  })

  test("[editingValue] clearing one segment preserves the other typed segments", async () => {
    // Regression: after typing 11/11/1111 and clearing only year, month and day must
    // still display the user's typed values (11/11) and NOT fall back to placeholderValue.
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSelectedValue("11/11/1111")

    // Clear only the year
    await I.focusSegment("year")
    await I.pressKey("Backspace", 4)
    await I.seeSegmentIsPlaceholder("year")

    // Month and day must retain the user's typed values, not the placeholder (04/10)
    await I.seeSegmentText("month", "11")
    await I.seeSegmentText("day", "11")
    await I.seeSegmentIsNotPlaceholder("month")
    await I.seeSegmentIsNotPlaceholder("day")
  })

  test("[placeholderValue] ArrowUp after clearing a previously typed year starts from placeholder year", async () => {
    // Regression: before the editingValue fix, clearing year after a full commit left
    // a stale edited year in the context, causing ArrowUp to start from year 1 instead
    // of the configured placeholder year.
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    // Enter a full date with an unusual year
    await I.focusSegment("month")
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSegmentIsNotPlaceholder("year")

    // Clear the year completely (4 backspaces: 1111 → 111 → 11 → 1 → placeholder)
    await I.focusSegment("year")
    await I.pressKey("Backspace", 4)
    await I.seeSegmentIsPlaceholder("year")

    // ArrowUp must seed from placeholderValue.year (2019), not from stale year 1
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("year", "2020")
    // Month and day must still reflect the typed values, not the placeholder
    await I.seeSegmentText("month", "11")
    await I.seeSegmentText("day", "11")
  })

  test("[placeholderValue] ArrowDown after clearing a previously typed year starts from placeholder year", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSegmentIsNotPlaceholder("year")

    await I.focusSegment("year")
    await I.pressKey("Backspace", 4)
    await I.seeSegmentIsPlaceholder("year")

    // ArrowDown from placeholder year must seed from placeholderValue.year (2019)
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("year", "2018")
  })

  test("[placeholderValue] ArrowUp after clearing a previously typed day starts from placeholder day", async () => {})
  test("[placeholderValue] ArrowDown after clearing a previously typed day starts from placeholder day", async () => {})

  test("[placeholderValue] ArrowUp after clearing a previously typed month starts from placeholder month", async () => {})
  test("[placeholderValue] ArrowDown after clearing a previously typed month starts from placeholder month", async () => {})

  test("[placeholderValue] changing the prop while mid-edit resets the editing base", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    // Partially edit month
    await I.focusSegment("month")
    await I.type("05")
    await I.seeSegmentText("month", "05")

    // Change the placeholder prop while editing is in progress
    await I.controls.date("placeholderValue", "2025-08-20")
    await I.seePlaceholderValue("2025-08-20")

    // ArrowUp on the now-empty day must start from new placeholder (day=20)
    await I.focusSegment("day")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "21")
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

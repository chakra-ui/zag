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
    await I.seeSegmentText("month", "1")
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
    await I.seeSegmentText("month", "1")
    await I.seeSegmentText("day", "25")
    await I.seeSegmentText("year", "2025")
    await I.seeSelectedValue("1/25/2025")
  })

  test("[input] typing a high first digit auto-advances (e.g. month=2 pads to 02)", async () => {
    await I.focusSegment("month")
    await I.type("2")
    // 2 followed by 0 would be 20 > 12, so next digit starts fresh
    // but first "2" alone: 20 > 12, so it should set month to 02 and advance
    await I.seeSegmentFocused("day")
    await I.seeSegmentText("month", "2")
  })

  test("[input] ArrowUp increments the segment value", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.focusSegment("month")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "2")
  })

  test("[input] ArrowDown decrements the segment value", async () => {
    await I.focusSegment("month")
    await I.type("03")
    await I.focusSegment("month")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "2")
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
    await I.seeSegmentText("month", "1")
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
    await I.seeSegmentText("month", "6")
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
    // Month 1 displays as "1" in numeric (locale-default) format
    await I.seeSegmentText("month", "1")
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
    await I.seeSegmentText("month", "1")
    await I.pressKey("Backspace")
    await I.seeSegmentIsPlaceholder("month")
    await I.seeSegmentFocused("month")
  })

  test("[input] Backspace clears day after clearing year", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.type("25")
    await I.type("2025")
    await I.seeSelectedValue("1/25/2025")

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
    await I.seeSegmentText("month", "4")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "5")

    await I.focusSegment("day")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "10")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "11")

    await I.focusSegment("year")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("year", "2019")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("year", "2020")
  })

  test("[input] ArrowDown value starts from the placeholder date", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "4")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "3")

    await I.focusSegment("day")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("day", "10")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("day", "9")

    await I.focusSegment("year")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("year", "2019")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("year", "2018")
  })

  test("[input] changing placeholderValue prop updates the base date for editing", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.controls.date("placeholderValue", "2020-06-15")
    await I.seePlaceholderValue("2020-06-15")

    await I.focusSegment("month")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "6")

    await I.focusSegment("day")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "15")

    await I.focusSegment("year")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("year", "2020")
  })

  test("[input] ArrowDown on year:1 should show year:1 era:BC and selected value should have 0 year set", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "0001-04-10")
    await I.seePlaceholderValue("0001-04-10")

    await I.focusSegment("year")
    await I.pressKey("ArrowDown") // seed year=1, era=AD from placeholder
    await I.seeSegmentText("year", "1")
    await I.pressKey("ArrowDown") // cycle year 1 AD → year 1 BC
    await I.seeSegmentText("year", "1")
    await I.seeSegmentText("era", "BC")

    await I.focusSegment("month")
    await I.type("01")
    await I.type("01")
    await I.seeSelectedValue("1/1/0")
  })

  test("[input] ArrowDown on year:1 era:BC should show year:2 era:BC and selected value should have -1 year set", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "0001-04-10")
    await I.seePlaceholderValue("0001-04-10")

    await I.focusSegment("year")
    await I.pressKey("ArrowDown") // seed year=1, era=AD from placeholder
    await I.pressKey("ArrowDown") // cycle year 1 AD → year 1 BC
    await I.seeSegmentText("year", "1")
    await I.seeSegmentText("era", "BC")
    await I.pressKey("ArrowDown") // cycle year 1 BC → year 2 BC
    await I.seeSegmentText("year", "2")
    await I.seeSegmentText("era", "BC")

    await I.focusSegment("month")
    await I.type("01")
    await I.type("01")
    await I.seeSelectedValue("1/1/-1")
  })

  // --- placeholderValue stability (editingValue behaviour) ---

  test("[placeholderValue] is not changed after a complete valid input", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("01")
    await I.type("25")
    await I.type("2025")
    await I.seeSelectedValue("1/25/2025")

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
    await I.seeSegmentText("month", "5")
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
    await I.seeSelectedValue("6/15/2022")

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
    await I.seeSegmentText("year", "2019")
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
    await I.seeSegmentText("year", "2019")
  })

  test("[placeholderValue] ArrowUp after clearing a previously typed day starts from placeholder day", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSegmentIsNotPlaceholder("day")

    // Clear only the day
    await I.focusSegment("day")
    await I.pressKey("Backspace", 2)
    await I.seeSegmentIsPlaceholder("day")

    // First ArrowUp seeds from placeholderValue.day (10)
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "10")
    // Second ArrowUp increments from there
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "11")
    // Month and year must still reflect the typed values
    await I.seeSegmentText("month", "11")
    await I.seeSegmentText("year", "1111")
  })

  test("[placeholderValue] ArrowDown after clearing a previously typed day starts from placeholder day", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSegmentIsNotPlaceholder("day")

    // Clear only the day
    await I.focusSegment("day")
    await I.pressKey("Backspace", 2)
    await I.seeSegmentIsPlaceholder("day")

    // First ArrowDown seeds from placeholderValue.day (10)
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("day", "10")
    // Second ArrowDown decrements from there
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("day", "9")
  })

  test("[placeholderValue] ArrowUp after clearing a previously typed month starts from placeholder month", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSegmentIsNotPlaceholder("month")

    // Clear only the month
    await I.focusSegment("month")
    await I.pressKey("Backspace", 2)
    await I.seeSegmentIsPlaceholder("month")

    // First ArrowUp seeds from placeholderValue.month (4)
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "4")
    // Second ArrowUp increments from there
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("month", "5")
    // Day and year must still reflect the typed values
    await I.seeSegmentText("day", "11")
    await I.seeSegmentText("year", "1111")
  })

  test("[placeholderValue] ArrowDown after clearing a previously typed month starts from placeholder month", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    await I.focusSegment("month")
    await I.type("11")
    await I.type("11")
    await I.type("1111")
    await I.seeSegmentIsNotPlaceholder("month")

    // Clear only the month
    await I.focusSegment("month")
    await I.pressKey("Backspace", 2)
    await I.seeSegmentIsPlaceholder("month")

    // First ArrowDown seeds from placeholderValue.month (4)
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "4")
    // Second ArrowDown decrements from there
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("month", "3")
  })

  test("[placeholderValue] changing the prop while mid-edit resets the editing base", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")
    await I.seePlaceholderValue("2019-04-10")

    // Partially edit month
    await I.focusSegment("month")
    await I.type("05")
    await I.seeSegmentText("month", "5")

    // Change the placeholder prop while editing is in progress
    await I.controls.date("placeholderValue", "2025-08-20")
    await I.seePlaceholderValue("2025-08-20")

    // ArrowUp on the now-empty day must start from new placeholder (day=20)
    await I.focusSegment("day")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("day", "20")
  })

  test("[placeholderValue] changing the prop preserves already-entered segments", async () => {
    await I.clickControls()
    await I.controls.date("placeholderValue", "2019-04-10")

    // Enter month and day but leave year as placeholder
    await I.focusSegment("month")
    await I.type("05")
    await I.type("15")
    await I.seeSegmentText("month", "5")
    await I.seeSegmentText("day", "15")
    await I.seeSegmentIsPlaceholder("year")

    // Change the placeholder prop
    await I.controls.date("placeholderValue", "2025-08-20")
    await I.seePlaceholderValue("2025-08-20")

    // Entered segments must be preserved — NOT reset to placeholder
    await I.seeSegmentIsNotPlaceholder("month")
    await I.seeSegmentIsNotPlaceholder("day")
    await I.seeSegmentText("month", "5")
    await I.seeSegmentText("day", "15")
  })

  test("[granularity] changing granularity preserves already-entered segments", async () => {
    // Enter month and day (partial — year left as placeholder)
    await I.focusSegment("month")
    await I.type("03")
    await I.type("20")
    // Wait for auto-advance to year to confirm both entries were processed
    await I.seeSegmentFocused("year")
    await I.seeSegmentText("month", "3")
    await I.seeSegmentText("day", "20")
    await I.seeSegmentIsPlaceholder("year")

    // Change granularity — this triggers a placeholderValue conversion internally
    await I.clickControls()
    await I.controls.select("granularity", "minute")

    // Previously entered segments must remain visible, NOT wiped to placeholders
    await I.seeSegmentIsNotPlaceholder("month")
    await I.seeSegmentIsNotPlaceholder("day")
    await I.seeSegmentText("month", "3")
    await I.seeSegmentText("day", "20")
    // New time segments must show as placeholder
    await I.seeSegmentIsPlaceholder("hour")
    await I.seeSegmentIsPlaceholder("minute")
  })

  test("[granularity] changing granularity preserves a fully committed date", async () => {
    // Enter a complete date so it is committed to value
    await I.focusSegment("month")
    await I.type("01")
    await I.type("25")
    await I.type("2025")
    await I.seeSelectedValue("1/25/2025")

    // Change granularity
    await I.clickControls()
    await I.controls.select("granularity", "minute")

    // Date segments must still show the committed values
    await I.seeSegmentIsNotPlaceholder("month")
    await I.seeSegmentIsNotPlaceholder("day")
    await I.seeSegmentIsNotPlaceholder("year")
    await I.seeSegmentText("month", "1")
    await I.seeSegmentText("day", "25")
    await I.seeSegmentText("year", "2025")
    // Time segments must show as placeholder
    await I.seeSegmentIsPlaceholder("hour")
    await I.seeSegmentIsPlaceholder("minute")
  })

  // --- shouldForceLeadingZeros ---

  test("[shouldForceLeadingZeros] when true, single-digit month shows leading zero", async () => {
    await I.clickControls()
    await I.controls.bool("shouldForceLeadingZeros", true)

    await I.focusSegment("month")
    await I.type("01")
    await I.seeSegmentText("month", "01")
  })

  test("[shouldForceLeadingZeros] when true, single-digit day shows leading zero", async () => {
    await I.clickControls()
    await I.controls.bool("shouldForceLeadingZeros", true)

    await I.focusSegment("day")
    await I.type("05")
    await I.seeSegmentText("day", "05")
  })

  test("[shouldForceLeadingZeros] when true, selected value has leading zeros", async () => {
    await I.clickControls()
    await I.controls.bool("shouldForceLeadingZeros", true)

    await I.focusSegment("month")
    await I.type("01")
    await I.type("05")
    await I.type("2025")
    await I.seeSelectedValue("01/05/2025")
  })

  test("[shouldForceLeadingZeros] when false (default), single-digit month has no leading zero", async () => {
    await I.focusSegment("month")
    await I.type("01")
    await I.seeSegmentText("month", "1")
  })

  test("[paste] pasting a valid ISO date string sets the value", async () => {
    await I.focusSegment("month")
    await I.paste("2024-06-15")
    await I.seeSelectedValue("6/15/2024")
  })

  test("[paste] pasting an invalid string is a no-op", async () => {
    await I.focusSegment("month")
    await I.paste("not-a-date")
    await I.seeSelectedValue("")
    await I.seeSegmentIsPlaceholder("month")
    await I.seeSegmentIsPlaceholder("day")
    await I.seeSegmentIsPlaceholder("year")
  })
})

test.describe("date-input [range]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DateInputModel(page)
    await I.goto("/date-input/range")
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("[input] can enter a start date", async () => {
    await I.focusFirstSegment()
    await I.type("01")
    await I.type("15")
    await I.type("2025")
    await I.seeSelectedValue("1/15/2025")
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

  test("[focus] focusing start date group marks only group 0 with data-focus", async () => {
    await I.focusFirstSegment()
    await I.seeSegmentGroupFocused(0)
    await I.seeSegmentGroupNotFocused(1)
  })

  test("[focus] focusing end date group marks only group 1 with data-focus", async () => {
    await I.focusFirstSegment()
    await I.type("01")
    await I.type("15")
    await I.type("2025")
    await I.seeSegmentInGroupFocused("month", 1)
    await I.seeSegmentGroupFocused(1)
    await I.seeSegmentGroupNotFocused(0)
  })

  test("[focus] blurring range input removes data-focus from all groups", async () => {
    await I.focusFirstSegment()
    await I.seeSegmentGroupFocused(0)
    await I.clickOutsideToBlur()
    await I.seeSegmentGroupNotFocused(0)
    await I.seeSegmentGroupNotFocused(1)
  })

  test("[keyboard] ArrowRight on last start segment moves focus to first end segment", async () => {
    await I.getSegmentInGroup("year", 0).click()
    await I.seeSegmentInGroupFocused("year", 0)
    await I.pressKey("ArrowRight")
    await I.seeSegmentInGroupFocused("month", 1)
  })
})

test.describe("date-input [granularity cycle]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DateInputModel(page)
    await I.goto()
  })

  test("[granularity] switching to hour granularity allows ArrowUp to initialise hour segment", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "hour")

    // First ArrowUp on an empty hour segment must initialise it from the placeholder
    await I.focusSegment("hour")
    await I.seeSegmentIsPlaceholder("hour")
    await I.pressKey("ArrowUp")
    await I.seeSegmentIsNotPlaceholder("hour")
  })

  test("[granularity] switching to minute granularity allows ArrowUp to initialise minute segment", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")

    await I.focusSegment("minute")
    await I.seeSegmentIsPlaceholder("minute")
    await I.pressKey("ArrowUp")
    await I.seeSegmentIsNotPlaceholder("minute")
  })

  test("[granularity] switching to hour granularity allows ArrowDown to initialise hour segment", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "hour")

    await I.focusSegment("hour")
    await I.seeSegmentIsPlaceholder("hour")
    await I.pressKey("ArrowDown")
    await I.seeSegmentIsNotPlaceholder("hour")
  })

  test("[granularity] typing 'P' on dayPeriod sets PM", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")

    await I.focusSegment("dayPeriod")
    await I.seeSegmentText("dayPeriod", "AM")
    await I.pressKey("p")
    await I.seeSegmentText("dayPeriod", "PM")
  })

  test("[granularity] typing 'A' on dayPeriod sets AM", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")

    await I.focusSegment("dayPeriod")
    await I.pressKey("p")
    await I.seeSegmentText("dayPeriod", "PM")
    await I.pressKey("a")
    await I.seeSegmentText("dayPeriod", "AM")
  })

  test("[granularity] switching to minute granularity allows ArrowUp/ArrowDown to toggle dayPeriod", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")

    await I.focusSegment("dayPeriod")
    await I.seeSegmentText("dayPeriod", "AM")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("dayPeriod", "PM")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("dayPeriod", "AM")
  })

  test("[hourCycle=12] dayPeriod segment renders and toggles", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")
    await I.controls.select("hourCycle", "12")

    await I.focusSegment("dayPeriod")
    await I.seeSegmentText("dayPeriod", "AM")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("dayPeriod", "PM")
  })

  test("[hourCycle=24] no dayPeriod segment renders; hour cycles 0-23", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")
    await I.controls.select("hourCycle", "24")

    await I.seeSegmentHasCount("dayPeriod", 0)

    await I.focusSegment("hour")
    await I.seeSegmentIsPlaceholder("hour")
    await I.pressKey("ArrowUp")
    await I.seeSegmentIsNotPlaceholder("hour")
  })

  test("[hourCycle] switching 12 → 24 → 12 preserves hour and re-shows dayPeriod", async () => {
    await I.clickControls()
    await I.controls.select("granularity", "minute")
    await I.controls.select("hourCycle", "12")

    // type 09:30 PM
    await I.focusSegment("hour")
    await I.type("09")
    await I.type("30")
    await I.focusSegment("dayPeriod")
    await I.pressKey("ArrowUp")
    await I.seeSegmentText("dayPeriod", "PM")
    await I.seeSegmentText("hour", "9")

    // switch to 24h: dayPeriod removed, hour becomes 21
    await I.controls.select("hourCycle", "24")
    await I.seeSegmentHasCount("dayPeriod", 0)
    await I.seeSegmentText("hour", "21")

    // switch back to 12h: dayPeriod re-appears as PM, hour becomes 9
    await I.controls.select("hourCycle", "12")
    await I.seeSegmentText("dayPeriod", "PM")
    await I.seeSegmentText("hour", "9")
  })
})

test.describe("date-input [hour-cycle]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DateInputModel(page)
    await I.goto("/date-input/hour-cycle")
  })

  test("[hour-cycle] hourCycle=24 forces 24-hour time regardless of locale", async () => {
    await I.seeSegmentHasCount("dayPeriod", 0)
    await I.focusSegment("hour")
    await I.pressKey("ArrowUp")
    // h23 hour cycle starts at 0, so first ArrowUp lands on a 0-23 value (placeholder).
    await I.seeSegmentIsNotPlaceholder("hour")
  })
})

test.describe("date-input [timezone]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DateInputModel(page)
    await I.goto("/date-input/timezone")
  })

  test("[timezone] timeZoneName segment renders with the zone abbreviation", async () => {
    await I.seeSegmentHasCount("timeZoneName", 1)
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "3")
    await I.seeSegmentText("year", "2025")
    await I.seeSegmentText("hour", "8")
    await I.seeSegmentText("minute", "45")
    await I.seeSegmentText("dayPeriod", "AM")
    await I.seeSegmentText("timeZoneName", "PST")
  })

  test("[timezone] ArrowRight from dayPeriod focuses the read-only timeZoneName", async () => {
    await I.focusSegment("dayPeriod")
    await I.pressKey("ArrowRight")
    await I.seeSegmentFocused("timeZoneName")
  })

  test("[timezone] ArrowLeft from timeZoneName focuses dayPeriod", async () => {
    await I.focusSegment("timeZoneName")
    await I.pressKey("ArrowLeft")
    await I.seeSegmentFocused("dayPeriod")
  })

  test("[timezone] typing 'P' on dayPeriod advances focus to timeZoneName", async () => {
    await I.focusSegment("dayPeriod")
    await I.pressKey("p")
    await I.seeSegmentText("dayPeriod", "PM")
    await I.seeSegmentFocused("timeZoneName")
  })

  test("[timezone] hideTimeZone hides the timeZoneName segment", async () => {
    await I.seeSegmentHasCount("timeZoneName", 1)
    await I.page.getByTestId("hide-tz").check()
    await I.seeSegmentHasCount("timeZoneName", 0)
    await I.page.getByTestId("hide-tz").uncheck()
    await I.seeSegmentHasCount("timeZoneName", 1)
  })
})

test.describe("date-input [min/max]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DateInputModel(page)
    await I.goto("/date-input/min-max")
  })

  test("[min/max] typing a full date within range sets the value correctly", async () => {
    await I.focusSegment("month")
    await I.type("02")
    await I.type("22")
    await I.type("2025")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")
    await I.seeSegmentText("year", "2025")
    await I.seeSelectedValue("2/22/2025")
  })

  test("[min/max] typing year digit-by-digit does not reset month and day", async () => {
    await I.focusSegment("month")
    await I.type("2")
    await I.seeSegmentFocused("day")
    await I.seeSegmentText("month", "2")

    await I.type("22")
    await I.seeSegmentFocused("year")
    await I.seeSegmentText("day", "22")

    await I.type("2")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")

    await I.type("0")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")

    await I.type("0")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")

    await I.type("0")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")
    await I.seeSegmentText("year", "2000")
    await I.seeSelectedValue("2/22/2000")
  })

  test("[min/max] partial year entry does not disrupt other segments on blur", async () => {
    await I.focusSegment("month")
    await I.type("2")
    await I.seeSegmentFocused("day")
    await I.type("22")
    await I.seeSegmentFocused("year")
    await I.type("2")

    await I.clickOutsideToBlur()
    await I.seeSelectedValue("2/22/2000")
  })

  test("[min/max] backspace during partial year entry does not reset other segments", async () => {
    await I.focusSegment("month")
    await I.type("2")
    await I.seeSegmentFocused("day")
    await I.type("22")
    await I.seeSegmentFocused("year")
    await I.type("20")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")

    await I.pressKey("Backspace")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")
  })

  test("[min/max] typing a date below min is unclamped during edit, segment-clamped on blur", async () => {
    await I.focusSegment("month")
    await I.type("06")
    await I.type("15")
    await I.type("1999")
    await I.seeSelectedValue("6/15/1999")

    await I.clickOutsideToBlur()
    await I.seeSelectedValue("6/15/2000")
  })

  test("[min/max] typing a date above max is unclamped during edit, segment-clamped on blur", async () => {
    await I.focusSegment("month")
    await I.type("06")
    await I.type("15")
    await I.type("2031")
    await I.seeSelectedValue("6/15/2031")

    await I.clickOutsideToBlur()
    await I.seeSelectedValue("6/15/2030")
  })

  test("[min/max] backspace on completed year does not reset month/day", async () => {
    await I.focusSegment("month")
    await I.type("12")
    await I.type("15")
    await I.type("2010")
    await I.seeSelectedValue("12/15/2010")

    await I.pressKey("Backspace")
    await I.seeSegmentText("year", "201")
    await I.seeSegmentText("month", "12")
    await I.seeSegmentText("day", "15")
  })

  test("[min/max] backspace then retype extends the partial value (does not start fresh)", async () => {
    await I.focusSegment("month")
    await I.type("12")
    await I.type("15")
    await I.type("1990")
    await I.seeSegmentText("year", "1990")

    await I.pressKey("Backspace")
    await I.type("5")
    await I.seeSegmentText("year", "1995")
  })

  test("[min/max] arrow-down on year at boundary does not reset month/day", async () => {
    await I.focusSegment("month")
    await I.type("02")
    await I.type("22")
    await I.type("2000")
    await I.seeSelectedValue("2/22/2000")

    await I.focusSegment("year")
    await I.pressKey("ArrowDown")
    await I.seeSegmentText("year", "1999")
    await I.seeSegmentText("month", "2")
    await I.seeSegmentText("day", "22")

    await I.clickOutsideToBlur()
    await I.seeSelectedValue("2/22/2000")
  })
})

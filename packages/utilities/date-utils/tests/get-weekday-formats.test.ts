import { CalendarDate } from "@internationalized/date"
import { getWeekdayFormats } from "../src"

test("getWeekdayFormats", () => {
  expect(getWeekdayFormats("en", "UTC")(new CalendarDate(2020, 1, 1))).toMatchInlineSnapshot(`
    {
      "long": "Wednesday",
      "narrow": "W",
      "short": "Wed",
      "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
        "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
          "identifier": "gregory",
        },
        "day": 1,
        "era": "AD",
        "month": 1,
        "year": 2020,
      },
    }
  `)
})

import { CalendarDate } from "@internationalized/date"
import { getWeekdayFormats } from "../src"

test("getWeekdayFormats", () => {
  expect(getWeekdayFormats("en", "UTC")(new CalendarDate(2020, 1, 1))).toMatchInlineSnapshot(`
    {
      "long": "Wednesday",
      "narrow": "W",
      "short": "Wed",
      "value": $35ea8db9cb2ccb90$export$99faa760c7908e4f {
        "calendar": $3b62074eb05584b2$export$80ee6245ec4f29ec {
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

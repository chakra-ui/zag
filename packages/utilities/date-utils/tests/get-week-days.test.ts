import { parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { getMonthDates, getWeekDays } from "../src"

const timeZone = "UTC"
const locale = "en-US"

describe("Date utilities", () => {
  test("should get week dates", () => {
    expect(getWeekDays(parseDate("2023-01-10"), timeZone, locale)).toMatchInlineSnapshot(`
      [
        {
          "long": "Sunday",
          "narrow": "S",
          "short": "Sun",
          "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
            "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
              "identifier": "gregory",
            },
            "day": 8,
            "era": "AD",
            "month": 1,
            "year": 2023,
          },
        },
        {
          "long": "Monday",
          "narrow": "M",
          "short": "Mon",
          "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
            "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
              "identifier": "gregory",
            },
            "day": 9,
            "era": "AD",
            "month": 1,
            "year": 2023,
          },
        },
        {
          "long": "Tuesday",
          "narrow": "T",
          "short": "Tue",
          "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
            "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
              "identifier": "gregory",
            },
            "day": 10,
            "era": "AD",
            "month": 1,
            "year": 2023,
          },
        },
        {
          "long": "Wednesday",
          "narrow": "W",
          "short": "Wed",
          "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
            "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
              "identifier": "gregory",
            },
            "day": 11,
            "era": "AD",
            "month": 1,
            "year": 2023,
          },
        },
        {
          "long": "Thursday",
          "narrow": "T",
          "short": "Thu",
          "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
            "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
              "identifier": "gregory",
            },
            "day": 12,
            "era": "AD",
            "month": 1,
            "year": 2023,
          },
        },
        {
          "long": "Friday",
          "narrow": "F",
          "short": "Fri",
          "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
            "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
              "identifier": "gregory",
            },
            "day": 13,
            "era": "AD",
            "month": 1,
            "year": 2023,
          },
        },
        {
          "long": "Saturday",
          "narrow": "S",
          "short": "Sat",
          "value": $625ad1e1f4c43bc1$export$99faa760c7908e4f {
            "calendar": $af14c9812fdceb33$export$80ee6245ec4f29ec {
              "identifier": "gregory",
            },
            "day": 14,
            "era": "AD",
            "month": 1,
            "year": 2023,
          },
        },
      ]
    `)
  })

  test("should get month dates", () => {
    expect(getMonthDates(parseDate("2023-01-10"), { months: 1 }, locale).map((date) => date.toString()))
      .toMatchInlineSnapshot(`
      [
        "2023-01-08,2023-01-09,2023-01-10,2023-01-11,2023-01-12,2023-01-13,2023-01-14",
        "2023-01-15,2023-01-16,2023-01-17,2023-01-18,2023-01-19,2023-01-20,2023-01-21",
        "2023-01-22,2023-01-23,2023-01-24,2023-01-25,2023-01-26,2023-01-27,2023-01-28",
        "2023-01-29,2023-01-30,2023-01-31,2023-02-01,2023-02-02,2023-02-03,2023-02-04",
        "2023-02-05,2023-02-06,2023-02-07,2023-02-08,2023-02-09,2023-02-10,2023-02-11",
      ]
    `)
  })
})

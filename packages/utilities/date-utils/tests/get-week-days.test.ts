import { parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { getWeekDays } from "../src"

const timeZone = "UTC"
const locale = "en-US"

describe("Date utilities", () => {
  test("should get week dates", () => {
    expect(getWeekDays(parseDate("2023-01-10"), undefined, timeZone, locale)).toMatchInlineSnapshot(`
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
})

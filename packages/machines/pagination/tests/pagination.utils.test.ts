import { expect, describe, test } from "vitest"
import * as utils from "../src/pagination.utils"
import { getRange } from "../src/pagination.utils"
import { getRangeTestCases } from "./pagination.utils.test-cases"

describe("@zag-js/pagination utils", () => {
  test("range method", () => {
    expect(utils.range(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  test("transform method", () => {
    const items = [1, 2, "ellipsis", 3, 4]
    const transformed = utils.transform(items)
    expect(transformed).toEqual([
      {
        type: "page",
        value: 1,
      },
      {
        type: "page",
        value: 2,
      },
      {
        type: "ellipsis",
      },
      {
        type: "page",
        value: 3,
      },
      {
        type: "page",
        value: 4,
      },
    ])
  })

  describe("getRange method", () => {
    test.each(getRangeTestCases)(
      "siblingCount: $siblingCount, totalPages: $totalPages, page: $pages",
      ({ expected, pages, ...ctx }) => {
        for (let page of pages) {
          const range = getRange({ ...ctx, page })
          expect(range).toEqual(expected)
        }
      },
    )
  })
})

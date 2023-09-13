import { expect, describe, test } from "vitest"
import * as utils from "../src/pagination.utils"

describe("@zag-js/pagination utils", () => {
  test("range method", () => {
    expect(utils.range(1, 5)).toMatchInlineSnapshot(`
    [
      1,
      2,
      3,
      4,
      5,
    ]
  `)
  })

  test("transform method", () => {
    const items = [1, 2, "ellipsis", 3, 4]
    const transformed = utils.transform(items)
    expect(transformed).toMatchInlineSnapshot(`
    [
      {
        "type": "page",
        "value": 1,
      },
      {
        "type": "page",
        "value": 2,
      },
      {
        "type": "ellipsis",
      },
      {
        "type": "page",
        "value": 3,
      },
      {
        "type": "page",
        "value": 4,
      },
    ]
  `)
  })
})

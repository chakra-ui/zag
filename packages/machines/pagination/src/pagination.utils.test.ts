import { utils } from "./pagination.utils"

describe("@zag-js/pagination utils", () => {
  test("range method", () => {
    const range = utils.range(1, 5)
    expect(range[0]).toEqual(1)
    expect(range[4]).toEqual(5)
    expect(range.length).toEqual(5)
  })

  test("transform method", () => {
    const items = [1, 2, "ellipsis", 3, 4]
    const transformed = utils.transform(items)
    expect(transformed[0].type).toEqual("page")
    expect(transformed[2].type).toEqual("ellipsis")
  })
})

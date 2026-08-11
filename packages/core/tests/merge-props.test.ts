import { mergeProps } from "../src/merge-props"

describe("mergeProps", () => {
  test("combines data-ownedby tokens", () => {
    const props = mergeProps({ "data-ownedby": "toggle-group" }, { "data-ownedby": "tooltip" })

    expect(props["data-ownedby"]).toBe("toggle-group tooltip")
  })

  test("dedupes data-ownedby tokens", () => {
    const props = mergeProps({ "data-ownedby": "toggle-group tooltip" }, { "data-ownedby": "tooltip toggle-group" })

    expect(props["data-ownedby"]).toBe("toggle-group tooltip")
  })

  test("keeps normal override behavior for other data attributes", () => {
    const props = mergeProps({ "data-state": "on" }, { "data-state": "open" })

    expect(props["data-state"]).toBe("open")
  })
})

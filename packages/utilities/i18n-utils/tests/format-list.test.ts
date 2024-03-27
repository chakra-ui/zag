import { formatList } from "../src/format-list"

const items = ["react", "svelte", "vue"]

describe("formatList", () => {
  test("conjunction / and", () => {
    expect(formatList(items, "en-US")).toMatchInlineSnapshot(`"react, svelte, and vue"`)
    expect(formatList(items, "fr-FR")).toMatchInlineSnapshot(`"react, svelte et vue"`)
  })

  test("conjunction / and + short", () => {
    expect(formatList(items, "en-US", { style: "short" })).toMatchInlineSnapshot(`"react, svelte, & vue"`)
    expect(formatList(items, "fr-FR", { style: "short" })).toMatchInlineSnapshot(`"react, svelte et vue"`)
  })

  test("disjunction / or", () => {
    expect(formatList(items, "en-US", { style: "short", type: "disjunction" })).toMatchInlineSnapshot(
      `"react, svelte, or vue"`,
    )
  })
})

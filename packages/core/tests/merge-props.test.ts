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

  test("splits a style string on declaration separators", () => {
    const props = mergeProps({ style: "color: red; margin: 0;" }, { style: { padding: "4px" } })

    expect(props.style).toEqual({ color: "red", margin: "0", padding: "4px" })
  })

  test("keeps semicolons inside quoted style values", () => {
    const props = mergeProps({ style: `--label: "a;b"; content: 'c;d'; color: red` }, { style: { display: "block" } })

    expect(props.style).toEqual({ "--label": '"a;b"', content: "'c;d'", color: "red", display: "block" })
  })

  test("does not end a quoted style value at an escaped quote", () => {
    const props = mergeProps({ style: 'content: "a\\";b"; color: red' }, { style: { display: "block" } })

    expect(props.style).toEqual({ content: '"a\\";b"', color: "red", display: "block" })
  })

  test("keeps semicolons inside url() and nested functions", () => {
    const props = mergeProps(
      {
        style: [
          'background-image: url("data:image/svg+xml;base64,PHN2Zy8+")',
          "mask-image: url(data:image/png;base64,AAA)",
          "border-image-source: image-set(url(data:image/png;base64,BBB) 1x)",
          "color: red",
        ].join("; "),
      },
      { style: { display: "block" } },
    )

    expect(props.style).toEqual({
      "background-image": 'url("data:image/svg+xml;base64,PHN2Zy8+")',
      "mask-image": "url(data:image/png;base64,AAA)",
      "border-image-source": "image-set(url(data:image/png;base64,BBB) 1x)",
      color: "red",
      display: "block",
    })
  })
})

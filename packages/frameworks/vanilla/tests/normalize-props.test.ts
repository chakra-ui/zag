import { normalizeProps } from "../src"

// normalizeProps is a Proxy - access any property to get the normalizer function
const normalize = normalizeProps.element

describe("normalizeProps", () => {
  describe("prop mapping", () => {
    test("htmlFor -> for", () => {
      const result = normalize({ htmlFor: "input-id" })
      expect(result).toHaveProperty("for", "input-id")
      expect(result).not.toHaveProperty("htmlFor")
    })

    test("className -> class", () => {
      const result = normalize({ className: "my-class" })
      expect(result).toHaveProperty("class", "my-class")
      expect(result).not.toHaveProperty("className")
    })

    test("defaultValue -> value", () => {
      const result = normalize({ defaultValue: "test" })
      expect(result).toHaveProperty("value", "test")
      expect(result).not.toHaveProperty("defaultValue")
    })

    test("defaultChecked -> checked", () => {
      const result = normalize({ defaultChecked: true })
      expect(result).toHaveProperty("checked", true)
      expect(result).not.toHaveProperty("defaultChecked")
    })
  })

  describe("event mapping", () => {
    test("onFocus -> onFocusin", () => {
      const handler = () => {}
      const result = normalize({ onFocus: handler })
      expect(result).toHaveProperty("onfocusin", handler)
      expect(result).not.toHaveProperty("onFocus")
    })

    test("onBlur -> onFocusout", () => {
      const handler = () => {}
      const result = normalize({ onBlur: handler })
      expect(result).toHaveProperty("onfocusout", handler)
      expect(result).not.toHaveProperty("onBlur")
    })

    test("onChange -> onInput", () => {
      const handler = () => {}
      const result = normalize({ onChange: handler })
      expect(result).toHaveProperty("oninput", handler)
      expect(result).not.toHaveProperty("onChange")
    })

    test("onDoubleClick -> onDblclick", () => {
      const handler = () => {}
      const result = normalize({ onDoubleClick: handler })
      expect(result).toHaveProperty("ondblclick", handler)
      expect(result).not.toHaveProperty("onDoubleClick")
    })
  })

  describe("style objects", () => {
    test("converts style object to CSS string", () => {
      const result = normalize({
        style: {
          backgroundColor: "red",
          fontSize: "16px",
        },
      })
      expect(result.style).toBe("background-color:red;font-size:16px;")
    })

    test("preserves CSS custom properties", () => {
      const result = normalize({
        style: {
          "--my-var": "blue",
          color: "red",
        },
      })
      expect(result.style).toBe("--my-var:blue;color:red;")
    })

    test("filters null and undefined style values", () => {
      // @ts-expect-error - null is allowed
      const result = normalize({
        style: {
          color: "red",
          backgroundColor: null,
          fontSize: undefined,
        },
      })
      expect(result.style).toBe("color:red;")
    })
  })

  describe("SVG attributes", () => {
    test("preserves viewBox case", () => {
      const result = normalize({ viewBox: "0 0 100 100" })
      expect(result).toHaveProperty("viewBox", "0 0 100 100")
    })

    test("preserves preserveAspectRatio case", () => {
      const result = normalize({ preserveAspectRatio: "xMidYMid" })
      expect(result).toHaveProperty("preserveAspectRatio", "xMidYMid")
    })

    test("lowercases other attributes", () => {
      const result = normalize({
        dataTestId: "test",
        ariaLabel: "label",
      })
      expect(result).toHaveProperty("datatestid", "test")
      expect(result).toHaveProperty("arialabel", "label")
    })
  })

  describe("undefined values", () => {
    test("filters out undefined values", () => {
      const result = normalize({
        id: "test",
        className: undefined,
        title: "hello",
      })
      expect(result).toEqual({
        id: "test",
        title: "hello",
      })
    })

    test("keeps null values", () => {
      // @ts-expect-error - null is allowed
      const result = normalize({
        id: "test",
        title: null,
      })
      expect(result).toHaveProperty("title", null)
    })

    test("keeps false boolean values", () => {
      const result = normalize({
        disabled: false,
        hidden: true,
      })
      expect(result).toHaveProperty("disabled", false)
      expect(result).toHaveProperty("hidden", true)
    })
  })

  describe("mixed props", () => {
    test("handles complex prop object", () => {
      const onClick = () => {}
      const result = normalize({
        id: "my-input",
        className: "input-class",
        htmlFor: "label-id",
        onChange: onClick,
        style: { color: "blue" },
        "data-testid": "test",
        viewBox: "0 0 24 24",
      })

      expect(result).toEqual({
        id: "my-input",
        class: "input-class",
        for: "label-id",
        oninput: onClick,
        style: "color:blue;",
        "data-testid": "test",
        viewBox: "0 0 24 24",
      })
    })
  })
})

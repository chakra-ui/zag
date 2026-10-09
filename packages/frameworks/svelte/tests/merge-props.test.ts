import { clsx } from "clsx"
import { describe, expect, it, vi } from "vitest"
import { mergeProps, normalizeProps } from "../src"
import { getAttachedStyle, STYLE_KEY, toStyleString } from "../src/style"

const attach = (props: any, el: Element) => props[STYLE_KEY](el)

describe("mergeProps for Svelte", () => {
  it("handles one argument", () => {
    const onClick = () => {}
    const className = "primary"
    const id = "test_id"

    const props = mergeProps({ onClick, className, id })

    expect(props.onClick).toBe(onClick)
    expect(props.className).toBe(className)
    expect(props.id).toBe(id)
  })

  it("combines handlers", () => {
    let count = 0
    const mockFn = vi.fn(() => {
      count++
    })

    const props = mergeProps({ onClick: mockFn }, { onClick: mockFn }, { onClick: mockFn })

    props.onClick()
    expect(mockFn).toHaveBeenCalledTimes(3)
    expect(count).toBe(3)
  })

  it("combines css classes", () => {
    const className1 = "primary"
    const className2 = "hover"
    const className3 = "focus"

    const props = mergeProps({ class: className1 }, { class: className2 }, { class: className3 })
    // mergeProps returns an array, clsx simulates what Svelte does at render time
    expect(clsx(props.class)).toBe("primary hover focus")
  })

  it("combines data-ownedby tokens", () => {
    const props = mergeProps({ "data-ownedby": "toggle-group tooltip" }, { "data-ownedby": "tooltip popover" })

    expect(props["data-ownedby"]).toBe("toggle-group tooltip popover")
  })

  it("combines styles", () => {
    const apiStyles =
      'margin:24px;padding:2;background-image:url("http://example.com/image.png");border:1px solid #123456;--x:123;'

    const objStyles = {
      margin: "10px",
      fontSize: "2rem",
    }
    const stringStyles = "margin:10px;font-size:2rem;"

    const propsFromObj = mergeProps({ style: apiStyles }, { style: objStyles })
    const propsFromString = mergeProps({ style: apiStyles }, { style: stringStyles })

    const result =
      'margin:10px;padding:2;background-image:url("http://example.com/image.png");border:1px solid #123456;--x:123;font-size:2rem;'

    // In the browser the merged style is applied through an attachment rather than the `style` attribute
    expect(propsFromObj.style).toBeUndefined()
    expect(toStyleString(getAttachedStyle(propsFromObj[STYLE_KEY])!)).toBe(result)
    expect(toStyleString(getAttachedStyle(propsFromString[STYLE_KEY])!)).toBe(result)
  })

  it("applies styles per property, keeping properties written to the element directly", () => {
    const el = document.createElement("div")
    const props = normalizeProps.element({ style: { position: "absolute", "--layer": 0 } })
    attach(props, el)

    // e.g. the positioning utility writing its variables
    el.style.setProperty("--x", "10px")

    const next = normalizeProps.element({ style: { position: "absolute", "--layer": 1 } })
    attach(next, el)

    expect(el.style.getPropertyValue("--layer")).toBe("1")
    expect(el.style.getPropertyValue("--x")).toBe("10px")
  })

  it("removes properties a later style drops", () => {
    const el = document.createElement("div")
    attach(normalizeProps.element({ style: { pointerEvents: "none", zIndex: 1 } }), el)
    attach(normalizeProps.element({ style: { zIndex: 2 } }), el)

    expect(el.style.getPropertyValue("pointer-events")).toBe("")
    expect(el.style.getPropertyValue("z-index")).toBe("2")
  })

  it("merges machine styles with consumer style strings", () => {
    const machine = normalizeProps.element({ style: { position: "absolute", top: "0px" } })
    const merged = mergeProps(machine, { style: "top:4px;color:red" })

    expect(getAttachedStyle(merged[STYLE_KEY])).toEqual({ position: "absolute", top: "4px", color: "red" })
  })

  it("keeps semicolons inside quoted values and url() when combining styles", () => {
    const props = mergeProps(
      { style: '--label:"a;b";background-image:url("data:image/svg+xml;base64,PHN2Zy8+")' },
      { style: "mask-image:url(data:image/png;base64,AAA);color:red" },
    )

    expect(toStyleString(getAttachedStyle(props[STYLE_KEY])!)).toBe(
      '--label:"a;b";background-image:url("data:image/svg+xml;base64,PHN2Zy8+");mask-image:url(data:image/png;base64,AAA);color:red;',
    )
  })

  it("last value overwrites the event listeners", () => {
    const mockFn = vi.fn()
    const message1 = "click1"
    const message2 = "click2"

    const props = mergeProps(
      { onEvent: () => mockFn(message1) },
      { onEvent: () => mockFn(message2) },
      { onEvent: "overwrites" },
    )

    expect(props.onEvent).toBe("overwrites")
  })

  it("works with Svelte-specific props", () => {
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    const combined = mergeProps({ onClick: cb1 }, { onClick: cb2 })

    combined.onClick("foo")

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb1).toHaveBeenCalledWith("foo")
    expect(cb2).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledWith("foo")
  })

  it("preserves symbol keys for Svelte attachments", () => {
    const attachmentKey1 = Symbol("attachment1")
    const attachmentKey2 = Symbol("attachment2")
    const attachmentFn1 = vi.fn()
    const attachmentFn2 = vi.fn()

    const props = mergeProps(
      { [attachmentKey1]: attachmentFn1, class: "base" },
      { [attachmentKey2]: attachmentFn2, class: "additional" },
    )

    expect(props[attachmentKey1]).toBe(attachmentFn1)
    expect(props[attachmentKey2]).toBe(attachmentFn2)
    expect(clsx(props.class)).toBe("base additional")

    // Test that symbols are enumerable with getOwnPropertySymbols
    const symbols = Object.getOwnPropertySymbols(props)
    expect(symbols).toContain(attachmentKey1)
    expect(symbols).toContain(attachmentKey2)
  })

  it("overwrites same symbol key with last value for primitives", () => {
    const attachmentKey = Symbol("attachment")

    const props = mergeProps(
      { [attachmentKey]: "first", class: "base" },
      { [attachmentKey]: "second", class: "additional" },
    )

    expect(props[attachmentKey]).toBe("second")
    expect(clsx(props.class)).toBe("base additional")
  })

  it("overwrites same symbol key with last value for functions", () => {
    const attachmentKey = Symbol("attachment")
    const fn1 = vi.fn()
    const fn2 = vi.fn()

    const props = mergeProps({ [attachmentKey]: fn1, class: "base" }, { [attachmentKey]: fn2, class: "additional" })

    expect(props[attachmentKey]).toBe(fn2)
    expect(clsx(props.class)).toBe("base additional")
  })

  describe("ClassValue handling (Svelte 5.15+)", () => {
    it("handles array class values", () => {
      const props = mergeProps({ class: "base" }, { class: ["foo", "bar"] })
      expect(clsx(props.class)).toBe("base foo bar")
    })

    it("handles object class values", () => {
      const props = mergeProps({ class: "base" }, { class: { active: true, disabled: false, "hover:bg-blue": true } })
      expect(clsx(props.class)).toBe("base active hover:bg-blue")
    })

    it("handles mixed arrays and strings", () => {
      const props = mergeProps({ class: ["foo", "bar"] }, { class: "baz" }, { class: ["qux"] })
      expect(clsx(props.class)).toBe("foo bar baz qux")
    })

    it("handles nested arrays in class values", () => {
      const props = mergeProps({ class: "base" }, { class: ["foo", ["bar", "baz"]] })
      expect(clsx(props.class)).toBe("base foo bar baz")
    })

    it("filters falsy values in arrays", () => {
      const props = mergeProps({ class: "base" }, { class: ["foo", false, "bar", null, "baz", undefined, ""] })
      expect(clsx(props.class)).toBe("base foo bar baz")
    })

    it("handles falsy values in objects", () => {
      const props = mergeProps({ class: "base" }, { class: { active: true, disabled: false, visible: true } })
      expect(clsx(props.class)).toBe("base active visible")
    })

    it("preserves Svelte falsy value behavior for primitives", () => {
      // When null/undefined is provided, it's filtered out and Svelte uses remaining classes
      const props1 = mergeProps({ class: "base" }, { class: null })
      expect(clsx(props1.class)).toBe("base")

      const props2 = mergeProps({ class: "base" }, { class: undefined })
      expect(clsx(props2.class)).toBe("base")
    })

    it("handles complex real-world scenario", () => {
      // Simulates a component accepting class prop and merging with internal classes
      const userProps = { class: ["rounded", { "border-blue": true, "bg-gray": false }] }
      const internalProps = { class: "component-base" }
      const conditionalProps = { class: { active: true } }

      const props = mergeProps(internalProps, userProps, conditionalProps)
      expect(clsx(props.class)).toBe("component-base rounded border-blue active")
    })
  })
})

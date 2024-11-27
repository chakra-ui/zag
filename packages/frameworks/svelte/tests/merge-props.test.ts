import { describe, it, expect, vi } from "vitest"
import { mergeProps } from "../src"

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
    expect(props.class).toBe("primary hover focus")

    const props2 = mergeProps({ className: className1 }, { className: className2 }, { className: className3 })
    expect(props2.className).toBe("primary hover focus")
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

    expect(propsFromObj.style).toBe(result)
    expect(propsFromString.style).toBe(result)
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
})

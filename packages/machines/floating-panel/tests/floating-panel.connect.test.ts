// @vitest-environment jsdom

import { describe, expect, test, vi } from "vitest"
import { connect } from "../src/floating-panel.connect"

function setup(options: { closeOnEscape?: boolean; dragging?: boolean; resizing?: boolean; isTopmost?: boolean } = {}) {
  const { closeOnEscape = true, dragging = false, resizing = false, isTopmost = true } = options
  const send = vi.fn()
  const api = connect(
    {
      state: {
        hasTag: (tag: string) => tag === "open",
        matches: (value: string) => {
          if (value === "open.dragging") return dragging
          if (value === "open.resizing") return resizing
          return false
        },
      },
      send,
      scope: {},
      prop: (key: string) => {
        if (key === "closeOnEscape") return closeOnEscape
        if (key === "gridSize") return 1
        return undefined
      },
      computed: () => false,
      context: {
        get: (key: string) => {
          if (key === "isTopmost") return isTopmost
          if (key === "size") return { width: 100, height: 100 }
          if (key === "position") return { x: 0, y: 0 }
          return undefined
        },
      },
    } as any,
    {
      button: (props: any) => props,
      element: (props: any) => props,
    } as any,
  )

  return { send, contentProps: api.getContentProps() as any }
}

describe("floating-panel connect", () => {
  test("stops Escape propagation when closing the topmost panel", () => {
    const { send, contentProps } = setup({ closeOnEscape: true })
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
    const stopPropagation = vi.spyOn(event, "stopPropagation")

    contentProps.onKeyDown(event)

    expect(send).toHaveBeenCalledWith({ type: "ESCAPE" })
    expect(event.defaultPrevented).toBe(true)
    expect(stopPropagation).toHaveBeenCalledTimes(1)
  })

  test("stops Escape propagation when restoring a drag or resize", () => {
    const { send, contentProps } = setup({ closeOnEscape: false, dragging: true })
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
    const stopPropagation = vi.spyOn(event, "stopPropagation")

    contentProps.onKeyDown(event)

    expect(send).toHaveBeenCalledWith({ type: "ESCAPE" })
    expect(event.defaultPrevented).toBe(true)
    expect(stopPropagation).toHaveBeenCalledTimes(1)
  })

  test("does not consume Escape when the idle panel will not close", () => {
    const { send, contentProps } = setup({ closeOnEscape: false })
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
    const stopPropagation = vi.spyOn(event, "stopPropagation")

    contentProps.onKeyDown(event)

    expect(send).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    expect(stopPropagation).not.toHaveBeenCalled()
  })
})

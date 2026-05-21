// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from "vitest"
import { trackDismissableElement } from "../src"
import { layerStack } from "../src/layer-stack"

function nextTick() {
  return new Promise<void>((resolve) => queueMicrotask(resolve))
}

function resetStack() {
  while (layerStack.count() > 0) {
    const first = layerStack.layers[0]
    if (first) layerStack.remove(first.node)
  }
}

describe("trackDismissableElement", () => {
  afterEach(async () => {
    resetStack()
    document.body.innerHTML = ""
    await nextTick()
  })

  test("stops handled Escape events from reaching the window after dismissing", () => {
    const layer = document.createElement("div")
    const input = document.createElement("input")
    layer.append(input)
    document.body.append(layer)

    const onInputKeyDown = vi.fn()
    const onWindowKeyDown = vi.fn()

    input.addEventListener("keydown", onInputKeyDown)
    window.addEventListener("keydown", onWindowKeyDown)

    let cleanup: VoidFunction | undefined
    const onDismiss = vi.fn(() => cleanup?.())

    cleanup = trackDismissableElement(layer, { onDismiss })

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
    input.dispatchEvent(event)

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onInputKeyDown).toHaveBeenCalledTimes(1)
    expect(onWindowKeyDown).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)

    window.removeEventListener("keydown", onWindowKeyDown)
  })

  test("stops prevented Escape events without dismissing", () => {
    const layer = document.createElement("div")
    const input = document.createElement("input")
    layer.append(input)
    document.body.append(layer)

    const onInputKeyDown = vi.fn()
    const onWindowKeyDown = vi.fn()
    const onDismiss = vi.fn()

    input.addEventListener("keydown", onInputKeyDown)
    window.addEventListener("keydown", onWindowKeyDown)

    const cleanup = trackDismissableElement(layer, {
      onEscapeKeyDown: (event) => event.preventDefault(),
      onDismiss,
    })

    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
    input.dispatchEvent(event)

    expect(onDismiss).not.toHaveBeenCalled()
    expect(onInputKeyDown).toHaveBeenCalledTimes(1)
    expect(onWindowKeyDown).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)

    cleanup?.()
    window.removeEventListener("keydown", onWindowKeyDown)
  })
})

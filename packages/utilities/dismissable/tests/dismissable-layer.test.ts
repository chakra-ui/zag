// @vitest-environment jsdom

import { noop } from "@zag-js/utils"
import { afterEach, describe, expect, test, vi } from "vitest"
import { trackDismissableElement } from "../src/dismissable-layer"
import { layerStack } from "../src/layer-stack"

function raf() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function pressEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))
}

function mountNode() {
  const node = document.createElement("div")
  document.body.appendChild(node)
  return node
}

function resetStack() {
  while (layerStack.count() > 0) {
    const first = layerStack.layers[0]
    if (first) layerStack.remove(first.node)
  }
}

describe("trackDismissableElement", () => {
  afterEach(() => {
    resetStack()
    document.body.innerHTML = ""
  })

  test("registers escape handler synchronously when the node is already available", () => {
    const node = mountNode()
    const onDismiss = vi.fn()

    // `defer: true` is what every machine passes (dialog, popover, menu, ...)
    const cleanup = trackDismissableElement(node, { defer: true, onDismiss, onLayerChange: noop })

    // no frame has passed — the dialog is painted and interactive at this point
    pressEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)

    cleanup()
  })

  test("adds the layer to the stack synchronously when the node is already available", () => {
    const node = mountNode()

    const cleanup = trackDismissableElement(node, { defer: true, onDismiss: noop, onLayerChange: noop })

    expect(layerStack.isTopMost(node)).toBe(true)

    cleanup()
  })

  // the real-world path: machine effects run before the framework commits the content,
  // so the node is always null at call time and only appears in the following render
  test("registers on the microtask tick, without waiting a frame, once the node commits", async () => {
    let node: HTMLElement | null = null
    const onDismiss = vi.fn()

    const cleanup = trackDismissableElement(() => node, {
      defer: true,
      onDismiss,
      onLayerChange: noop,
      warnOnMissingNode: false,
    })

    node = mountNode()
    await Promise.resolve()

    pressEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)

    cleanup()
  })

  test("falls back to a frame when the node has still not committed by the microtask", async () => {
    let node: HTMLElement | null = null
    const onDismiss = vi.fn()

    const cleanup = trackDismissableElement(() => node, {
      defer: true,
      onDismiss,
      onLayerChange: noop,
      warnOnMissingNode: false,
    })

    await Promise.resolve()
    node = mountNode()
    await raf()

    pressEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)

    cleanup()
  })

  test("does not register when cleanup runs before the node commits", async () => {
    let node: HTMLElement | null = null
    const onDismiss = vi.fn()

    const cleanup = trackDismissableElement(() => node, {
      defer: true,
      onDismiss,
      onLayerChange: noop,
      warnOnMissingNode: false,
    })
    cleanup()

    node = mountNode()
    await Promise.resolve()
    await raf()

    pressEscape()
    expect(onDismiss).not.toHaveBeenCalled()
    expect(layerStack.isTopMost(node)).toBe(false)
  })

  test("cleanup removes the layer and unregisters escape", async () => {
    const node = mountNode()
    const onDismiss = vi.fn()

    const cleanup = trackDismissableElement(node, { defer: true, onDismiss, onLayerChange: noop })
    cleanup()
    await raf()

    pressEscape()
    expect(onDismiss).not.toHaveBeenCalled()
    expect(layerStack.isTopMost(node)).toBe(false)
  })
})

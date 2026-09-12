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
  afterEach(async () => {
    resetStack()
    document.body.innerHTML = ""
    // `layerStack.remove` keeps the node in `recentlyRemoved` for two frames; drain them so
    // the next test does not start with every interaction counted as "inside a layer"
    for (let i = 0; i < 4; i++) {
      await raf()
    }
  })

  test("registers escape handler synchronously when the node is already available", () => {
    const node = mountNode()
    const onDismiss = vi.fn()

    // `defer: true` is what every machine passes (dialog, popover, menu, ...)
    const cleanup = trackDismissableElement(node, { defer: true, onDismiss })

    // no frame has passed — the dialog is painted and interactive at this point
    pressEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)

    cleanup()
  })

  test("adds the layer to the stack synchronously when the node is already available", () => {
    const node = mountNode()

    const cleanup = trackDismissableElement(node, { defer: true, onDismiss: noop })

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

  // a layer opened from outside every open layer is a sibling, not a nested layer: the
  // layer below it is dismissed by the same interaction and must not take it down with it
  test("keeps a layer opened from outside alive when the layer below it dismisses", async () => {
    const triggerBelow = document.createElement("button")
    const nodeBelow = mountNode()
    const trigger = document.createElement("button")
    const node = mountNode()
    document.body.append(triggerBelow, trigger)

    let cleanupBelow: VoidFunction
    // mirrors a machine closing on interact-outside: the CLOSE transition tears the effect down
    const onDismissBelow = vi.fn(() => cleanupBelow())
    const onDismiss = vi.fn()

    cleanupBelow = trackDismissableElement(nodeBelow, {
      defer: true,
      exclude: [triggerBelow],
      onDismiss: onDismissBelow,
    })

    // `trackInteractOutside` resolves its node a frame late and binds `pointerdown` a task later
    await raf()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // pressing the other trigger queues the outside check for the next frame...
    trigger.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }))

    // ...and the layer it opens reaches the stack first, on the microtask after the commit
    const cleanup = trackDismissableElement(node, { defer: true, exclude: [trigger], onDismiss })
    await Promise.resolve()
    expect(layerStack.isTopMost(node)).toBe(true)

    await raf()

    expect(onDismissBelow).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()
    expect(layerStack.isTopMost(node)).toBe(true)

    cleanup()
  })

  // `persistentElements` says which elements must not dismiss the layer, not where it was
  // opened from, so one rendered inside another layer does not nest this layer in it
  test("does not nest a layer in the layer holding its persistent elements", () => {
    const nodeBelow = mountNode()
    const persistent = document.createElement("div")
    nodeBelow.append(persistent)
    const trigger = document.createElement("button")
    const node = mountNode()
    document.body.append(trigger)

    const cleanupBelow = trackDismissableElement(nodeBelow, { onDismiss: noop })
    const onDismiss = vi.fn()
    const cleanup = trackDismissableElement(node, {
      exclude: [trigger],
      persistentElements: [() => persistent],
      onDismiss,
    })

    cleanupBelow()

    expect(onDismiss).not.toHaveBeenCalled()

    cleanup()
  })

  test("cleanup removes the layer and unregisters escape", async () => {
    const node = mountNode()
    const onDismiss = vi.fn()

    const cleanup = trackDismissableElement(node, { defer: true, onDismiss })
    cleanup()
    await raf()

    pressEscape()
    expect(onDismiss).not.toHaveBeenCalled()
    expect(layerStack.isTopMost(node)).toBe(false)
  })
})

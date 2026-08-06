// @vitest-environment jsdom

import { afterEach, describe, expect, test, vi } from "vitest"
import { trackDismissableElement } from "../src/dismissable-layer"
import { layerStack } from "../src/layer-stack"

function dispatchEscape(target: EventTarget = document) {
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

/** Drain the double-rAF used by `nextTick` in `layerStack.remove` */
function drainRemoval() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

describe("trackDismissableElement", () => {
  const cleanups: VoidFunction[] = []

  function track(...args: Parameters<typeof trackDismissableElement>) {
    const cleanup = trackDismissableElement(...args)
    cleanups.push(cleanup)
    return cleanup
  }

  afterEach(async () => {
    cleanups.splice(0).forEach((fn) => fn())
    document.body.innerHTML = ""
    for (let i = 0; i < 3; i++) {
      await drainRemoval()
    }
  })

  test("escape key dismisses immediately when `defer: true` and node is available", () => {
    const node = document.createElement("div")
    document.body.appendChild(node)

    const onDismiss = vi.fn()
    track(() => node, { defer: true, onDismiss })

    // no frame has elapsed yet; escape must already be wired up
    dispatchEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  test("registers the layer on the stack synchronously when node is available", () => {
    const node = document.createElement("div")
    document.body.appendChild(node)

    track(() => node, { defer: true, onDismiss: vi.fn() })
    expect(layerStack.isTopMost(node)).toBe(true)
  })

  test("falls back to deferred registration when node is not yet available", async () => {
    let node: HTMLElement | null = null
    const onDismiss = vi.fn()
    track(() => node, { defer: true, onDismiss })

    // node commits after the effect ran (the case `defer` exists for)
    node = document.createElement("div")
    document.body.appendChild(node)

    await nextFrame()

    dispatchEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  test("escape only dismisses the topmost layer", () => {
    const parent = document.createElement("div")
    const child = document.createElement("div")
    document.body.append(parent, child)

    const dismissParent = vi.fn()
    const dismissChild = vi.fn()

    track(() => parent, { defer: true, onDismiss: dismissParent })
    track(() => child, { defer: true, onDismiss: dismissChild })

    dispatchEscape()
    expect(dismissChild).toHaveBeenCalledTimes(1)
    expect(dismissParent).not.toHaveBeenCalled()
  })

  test("cleanup removes the escape handler", () => {
    const node = document.createElement("div")
    document.body.appendChild(node)

    const onDismiss = vi.fn()
    const cleanup = track(() => node, { defer: true, onDismiss })

    cleanup()
    dispatchEscape()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test("cleanup before the deferred frame cancels registration", async () => {
    let node: HTMLElement | null = null
    const onDismiss = vi.fn()
    const cleanup = track(() => node, { defer: true, onDismiss })

    cleanup()

    node = document.createElement("div")
    document.body.appendChild(node)
    await nextFrame()

    dispatchEscape()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  test("without `defer`, registration is synchronous (unchanged behavior)", () => {
    const node = document.createElement("div")
    document.body.appendChild(node)

    const onDismiss = vi.fn()
    track(node, { onDismiss })

    dispatchEscape()
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

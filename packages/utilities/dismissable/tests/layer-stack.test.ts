// @vitest-environment jsdom

import { compact, noop } from "@zag-js/utils"
import { afterEach, describe, expect, test, vi } from "vitest"
import type { Layer, LayerDismissEvent, LayerType } from "../src/layer-stack"
import { layerStack } from "../src/layer-stack"

function createLayer(
  node: HTMLElement,
  options: {
    type?: LayerType
    pointerBlocking?: boolean
    dismiss?: VoidFunction
    requestDismiss?: (event: LayerDismissEvent) => void
  } = {},
): Layer {
  const { type = "dialog", pointerBlocking, dismiss = noop, requestDismiss } = options
  return compact({
    type,
    node,
    pointerBlocking,
    dismiss,
    requestDismiss,
  })
}

/** Drain the double-rAF used by `nextTick` in `layerStack.remove` */
function nextTick() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

function resetStack() {
  while (layerStack.count() > 0) {
    const first = layerStack.layers[0]
    if (first) layerStack.remove(first.node)
  }
  while (layerStack.branches.length > 0) {
    const b = layerStack.branches[0]
    if (b) layerStack.removeBranch(b)
  }
}

describe("layerStack", () => {
  afterEach(async () => {
    resetStack()
    // `remove` schedules `nextTick` to clear `recentlyRemoved`; drain so the next test
    // does not see a global "during removal" `isInNestedLayer` true positive.
    for (let i = 0; i < 3; i++) {
      await nextTick()
    }
  })

  describe("add", () => {
    test("does not duplicate the same DOM node (Strict Mode / double-register)", () => {
      const node = document.createElement("div")
      document.body.append(node)

      layerStack.add(createLayer(node))
      layerStack.add(createLayer(node))

      expect(layerStack.count()).toBe(1)
      expect(layerStack.countNestedLayersOfType(node, "dialog")).toBe(0)
      expect(node.hasAttribute("data-has-nested")).toBe(false)
      expect(node.style.getPropertyValue("--layer-index")).toBe("0")
      expect(node.style.getPropertyValue("--nested-layer-count")).toBe("0")
    })

    test("re-adding the same node keeps the latest layer object at the top", () => {
      const node = document.createElement("div")
      document.body.append(node)

      let dismissCount = 0
      const first = createLayer(node, { dismiss: () => dismissCount++ })
      const second = createLayer(node, { dismiss: () => (dismissCount += 10) })

      layerStack.add(first)
      layerStack.add(second)

      expect(layerStack.count()).toBe(1)
      layerStack.layers[0]?.dismiss()
      expect(dismissCount).toBe(10)
    })
  })

  describe("sync metadata (two layers, same type)", () => {
    test("sets data-nested / data-has-nested and CSS vars on parent and child", () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      document.body.append(parent, child)

      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))

      expect(parent.style.getPropertyValue("--layer-index")).toBe("0")
      expect(parent.style.getPropertyValue("--nested-layer-count")).toBe("1")
      expect(parent.getAttribute("data-has-nested")).toBe("dialog")
      expect(parent.hasAttribute("data-nested")).toBe(false)

      expect(child.style.getPropertyValue("--layer-index")).toBe("1")
      expect(child.style.getPropertyValue("--nested-layer-count")).toBe("0")
      expect(child.getAttribute("data-nested")).toBe("dialog")
      expect(child.hasAttribute("data-has-nested")).toBe(false)
    })
  })

  describe("remove", () => {
    test("dismisses nested layers when removing a parent from the stack", () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      document.body.append(parent, child)

      const childDismiss = vi.fn()
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child, { dismiss: childDismiss }))

      layerStack.remove(parent)

      expect(childDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe("dismiss", () => {
    test("invokes layer.dismiss when the request-dismiss event is not prevented", () => {
      const node = document.createElement("div")
      document.body.append(node)

      const dismiss = vi.fn()
      layerStack.add(createLayer(node, { dismiss }))

      layerStack.dismiss(node)

      expect(dismiss).toHaveBeenCalledTimes(1)
    })

    test("does not invoke layer.dismiss when requestDismiss prevents default", () => {
      const node = document.createElement("div")
      document.body.append(node)

      const dismiss = vi.fn()
      layerStack.add(
        createLayer(node, {
          dismiss,
          requestDismiss: (e) => e.preventDefault(),
        }),
      )

      layerStack.dismiss(node)

      expect(dismiss).not.toHaveBeenCalled()
    })
  })

  describe("pointer blocking", () => {
    test("isBelowPointerBlockingLayer and isTopMost reflect stack order and pointerBlocking flags", () => {
      const bottom = document.createElement("div")
      const child = document.createElement("div")
      document.body.append(bottom, child)

      layerStack.add(createLayer(bottom, { pointerBlocking: false }))
      layerStack.add(createLayer(child, { pointerBlocking: true }))

      expect(layerStack.hasPointerBlockingLayer()).toBe(true)
      expect(layerStack.pointerBlockingLayers()).toHaveLength(1)
      expect(layerStack.topMostPointerBlockingLayer()?.node).toBe(child)

      expect(layerStack.isBelowPointerBlockingLayer(bottom)).toBe(true)
      expect(layerStack.isBelowPointerBlockingLayer(child)).toBe(false)

      expect(layerStack.isTopMost(child)).toBe(true)
      expect(layerStack.isTopMost(bottom)).toBe(false)
    })
  })

  describe("branches", () => {
    test("isInBranch is true when target is inside a registered branch", () => {
      const branch = document.createElement("div")
      const inner = document.createElement("span")
      branch.append(inner)
      document.body.append(branch)

      layerStack.addBranch(branch)
      expect(layerStack.isInBranch(inner)).toBe(true)

      layerStack.removeBranch(branch)
      expect(layerStack.isInBranch(inner)).toBe(false)
    })
  })

  describe("isInNestedLayer and recentlyRemoved", () => {
    test("returns true when target is inside a nested layer node", () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      const inner = document.createElement("button")
      child.append(inner)
      document.body.append(parent, child)

      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))

      expect(layerStack.isInNestedLayer(parent, inner)).toBe(true)
      expect(layerStack.isInNestedLayer(parent, parent)).toBe(false)
    })

    test("treats interactions as inside while recentlyRemoved is non-empty, then clears after nextTick", async () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      document.body.append(parent, child)

      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))

      layerStack.remove(parent)

      expect(layerStack.isInNestedLayer(child, document.body)).toBe(true)

      await nextTick()

      expect(layerStack.isInNestedLayer(child, document.body)).toBe(false)
    })
  })
})

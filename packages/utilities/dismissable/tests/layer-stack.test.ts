// @vitest-environment jsdom

import { compact, noop } from "@zag-js/utils"
import { afterEach, describe, expect, test, vi } from "vitest"
import type { Layer, LayerDismissEvent, LayerStyleTarget, LayerType } from "../src/layer-stack"
import { layerStack } from "../src/layer-stack"

function createLayer(
  node: HTMLElement,
  options: {
    type?: LayerType
    pointerBlocking?: boolean
    dismiss?: VoidFunction
    requestDismiss?: (event: LayerDismissEvent) => void
    styleTargets?: LayerStyleTarget[]
    triggerElements?: () => Element[]
  } = {},
): Layer {
  const { type = "dialog", pointerBlocking, dismiss = noop, requestDismiss, styleTargets, triggerElements } = options
  return compact({
    type,
    node,
    pointerBlocking,
    dismiss,
    requestDismiss,
    styleTargets,
    triggerElements,
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

  describe("styleTargets", () => {
    test("mirrors stack metadata to extra elements", () => {
      const primary = document.createElement("div")
      const backdrop = document.createElement("div")
      document.body.append(primary, backdrop)

      layerStack.add(
        createLayer(primary, {
          styleTargets: [() => backdrop],
        }),
      )

      expect(backdrop.style.getPropertyValue("--layer-index")).toBe("0")
      expect(backdrop.style.getPropertyValue("--nested-layer-count")).toBe("0")
      expect(backdrop.style.getPropertyValue("--z-index")).toBe(getComputedStyle(primary).zIndex)
      expect(backdrop.hasAttribute("data-nested")).toBe(false)
      expect(backdrop.hasAttribute("data-has-nested")).toBe(false)
    })

    test("clears mirrored styles when the layer is removed", () => {
      const primary = document.createElement("div")
      const backdrop = document.createElement("div")
      document.body.append(primary, backdrop)

      layerStack.add(
        createLayer(primary, {
          styleTargets: [() => backdrop],
        }),
      )

      expect(backdrop.style.getPropertyValue("--layer-index")).toBe("0")

      layerStack.remove(primary)

      expect(backdrop.style.getPropertyValue("--layer-index")).toBe("")
      expect(backdrop.style.getPropertyValue("--z-index")).toBe("")
    })

    test("skips mirroring when target is the same node as the layer", () => {
      const node = document.createElement("div")
      document.body.append(node)

      layerStack.add(
        createLayer(node, {
          styleTargets: [() => node],
        }),
      )

      expect(node.style.getPropertyValue("--layer-index")).toBe("0")
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

    test("dismisses the whole subtree, not only direct children", () => {
      const [first, second, third] = ["div", "div", "div"].map((tag) => document.createElement(tag))
      const secondTrigger = document.createElement("button")
      const thirdTrigger = document.createElement("button")
      first.append(secondTrigger)
      second.append(thirdTrigger)
      document.body.append(first, second, third)

      const secondDismiss = vi.fn()
      const thirdDismiss = vi.fn()
      layerStack.add(createLayer(first))
      layerStack.add(createLayer(second, { dismiss: secondDismiss, triggerElements: () => [secondTrigger] }))
      layerStack.add(createLayer(third, { dismiss: thirdDismiss, triggerElements: () => [thirdTrigger] }))

      layerStack.remove(first)

      expect(secondDismiss).toHaveBeenCalledTimes(1)
      expect(thirdDismiss).toHaveBeenCalledTimes(1)
    })

    // re-registering a layer moves it to the top of the stack, so a parent can sit above the
    // child it dismisses — the child's removal must not shift the parent out from under itself
    test("removes a layer that sits above its own child in the stack", () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      const childTrigger = document.createElement("button")
      parent.append(childTrigger)
      document.body.append(parent, child)

      const parentLayer = createLayer(parent)
      layerStack.add(parentLayer)
      // mirrors a machine closing on dismiss: the CLOSE transition tears the effect down
      layerStack.add(
        createLayer(child, { dismiss: () => layerStack.remove(child), triggerElements: () => [childTrigger] }),
      )
      layerStack.add(parentLayer)

      layerStack.remove(parent)

      expect(layerStack.count()).toBe(0)
    })

    test("hands a surviving child over to the removed layer's parent", () => {
      const root = document.createElement("div")
      const middle = document.createElement("div")
      const middleTrigger = document.createElement("button")
      const leaf = document.createElement("div")
      const leafTrigger = document.createElement("button")
      root.append(middleTrigger)
      middle.append(leafTrigger)
      document.body.append(root, middle, leaf)

      const leafDismiss = vi.fn()
      layerStack.add(createLayer(root))
      layerStack.add(createLayer(middle, { triggerElements: () => [middleTrigger] }))
      const leafLayer = createLayer(leaf, {
        dismiss: leafDismiss,
        triggerElements: () => [leafTrigger],
        requestDismiss: (event) => {
          if (event.detail.targetLayer === middle) event.preventDefault()
        },
      })
      layerStack.add(leafLayer)

      layerStack.remove(middle)

      expect(leafDismiss).not.toHaveBeenCalled()
      expect(leafLayer.parent).toBe(root)

      layerStack.remove(root)

      expect(leafDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe("nesting", () => {
    test("nests a layer under the layer holding its trigger, even when its node is portalled", () => {
      const parent = document.createElement("div")
      const trigger = document.createElement("button")
      const child = document.createElement("div")
      const inner = document.createElement("button")
      parent.append(trigger)
      child.append(inner)
      document.body.append(parent, child)

      const childDismiss = vi.fn()
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child, { dismiss: childDismiss, triggerElements: () => [trigger] }))

      expect(parent.getAttribute("data-has-nested")).toBe("dialog")
      expect(child.getAttribute("data-nested")).toBe("dialog")
      expect(layerStack.isInNestedLayer(parent, inner)).toBe(true)

      layerStack.remove(parent)

      expect(childDismiss).toHaveBeenCalledTimes(1)
    })

    test("nests a layer rendered inside another layer, whatever its trigger says", () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      const trigger = document.createElement("button")
      parent.append(child)
      document.body.append(parent, trigger)

      const childDismiss = vi.fn()
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child, { dismiss: childDismiss, triggerElements: () => [trigger] }))

      expect(child.getAttribute("data-nested")).toBe("dialog")

      layerStack.remove(parent)

      expect(childDismiss).toHaveBeenCalledTimes(1)
    })

    test("keeps a layer whose trigger sits outside every layer independent of the stack below it", () => {
      const first = document.createElement("div")
      const firstTrigger = document.createElement("button")
      const second = document.createElement("div")
      const secondTrigger = document.createElement("button")
      const inner = document.createElement("button")
      second.append(inner)
      document.body.append(firstTrigger, first, secondTrigger, second)

      const secondDismiss = vi.fn()
      layerStack.add(createLayer(first, { triggerElements: () => [firstTrigger] }))
      layerStack.add(createLayer(second, { dismiss: secondDismiss, triggerElements: () => [secondTrigger] }))

      expect(first.hasAttribute("data-has-nested")).toBe(false)
      expect(second.hasAttribute("data-nested")).toBe(false)
      expect(layerStack.isInNestedLayer(first, inner)).toBe(false)

      layerStack.remove(first)

      expect(secondDismiss).not.toHaveBeenCalled()
      expect(layerStack.isTopMost(second)).toBe(true)
    })

    test("never nests a re-registered layer inside a layer it already owns", () => {
      const first = document.createElement("div")
      const second = document.createElement("div")
      const firstTrigger = document.createElement("button")
      second.append(firstTrigger)
      document.body.append(first, second)

      const firstLayer = createLayer(first, { type: "listbox", triggerElements: () => [firstTrigger] })
      layerStack.add(firstLayer)
      layerStack.add(createLayer(second, { type: "popover" }))
      // `second` nests in `first`, and re-registering `first` resolves it against a stack that
      // still holds `second` — whose node contains the trigger `first` is opened from
      layerStack.add(firstLayer)

      expect(firstLayer.parent).toBeUndefined()
      expect(layerStack.getChildLayers(first).map((layer) => layer.node)).toEqual([second])
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

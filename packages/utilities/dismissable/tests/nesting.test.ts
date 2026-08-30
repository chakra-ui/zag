// @vitest-environment jsdom

import { compact, noop } from "@zag-js/utils"
import { afterEach, describe, expect, test, vi } from "vitest"
import type { Layer, LayerType } from "../src/layer-stack"
import { layerStack } from "../src/layer-stack"

function createLayer(
  node: HTMLElement,
  options: { type?: LayerType; pointerBlocking?: boolean; dismiss?: VoidFunction } = {},
): Layer {
  const { type = "dialog", pointerBlocking, dismiss = noop } = options
  return compact({ type, node, pointerBlocking, dismiss })
}

function el(id: string, parent: HTMLElement = document.body) {
  const node = document.createElement("div")
  node.id = id
  parent.appendChild(node)
  return node
}

function nextTick() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function resetStack() {
  while (layerStack.count() > 0) {
    const first = layerStack.layers[0]
    if (first) layerStack.remove(first.node)
  }
  document.body.innerHTML = ""
}

describe("layer nesting", () => {
  afterEach(async () => {
    resetStack()
    await nextTick()
  })

  describe("getNestedLayers", () => {
    test("a layer opened after another is nested inside it", () => {
      const a = el("a")
      const b = el("b")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(b))

      expect(layerStack.getNestedLayers(a).map((l) => l.node)).toEqual([b])
      expect(layerStack.getNestedLayers(b)).toEqual([])
    })

    test("nesting is transitive across three layers", () => {
      const a = el("a")
      const b = el("b")
      const c = el("c")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(b))
      layerStack.add(createLayer(c))

      expect(layerStack.getNestedLayers(a).map((l) => l.node)).toEqual([b, c])
      expect(layerStack.getNestedLayers(b).map((l) => l.node)).toEqual([c])
      expect(layerStack.getNestedLayers(c)).toEqual([])
    })

    test("nesting holds when children are portalled out of their parent", () => {
      // the common case: both contents live directly under body, not inside each other
      const parent = el("parent")
      const child = el("child")
      expect(parent.contains(child)).toBe(false)

      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))
      expect(layerStack.getNestedLayers(parent).map((l) => l.node)).toEqual([child])
    })

    test("an unregistered node has no nested layers", () => {
      const a = el("a")
      layerStack.add(createLayer(a))
      expect(layerStack.getNestedLayers(el("stranger"))).toEqual([])
    })
  })

  describe("getParentLayerOfType", () => {
    test("finds the nearest ancestor of a matching type", () => {
      const dialog = el("dialog")
      const popover = el("popover")
      const inner = el("inner")
      layerStack.add(createLayer(dialog, { type: "dialog" }))
      layerStack.add(createLayer(popover, { type: "popover" }))
      layerStack.add(createLayer(inner, { type: "popover" }))

      expect(layerStack.getParentLayerOfType(inner, "popover")?.node).toBe(popover)
      expect(layerStack.getParentLayerOfType(inner, "dialog")?.node).toBe(dialog)
      expect(layerStack.getParentLayerOfType(dialog, "dialog")).toBeUndefined()
    })

    test("countNestedLayersOfType counts only matching descendants", () => {
      const dialog = el("dialog")
      layerStack.add(createLayer(dialog, { type: "dialog" }))
      layerStack.add(createLayer(el("p1"), { type: "popover" }))
      layerStack.add(createLayer(el("d2"), { type: "dialog" }))

      expect(layerStack.countNestedLayersOfType(dialog, "popover")).toBe(1)
      expect(layerStack.countNestedLayersOfType(dialog, "dialog")).toBe(1)
    })
  })

  describe("cascade dismissal", () => {
    test("removing a parent dismisses its descendants", () => {
      const parentDismiss = vi.fn()
      const childDismiss = vi.fn()
      const parent = el("parent")
      const child = el("child")
      layerStack.add(createLayer(parent, { dismiss: parentDismiss }))
      layerStack.add(createLayer(child, { dismiss: childDismiss }))

      layerStack.remove(parent)
      expect(childDismiss).toHaveBeenCalledTimes(1)
    })

    test("removing the topmost layer dismisses nothing", () => {
      const parentDismiss = vi.fn()
      const childDismiss = vi.fn()
      const parent = el("parent")
      const child = el("child")
      layerStack.add(createLayer(parent, { dismiss: parentDismiss }))
      layerStack.add(createLayer(child, { dismiss: childDismiss }))

      layerStack.remove(child)
      expect(parentDismiss).not.toHaveBeenCalled()
      expect(childDismiss).not.toHaveBeenCalled()
    })
  })

  describe("isTopMost", () => {
    test("only the last registered layer is topmost", () => {
      const a = el("a")
      const b = el("b")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(b))
      expect(layerStack.isTopMost(b)).toBe(true)
      expect(layerStack.isTopMost(a)).toBe(false)
    })

    test("removing the top restores the one below", () => {
      const a = el("a")
      const b = el("b")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(b))
      layerStack.remove(b)
      expect(layerStack.isTopMost(a)).toBe(true)
    })
  })

  describe("isBelowPointerBlockingLayer", () => {
    test("a layer under a blocking layer is below it", () => {
      const a = el("a")
      const b = el("b")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(b, { pointerBlocking: true }))
      expect(layerStack.isBelowPointerBlockingLayer(a)).toBe(true)
      expect(layerStack.isBelowPointerBlockingLayer(b)).toBe(false)
    })

    test("no blocking layer means nothing is below one", () => {
      const a = el("a")
      layerStack.add(createLayer(a))
      expect(layerStack.isBelowPointerBlockingLayer(a)).toBe(false)
    })
  })

  describe("isInNestedLayer", () => {
    test("a target inside a descendant counts as inside", () => {
      const parent = el("parent")
      const child = el("child")
      const target = el("target", child)
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))

      expect(layerStack.isInNestedLayer(parent, target)).toBe(true)
    })

    test("a target outside every descendant does not", () => {
      const parent = el("parent")
      const child = el("child")
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))

      expect(layerStack.isInNestedLayer(parent, el("elsewhere"))).toBe(false)
    })
  })

  describe("re-registration", () => {
    test("re-adding a parent keeps it below its child and dismisses nothing", () => {
      const childDismiss = vi.fn()
      const parent = el("parent")
      const child = el("child")
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child, { dismiss: childDismiss }))

      // what reconfiguring a layer used to do: remove then add
      layerStack.remove(parent)
      layerStack.add(createLayer(parent))

      expect(childDismiss).toHaveBeenCalledTimes(1) // remove still cascades, by design
      expect(layerStack.getNestedLayers(parent)).toEqual([])
    })

    test("adding over an existing node preserves its parent", () => {
      const parent = el("parent")
      const child = el("child")
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))

      // re-register the child without removing it first
      layerStack.add(createLayer(child))

      expect(layerStack.count()).toBe(2)
      expect(layerStack.getNestedLayers(parent).map((l) => l.node)).toEqual([child])
      expect(layerStack.getNestedLayers(child)).toEqual([])
    })

    test("a re-registered top-level layer does not become its own parent", () => {
      const a = el("a")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(a))

      expect(layerStack.count()).toBe(1)
      expect(layerStack.getNestedLayers(a)).toEqual([])
      expect(layerStack.countNestedLayersOfType(a, "dialog")).toBe(0)
    })

    test("re-registering a middle layer keeps the whole chain intact", () => {
      const a = el("a")
      const b = el("b")
      const c = el("c")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(b))
      layerStack.add(createLayer(c))

      layerStack.add(createLayer(b))

      expect(layerStack.getNestedLayers(a).map((l) => l.node.id)).toEqual(["b", "c"])
      expect(layerStack.getNestedLayers(b).map((l) => l.node)).toEqual([c])
      expect(layerStack.getNestedLayers(c)).toEqual([])
    })
  })

  describe("reattach", () => {
    test("keeps descendants and restores the layer's position", () => {
      const childDismiss = vi.fn()
      const parent = el("parent")
      const child = el("child")
      const parentLayer = createLayer(parent)
      layerStack.add(parentLayer)
      layerStack.add(createLayer(child, { dismiss: childDismiss }))

      const { id, parentId } = parentLayer
      layerStack.remove(parent, { reattach: true })

      expect(childDismiss).not.toHaveBeenCalled()
      expect(layerStack.count()).toBe(1)

      const readded = createLayer(parent)
      layerStack.add(readded)

      expect(readded.id).toBe(id)
      expect(readded.parentId).toBe(parentId)
      // back at index 0, so the child is still nested inside it
      expect(layerStack.indexOf(parent)).toBe(0)
      expect(layerStack.getNestedLayers(parent).map((l) => l.node)).toEqual([child])
    })

    test("without reattach, descendants are dismissed", () => {
      const childDismiss = vi.fn()
      const parent = el("parent")
      const child = el("child")
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child, { dismiss: childDismiss }))

      layerStack.remove(parent)

      expect(childDismiss).toHaveBeenCalledTimes(1)
    })

    test("a reattaching layer does not block pointer events while detached", () => {
      const node = el("blocking")
      layerStack.add(createLayer(node, { pointerBlocking: true }))
      expect(layerStack.hasPointerBlockingLayer()).toBe(true)

      layerStack.remove(node, { reattach: true })
      expect(layerStack.hasPointerBlockingLayer()).toBe(false)

      layerStack.add(createLayer(node, { pointerBlocking: true }))
      expect(layerStack.hasPointerBlockingLayer()).toBe(true)
    })
  })

  describe("sibling layers", () => {
    test("a layer opened after a sibling closed is not nested in the survivor", () => {
      const a = el("a")
      const b = el("b")
      layerStack.add(createLayer(a))
      layerStack.add(createLayer(b))
      layerStack.remove(b)

      const c = el("c")
      layerStack.add(createLayer(c))
      expect(layerStack.getNestedLayers(a).map((l) => l.node)).toEqual([c])
    })

    test("removing a child leaves the parent with no descendants", () => {
      const parent = el("parent")
      const child = el("child")
      layerStack.add(createLayer(parent))
      layerStack.add(createLayer(child))
      layerStack.remove(child)

      expect(layerStack.getNestedLayers(parent)).toEqual([])
    })
  })
})

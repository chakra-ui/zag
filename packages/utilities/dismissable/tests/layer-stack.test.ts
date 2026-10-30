// @vitest-environment jsdom

import { compact, noop } from "@zag-js/utils"
import { afterEach, describe, expect, test, vi } from "vitest"
import type { Layer, LayerDismissEvent, LayerSnapshot, LayerType } from "../src/layer-stack"
import { layerStack } from "../src/layer-stack"

function createLayer(
  node: HTMLElement,
  options: {
    type?: LayerType
    pointerBlocking?: boolean
    dismiss?: VoidFunction
    requestDismiss?: (event: LayerDismissEvent) => void
    onLayerChange?: (snapshot: LayerSnapshot) => void
  } = {},
): Layer {
  const { type = "dialog", pointerBlocking, dismiss = noop, requestDismiss, onLayerChange } = options
  return compact({
    type,
    node,
    pointerBlocking,
    dismiss,
    requestDismiss,
    onLayerChange,
  })
}

function getLastSnapshot(spy: ReturnType<typeof vi.fn>): LayerSnapshot {
  return spy.mock.lastCall?.[0] as LayerSnapshot
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
      const onLayerChange = vi.fn()

      layerStack.add(createLayer(node))
      layerStack.add(createLayer(node, { onLayerChange }))

      expect(layerStack.count()).toBe(1)
      expect(layerStack.countNestedLayersOfType(node, "dialog")).toBe(0)
      expect(getLastSnapshot(onLayerChange)).toMatchObject({ index: 0, nestedCount: 0, active: true })
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

  describe("snapshots", () => {
    test("publishes metadata without mutating the layer element", () => {
      const node = document.createElement("div")
      document.body.append(node)
      const onLayerChange = vi.fn()

      layerStack.add(createLayer(node, { onLayerChange }))

      expect(getLastSnapshot(onLayerChange)).toEqual({
        active: true,
        type: "dialog",
        index: 0,
        nested: false,
        hasNested: false,
        nestedCount: 0,
        blocked: false,
      })
      expect(node.getAttribute("style")).toBeNull()
      expect(node.hasAttribute("data-nested")).toBe(false)
      expect(node.hasAttribute("data-has-nested")).toBe(false)
    })

    test("publishes a final inactive snapshot on removal", () => {
      const node = document.createElement("div")
      document.body.append(node)
      const onLayerChange = vi.fn()

      layerStack.add(createLayer(node, { onLayerChange }))
      layerStack.remove(node)

      expect(getLastSnapshot(onLayerChange)).toMatchObject({ active: false, blocked: false, index: 0 })
    })

    test("keeps the removed parent inactive when nested dismissal resyncs the stack", () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      document.body.append(parent, child)
      const onParentChange = vi.fn()
      const onChildChange = vi.fn()

      layerStack.add(createLayer(parent, { onLayerChange: onParentChange }))
      layerStack.add(createLayer(child, { onLayerChange: onChildChange }))

      layerStack.remove(parent)

      expect(getLastSnapshot(onParentChange)).toMatchObject({ active: false, blocked: false })
      expect(getLastSnapshot(onChildChange)).toMatchObject({ active: true, index: 0, nested: false })
    })
  })

  describe("sync metadata (two layers, same type)", () => {
    test("sets data-nested / data-has-nested and CSS vars on parent and child", () => {
      const parent = document.createElement("div")
      const child = document.createElement("div")
      document.body.append(parent, child)
      const onParentChange = vi.fn()
      const onChildChange = vi.fn()

      layerStack.add(createLayer(parent, { onLayerChange: onParentChange }))
      layerStack.add(createLayer(child, { onLayerChange: onChildChange }))

      expect(getLastSnapshot(onParentChange)).toMatchObject({
        index: 0,
        nestedCount: 1,
        hasNested: true,
        nested: false,
      })
      expect(getLastSnapshot(onChildChange)).toMatchObject({
        index: 1,
        nestedCount: 0,
        hasNested: false,
        nested: true,
      })
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
      const onBottomChange = vi.fn()
      const onChildChange = vi.fn()

      layerStack.add(createLayer(bottom, { pointerBlocking: false, onLayerChange: onBottomChange }))
      layerStack.add(createLayer(child, { pointerBlocking: true, onLayerChange: onChildChange }))

      expect(layerStack.hasPointerBlockingLayer()).toBe(true)
      expect(layerStack.pointerBlockingLayers()).toHaveLength(1)
      expect(layerStack.topMostPointerBlockingLayer()?.node).toBe(child)

      expect(layerStack.isBelowPointerBlockingLayer(bottom)).toBe(true)
      expect(layerStack.isBelowPointerBlockingLayer(child)).toBe(false)

      expect(layerStack.isTopMost(child)).toBe(true)
      expect(layerStack.isTopMost(bottom)).toBe(false)
      expect(getLastSnapshot(onBottomChange).blocked).toBe(true)
      expect(getLastSnapshot(onChildChange).blocked).toBe(false)
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

describe("layerStack snapshots", () => {
  afterEach(async () => {
    resetStack()
    for (let i = 0; i < 3; i++) {
      await nextTick()
    }
  })

  function addLayer(type: LayerType = "popover", options: Partial<Layer> = {}) {
    const node = document.createElement("div")
    document.body.append(node)
    const layer: Layer = { node, type, dismiss: () => layerStack.remove(node), ...options }
    layerStack.add(layer)
    return layer
  }

  // the per-layer helpers are the reference `syncLayers` must agree with
  function expectSnapshotsMatchHelpers() {
    layerStack.layers.forEach((layer, index) => {
      const nestedCount = layerStack.countNestedLayersOfType(layer.node, layer.type)
      expect(layer.snapshot).toEqual({
        active: true,
        type: layer.type,
        index,
        nested: layerStack.getParentLayerOfType(layer.node, layer.type) != null,
        hasNested: nestedCount > 0,
        nestedCount,
        blocked: layerStack.isBelowPointerBlockingLayer(layer.node),
      })
    })
  }

  test("counts same-type descendants through layers of another type", () => {
    const dialog = addLayer("dialog")
    const menu = addLayer("menu")
    const nestedDialog = addLayer("dialog")
    addLayer("dialog")

    expect(dialog.snapshot).toMatchObject({ nested: false, nestedCount: 2 })
    expect(menu.snapshot).toMatchObject({ nested: false, nestedCount: 0 })
    expect(nestedDialog.snapshot).toMatchObject({ nested: true, nestedCount: 1 })
    expectSnapshotsMatchHelpers()
  })

  test("menubar peers are siblings, not nested", () => {
    const first = addLayer("menu", { group: "menubar" })
    const second = addLayer("menu", { group: "menubar" })

    expect(first.snapshot).toMatchObject({ nested: false, nestedCount: 0 })
    expect(second.snapshot).toMatchObject({ nested: false, nestedCount: 0 })
    expectSnapshotsMatchHelpers()
  })

  test("blocks only layers below the topmost pointer-blocking layer", () => {
    let blocking = true
    const below = addLayer("popover")
    addLayer("dialog", { pointerBlocking: () => blocking })
    const above = addLayer("popover")

    expect(below.snapshot?.blocked).toBe(true)
    expect(above.snapshot?.blocked).toBe(false)

    blocking = false
    layerStack.syncLayers()
    expect(below.snapshot?.blocked).toBe(false)
    expectSnapshotsMatchHelpers()
  })

  test("a missing parent ends the chain", () => {
    addLayer("dialog")
    const child = addLayer("dialog")
    child.parentId = "missing"
    layerStack.syncLayers()

    expect(child.snapshot?.nested).toBe(false)
    expectSnapshotsMatchHelpers()
  })

  test("a parent cycle does not hang", () => {
    const a = addLayer("dialog")
    const b = addLayer("dialog")
    a.parentId = b.id
    layerStack.syncLayers()

    expect(layerStack.depthOf(a)).toBe(2)
    expect(layerStack.getNestedLayers(a.node)).toHaveLength(2)
    expectSnapshotsMatchHelpers()

    // `add` never builds a cycle; break it so teardown's cascade can finish
    a.parentId = undefined
  })

  test("reattached layers keep their index and nesting", () => {
    const parent = addLayer("dialog")
    const child = addLayer("dialog")
    addLayer("dialog")

    layerStack.remove(child.node, { reattach: true })
    layerStack.add({ ...child, id: undefined, parentId: undefined })

    expect(layerStack.indexOf(child.node)).toBe(1)
    expect(parent.snapshot?.nestedCount).toBe(2)
    expectSnapshotsMatchHelpers()
  })

  test("random stacks match the per-layer helpers", () => {
    let seed = 1
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const types: LayerType[] = ["dialog", "popover", "menu"]

    for (let run = 0; run < 20; run++) {
      resetStack()
      for (let i = 0; i < 15; i++) {
        const type = types[Math.floor(random() * types.length)]
        if (random() < 0.2 && layerStack.count() > 0) {
          const layer = layerStack.layers[Math.floor(random() * layerStack.count())]
          layerStack.remove(layer.node, { reattach: random() < 0.5 })
          if (!layerStack.layers.includes(layer) && layerStack.pendingReattach.has(layer.node)) {
            layerStack.add({ ...layer, id: undefined })
          }
        } else {
          addLayer(type, { pointerBlocking: random() < 0.2, group: random() < 0.2 ? "group" : undefined })
        }
        expectSnapshotsMatchHelpers()
      }
    }
  })

  test("many open layers mount and unmount quickly", () => {
    const start = performance.now()
    const layers = Array.from({ length: 200 }, () => addLayer("popover"))
    layers.reverse().forEach((layer) => layerStack.remove(layer.node))

    expect(layerStack.count()).toBe(0)
    // was several seconds at 120 layers when each snapshot rescanned the stack
    expect(performance.now() - start).toBeLessThan(1000)
  })

  test("removing the bottom of a long chain dismisses the rest", () => {
    const layers = Array.from({ length: 200 }, () => addLayer("popover"))
    const start = performance.now()
    layerStack.remove(layers[0].node)

    expect(layerStack.count()).toBe(0)
    expect(performance.now() - start).toBeLessThan(1000)
  })
})

// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { trackDismissableElement, type DismissableElementOptions } from "../src/dismissable-layer"
import { layerStack } from "../src/layer-stack"
import { createDismissableTrigger } from "../src/dismissable-trigger"

const cleanups: VoidFunction[] = []
const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
}
const mount = (parent = document.body) => {
  const el = document.createElement("div")
  parent.append(el)
  return el
}
function track(getNode: () => HTMLElement | null, options: Partial<DismissableElementOptions> = {}) {
  const dismiss = vi.fn()
  const cleanup = trackDismissableElement(getNode, {
    defer: true,
    warnOnMissingNode: false,
    onDismiss: dismiss,
    ...options,
  })
  cleanups.push(cleanup)
  return { dismiss, cleanup }
}
afterEach(async () => {
  cleanups
    .splice(0)
    .reverse()
    .forEach((fn) => fn())
  await flush()
  expect(layerStack.layers).toHaveLength(0)
  expect(layerStack.branches).toHaveLength(0)
  layerStack.recentlyRemoved.clear()
  document.body.innerHTML = ""
})
test("closes the child after parent content detached in a previous mutation batch", async () => {
  const parentNode = mount()
  const trigger = mount(parentNode)
  const childNode = mount()
  const parent = track(() => parentNode)
  const child = track(() => childNode, { getTriggerEl: () => (trigger.isConnected ? trigger : null) })
  await flush()
  parentNode.remove()
  await flush()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})
test("closes child whose trigger was removed separately before the parent cleanup", async () => {
  const parentNode = mount()
  const trigger = mount(parentNode)
  const childNode = mount()
  const parent = track(() => parentNode)
  const child = track(() => childNode, { getTriggerEl: () => (trigger.isConnected ? trigger : null) })
  await flush()
  trigger.remove()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("retains ownership when parent content is replaced", async () => {
  let parentNode = mount()
  const trigger = mount(parentNode)
  const childNode = mount()
  const parent = track(() => parentNode)
  const child = track(() => childNode, { getTriggerEl: () => (trigger.isConnected ? trigger : null) })
  await flush()
  parentNode.remove()
  parentNode = mount()
  await flush()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

let triggerId = 0

function selection(node: HTMLElement | null = null) {
  if (node && !node.id) node.id = `trigger-${++triggerId}`
  return createDismissableTrigger((id) => document.getElementById(id), node?.id ?? null)
}

test("discovers a trigger that mounts after the child content", async () => {
  const parentNode = mount()
  const parent = track(() => parentNode)
  const trigger = createDismissableTrigger((id) => document.getElementById(id), "late-trigger")
  const childNode = mount()
  const child = track(() => childNode, { trigger })
  await flush()
  const late = mount(parentNode)
  late.id = "late-trigger"
  await flush()
  late.remove()
  await flush()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("establishes ownership before deferred content attaches", () => {
  const parentNode = mount()
  const triggerNode = mount(parentNode)
  const childNode = mount()
  const parent = track(() => parentNode)
  const child = track(() => childNode, { trigger: selection(triggerNode) })
  triggerNode.remove()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("pending child retains its owner without content", async () => {
  const parentNode = mount()
  const trigger = mount(parentNode)
  const parent = track(() => parentNode)
  const child = track(() => null, { trigger: selection(trigger) })
  await flush()
  trigger.remove()
  await flush()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

for (const [fromInside, toInside] of [
  [true, false],
  [false, true],
] as const) {
  test(`updates ownership on an explicit trigger switch: ${fromInside} to ${toInside}`, async () => {
    const parentNode = mount()
    const inside = mount(parentNode)
    const outside = mount()
    inside.id = "inside"
    outside.id = "outside"
    const parent = track(() => parentNode)
    const trigger = selection(fromInside ? inside : outside)
    const childNode = mount()
    const child = track(() => childNode, { trigger })
    await flush()
    trigger.setId((toInside ? inside : outside).id)
    // No DOM mutation and no microtask between selection and parent cleanup.
    parent.cleanup()
    expect(child.dismiss).toHaveBeenCalledTimes(toInside ? 1 : 0)
  })
}

test("keeps established ownership while a newly selected trigger is missing", async () => {
  const parentNode = mount()
  const inside = mount(parentNode)
  const parent = track(() => parentNode)
  const trigger = selection(inside)
  const childNode = mount()
  const child = track(() => childNode, { trigger })
  await flush()
  trigger.setId("not-mounted")
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("retries a missing selected trigger even when content does not change", async () => {
  const parentNode = mount()
  const inside = mount(parentNode)
  const outside = mount()
  outside.id = "outside"
  const parent = track(() => parentNode)
  const trigger = selection(outside)
  const childNode = mount()
  const child = track(() => childNode, { trigger })
  await flush()
  trigger.setId("late-inside")
  inside.id = "late-inside"
  await flush()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("keeps the same logical trigger owner through DOM replacement", async () => {
  const parentNode = mount()
  const triggerNode = mount(parentNode)
  triggerNode.id = "selected"
  const parent = track(() => parentNode)
  const trigger = selection(triggerNode)
  const childNode = mount()
  const child = track(() => childNode, { trigger })
  await flush()
  triggerNode.remove()
  const replacement = mount()
  replacement.id = "selected"
  await flush()
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("programmatic selection clearing makes a mounted child independent immediately", async () => {
  const parentNode = mount()
  const triggerNode = mount(parentNode)
  const parent = track(() => parentNode)
  const trigger = selection(triggerNode)
  const childNode = mount()
  const child = track(() => childNode, { trigger })
  await flush()
  trigger.setId(null)
  parent.cleanup()
  expect(child.dismiss).not.toHaveBeenCalled()
})

test("can acquire an owner registered later without changing stack order", async () => {
  const outside = mount()
  outside.id = "outside"
  const trigger = selection(outside)
  const childNode = mount()
  const child = track(() => childNode, { trigger })
  const parentNode = mount()
  const inside = mount(parentNode)
  inside.id = "inside"
  const parent = track(() => parentNode)
  await flush()
  const order = [...layerStack.layers]
  trigger.setId("inside")
  expect(layerStack.layers).toEqual(order)
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("does not form cycles when selecting a trigger inside an owned descendant", async () => {
  const parentNode = mount()
  parentNode.id = "parent"
  const childTrigger = mount(parentNode)
  childTrigger.id = "child-trigger"
  const parentTrigger = selection()
  const parent = track(() => parentNode, { trigger: parentTrigger })
  const childNode = mount()
  const child = track(() => childNode, { trigger: selection(childTrigger) })
  const insideChild = mount(childNode)
  insideChild.id = "inside-child"
  await flush()
  parentTrigger.setId("inside-child")
  parent.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("requests dismissal once when a child synchronously removes itself but a grandchild remains controlled", async () => {
  const parentNode = mount()
  const parent = track(() => parentNode)
  const childTrigger = mount(parentNode)
  const childNode = mount()
  const grandchildTrigger = mount(childNode)
  const grandchildNode = mount()
  let child: ReturnType<typeof track>
  child = track(() => childNode, { trigger: selection(childTrigger), onDismiss: () => child.cleanup() })
  const grandchild = track(() => grandchildNode, { trigger: selection(grandchildTrigger) })
  await flush()
  parent.cleanup()
  expect(grandchild.dismiss).toHaveBeenCalledOnce()
})

test("preserves descendant dismissal when an intermediate child prevents its own dismissal", async () => {
  const parentNode = mount()
  const parent = track(() => parentNode)
  const childTrigger = mount(parentNode)
  const childNode = mount()
  const grandchildTrigger = mount(childNode)
  const grandchildNode = mount()
  const prevent = vi.fn((event: Event) => event.preventDefault())
  const child = track(() => childNode, { trigger: selection(childTrigger), onRequestDismiss: prevent })
  const grandchild = track(() => grandchildNode, { trigger: selection(grandchildTrigger) })
  await flush()
  parent.cleanup()
  expect(prevent).toHaveBeenCalledOnce()
  expect(child.dismiss).not.toHaveBeenCalled()
  expect(grandchild.dismiss).toHaveBeenCalledOnce()
})

test("releases the pointer lock when an orphaned modal is dismissed with its parent", async () => {
  const parentNode = mount()
  const triggerNode = mount(parentNode)
  const parent = track(() => parentNode)
  const childNode = mount()
  let child: ReturnType<typeof track>
  child = track(() => childNode, {
    trigger: selection(triggerNode),
    pointerBlocking: true,
    onDismiss: () => child.cleanup(),
  })
  await flush()
  expect(document.body.style.pointerEvents).toBe("none")
  parentNode.remove()
  await flush()
  parent.cleanup()
  await flush()
  expect(document.body.style.pointerEvents).toBe("")
  expect(layerStack.layers).toHaveLength(0)
})

test("transfers owned children when a duplicate registration replaces the parent", async () => {
  const parentNode = mount()
  const triggerNode = mount(parentNode)
  const childNode = mount()
  const original = track(() => parentNode)
  const child = track(() => childNode, { trigger: selection(triggerNode) })
  await flush()
  const replacement = track(() => parentNode)
  await flush()
  original.cleanup()
  replacement.cleanup()
  expect(child.dismiss).toHaveBeenCalledOnce()
})

test("consumes active selections but retains a fresh explicit selection made after closing", async () => {
  const parentNode = mount()
  const triggerNode = mount(parentNode)
  const parent = track(() => parentNode)
  const trigger = selection(triggerNode)
  const childNode = mount()
  const child = track(() => childNode, { trigger })
  await flush()
  expect(trigger.takePendingId()).toBeNull()
  trigger.setId(triggerNode.id)
  expect(trigger.takePendingId()).toBeNull()
  child.cleanup()
  expect(trigger.takePendingId()).toBeNull()
  trigger.setId(triggerNode.id)
  expect(trigger.takePendingId()).toBe(triggerNode.id)
  parent.cleanup()
})

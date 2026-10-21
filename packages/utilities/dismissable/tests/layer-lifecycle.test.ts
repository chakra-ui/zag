// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  trackDismissableBranch,
  trackDismissableElement,
  type DismissableElementOptions,
} from "../src/dismissable-layer"
import { layerStack } from "../src/layer-stack"

const cleanups: VoidFunction[] = []
let frames: Map<number, FrameRequestCallback>

function track(
  node: HTMLElement | null | (() => HTMLElement | null),
  options: Partial<DismissableElementOptions> = {},
) {
  const dismiss = vi.fn()
  const cleanup = trackDismissableElement(node, {
    defer: true,
    warnOnMissingNode: false,
    onDismiss: dismiss,
    ...options,
  })
  cleanups.push(cleanup)
  return { dismiss, cleanup }
}

function mount(root: Node = document.body) {
  const node = root.ownerDocument!.createElement("div")
  root.appendChild(node)
  return node
}

function escape(doc = document, init: KeyboardEventInit = {}) {
  const event = new doc.defaultView!.KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
    ...init,
  })
  doc.dispatchEvent(event)
  return event
}

async function commit() {
  await Promise.resolve()
  await Promise.resolve()
}

async function frame() {
  const callbacks = [...frames.values()]
  frames.clear()
  callbacks.forEach((fn) => fn(0))
  await commit()
}

describe("dismissable layer lifecycle", () => {
  beforeEach(() => {
    frames = new Map()
    let id = 0
    vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
      frames.set(++id, fn)
      return id
    })
    vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id))
  })

  afterEach(async () => {
    cleanups
      .splice(0)
      .reverse()
      .forEach((fn) => fn())
    await commit()
    expect(layerStack.layers).toHaveLength(0)
    expect(layerStack.branches).toHaveLength(0)
    layerStack.recentlyRemoved.clear()
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test("handles Escape synchronously before the node or a microtask exists", () => {
    const { dismiss } = track(() => null)
    expect(layerStack.count()).toBe(1)
    expect(escape().defaultPrevented).toBe(true)
    expect(dismiss).toHaveBeenCalledOnce()
  })

  test("attaches a presence-style commit after the initial microtask without a frame", async () => {
    let node: HTMLElement | null = null
    const { dismiss } = track(() => node)
    await commit()
    node = mount()
    await commit()
    expect(layerStack.layers[0].node).toBe(node)
    escape()
    expect(dismiss).toHaveBeenCalledOnce()
  })

  test("keeps observing content that mounts later than the first frame", async () => {
    let node: HTMLElement | null = null
    track(() => node)
    await commit()
    await frame()
    await frame()
    node = mount()
    await commit()
    expect(node.style.getPropertyValue("--layer-index")).toBe("0")
  })

  test("resolves the committed node instead of the node being replaced on open", async () => {
    let node = mount()
    const doomed = node
    track(() => node)
    doomed.remove()
    node = mount()
    await commit()
    expect(layerStack.layers[0].node).toBe(node)
    expect(doomed.style.getPropertyValue("--layer-index")).toBe("")
  })

  test("replaces an attached node without changing stack position or closing a child", async () => {
    let parent = mount()
    track(() => parent)
    const child = mount()
    const { dismiss } = track(child)
    await commit()
    const registration = layerStack.layers[0]
    const oldParent = parent
    oldParent.remove()
    parent = mount()
    await commit()
    expect(layerStack.layers.map((layer) => layer.node)).toEqual([parent, child])
    expect(layerStack.layers[0]).toBe(registration)
    expect(oldParent.style.pointerEvents).toBe("")
    expect(dismiss).not.toHaveBeenCalled()
    escape()
    expect(dismiss).toHaveBeenCalledOnce()
  })

  test("reserves opening order when parent content commits after the child", async () => {
    let parent: HTMLElement | null = null
    const first = track(() => parent)
    const child = mount()
    const second = track(child)
    await commit()
    parent = mount()
    await commit()
    expect(layerStack.layers.map((layer) => layer.node)).toEqual([parent, child])
    expect(parent.style.getPropertyValue("--layer-index")).toBe("0")
    expect(child.style.getPropertyValue("--layer-index")).toBe("1")
    expect(child.getAttribute("data-nested")).toBe("dialog")
    escape()
    expect(first.dismiss).not.toHaveBeenCalled()
    expect(second.dismiss).toHaveBeenCalledOnce()
  })

  test("routes Escape to a pending child instead of its mounted parent", async () => {
    const parent = track(mount())
    await commit()
    const child = track(() => null)
    escape()
    expect(child.dismiss).toHaveBeenCalledOnce()
    expect(parent.dismiss).not.toHaveBeenCalled()
  })

  test("does not send the same Escape to a parent after synchronous child cleanup", () => {
    const parent = track(() => null)
    const child = track(() => null, { onDismiss: () => child.cleanup() })
    escape()
    expect(layerStack.count()).toBe(1)
    expect(parent.dismiss).not.toHaveBeenCalled()
    escape()
    expect(parent.dismiss).toHaveBeenCalledOnce()
  })

  test("honors prevention and composition before attachment", () => {
    const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => event.preventDefault())
    const { dismiss } = track(() => null, { onEscapeKeyDown })
    escape(document, { isComposing: true })
    escape(document, { key: "Enter" })
    expect(onEscapeKeyDown).not.toHaveBeenCalled()
    escape()
    expect(onEscapeKeyDown).toHaveBeenCalledOnce()
    expect(dismiss).not.toHaveBeenCalled()
  })

  test("cleanup before commit cancels attachment, Escape and pending warnings", async () => {
    let node: HTMLElement | null = null
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const { cleanup, dismiss } = track(() => node, { warnOnMissingNode: true })
    cleanup()
    cleanup()
    node = mount()
    await commit()
    await frame()
    escape()
    expect(layerStack.count()).toBe(0)
    expect(node.style.getPropertyValue("--layer-index")).toBe("")
    expect(warn).not.toHaveBeenCalled()
    expect(dismiss).not.toHaveBeenCalled()
  })

  test("registers one Escape listener per document and removes it after the last cleanup", () => {
    const add = vi.spyOn(document, "addEventListener")
    const remove = vi.spyOn(document, "removeEventListener")
    const first = track(() => null)
    const second = track(() => null)
    expect(add.mock.calls.filter(([name]) => name === "keydown")).toHaveLength(1)
    second.cleanup()
    expect(remove.mock.calls.filter(([name]) => name === "keydown")).toHaveLength(0)
    first.cleanup()
    expect(remove.mock.calls.filter(([name]) => name === "keydown")).toHaveLength(1)
  })

  test("isolates Escape and stack metadata between documents", async () => {
    const iframe = document.createElement("iframe")
    document.body.append(iframe)
    const doc = iframe.contentDocument!
    const outerNode = mount()
    const innerNode = mount(doc.body)
    const outer = track(outerNode)
    const inner = track(() => innerNode, { getRootNode: () => doc })
    await commit()
    expect(outerNode.style.getPropertyValue("--layer-index")).toBe("0")
    expect(innerNode.style.getPropertyValue("--layer-index")).toBe("0")
    expect(outerNode.hasAttribute("data-has-nested")).toBe(false)
    escape()
    expect(outer.dismiss).toHaveBeenCalledOnce()
    expect(inner.dismiss).not.toHaveBeenCalled()
    escape(doc)
    expect(inner.dismiss).toHaveBeenCalledOnce()
    outer.cleanup()
    expect(inner.dismiss).toHaveBeenCalledOnce()
  })

  test("observes insertion and replacement inside a shadow root", async () => {
    const root = mount().attachShadow({ mode: "open" })
    track(() => root.getElementById("content"), { getRootNode: () => root })
    await commit()
    const node = mount(root)
    node.id = "content"
    await commit()
    expect(layerStack.layers[0].node).toBe(node)
    node.remove()
    await commit()
    expect(layerStack.layers[0].node).toBeNull()
    const replacement = mount(root)
    replacement.id = "content"
    await commit()
    expect(layerStack.layers[0].node).toBe(replacement)
  })

  test("keeps layers without a trigger open when an earlier layer closes", async () => {
    const parent = track(mount())
    // e.g. a button in the parent opens a dialog from code, then closes the parent
    const pending = track(() => null)
    const mounted = track(mount())
    await commit()

    parent.cleanup()

    expect(pending.dismiss).not.toHaveBeenCalled()
    expect(mounted.dismiss).not.toHaveBeenCalled()
  })

  test("keeps a layer opened from outside open when an earlier layer closes", async () => {
    const parent = track(mount())
    const siblingTrigger = mount()
    const mounted = track(mount(), { getTriggerEl: () => siblingTrigger })
    const pending = track(() => null, { getTriggerEl: () => siblingTrigger })
    await commit()

    parent.cleanup()

    expect(mounted.dismiss).not.toHaveBeenCalled()
    expect(pending.dismiss).not.toHaveBeenCalled()
  })

  test("closes layers opened from inside a closing layer, including their own children", async () => {
    const parentNode = mount()
    const childTrigger = mount(parentNode)
    const childNode = mount()
    const grandchildTrigger = mount(childNode)

    const parent = track(parentNode)
    const child = track(childNode, { getTriggerEl: () => childTrigger })
    const grandchild = track(mount(), { getTriggerEl: () => grandchildTrigger })
    await commit()

    parent.cleanup()

    expect(child.dismiss).toHaveBeenCalledOnce()
    expect(grandchild.dismiss).toHaveBeenCalledOnce()
  })

  test("closes a child whose trigger was removed along with the parent's content", async () => {
    const parentNode = mount()
    const trigger = mount(parentNode)
    const parent = track(parentNode)
    // Like an id lookup, the getter finds nothing once the trigger leaves the document
    const child = track(mount(), { getTriggerEl: () => (trigger.isConnected ? trigger : null) })
    await commit()

    parentNode.remove()
    parent.cleanup()

    expect(child.dismiss).toHaveBeenCalledOnce()
  })

  test("attaches and detaches when a shadow host itself is connected or removed", async () => {
    const host = document.createElement("div")
    const root = host.attachShadow({ mode: "open" })
    const node = mount(root)
    track(() => node, { getRootNode: () => root })
    await commit()
    expect(layerStack.layers[0].node).toBeNull()
    document.body.append(host)
    await commit()
    expect(layerStack.layers[0].node).toBe(node)
    host.remove()
    await commit()
    expect(layerStack.layers[0].node).toBeNull()
  })

  test("preserves preventable request-dismiss events and their original indices", async () => {
    const node = mount()
    const parent = track(node)
    const onRequestDismiss = vi.fn((event) => event.preventDefault())
    const trigger = mount(node)
    const child = track(mount(), { onRequestDismiss, getTriggerEl: () => trigger })
    await commit()
    parent.cleanup()
    expect(onRequestDismiss).toHaveBeenCalledOnce()
    expect(onRequestDismiss.mock.calls[0][0].detail).toMatchObject({
      targetLayer: node,
      targetIndex: 0,
      originalIndex: 1,
    })
    expect(child.dismiss).not.toHaveBeenCalled()
  })

  test("does not let a stale cleanup remove a replacement registration on the same node", async () => {
    const node = mount()
    const first = track(node)
    await commit()
    const second = track(node)
    await commit()
    first.cleanup()
    expect(layerStack.count()).toBe(1)
    expect(layerStack.layers[0].node).toBe(node)
    escape()
    expect(first.dismiss).not.toHaveBeenCalled()
    expect(second.dismiss).toHaveBeenCalledOnce()
  })

  test("does not block the page for pending content or leave it blocked after immediate close", async () => {
    let node: HTMLElement | null = null
    const { cleanup } = track(() => node, { pointerBlocking: true })
    await commit()
    expect(document.body.style.pointerEvents).toBe("")
    node = mount()
    await commit()
    expect(document.body.style.pointerEvents).toBe("none")
    cleanup()
    await commit()
    expect(document.body.style.pointerEvents).toBe("")
    expect(document.body.hasAttribute("data-inert")).toBe(false)
  })

  test("keeps the page blocked until every copy of the package unblocks it", async () => {
    vi.resetModules()
    const copy = await import("../src/dismissable-layer")

    for (const closeFirst of ["this copy", "other copy"] as const) {
      const local = track(mount(), { pointerBlocking: true })
      const other = copy.trackDismissableElement(mount(), {
        defer: true,
        pointerBlocking: true,
        warnOnMissingNode: false,
        onDismiss: vi.fn(),
      })
      await commit()
      expect(document.body.style.pointerEvents).toBe("none")

      const [first, second] = closeFirst === "this copy" ? [local.cleanup, other] : [other, local.cleanup]

      first()
      await commit()
      expect(document.body.style.pointerEvents).toBe("none")
      expect(document.body.hasAttribute("data-inert")).toBe(true)

      second()
      await commit()
      expect(document.body.style.pointerEvents).toBe("")
      expect(document.body.hasAttribute("data-inert")).toBe(false)
    }
  })

  test("restores each document's pointer styles independently", async () => {
    const iframe = document.createElement("iframe")
    document.body.append(iframe)
    const doc = iframe.contentDocument!
    document.body.style.pointerEvents = "auto"
    const outer = track(mount(), { pointerBlocking: true })
    const inner = track(mount(doc.body), { pointerBlocking: true, getRootNode: () => doc })
    await commit()
    expect(document.body.style.pointerEvents).toBe("none")
    expect(doc.body.style.pointerEvents).toBe("none")
    outer.cleanup()
    await commit()
    expect(document.body.style.pointerEvents).toBe("auto")
    expect(doc.body.style.pointerEvents).toBe("none")
    inner.cleanup()
    await commit()
    expect(doc.body.style.pointerEvents).toBe("")
    document.body.style.pointerEvents = ""
  })

  test("immediate cleanup cannot leave a queued body pointer lock behind", async () => {
    const { cleanup } = track(mount(), { defer: false, pointerBlocking: true })
    cleanup()
    await commit()
    expect(document.body.style.pointerEvents).toBe("")
    expect(document.body.hasAttribute("data-inert")).toBe(false)
  })

  test("ignores a deferred focus-outside callback belonging to replaced content", async () => {
    let node = mount()
    const { dismiss } = track(() => node)
    await commit()
    await frame()
    const outside = mount()
    outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
    node.remove()
    node = mount()
    await commit()
    await frame()
    expect(dismiss).not.toHaveBeenCalled()
  })

  test("releases persistent-element styles while another modal is still open", async () => {
    const persistent = mount()
    track(mount(), { pointerBlocking: true })
    const child = track(mount(), { pointerBlocking: true, persistentElements: [() => persistent] })
    await commit()
    expect(persistent.style.pointerEvents).toBe("auto")
    child.cleanup()
    await commit()
    expect(document.body.style.pointerEvents).toBe("none")
    expect(persistent.style.pointerEvents).toBe("")
  })

  test("shares persistent-element styles until every owner has detached", async () => {
    const persistent = mount()
    persistent.style.pointerEvents = "none"
    const options = { pointerBlocking: true, persistentElements: [() => persistent] }
    const parent = track(mount(), options)
    const child = track(mount(), options)
    await commit()
    child.cleanup()
    await commit()
    expect(persistent.style.pointerEvents).toBe("auto")
    parent.cleanup()
    await commit()
    expect(persistent.style.pointerEvents).toBe("none")
  })

  test("updates branches that mount late or replace their node", async () => {
    let node: HTMLElement | null = null
    cleanups.push(trackDismissableBranch(() => node, { defer: true }))
    await commit()
    await frame()
    node = mount()
    expect(layerStack.isInBranch(node)).toBe(true)
    const stale = node
    stale.remove()
    node = mount()
    expect(layerStack.isInBranch(stale)).toBe(false)
    expect(layerStack.isInBranch(node)).toBe(true)
  })
})

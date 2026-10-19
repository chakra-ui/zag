// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  createSharedMutationObserver,
  observeAttributes,
  observeChildren,
  type SharedMutationObserver,
} from "../src/mutation-observer"

const cleanups: VoidFunction[] = []
let observer: SharedMutationObserver

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

function subscribe(root: Document | ShadowRoot | Element, listener: VoidFunction) {
  const cleanup = observer.observe(root, listener)
  cleanups.push(cleanup)
  return cleanup
}

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

function mutate(root: Node = document.body) {
  root.appendChild((root.ownerDocument ?? document).createElement("div"))
}

describe("shared mutation observer", () => {
  beforeEach(() => {
    observer = createSharedMutationObserver({
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id"],
    })
  })

  test("uses one observer per root and notifies each subscriber once per mutation batch", async () => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe")
    const first = vi.fn()
    const second = vi.fn()
    subscribe(document, first)
    subscribe(document, second)
    expect(observe).toHaveBeenCalledOnce()
    for (let i = 0; i < 100; i++) mutate()
    await flush()
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
  })

  test("disconnects only after the last subscriber and recreates lazily", () => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe")
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect")
    const first = subscribe(document, vi.fn())
    const second = subscribe(document, vi.fn())
    first()
    expect(disconnect).not.toHaveBeenCalled()
    second()
    expect(disconnect).toHaveBeenCalledOnce()
    subscribe(document, vi.fn())
    expect(observe).toHaveBeenCalledTimes(2)
  })

  test("a repeated stale cleanup cannot disconnect a new observer for the same root", async () => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe")
    const first = subscribe(document, vi.fn())
    first()
    const listener = vi.fn()
    subscribe(document, listener)
    first()
    subscribe(document, vi.fn())
    expect(observe).toHaveBeenCalledTimes(2)
    mutate()
    await flush()
    expect(listener).toHaveBeenCalledOnce()
  })

  test("gives duplicate listener subscriptions independent cleanup", async () => {
    const listener = vi.fn()
    const first = subscribe(document, listener)
    subscribe(document, listener)
    mutate()
    await flush()
    expect(listener).toHaveBeenCalledTimes(2)
    first()
    mutate()
    await flush()
    expect(listener).toHaveBeenCalledTimes(3)
  })

  test("preserves queued mutations for the subscribers that remain", async () => {
    const first = vi.fn()
    const second = vi.fn()
    const stop = subscribe(document, first)
    subscribe(document, second)
    mutate()
    stop()
    await flush()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  test("skips a subscriber removed during delivery without skipping the others", async () => {
    const second = vi.fn()
    const third = vi.fn()
    subscribe(document, () => stopSecond())
    const stopSecond = subscribe(document, second)
    subscribe(document, third)
    mutate()
    await flush()
    expect(second).not.toHaveBeenCalled()
    expect(third).toHaveBeenCalledOnce()
  })

  test("does not include subscriptions added during delivery in the current batch", async () => {
    const listener = vi.fn()
    let added = false
    subscribe(document, () => {
      if (added) return
      added = true
      subscribe(document, listener)
    })
    mutate()
    await flush()
    expect(listener).not.toHaveBeenCalled()
    mutate()
    await flush()
    expect(listener).toHaveBeenCalledOnce()
  })

  test("reports a subscriber error without starving the rest of the batch", async () => {
    const error = new Error("subscriber failed")
    const report: VoidFunction[] = []
    vi.spyOn(window, "queueMicrotask").mockImplementation((fn) => report.push(fn))
    const listener = vi.fn()
    subscribe(document, () => {
      throw error
    })
    subscribe(document, listener)
    mutate()
    await flush()
    expect(listener).toHaveBeenCalledOnce()
    expect(report).toHaveLength(1)
    expect(report[0]).toThrow(error)
  })

  test("keeps document and shadow-root notifications separate", async () => {
    const host = document.createElement("div")
    document.body.append(host)
    const root = host.attachShadow({ mode: "open" })
    const outer = vi.fn()
    const inner = vi.fn()
    subscribe(document, outer)
    subscribe(root, inner)
    mutate(root)
    await flush()
    expect(inner).toHaveBeenCalledOnce()
    expect(outer).not.toHaveBeenCalled()
    mutate()
    await flush()
    expect(outer).toHaveBeenCalledOnce()
    expect(inner).toHaveBeenCalledOnce()
  })

  test("uses separate observers and cleanup for iframe documents", async () => {
    const iframe = document.createElement("iframe")
    document.body.append(iframe)
    const doc = iframe.contentDocument!
    const outer = vi.fn()
    const inner = vi.fn()
    const stop = subscribe(document, outer)
    subscribe(doc, inner)
    mutate(doc.body)
    await flush()
    expect(inner).toHaveBeenCalledOnce()
    expect(outer).not.toHaveBeenCalled()
    stop()
    mutate(doc.body)
    await flush()
    expect(inner).toHaveBeenCalledTimes(2)
  })

  test("observes ids but ignores style and unrelated attribute writes", async () => {
    const node = document.createElement("div")
    document.body.append(node)
    const listener = vi.fn()
    subscribe(document, listener)
    node.style.pointerEvents = "auto"
    node.setAttribute("data-layer", "1")
    await flush()
    expect(listener).not.toHaveBeenCalled()
    node.id = "content"
    await flush()
    expect(listener).toHaveBeenCalledOnce()
  })

  test("delivers mutation records with the requested configuration", async () => {
    const node = document.createElement("div")
    document.body.append(node)
    observer = createSharedMutationObserver({ attributes: true, attributeOldValue: true, attributeFilter: ["title"] })
    const listener = vi.fn()
    subscribe(node, listener)
    node.title = "first"
    node.title = "second"
    await flush()
    const records = listener.mock.calls[0][0] as readonly MutationRecord[]
    expect(records.map((record) => [record.type, record.attributeName, record.oldValue])).toEqual([
      ["attributes", "title", null],
      ["attributes", "title", "first"],
    ])
  })

  test("supports character-data targets, not just element roots", async () => {
    const text = document.createTextNode("before")
    document.body.append(text)
    observer = createSharedMutationObserver({ characterData: true, characterDataOldValue: true })
    const listener = vi.fn()
    cleanups.push(observer.observe(text, listener))
    text.data = "after"
    await flush()
    expect(listener.mock.calls[0][0][0]).toMatchObject({ type: "characterData", oldValue: "before", target: text })
  })

  test("snapshots options and attribute filters when creating the pool", async () => {
    const options = { attributes: true, attributeFilter: ["id"] }
    observer = createSharedMutationObserver(options)
    options.attributes = false
    options.attributeFilter[0] = "class"
    const node = document.createElement("div")
    document.body.append(node)
    const listener = vi.fn()
    subscribe(node, listener)
    node.id = "content"
    node.className = "changed"
    await flush()
    expect(listener.mock.calls[0][0]).toHaveLength(1)
    expect(listener.mock.calls[0][0][0].attributeName).toBe("id")
  })

  test("keeps configurations independent when they observe the same target", async () => {
    const node = document.createElement("div")
    document.body.append(node)
    const ids = vi.fn()
    const styles = vi.fn()
    subscribe(node, ids)
    const styleObserver = createSharedMutationObserver({ attributes: true, attributeFilter: ["style"] })
    const stopStyles = styleObserver.observe(node, styles)
    cleanups.push(stopStyles)
    node.id = "content"
    await flush()
    expect(ids).toHaveBeenCalledOnce()
    expect(styles).not.toHaveBeenCalled()
    stopStyles()
    node.style.pointerEvents = "none"
    node.id = "replacement"
    await flush()
    expect(ids).toHaveBeenCalledTimes(2)
    expect(styles).not.toHaveBeenCalled()
  })

  test.each<[MutationObserverInit, MutationObserverInit]>([
    [{ childList: true }, { subtree: false, childList: true }],
    [{ attributeFilter: ["id", "title", "id"] }, { attributes: true, attributeFilter: ["title", "id"] }],
    [{ attributeOldValue: false }, { attributes: true }],
    [{ characterDataOldValue: false }, { characterData: true }],
  ])("shares equivalent configurations across separate factories: %j and %j", (first, second) => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe")
    cleanups.push(createSharedMutationObserver(first).observe(document, vi.fn()))
    cleanups.push(createSharedMutationObserver(second).observe(document, vi.fn()))
    expect(observe).toHaveBeenCalledOnce()
  })

  test("releasing one configuration does not disconnect another configuration", async () => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe")
    const node = document.createElement("div")
    document.body.append(node)
    const first = createSharedMutationObserver({ attributes: true })
    const second = createSharedMutationObserver({ attributeFilter: [] })
    const stopFirst = first.observe(node, vi.fn())
    const stopSecond = second.observe(node, vi.fn())
    cleanups.push(stopFirst, stopSecond)
    expect(observe).toHaveBeenCalledTimes(2)
    stopSecond()
    const listener = vi.fn()
    cleanups.push(createSharedMutationObserver({ attributeOldValue: false }).observe(node, listener))
    expect(observe).toHaveBeenCalledTimes(2)
    node.id = "changed"
    await flush()
    expect(listener).toHaveBeenCalledOnce()
  })

  test.each<MutationObserverInit>([
    {},
    { attributes: false, attributeOldValue: true },
    { childList: true, attributes: false, attributeFilter: [] },
    { characterData: false, characterDataOldValue: true },
  ])("preserves native validation for invalid configuration: %j", (options) => {
    expect(() => createSharedMutationObserver(options).observe(document, vi.fn())).toThrow(TypeError)
  })

  test("is lazy and becomes a no-op when MutationObserver is unavailable", () => {
    const observe = vi.spyOn(MutationObserver.prototype, "observe")
    const pool = createSharedMutationObserver({ childList: true })
    expect(observe).not.toHaveBeenCalled()
    vi.spyOn(window, "MutationObserver", "get").mockReturnValue(undefined as any)
    const cleanup = pool.observe(document, vi.fn())
    expect(() => cleanup()).not.toThrow()
    expect(observe).not.toHaveBeenCalled()
  })
})

describe("mutation observer helpers", () => {
  test("attribute observers share equivalent filters and release independently", async () => {
    const node = document.createElement("div")
    const observe = vi.spyOn(MutationObserver.prototype, "observe")
    const first = vi.fn()
    const second = vi.fn()
    const stopFirst = observeAttributes(node, { attributes: ["id", "title"], callback: first })
    cleanups.push(stopFirst, observeAttributes(node, { attributes: ["title", "id"], callback: second }))
    expect(observe).toHaveBeenCalledOnce()
    node.id = "first"
    node.className = "ignored"
    await Promise.resolve()
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
    stopFirst()
    node.title = "second"
    await Promise.resolve()
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledTimes(2)
  })

  test("attribute observation cleanup cancels deferred setup", async () => {
    const node = document.createElement("div")
    const callback = vi.fn()
    const cleanup = observeAttributes(node, { attributes: ["id"], callback, defer: true })
    cleanups.push(cleanup)
    cleanup()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    node.id = "changed"
    await Promise.resolve()
    expect(callback).not.toHaveBeenCalled()
  })

  test("deferred attribute observation releases its subscription after setup", async () => {
    const node = document.createElement("div")
    const callback = vi.fn()
    const cleanup = observeAttributes(node, { attributes: ["id"], callback, defer: true })
    cleanups.push(cleanup)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    node.id = "first"
    await Promise.resolve()
    expect(callback).toHaveBeenCalledOnce()
    cleanup()
    node.id = "second"
    await Promise.resolve()
    expect(callback).toHaveBeenCalledOnce()
  })

  test("children callbacks retain an independent native observer", async () => {
    const node = document.createElement("div")
    const first = vi.fn((_records, observer: MutationObserver) => observer.disconnect())
    const second = vi.fn()
    cleanups.push(observeChildren(node, { callback: first }), observeChildren(node, { callback: second }))
    node.append(document.createElement("div"))
    await Promise.resolve()
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
    expect(first.mock.calls[0][1]).toBeInstanceOf(MutationObserver)
    node.append(document.createElement("div"))
    await Promise.resolve()
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledTimes(2)
  })
})

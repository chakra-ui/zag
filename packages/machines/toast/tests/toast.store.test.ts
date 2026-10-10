import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { createToastStore } from "../src/toast.store"
import type { ToastProps } from "../src/toast.types"

describe("toast store updates", () => {
  test("keeps object updates and their missing-ID creation behavior", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original", description: "Keep me" })

    expect(store.update(id, { title: "Updated" })).toBe(id)
    expect(store.getVisibleToasts()[0]).toMatchObject({ id, title: "Updated", description: "Keep me" })

    expect(store.update("missing", { title: "Created" })).toBe("missing")
    expect(store.getVisibleToasts()[0]).toMatchObject({ id: "missing", title: "Created" })
  })

  test("merges a functional update and publishes it once", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original", description: "Keep me", type: "loading" })
    const subscriber = vi.fn()
    store.subscribe(subscriber)
    const updater = vi.fn((prev: Partial<ToastProps<string>>) => ({ title: `${prev.title} updated` }))

    expect(store.update(id, updater)).toBe(id)
    expect(updater).toHaveBeenCalledTimes(1)
    expect(updater).toHaveBeenCalledWith(expect.objectContaining({ id, title: "Original", type: "loading" }))
    expect(store.getVisibleToasts()[0]).toMatchObject({
      id,
      title: "Original updated",
      description: "Keep me",
      type: "loading",
    })
    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(subscriber).toHaveBeenCalledWith(store.getVisibleToasts()[0])
  })

  test("successive updates receive the latest properties", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Count", meta: { count: 0, retained: true } })

    store.update(id, (prev) => ({ meta: { ...prev.meta, count: prev.meta!.count + 1 } }))
    store.update(id, (prev) => ({ meta: { ...prev.meta, count: prev.meta!.count + 1 } }))

    expect(store.getVisibleToasts()[0].meta).toEqual({ count: 2, retained: true })
  })

  test("functional updates see earlier object updates and preserve omitted properties", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original", description: "Keep me", duration: 5000 })

    store.update(id, { title: "Object update", type: "success" })
    store.update(id, (prev) => ({ title: `${prev.title}: ${prev.type}` }))
    store.update(id, { duration: 10000 })

    expect(store.getVisibleToasts()).toMatchObject([
      { id, title: "Object update: success", description: "Keep me", type: "success", duration: 10000 },
    ])
  })

  test("an empty functional update preserves the stored properties", () => {
    const store = createToastStore<string>({ duration: 5000, overlap: true })
    const id = store.create({ title: "Original", meta: { count: 1 } })
    const original = { ...store.getVisibleToasts()[0] }
    const updater = vi.fn((prev: Partial<ToastProps<string>>) => {
      expect(prev).toEqual(original)
      expect(prev.duration).toBe(5000)
      expect(prev.stacked).toBe(false)
      return {}
    })

    expect(store.update(id, updater)).toBe(id)
    expect(updater).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts()).toEqual([original])
  })

  test("explicit undefined clears a property and nested objects are replaced shallowly", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original", description: "Clear me", meta: { count: 1, retained: true } })

    store.update(id, () => ({ description: undefined, meta: { count: 2 } }))

    expect(store.getVisibleToasts()[0]).toMatchObject({ id, title: "Original", description: undefined })
    expect(store.getVisibleToasts()[0].meta).toEqual({ count: 2 })
  })

  test("preserves the store's value type in functional updates", () => {
    const store = createToastStore<number>()
    const id = store.create({ title: 1 })

    store.update(id, (prev) => {
      expectTypeOf(prev.title).toEqualTypeOf<number | undefined>()
      return { title: (prev.title ?? 0) + 1 }
    })

    expect(store.getVisibleToasts()[0].title).toBe(2)
  })

  test("passes absent metadata to the updater without inventing a value", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original" })
    const updater = vi.fn((prev: Partial<ToastProps<string>>) => ({
      meta: { ...prev.meta, count: (prev.meta?.count ?? 0) + 1 },
    }))

    store.update(id, updater)

    expect(updater).toHaveBeenCalledTimes(1)
    expect(updater.mock.calls[0][0].meta).toBeUndefined()
    expect(store.getVisibleToasts()[0].meta).toEqual({ count: 1 })
  })

  test("stores function-valued properties without invoking them", () => {
    const store = createToastStore<() => string>()
    const originalTitle = vi.fn(() => "Original")
    const nextTitle = vi.fn(() => "Updated")
    const description = vi.fn(() => "Description")
    const action = vi.fn()
    const id = store.create({ title: originalTitle })

    store.update(id, { description })
    store.update(id, (prev) => {
      expect(prev.title).toBe(originalTitle)
      return { title: nextTitle, action: { label: "Undo", onClick: action } }
    })

    expect(store.getVisibleToasts()[0]).toMatchObject({ title: nextTitle, description })
    expect(originalTitle).not.toHaveBeenCalled()
    expect(nextTitle).not.toHaveBeenCalled()
    expect(description).not.toHaveBeenCalled()
    expect(action).not.toHaveBeenCalled()
  })

  test("preserves a toast created from inside an updater", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original" })
    let addedId = ""

    store.update(id, (prev) => {
      addedId = store.create({ title: "Added during update" })
      return { title: `${prev.title} updated` }
    })

    expect(store.getVisibleToasts()).toMatchObject([
      { id: addedId, title: "Added during update" },
      { id, title: "Original updated" },
    ])
  })

  test.each([false, true])("does not recreate a toast removed from its updater (queued: %s)", (queued) => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = queued ? store.create({ title: "Visible" }) : undefined
    const id = store.create({ title: "Target" })
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    expect(
      store.update(id, () => {
        store.remove(id)
        return { title: "Should not return" }
      }),
    ).toBe(id)

    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(subscriber).toHaveBeenCalledWith({ id, dismiss: true })
    if (visibleId) store.remove(visibleId)
    expect(store.getCount()).toBe(0)
    expect(store.getVisibleToasts()).toEqual([])
  })

  test.each([false, true])("preserves nested updates to omitted properties (queued: %s)", (queued) => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = queued ? store.create({ title: "Visible" }) : undefined
    const id = store.create({ title: "Target", description: "Original description" })

    store.update(id, (prev) => {
      store.update(id, () => ({ description: "Nested update" }))
      return { title: `${prev.title} updated` }
    })

    if (visibleId) store.remove(visibleId)
    expect(store.getVisibleToasts()).toMatchObject([{ id, title: "Target updated", description: "Nested update" }])
    store.remove(id)
    expect(store.getCount()).toBe(0)
  })

  test("applies an update to a queued toast promoted from inside its updater", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const queuedId = store.create({ title: "Queued" })

    store.update(queuedId, (prev) => {
      store.remove(visibleId)
      return { title: `${prev.title} updated` }
    })

    expect(store.getVisibleToasts()).toMatchObject([{ id: queuedId, title: "Queued updated" }])
    store.remove(queuedId)
    expect(store.getCount()).toBe(0)
  })

  test("only updates the requested toast and preserves its ID", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Target" })
    const otherId = store.create({ title: "Other" })

    store.update(id, (prev) => ({ ...prev, id: "different", title: "Updated" }))

    expect(store.getVisibleToasts()).toMatchObject([
      { id: otherId, title: "Other" },
      { id, title: "Updated" },
    ])
  })

  test.each(["missing", "removed"])("ignores functional updates for a %s toast", (state) => {
    const store = createToastStore()
    const id = state === "removed" ? store.create({ title: "Removed" }) : "missing"
    if (state === "removed") store.remove(id)
    const updater = vi.fn(() => ({ title: "Unexpected" }))
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    expect(store.update(id, updater)).toBe(id)
    expect(updater).not.toHaveBeenCalled()
    expect(subscriber).not.toHaveBeenCalled()
    expect(store.getCount()).toBe(0)
  })

  test("updates a queued toast without publishing or promoting it", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const queuedId = store.create({ title: "Queued", meta: { count: 0 } })
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    store.update(queuedId, (prev) => ({ title: `${prev.title} updated`, meta: { count: prev.meta!.count + 1 } }))
    store.update(queuedId, (prev) => ({ meta: { count: prev.meta!.count + 1 } }))

    expect(subscriber).not.toHaveBeenCalled()
    expect(store.getVisibleToasts()).toMatchObject([{ id: visibleId, title: "Visible" }])

    store.remove(visibleId)
    expect(store.getVisibleToasts()).toMatchObject([{ id: queuedId, title: "Queued updated", meta: { count: 2 } }])
  })

  test("queued updates preserve identity, update priority, and leave other queued toasts alone", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const firstId = store.create({ title: "First queued", priority: 2 })
    const targetId = store.create({ title: "Target queued", priority: 8 })
    const lastId = store.create({ title: "Last queued", priority: 3 })

    store.update(targetId, (prev) => ({ ...prev, id: "different", title: "Updated queued", priority: 1 }))

    expect(store.getCount()).toBe(1)
    store.remove(visibleId)
    expect(store.getVisibleToasts()).toMatchObject([{ id: targetId, title: "Updated queued", priority: 1 }])
    store.remove(targetId)
    expect(store.getVisibleToasts()).toMatchObject([{ id: firstId, title: "First queued", priority: 2 }])
    store.remove(firstId)
    expect(store.getVisibleToasts()).toMatchObject([{ id: lastId, title: "Last queued", priority: 3 }])
    store.remove(lastId)
    expect(store.getVisibleToasts()).toEqual([])
  })

  test("equal-priority queued updates preserve promotion order", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const firstId = store.create({ title: "First", priority: 2 })
    const secondId = store.create({ title: "Second", priority: 2 })

    store.update(firstId, (prev) => ({ title: `${prev.title} updated` }))
    store.remove(visibleId)
    expect(store.getVisibleToasts()).toMatchObject([{ id: firstId, title: "First updated" }])
    store.remove(firstId)
    expect(store.getVisibleToasts()).toMatchObject([{ id: secondId, title: "Second" }])
  })

  test("a queued toast can still be updated after it becomes visible", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const queuedId = store.create({ title: "Queued", meta: { count: 0 } })

    store.update(queuedId, (prev) => ({ meta: { count: prev.meta!.count + 1 } }))
    store.remove(visibleId)
    const subscriber = vi.fn()
    store.subscribe(subscriber)
    store.update(queuedId, (prev) => ({ meta: { count: prev.meta!.count + 1 } }))

    expect(store.getVisibleToasts()).toMatchObject([{ id: queuedId, meta: { count: 2 } }])
    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(subscriber).toHaveBeenCalledWith(store.getVisibleToasts()[0])
  })

  test("removed queued toasts cannot be updated or promoted later", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const queuedId = store.create({ title: "Queued" })
    store.remove(queuedId)
    const updater = vi.fn(() => ({ title: "Unexpected" }))

    expect(store.update(queuedId, updater)).toBe(queuedId)
    expect(updater).not.toHaveBeenCalled()
    store.remove(visibleId)
    expect(store.getCount()).toBe(0)
    expect(store.getVisibleToasts()).toEqual([])
  })

  test("removing all toasts also clears queued functional update targets", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const queuedId = store.create({ title: "Queued" })
    store.remove()
    const updater = vi.fn(() => ({ title: "Unexpected" }))

    store.update(visibleId, updater)
    store.update(queuedId, updater)

    expect(updater).not.toHaveBeenCalled()
    expect(store.getCount()).toBe(0)
  })

  test("a throwing queued updater leaves the queue usable and does not publish", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const queuedId = store.create({ title: "Original queued" })
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    expect(() =>
      store.update(queuedId, (prev) => {
        prev.title = "Mutated snapshot"
        throw new Error("Updater failed")
      }),
    ).toThrow("Updater failed")
    expect(subscriber).not.toHaveBeenCalled()

    store.update(queuedId, (prev) => ({ title: `${prev.title} updated` }))
    expect(subscriber).not.toHaveBeenCalled()
    store.remove(visibleId)
    expect(store.getVisibleToasts()).toMatchObject([{ id: queuedId, title: "Original queued updated" }])
  })

  test("a throwing updater does not change or publish the stored toast", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original" })
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    expect(() =>
      store.update(id, (prev) => {
        prev.title = "Mutated snapshot"
        throw new Error("Updater failed")
      }),
    ).toThrow("Updater failed")

    expect(store.getVisibleToasts()[0].title).toBe("Original")
    expect(subscriber).not.toHaveBeenCalled()
  })
})

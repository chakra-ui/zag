import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { createToastStore } from "../src/toast.store"
import type { ToastProps } from "../src/toast.types"

describe("toast store updates", () => {
  test("object updates merge properties and create missing toasts", () => {
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

  test("ignores functional updates for a missing toast", () => {
    const store = createToastStore()
    const id = "missing"
    const updater = vi.fn(() => ({ title: "Unexpected" }))
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    expect(store.update(id, updater)).toBe(id)
    expect(updater).not.toHaveBeenCalled()
    expect(subscriber).not.toHaveBeenCalled()
    expect(store.getCount()).toBe(0)
  })

  test("ignores functional updates for a removed toast", () => {
    const store = createToastStore()
    const id = store.create({ title: "Removed" })
    store.remove(id)
    const updater = vi.fn(() => ({ title: "Unexpected" }))
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    expect(store.update(id, updater)).toBe(id)
    expect(updater).not.toHaveBeenCalled()
    expect(subscriber).not.toHaveBeenCalled()
    expect(store.getCount()).toBe(0)
  })
})

describe("toast store queued updates", () => {
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

  test("object updates and duplicate creates update queued IDs in place", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const id = store.create({ title: "Queued" })
    const subscriber = vi.fn()

    store.subscribe(subscriber)
    store.update(id, { title: "Updated" })
    store.create({ id, description: "Retained" })
    store.update(id, (prev) => ({ title: `${prev.title}!` }))

    expect(subscriber).not.toHaveBeenCalled()

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([{ id, title: "Updated!", description: "Retained" }])

    store.remove(id)

    expect(store.getCount()).toBe(0)
  })
})

describe("toast store updater side effects", () => {
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

  test("does not recreate a visible toast removed from its updater", () => {
    const store = createToastStore<string>({ max: 1 })
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
    expect(store.getCount()).toBe(0)
    expect(store.getVisibleToasts()).toEqual([])
  })

  test("does not recreate a queued toast removed from its updater", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
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
    store.remove(visibleId)

    expect(store.getCount()).toBe(0)
    expect(store.getVisibleToasts()).toEqual([])
  })

  test("preserves nested updates to omitted properties of a visible toast", () => {
    const store = createToastStore<string>({ max: 1 })
    const id = store.create({ title: "Target", description: "Original description" })

    store.update(id, (prev) => {
      store.update(id, () => ({ description: "Nested update" }))
      return { title: `${prev.title} updated` }
    })

    expect(store.getVisibleToasts()).toMatchObject([{ id, title: "Target updated", description: "Nested update" }])
    store.remove(id)

    expect(store.getCount()).toBe(0)
  })

  test("preserves nested updates to omitted properties of a queued toast", () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    const id = store.create({ title: "Target", description: "Original description" })

    store.update(id, (prev) => {
      store.update(id, () => ({ description: "Nested update" }))
      return { title: `${prev.title} updated` }
    })

    store.remove(visibleId)

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

describe("toast store dismissal", () => {
  test("dismissing a queued toast cancels it", () => {
    const store = createToastStore({ max: 1 })
    const visibleId = store.create({})
    const queuedId = store.create({})

    store.dismiss(queuedId)

    const updater = vi.fn(() => ({}))

    store.update(queuedId, updater)

    expect(updater).not.toHaveBeenCalled()
    expect(store.isDismissed(queuedId)).toBe(true)

    store.remove(visibleId)

    expect(store.getCount()).toBe(0)
  })

  test("dismissing all toasts cancels queued toasts", () => {
    const store = createToastStore({ max: 1 })
    const visibleId = store.create({})
    const queuedId = store.create({})

    store.dismiss()

    const updater = vi.fn(() => ({}))

    store.update(queuedId, updater)

    expect(updater).not.toHaveBeenCalled()
    expect(store.isDismissed(queuedId)).toBe(true)

    store.remove(visibleId)

    expect(store.getCount()).toBe(0)
  })

  test("closing toasts reject updates before and after the callback", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original" })

    store.update(id, () => {
      store.dismiss(id)
      return { title: "Unexpected" }
    })

    const updater = vi.fn(() => ({ title: "Unexpected" }))

    store.update(id, updater)
    store.update(id, { type: "loading" })
    store.create({ id, title: "Unexpected" })

    expect(updater).not.toHaveBeenCalled()
    expect(store.getVisibleToasts()[0]).toMatchObject({ title: "Original", type: "info", message: "DISMISS" })

    store.remove(id)
    store.create({ id, title: "Explicit new toast" })

    expect(store.getVisibleToasts()[0].title).toBe("Explicit new toast")
  })
})

describe("toast store promise updates", () => {
  test("duplicate creates preserve visible promise success", async () => {
    const store = createToastStore<string>({ max: 1 })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      error: { title: "Error" },
    })!

    store.create({ id: result.id, description: "Additional details" })
    store.create({ id: result.id, promise: pending })

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(store.getVisibleToasts()).toMatchObject([
      {
        id: result.id,
        title: "Success",
        type: "success",
        description: "Additional details",
      },
    ])
  })

  test("duplicate creates preserve visible promise failure", async () => {
    const store = createToastStore<string>({ max: 1 })
    let reject!: (error: Error) => void
    const pending = new Promise<string>((_, rejectPromise) => {
      reject = rejectPromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      error: { title: "Error" },
    })!

    store.create({ id: result.id, description: "Additional details" })
    store.create({ id: result.id, promise: pending })

    reject(new Error("failed"))
    await expect(result.unwrap()).rejects.toThrow("failed")

    expect(store.getVisibleToasts()).toMatchObject([
      {
        id: result.id,
        title: "Error",
        type: "error",
        description: "Additional details",
      },
    ])
  })

  test("a replacement promise stays active when the previous promise settles", async () => {
    const store = createToastStore<string>()
    let resolveFirst!: (value: string) => void
    let resolveSecond!: (value: string) => void
    const first = new Promise<string>((resolvePromise) => {
      resolveFirst = resolvePromise
    })
    const second = new Promise<string>((resolvePromise) => {
      resolveSecond = resolvePromise
    })
    const firstResult = store.promise(first, { loading: { title: "First loading" }, success: { title: "First done" } })!
    const secondResult = store.promise(
      second,
      { loading: { title: "Second loading" }, success: { title: "Second done" } },
      { id: firstResult.id },
    )!

    resolveFirst("first")
    await firstResult.unwrap()

    expect(store.getVisibleToasts()).toMatchObject([{ id: firstResult.id, title: "Second loading", type: "loading" }])

    resolveSecond("second")
    await secondResult.unwrap()

    expect(store.getVisibleToasts()).toMatchObject([{ id: firstResult.id, title: "Second done", type: "success" }])
  })

  test("manual updates to a pending toast still allow its promise to settle", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Done" },
    })!
    const id = result.id!

    store.update(id, { description: "Progress" })

    resolve("done")
    await result.unwrap()

    expect(store.getVisibleToasts()[0]).toMatchObject({ title: "Done", description: "Progress", type: "success" })
  })
})

describe("toast store queued promise updates", () => {
  test("duplicate creates preserve queued promise success", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      error: { title: "Error" },
    })!

    store.create({ id: result.id, description: "Additional details" })
    store.create({ id: result.id, promise: pending })

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([
      {
        id: result.id,
        title: "Success",
        type: "success",
        description: "Additional details",
      },
    ])
  })

  test("duplicate creates preserve queued promise failure", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let reject!: (error: Error) => void
    const pending = new Promise<string>((_, rejectPromise) => {
      reject = rejectPromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      error: { title: "Error" },
    })!

    store.create({ id: result.id, description: "Additional details" })
    store.create({ id: result.id, promise: pending })

    reject(new Error("failed"))
    await expect(result.unwrap()).rejects.toThrow("failed")

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([
      {
        id: result.id,
        title: "Error",
        type: "error",
        description: "Additional details",
      },
    ])
  })

  test("clearing a queued promise with a functional update ignores its success", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Old success" },
    })!
    const queuedId = result.id!
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    store.update(queuedId, () => ({ promise: undefined, title: "Replacement", type: "info" }))

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(subscriber).not.toHaveBeenCalled()
    expect(store.getVisibleToasts()).toMatchObject([{ id: visibleId, title: "Visible" }])

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([
      { id: queuedId, title: "Replacement", type: "info", promise: undefined },
    ])
  })

  test("clearing a queued promise with a functional update ignores its failure", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let reject!: (error: Error) => void
    const pending = new Promise<string>((_, rejectPromise) => {
      reject = rejectPromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      error: { title: "Old error" },
    })!
    const queuedId = result.id!

    store.update(queuedId, () => ({ promise: undefined, title: "Replacement", type: "info" }))

    reject(new Error("failed"))
    await expect(result.unwrap()).rejects.toThrow("failed")

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([
      { id: queuedId, title: "Replacement", type: "info", promise: undefined },
    ])
  })

  test("replacing a queued promise with a functional update ignores its success", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const replacement = Promise.resolve("replacement")
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Old success" },
    })!
    const queuedId = result.id!

    store.update(queuedId, () => ({ promise: replacement, title: "Replacement", type: "info" }))

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([{ id: queuedId, title: "Replacement", type: "info" }])
    expect(store.getVisibleToasts()[0].promise).toBe(replacement)
  })

  test("replacing a queued promise with a functional update ignores its failure", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let reject!: (error: Error) => void
    const pending = new Promise<string>((_, rejectPromise) => {
      reject = rejectPromise
    })
    const replacement = Promise.resolve("replacement")
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      error: { title: "Old error" },
    })!
    const queuedId = result.id!

    store.update(queuedId, () => ({ promise: replacement, title: "Replacement", type: "info" }))

    reject(new Error("failed"))
    await expect(result.unwrap()).rejects.toThrow("failed")

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([{ id: queuedId, title: "Replacement", type: "info" }])
    expect(store.getVisibleToasts()[0].promise).toBe(replacement)
  })

  test("a queued functional update preserves settlement when it omits the promise", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
    })!
    const queuedId = result.id!

    store.update(queuedId, () => ({ description: "Progress" }))

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([
      { id: queuedId, title: "Success", type: "success", description: "Progress" },
    ])
  })

  test("a queued functional update preserves settlement when it returns the same promise", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({ title: "Visible" })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
    })!
    const queuedId = result.id!

    store.update(queuedId, (prev) => ({ promise: prev.promise, description: "Progress" }))

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([
      { id: queuedId, title: "Success", type: "success", description: "Progress" },
    ])
  })

  test("queued promises settle in place and promote only once", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visibleId = store.create({})
    const result = store.promise(Promise.resolve("done"), {
      loading: { title: "Loading" },
      success: { title: "Done" },
    })!
    await result.unwrap()
    store.remove(visibleId)

    expect(store.getVisibleToasts()).toMatchObject([{ id: result.id, title: "Done", type: "success" }])

    store.remove(result.id)

    expect(store.getCount()).toBe(0)
  })
})

describe("toast store promise cancellation", () => {
  test("promise settlement cannot revive a toast after removal", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const onFinally = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: onFinally,
    })!
    const id = result.id!
    store.remove(id)

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(onFinally).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getCount()).toBe(0)
  })

  test("promise settlement cannot revive a toast after dismissal", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const onFinally = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: onFinally,
    })!
    const id = result.id!
    store.dismiss(id)

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(onFinally).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getCount()).toBe(1)
  })

  test("promise settlement cannot revive a toast after removing all toasts", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const onFinally = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: onFinally,
    })!
    store.remove()

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(onFinally).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getCount()).toBe(0)
  })

  test("promise settlement cannot revive a toast after removal and ID reuse", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((resolvePromise) => {
      resolve = resolvePromise
    })
    const onFinally = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: onFinally,
    })!
    const id = result.id!
    store.remove(id)
    store.create({ id, title: "Replacement" })

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(onFinally).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getVisibleToasts()).toMatchObject([{ id, title: "Replacement" }])
  })

  test("rejected promises retain unwrap rejection without recreating removed toasts", async () => {
    const store = createToastStore<string>()
    let reject!: (error: Error) => void
    const pending = new Promise<string>((_, rejectPromise) => {
      reject = rejectPromise
    })
    const result = store.promise(pending, { loading: { title: "Loading" }, error: { title: "Error" } })!

    store.remove(result.id)

    reject(new Error("failed"))
    await expect(result.unwrap()).rejects.toThrow("failed")

    expect(store.getCount()).toBe(0)
  })

  test("removing the loading toast from its creation notification prevents resurrection", async () => {
    const store = createToastStore<string>()

    store.subscribe((toast) => {
      if (toast.type === "loading") store.remove(toast.id)
    })
    const result = store.promise(Promise.resolve("done"), {
      loading: { title: "Loading" },
      success: { title: "Done" },
    })!
    await result.unwrap()

    expect(store.getCount()).toBe(0)
  })
})

describe("toast store subscriptions", () => {
  test("subscribers see committed state and can create another toast", () => {
    const store = createToastStore<string>()

    store.subscribe((toast) => {
      if (toast.dismiss) {
        expect(store.isVisible(toast.id)).toBe(false)
      } else {
        const current = store.getVisibleToasts().find((item) => item.id === toast.id)
        expect(current).toEqual(toast)
      }

      if (toast.title === "Updated") {
        store.create({ id: "nested", title: "Nested" })
      }
    })
    const id = store.create({ title: "Original" })

    store.update(id, { title: "Updated" })

    expect(store.getVisibleToasts().map((toast) => toast.title)).toEqual(["Nested", "Updated"])

    store.pause()
    store.resume()
    store.expand()
    store.collapse()
    store.remove()

    expect(store.getCount()).toBe(0)
  })

  test("unsubscribing twice does not remove another subscriber", () => {
    const store = createToastStore()
    const firstSubscriber = vi.fn()
    const secondSubscriber = vi.fn()
    const unsubscribe = store.subscribe(firstSubscriber)

    store.subscribe(secondSubscriber)
    unsubscribe()
    unsubscribe()
    store.create({})

    expect(firstSubscriber).not.toHaveBeenCalled()
    expect(secondSubscriber).toHaveBeenCalledTimes(1)
  })

  test("nested notifications reach every subscriber in mutation order", () => {
    const store = createToastStore<string>()
    const id = store.create({ title: "Original" })

    store.subscribe((toast) => {
      if (toast.title === "Outer") store.update(id, { title: "Inner" })
    })

    const titles: string[] = []

    store.subscribe((toast) => titles.push(toast.title))
    store.update(id, { title: "Outer" })

    expect(titles).toEqual(["Outer", "Inner"])
    expect(store.getVisibleToasts()[0].title).toBe("Inner")
  })

  test("batch notifications precede nested mutations", () => {
    const store = createToastStore<string>()
    const firstId = store.create({ title: "First" })
    const secondId = store.create({ title: "Second" })

    store.subscribe((toast) => {
      if (toast.id === secondId && toast.paused && toast.title === "Second") {
        store.update(firstId, { title: "Nested" })
      }
    })

    const titles: string[] = []

    store.subscribe((toast) => titles.push(toast.title))
    store.pause()

    expect(titles).toEqual(["Second", "First", "Nested"])
  })

  test("unsubscribing twice removes only one duplicate registration", () => {
    const store = createToastStore()
    const subscriber = vi.fn()
    const unsubscribe = store.subscribe(subscriber)

    store.subscribe(subscriber)
    unsubscribe()
    unsubscribe()
    store.create({})

    expect(subscriber).toHaveBeenCalledTimes(1)
  })
})

describe("toast store paused timers", () => {
  test("new and promoted toasts inherit the store pause state", () => {
    const store = createToastStore({ max: 1 })

    store.pause()
    const visibleId = store.create({})
    const queuedId = store.create({})

    expect(store.getVisibleToasts()[0].paused).toBe(true)

    store.resume()
    store.remove(visibleId)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queuedId, paused: false })

    store.pause(queuedId)
    store.update(queuedId, { title: "Still paused" })

    expect(store.getVisibleToasts()[0].paused).toBe(true)
  })
})

describe("toast store priority", () => {
  test("custom toast type uses the info priority", () => {
    const store = createToastStore({ max: 1 })
    const visibleId = store.create({ type: "custom" })
    const queuedId = store.create({ type: "custom", action: { label: "Undo", onClick: vi.fn() } })

    expect(store.getVisibleToasts()[0].priority).toBe(8)

    store.remove(visibleId)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queuedId, priority: 6 })
  })

  test("toString toast type uses the info priority", () => {
    const store = createToastStore({ max: 1 })
    const visibleId = store.create({ type: "toString" })
    const queuedId = store.create({ type: "toString", action: { label: "Undo", onClick: vi.fn() } })

    expect(store.getVisibleToasts()[0].priority).toBe(8)

    store.remove(visibleId)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queuedId, priority: 6 })
  })

  test("__proto__ toast type uses the info priority", () => {
    const store = createToastStore({ max: 1 })
    const visibleId = store.create({ type: "__proto__" })
    const queuedId = store.create({ type: "__proto__", action: { label: "Undo", onClick: vi.fn() } })

    expect(store.getVisibleToasts()[0].priority).toBe(8)

    store.remove(visibleId)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queuedId, priority: 6 })
  })
})

describe("toast store layout", () => {
  test("does not store the layout on toasts", () => {
    const store = createToastStore({ overlap: true })
    store.create({ id: "first" })
    expect(store.getVisibleToasts()[0]).not.toHaveProperty("stacked")
  })

  test("expand and collapse notify layout subscribers", () => {
    const store = createToastStore({ overlap: true })
    const subscriber = vi.fn()
    const unsubscribe = store.subscribeLayout(subscriber)

    store.expand()
    store.collapse()
    expect(subscriber.mock.calls).toEqual([[true], [false]])

    unsubscribe()
    store.expand()
    expect(subscriber).toHaveBeenCalledTimes(2)
  })

  test("expand and collapse do not republish toasts", () => {
    const store = createToastStore({ overlap: true })
    store.create({ id: "first" })
    const subscriber = vi.fn()
    store.subscribe(subscriber)

    store.expand()
    store.collapse()
    expect(subscriber).not.toHaveBeenCalled()
  })
})

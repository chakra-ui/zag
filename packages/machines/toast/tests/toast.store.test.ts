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

describe("toast store lifecycle", () => {
  test("object updates and duplicate creates update queued IDs in place", () => {
    const store = createToastStore<string>({ max: 1 })
    const visible = store.create({ title: "Visible" })
    const id = store.create({ title: "Queued" })
    const notify = vi.fn()

    store.subscribe(notify)
    store.update(id, { title: "Updated" })
    store.create({ id, description: "Retained" })
    store.update(id, (prev) => ({ title: `${prev.title}!` }))

    expect(notify).not.toHaveBeenCalled()

    store.remove(visible)

    expect(store.getVisibleToasts()).toMatchObject([{ id, title: "Updated!", description: "Retained" }])

    store.remove(id)

    expect(store.getCount()).toBe(0)
  })

  test("dismissing a queued toast cancels it", () => {
    const store = createToastStore({ max: 1 })
    const visible = store.create({})
    const queued = store.create({})

    store.dismiss(queued)

    const updater = vi.fn(() => ({}))

    store.update(queued, updater)

    expect(updater).not.toHaveBeenCalled()
    expect(store.isDismissed(queued)).toBe(true)

    store.remove(visible)

    expect(store.getCount()).toBe(0)
  })

  test("dismissing all toasts cancels queued toasts", () => {
    const store = createToastStore({ max: 1 })
    const visible = store.create({})
    const queued = store.create({})

    store.dismiss()

    const updater = vi.fn(() => ({}))

    store.update(queued, updater)

    expect(updater).not.toHaveBeenCalled()
    expect(store.isDismissed(queued)).toBe(true)

    store.remove(visible)

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

  test("duplicate creates preserve visible promise success", async () => {
    const store = createToastStore<string>({ max: 1 })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((done) => {
      resolve = done
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
    const pending = new Promise<string>((_, fail) => {
      reject = fail
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

  test("duplicate creates preserve queued promise success", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visible = store.create({ title: "Visible" })
    let resolve!: (value: string) => void
    const pending = new Promise<string>((done) => {
      resolve = done
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

    store.remove(visible)

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
    const visible = store.create({ title: "Visible" })
    let reject!: (error: Error) => void
    const pending = new Promise<string>((_, fail) => {
      reject = fail
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

    store.remove(visible)

    expect(store.getVisibleToasts()).toMatchObject([
      {
        id: result.id,
        title: "Error",
        type: "error",
        description: "Additional details",
      },
    ])
  })

  test("replacing a pending promise ignores its settlement without clearing the replacement token", async () => {
    const store = createToastStore<string>()
    let resolveFirst!: (value: string) => void
    let resolveSecond!: (value: string) => void
    const first = new Promise<string>((done) => {
      resolveFirst = done
    })
    const second = new Promise<string>((done) => {
      resolveSecond = done
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

  test("promise settlement cannot revive a toast after removal", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((done) => {
      resolve = done
    })
    const finallyFn = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: finallyFn,
    })!
    const id = result.id!
    store.remove(id)

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(finallyFn).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getCount()).toBe(0)
  })

  test("promise settlement cannot revive a toast after dismissal", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((done) => {
      resolve = done
    })
    const finallyFn = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: finallyFn,
    })!
    const id = result.id!
    store.dismiss(id)

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(finallyFn).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getCount()).toBe(1)
  })

  test("promise settlement cannot revive a toast after removing all toasts", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((done) => {
      resolve = done
    })
    const finallyFn = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: finallyFn,
    })!
    const id = result.id!
    store.remove()

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(finallyFn).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getCount()).toBe(0)
  })

  test("promise settlement cannot revive a toast after removal and ID reuse", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const pending = new Promise<string>((done) => {
      resolve = done
    })
    const finallyFn = vi.fn()
    const result = store.promise(pending, {
      loading: { title: "Loading" },
      success: { title: "Success" },
      finally: finallyFn,
    })!
    const id = result.id!
    store.remove(id)
    store.create({ id, title: "Replacement" })

    resolve("done")
    await expect(result.unwrap()).resolves.toBe("done")

    expect(finallyFn).toHaveBeenCalledTimes(1)
    expect(store.getVisibleToasts().some((toast) => toast.title === "Success")).toBe(false)
    expect(store.getVisibleToasts()).toMatchObject([{ id, title: "Replacement" }])
  })

  test("rejected promises retain unwrap rejection without recreating removed toasts", async () => {
    const store = createToastStore<string>()
    let reject!: (error: Error) => void
    const pending = new Promise<string>((_, fail) => {
      reject = fail
    })
    const result = store.promise(pending, { loading: { title: "Loading" }, error: { title: "Error" } })!

    store.remove(result.id)

    reject(new Error("failed"))
    await expect(result.unwrap()).rejects.toThrow("failed")

    expect(store.getCount()).toBe(0)
  })

  test("queued promises settle in place and promote only once", async () => {
    const store = createToastStore<string>({ max: 1 })
    const visible = store.create({})
    const result = store.promise(Promise.resolve("done"), {
      loading: { title: "Loading" },
      success: { title: "Done" },
    })!
    await result.unwrap()
    store.remove(visible)

    expect(store.getVisibleToasts()).toMatchObject([{ id: result.id, title: "Done", type: "success" }])

    store.remove(result.id)

    expect(store.getCount()).toBe(0)
  })

  test("notifications observe committed state and reentrant mutations survive", () => {
    const store = createToastStore<string>()

    store.subscribe((toast) => {
      if (!toast.dismiss) expect(store.getVisibleToasts().find((item) => item.id === toast.id)).toEqual(toast)
      else expect(store.isVisible(toast.id)).toBe(false)
      if (toast.title === "Updated") store.create({ id: "nested", title: "Nested" })
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
    const first = vi.fn()
    const second = vi.fn()
    const unsubscribe = store.subscribe(first)

    store.subscribe(second)
    unsubscribe()
    unsubscribe()
    store.create({})

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  test("new and promoted toasts inherit the store pause state", () => {
    const store = createToastStore({ max: 1 })

    store.pause()
    const visible = store.create({})
    const queued = store.create({})

    expect(store.getVisibleToasts()[0].paused).toBe(true)

    store.resume()
    store.remove(visible)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queued, paused: false })

    store.pause(queued)
    store.update(queued, { title: "Still paused" })

    expect(store.getVisibleToasts()[0].paused).toBe(true)
  })

  test("custom toast type uses the info priority", () => {
    const store = createToastStore({ max: 1 })
    const visible = store.create({ type: "custom" })
    const queued = store.create({ type: "custom", action: { label: "Undo", onClick: vi.fn() } })

    expect(store.getVisibleToasts()[0].priority).toBe(8)

    store.remove(visible)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queued, priority: 6 })
  })
})

describe("toast store reentrancy", () => {
  test("toString toast type uses the info priority", () => {
    const store = createToastStore({ max: 1 })
    const visible = store.create({ type: "toString" })
    const queued = store.create({ type: "toString", action: { label: "Undo", onClick: vi.fn() } })

    expect(store.getVisibleToasts()[0].priority).toBe(8)

    store.remove(visible)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queued, priority: 6 })
  })
})

describe("toast store reentrancy", () => {
  test("__proto__ toast type uses the info priority", () => {
    const store = createToastStore({ max: 1 })
    const visible = store.create({ type: "__proto__" })
    const queued = store.create({ type: "__proto__", action: { label: "Undo", onClick: vi.fn() } })

    expect(store.getVisibleToasts()[0].priority).toBe(8)

    store.remove(visible)

    expect(store.getVisibleToasts()[0]).toMatchObject({ id: queued, priority: 6 })
  })
})

describe("toast store reentrancy", () => {
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
    const first = store.create({ title: "First" })
    const second = store.create({ title: "Second" })

    store.subscribe((toast) => {
      if (toast.id === second && toast.paused && toast.title === "Second") {
        store.update(first, { title: "Nested" })
      }
    })

    const titles: string[] = []

    store.subscribe((toast) => titles.push(toast.title))
    store.pause()

    expect(titles).toEqual(["Second", "First", "Nested"])
  })

  test("duplicate registrations have independent idempotent cleanup", () => {
    const store = createToastStore()
    const notify = vi.fn()
    const unsubscribe = store.subscribe(notify)

    store.subscribe(notify)
    unsubscribe()
    unsubscribe()
    store.create({})

    expect(notify).toHaveBeenCalledTimes(1)
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

  test("manual updates to a pending toast still allow its promise to settle", async () => {
    const store = createToastStore<string>()
    let resolve!: (value: string) => void
    const result = store.promise(
      new Promise<string>((done) => {
        resolve = done
      }),
      {
        loading: { title: "Loading" },
        success: { title: "Done" },
      },
    )!
    store.update(result.id!, { description: "Progress" })

    resolve("done")
    await result.unwrap()

    expect(store.getVisibleToasts()[0]).toMatchObject({ title: "Done", description: "Progress", type: "success" })
  })
})

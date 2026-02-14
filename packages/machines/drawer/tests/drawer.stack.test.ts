import { describe, expect, test, vi } from "vitest"
import { createStack } from "../src/drawer.stack"

async function flushMicrotask() {
  await Promise.resolve()
}

describe("@zag-js/drawer stack", () => {
  test("tracks open state and count", async () => {
    const stack = createStack()
    stack.register("a")
    stack.setOpen("a", true)

    await flushMicrotask()

    expect(stack.getSnapshot()).toEqual({
      active: true,
      openCount: 1,
      swipeProgress: 0,
      frontmostHeight: 0,
    })
  })

  test("resolves frontmost height from latest open drawer", async () => {
    const stack = createStack()
    stack.register("a")
    stack.setOpen("a", true)
    stack.setHeight("a", 180)
    stack.register("b")
    stack.setOpen("b", true)
    stack.setHeight("b", 320)

    await flushMicrotask()

    expect(stack.getSnapshot().frontmostHeight).toBe(320)
  })

  test("uses frontmost swiping progress and clamps range", async () => {
    const stack = createStack()
    stack.register("a")
    stack.setOpen("a", true)
    stack.setHeight("a", 180)
    stack.setSwipe("a", true, 5)

    await flushMicrotask()
    expect(stack.getSnapshot().swipeProgress).toBe(1)

    stack.register("b")
    stack.setOpen("b", true)
    stack.setHeight("b", 320)
    stack.setSwipe("b", true, -1)

    await flushMicrotask()
    expect(stack.getSnapshot().swipeProgress).toBe(0)
  })

  test("batches notifications in the same tick", async () => {
    const stack = createStack()
    const listener = vi.fn()
    stack.subscribe(listener)

    stack.register("a")
    stack.setOpen("a", true)
    stack.setHeight("a", 200)
    stack.setSwipe("a", true, 0.4)

    expect(listener).toHaveBeenCalledTimes(0)

    await flushMicrotask()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(stack.getSnapshot()).toEqual({
      active: true,
      openCount: 1,
      swipeProgress: 0.4,
      frontmostHeight: 200,
    })
  })

  test("supports unsubscribe", async () => {
    const stack = createStack()
    const listener = vi.fn()
    const unsubscribe = stack.subscribe(listener)

    stack.register("a")
    stack.setOpen("a", true)
    await flushMicrotask()

    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    stack.setOpen("a", false)
    await flushMicrotask()

    expect(listener).toHaveBeenCalledTimes(1)
  })
})

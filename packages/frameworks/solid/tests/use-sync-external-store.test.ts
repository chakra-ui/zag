import { renderHook } from "@solidjs/testing-library"
import { createRoot, flush } from "solid-js"
import { useSyncExternalStore } from "../src/use-sync-external-store"

describe("useSyncExternalStore", () => {
  test("preserves function snapshots on the initial read", () => {
    const value = vi.fn(() => 42)
    let initial: unknown

    createRoot((dispose) => {
      const snapshot = useSyncExternalStore(
        () => () => {},
        () => value,
      )
      initial = snapshot()
      dispose()
    })

    expect(initial).toBe(value)
    expect(value).not.toHaveBeenCalled()
  })

  test("updates function snapshots and unsubscribes on disposal", () => {
    const initial = vi.fn(() => 1)
    const next = vi.fn(() => 2)
    let current = initial
    let notify = () => {}
    const unsubscribe = vi.fn()
    const { result, cleanup } = renderHook(() =>
      useSyncExternalStore(
        (listener) => {
          notify = listener
          return unsubscribe
        },
        () => current,
      ),
    )

    expect(result()).toBe(initial)

    current = next
    notify()
    flush()

    expect(result()).toBe(next)
    expect(initial).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()

    cleanup()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})

import { renderHook } from "@solidjs/testing-library"
import { createSignal, flush } from "solid-js"
import { createBindable } from "../src/bindable"

describe("bindable updates", () => {
  test("functional updates accumulate within a tick", () => {
    const { result } = renderHook(() => createBindable(() => ({ defaultValue: 0 })))

    result.set((prev) => prev + 1)
    result.set((prev) => prev + 1)
    result.set((prev) => prev + 1)
    flush()

    expect(result.get()).toBe(3)
  })

  test("functional updates see direct writes in the same tick", () => {
    const { result } = renderHook(() => createBindable(() => ({ defaultValue: 0 })))

    result.set(10)
    result.set((prev) => prev + 1)
    flush()

    expect(result.get()).toBe(11)
  })

  test("change callbacks receive the preceding value and skip unchanged writes", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => createBindable(() => ({ defaultValue: 0, onChange })))

    result.set(1)
    result.set(1)
    result.set((prev) => prev + 1)
    flush()

    expect(onChange.mock.calls).toEqual([
      [1, 0],
      [2, 1],
    ])
  })

  test("controlled updates read the parent's value once it has flushed", () => {
    const { result } = renderHook(() => {
      const [value, setValue] = createSignal(0)
      return createBindable(() => ({ value: value(), onChange: setValue }))
    })

    // Solid 2 applies the parent's write when the tick flushes, so both updates start from 0
    result.set((prev) => prev + 1)
    result.set((prev) => prev + 1)
    flush()
    expect(result.get()).toBe(1)

    result.set((prev) => prev + 1)
    flush()
    expect(result.get()).toBe(2)
  })

  test("controlled values stay unchanged until the parent accepts an update", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => createBindable(() => ({ value: 10, onChange })))

    result.set((prev) => prev + 1)
    result.set((prev) => prev + 1)
    flush()

    expect(result.get()).toBe(10)
    expect(onChange.mock.calls).toEqual([
      [11, 10],
      [11, 10],
    ])
  })
})

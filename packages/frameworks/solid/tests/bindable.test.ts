import { renderHook } from "@solidjs/testing-library"
import { createEffect, createSignal, flush } from "solid-js"
import { createBindable } from "../src/bindable"

describe("bindable updates", () => {
  test("refs update immediately for uncontrolled writes", () => {
    const { result } = renderHook(() => createBindable(() => ({ defaultValue: 0 })))

    result.set(1)
    expect(result.ref.current).toBe(1)

    result.set((prev) => prev + 1)
    expect(result.ref.current).toBe(2)

    flush()
    expect(result.ref.current).toBe(2)
  })

  test("refs follow controlled values and restore the uncontrolled value", () => {
    const [value, setValue] = createSignal<number | undefined>(undefined)
    const { result } = renderHook(() => createBindable(() => ({ value: value(), defaultValue: 1 })))

    result.set(2)
    expect(result.ref.current).toBe(2)

    setValue(10)
    flush()
    expect(result.ref.current).toBe(10)

    result.set(20)
    flush()
    expect(result.ref.current).toBe(10)

    setValue(undefined)
    flush()
    expect(result.ref.current).toBe(2)
    expect(result.get()).toBe(2)
  })

  test("unchanged writes do not notify reactive consumers", () => {
    const onRead = vi.fn()
    const { result } = renderHook(() => {
      const value = createBindable(() => ({ defaultValue: 1 }))
      createEffect(() => value.get(), onRead)
      return value
    })

    expect(onRead).toHaveBeenCalledOnce()

    result.set(1)
    flush()

    expect(onRead).toHaveBeenCalledOnce()
  })

  test("custom equality does not suppress reactive value updates", () => {
    const onRead = vi.fn()
    const onChange = vi.fn()
    const { result } = renderHook(() => {
      const value = createBindable(() => ({ defaultValue: 1, isEqual: () => true, onChange }))
      createEffect(() => value.get(), onRead)
      return value
    })

    result.set(2)
    flush()

    expect(result.get()).toBe(2)
    expect(onRead).toHaveBeenCalledTimes(2)
    expect(onChange).not.toHaveBeenCalled()
  })

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

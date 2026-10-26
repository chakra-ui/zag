import { createMachine } from "@zag-js/core"
import { VanillaMachine } from "../src/machine"
import { mergeMachineProps } from "../src/merge-machine-props"

const machine = createMachine<any>({
  initialState: () => "idle",
  states: { idle: {} },
  watch({ prop, track }) {
    track([() => prop("value")], () => {})
  },
})

describe("updateProps", () => {
  test("keeps partial props, merges nested objects, and ignores undefined updates", () => {
    const service = new VanillaMachine(machine, {
      id: "test",
      value: 1,
      translations: { clear: "Clear", close: "Close" },
      values: [1, 2],
    })
    service.updateProps({ value: undefined, translations: { clear: "Reset" }, values: [3] })

    expect(service.prop("id")).toBe("test")
    expect(service.prop("value")).toBe(1)
    expect(service.prop("translations")).toEqual({ clear: "Reset", close: "Close" })
    expect(service.prop("values")).toEqual([3])
  })

  test.each(["object", "getter"])("reads patches once with an initial %s source", (kind) => {
    const service = new VanillaMachine(machine, kind === "object" ? { value: -1 } : () => ({ value: -1 }))
    let reads = 0
    for (let i = 0; i < 1_000; i++) {
      service.updateProps({
        get value() {
          reads++
          return i
        },
      })
    }
    expect(reads).toBe(1_000)
    for (let i = 0; i < 100; i++) expect(service.prop("value")).toBe(999)
    expect(reads).toBe(1_000)
  })

  test("supports long-lived machines without growing the prop read stack", () => {
    const service = new VanillaMachine(machine, { value: -1 })
    service.start()
    for (let value = 0; value < 20_000; value++) service.updateProps({ value })
    expect(service.prop("value")).toBe(19_999)
    service.stop()
  })

  test("retains a live getter beneath accumulated object overrides", () => {
    let value = 1
    const service = new VanillaMachine(machine, () => ({
      id: "test",
      value,
      translations: { clear: `Clear ${value}`, close: `Close ${value}` },
    }))
    service.updateProps({ translations: { clear: "Reset" } })
    service.updateProps({ translations: { clear: undefined } })
    value = 2

    expect(service.prop("value")).toBe(2)
    expect(service.prop("translations")).toEqual({ clear: "Reset", close: "Close 2" })
  })

  test("keeps earlier getters live when a partial getter is added", () => {
    let oldValue = 1
    let nextValue = 10
    const previous = vi.fn(() => ({ id: "test", value: oldValue, retained: oldValue }))
    const service = new VanillaMachine(machine, previous)
    service.updateProps({ value: 2, translations: { clear: "Clear" } })
    service.updateProps(() => ({ value: nextValue, translations: { close: "Close" } }))
    previous.mockClear()
    oldValue = 3
    nextValue = 20

    expect(service.prop("id")).toBe("test")
    expect(service.prop("retained")).toBe(3)
    expect(service.prop("value")).toBe(20)
    expect(service.prop("translations")).toEqual({ clear: "Clear", close: "Close" })
    expect(previous).toHaveBeenCalled()

    service.updateProps({ value: 30 })
    nextValue = 40
    expect(service.prop("value")).toBe(30)
  })

  test("resolves long getter histories without growing the call stack", () => {
    const service = new VanillaMachine(machine, { id: "test", value: -1 })
    let reads = 0
    for (let value = 0; value < 20_000; value++) {
      service.updateProps(() => {
        reads++
        return { value }
      })
    }
    expect(service.prop("value")).toBe(19_999)
    expect(reads).toBe(20_000)
    expect(service.prop("id")).toBe("test")
  })

  test("coalesces object patches without moving them ahead of live getters", () => {
    let first = 1
    let second = 2
    const service = new VanillaMachine(machine, () => ({ value: first, retained: first }))
    for (let i = 0; i < 1_000; i++) service.updateProps({ value: 10, before: i })
    service.updateProps(() => ({ value: second, retained: undefined }))
    for (let i = 0; i < 1_000; i++) service.updateProps({ after: i })
    first = 3
    second = 4

    expect(service.prop("retained")).toBe(3)
    expect(service.prop("value")).toBe(4)
    expect(service.prop("before")).toBe(999)
    expect(service.prop("after")).toBe(999)
  })

  test("notifies watchers and subscribers when an empty patch signals changed getter values", () => {
    let value = 1
    const changed = vi.fn()
    const watched = createMachine<any>({
      initialState: () => "idle",
      states: { idle: {} },
      watch({ prop, track }) {
        track([() => prop("value")], changed)
      },
    })
    const service = new VanillaMachine(watched, () => ({ value }))
    service.start()
    const subscriber = vi.fn()
    service.subscribe(subscriber)
    value = 2
    service.updateProps({})
    service.updateProps({})

    expect(changed).toHaveBeenCalledOnce()
    expect(subscriber).toHaveBeenCalledTimes(2)
    service.stop()
  })
})

describe("mergeMachineProps", () => {
  test("reuses unchanged props and nested branches without mutating inputs", () => {
    const previous = { translations: { clear: "Clear", close: "Close" }, nested: { value: 1 } }
    expect(mergeMachineProps(previous, { translations: { ...previous.translations } })).toBe(previous)
    expect(mergeMachineProps<any>(previous, { nested: { value: undefined } })).toBe(previous)

    const next = mergeMachineProps(previous, { nested: { value: 2 } })
    expect(next).not.toBe(previous)
    expect(next.translations).toBe(previous.translations)
    expect(next.nested).toEqual({ value: 2 })
    expect(previous.nested).toEqual({ value: 1 })
  })
})

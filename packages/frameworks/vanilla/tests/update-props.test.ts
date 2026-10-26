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

  test("reads object patches once instead of replaying them on each prop read", () => {
    const service = new VanillaMachine(machine, { value: -1 })
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

  test("replaces a getter while retaining omitted props at their last resolved values", () => {
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
    expect(service.prop("retained")).toBe(1)
    expect(service.prop("value")).toBe(20)
    expect(service.prop("translations")).toEqual({ clear: "Clear", close: "Close" })
    expect(previous).not.toHaveBeenCalled()

    service.updateProps({ value: 30 })
    nextValue = 40
    expect(service.prop("value")).toBe(30)
  })

  test("evaluates only the current getter regardless of earlier function updates", () => {
    const service = new VanillaMachine(machine, { id: "test", value: -1 })
    let reads = 0
    service.start()
    for (let value = 0; value < 1_000; value++) {
      service.updateProps(() => {
        reads++
        return { value }
      })
    }
    reads = 0
    for (let i = 0; i < 100; i++) expect(service.prop("value")).toBe(999)
    expect(reads).toBe(100)
    expect(service.prop("id")).toBe("test")
    service.stop()
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

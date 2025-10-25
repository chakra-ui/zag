import { renderHook } from "@solidjs/testing-library"
import { createGuards, createMachine } from "@zag-js/core"
import type { Machine } from "@zag-js/core"
import { createSignal } from "solid-js"
import { useMachine } from "../src"

function renderMachine(machine: any, props?: any) {
  const render = renderHook(() => useMachine<any>(machine, props))
  const send = async (event: any) => {
    render.result.send(event)
    await Promise.resolve()
  }
  const advanceTime = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms)
  }
  return { ...render, send, advanceTime }
}

describe("basic", () => {
  test("initial state", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      states: {
        foo: {
          on: {
            NEXT: { target: "bar" },
          },
        },
        bar: {},
      },
    })

    const { result } = renderMachine(machine)
    await Promise.resolve()

    expect(result.state.get()).toBe("foo")
  })

  test("initial entry action", async () => {
    const fooEntry = vi.fn()
    const rootEntry = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      entry: ["rootEntry"],
      states: {
        foo: {
          entry: ["fooEntry"],
        },
      },
      implementations: {
        actions: {
          fooEntry,
          rootEntry,
        },
      },
    })

    renderMachine(machine)
    await Promise.resolve()

    expect(fooEntry).toHaveBeenCalledOnce()
    expect(rootEntry).toHaveBeenCalledOnce()
  })

  test("current state and context", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return { foo: bindable(() => ({ defaultValue: "bar" })) }
      },
      states: {
        test: {},
      },
    })

    const { result } = renderMachine(machine)
    await Promise.resolve()

    expect(result.state.get()).toEqual("test")
    expect(result.context.get("foo")).toEqual("bar")
  })

  test("send event", async () => {
    let done = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return { foo: bindable(() => ({ defaultValue: "bar" })) }
      },
      states: {
        test: {
          on: {
            CHANGE: { target: "success" },
          },
        },
        success: {
          entry: ["done"],
        },
      },
      implementations: {
        actions: {
          done,
        },
      },
    })

    const { send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "CHANGE" })
    expect(done).toHaveBeenCalledOnce()
  })

  test("state tags", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "green"
      },
      states: {
        green: {
          tags: ["go"],
          on: {
            TIMER: {
              target: "yellow",
            },
          },
        },
        yellow: {
          tags: ["go"],
          on: {
            TIMER: {
              target: "red",
            },
          },
        },
        red: {
          tags: ["stop"],
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.state.hasTag("go")).toBeTruthy()

    await send({ type: "TIMER" })
    expect(result.state.get()).toBe("yellow")
    expect(result.state.hasTag("go")).toBeTruthy()

    await send({ type: "TIMER" })
    expect(result.state.get()).toBe("red")
    expect(result.state.hasTag("go")).toBeFalsy()
  })

  test("action order", async () => {
    const order = new Set<string>()
    const call = (key: string) => () => order.add(key)
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          exit: ["exit1"],
          on: {
            NEXT: { target: "success", actions: ["nextActions"] },
          },
        },
        success: {
          entry: ["entry2"],
        },
      },
      implementations: {
        actions: {
          nextActions: call("transition"),
          exit1: call("exit1"),
          entry2: call("entry2"),
        },
      },
    })

    const { send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "NEXT" })
    expect([...order]).toEqual(["exit1", "transition", "entry2"])
  })

  test("computed", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          on: {
            UPDATE: {
              actions: ["setValue"],
            },
          },
        },
      },
      context({ bindable }) {
        return { value: bindable(() => ({ defaultValue: "bar" })) }
      },
      computed: {
        length: ({ context }) => context.get("value").length,
      },
      implementations: {
        actions: {
          setValue: ({ context }) => context.set("value", "hello"),
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.computed("length")).toEqual(3)

    await send({ type: "UPDATE" })
    expect(result.computed("length")).toEqual(5)
  })

  test("watch", async () => {
    const notify = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          on: {
            UPDATE: {
              actions: ["setValue"],
            },
          },
        },
      },
      context({ bindable }) {
        return { value: bindable(() => ({ defaultValue: "bar" })) }
      },
      watch({ track, context, action }) {
        track([() => context.get("value")], () => {
          action(["notify"])
        })
      },
      implementations: {
        actions: {
          setValue: ({ context }) => context.set("value", "hello"),
          notify,
        },
      },
    })

    const { send } = renderMachine(machine)

    // send update twice and expect notify to be called once (since the value is the same)
    await send({ type: "UPDATE" })
    await send({ type: "UPDATE" })
    expect(notify).toHaveBeenCalledOnce()
  })

  test("guard: basic", async () => {
    const machine = createMachine<any>({
      props() {
        return { max: 1 }
      },
      initialState() {
        return "test"
      },

      context({ bindable }) {
        return { count: bindable(() => ({ defaultValue: 0 })) }
      },

      states: {
        test: {
          on: {
            INCREMENT: {
              guard: "isBelowMax",
              actions: ["increment"],
            },
          },
        },
      },

      implementations: {
        guards: {
          isBelowMax: ({ prop, context }) => prop("max") > context.get("count"),
        },
        actions: {
          increment: ({ context }) => context.set("count", context.get("count") + 1),
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "INCREMENT" })
    expect(result.context.get("count")).toEqual(1)

    await send({ type: "INCREMENT" })
    expect(result.context.get("count")).toEqual(1)
  })

  test("guard: composition", async () => {
    const { and } = createGuards<any>()
    const machine = createMachine<any>({
      props() {
        return { max: 3, min: 1 }
      },
      initialState() {
        return "test"
      },

      context({ bindable }) {
        return { count: bindable(() => ({ defaultValue: 0 })) }
      },

      states: {
        test: {
          on: {
            INCREMENT: {
              guard: and("isBelowMax", "isAboveMin"),
              actions: ["increment"],
            },
            "COUNT.SET": {
              actions: ["setValue"],
            },
          },
        },
      },

      implementations: {
        guards: {
          isBelowMax: ({ prop, context }) => prop("max") > context.get("count"),
          isAboveMin: ({ prop, context }) => prop("min") < context.get("count"),
        },
        actions: {
          increment: ({ context }) => context.set("count", context.get("count") + 1),
          setValue: ({ context, event }) => context.set("count", event.value),
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "INCREMENT" })
    expect(result.context.get("count")).toEqual(0)

    await send({ type: "COUNT.SET", value: 2 })
    expect(result.context.get("count")).toEqual(2)

    await send({ type: "INCREMENT" })
    expect(result.context.get("count")).toEqual(3)
  })

  test("context: controlled", async () => {
    const machine = createMachine<any>({
      props() {
        return { value: "foo", defaultValue: "" }
      },
      initialState() {
        return "test"
      },

      context({ bindable, prop }) {
        return {
          value: bindable(() => ({
            defaultValue: prop("defaultValue"),
            value: prop("value"),
          })),
        }
      },

      states: {
        test: {
          on: {
            "VALUE.SET": {
              actions: ["setValue"],
            },
          },
        },
      },

      implementations: {
        actions: {
          setValue: ({ context, event }) => context.set("value", event.value),
        },
      },
    })

    const { result, send } = renderMachine(machine)

    await send({ type: "VALUE.SET", value: "next" })

    // since value is controlled, it should not change
    expect(result.context.get("value")).toEqual("foo")
  })

  test("effects", async () => {
    vi.useFakeTimers()

    const cleanup = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          effects: ["waitForMs"],
          on: {
            DONE: { target: "success" },
          },
        },
        success: {},
      },
      implementations: {
        effects: {
          waitForMs({ send }) {
            const id = setTimeout(() => {
              send({ type: "DONE" })
            }, 1000)
            return () => {
              cleanup()
              clearTimeout(id)
            }
          },
        },
      },
    })

    const { result, send, advanceTime } = renderMachine(machine)

    await send({ type: "START" })
    expect(result.state.get()).toEqual("test")

    await advanceTime(1000)
    expect(result.state.get()).toEqual("success")
    expect(cleanup).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })
})

describe("useMachine - transition actions", () => {
  it("should execute transition actions with correct event data", async () => {
    const capturedEvents: any[] = []

    const machine: Machine<any> = {
      id: "test",
      initial: "idle",
      initialState: () => "idle",
      states: {
        idle: {
          on: {
            START: {
              target: "active",
              actions: ["captureEvent"],
            },
          },
        },
        active: {
          on: {
            STOP: {
              target: "idle",
              actions: ["captureEvent"],
            },
          },
        },
      },
      implementations: {
        actions: {
          captureEvent(params: any) {
            capturedEvents.push(params.event)
          },
        },
      },
    } as any

    const { send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "START", value: "test-1" })
    await send({ type: "STOP", value: "test-2" })

    expect(capturedEvents).toHaveLength(2)
    expect(capturedEvents[0]).toMatchObject({ type: "START", value: "test-1" })
    expect(capturedEvents[1]).toMatchObject({ type: "STOP", value: "test-2" })
  })

  it("should preserve event data when multiple sends happen before state change", async () => {
    const capturedEvents: any[] = []

    const machine: Machine<any> = {
      id: "test",
      initial: "a",
      initialState: () => "a",
      states: {
        a: {
          on: {
            GO_B: {
              target: "b",
              actions: ["capture"],
            },
          },
        },
        b: {
          on: {
            GO_C: {
              target: "c",
              actions: ["capture"],
            },
          },
        },
        c: {},
      },
      implementations: {
        actions: {
          capture(params: any) {
            capturedEvents.push({ type: params.event.type, data: params.event.data })
          },
        },
      },
    } as any

    const { send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "GO_B", data: "first" })
    await send({ type: "GO_C", data: "second" })

    expect(capturedEvents[0]).toMatchObject({ type: "GO_B", data: "first" })
    expect(capturedEvents[1]).toMatchObject({ type: "GO_C", data: "second" })
  })

  it("should execute actions in correct order: exit -> transition -> enter", async () => {
    const executionOrder: string[] = []

    const machine: Machine<any> = {
      id: "test",
      initial: "state1",
      initialState: () => "state1",
      states: {
        state1: {
          exit: ["exitState1"],
          on: {
            TRANSITION: {
              target: "state2",
              actions: ["transitionAction"],
            },
          },
        },
        state2: {
          entry: ["enterState2"],
        },
      },
      implementations: {
        actions: {
          exitState1() {
            executionOrder.push("exit")
          },
          transitionAction() {
            executionOrder.push("transition")
          },
          enterState2() {
            executionOrder.push("enter")
          },
        },
      },
    } as any

    const { send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "TRANSITION" })

    expect(executionOrder).toEqual(["exit", "transition", "enter"])
  })
})

describe("edge cases", () => {
  test("reactive props with Solid signals", async () => {
    const [max, setMax] = createSignal(5)
    const actionSpy = vi.fn()

    const machine = createMachine<any>({
      props({ props }) {
        return { max: props.max }
      },
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return {
          count: bindable(() => ({ defaultValue: 0 })),
        }
      },
      states: {
        test: {
          on: {
            INCREMENT: {
              actions: ["increment"],
            },
            CHECK: {
              guard: ({ prop, context }: any) => context.get("count") < prop("max"),
              actions: ["allowAction"],
            },
          },
        },
      },
      implementations: {
        actions: {
          allowAction: actionSpy,
          increment: ({ context }) => context.set("count", context.get("count") + 1),
        },
      },
    })

    const { result } = renderHook(() => useMachine(machine, () => ({ max: max() })))
    await Promise.resolve()

    // Increment count to 3
    result.send({ type: "INCREMENT" })
    result.send({ type: "INCREMENT" })
    result.send({ type: "INCREMENT" })
    await Promise.resolve()

    // max is 5, count is 3, should allow action
    result.send({ type: "CHECK" })
    await Promise.resolve()
    expect(actionSpy).toHaveBeenCalledTimes(1)

    // Update signal to lower max to 3
    setMax(3)
    await Promise.resolve()

    // Now max is 3, count is 3, should NOT allow action
    result.send({ type: "CHECK" })
    await Promise.resolve()
    expect(actionSpy).toHaveBeenCalledTimes(1)

    // Update signal to increase max to 10
    setMax(10)
    await Promise.resolve()

    // Now max is 10, count is 3, should allow action
    result.send({ type: "CHECK" })
    await Promise.resolve()
    expect(actionSpy).toHaveBeenCalledTimes(2)
  })

  test("state.matches() helper", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            START: { target: "loading" },
          },
        },
        loading: {
          on: {
            SUCCESS: { target: "success" },
            ERROR: { target: "error" },
          },
        },
        success: {},
        error: {},
      },
    })

    const { result, send } = renderMachine(machine)

    expect(result.state.matches("idle")).toBe(true)
    expect(result.state.matches("idle", "loading")).toBe(true)
    expect(result.state.matches("loading", "success")).toBe(false)

    await send({ type: "START" })
    expect(result.state.matches("loading")).toBe(true)
    expect(result.state.matches("idle", "loading", "error")).toBe(true)

    await send({ type: "SUCCESS" })
    expect(result.state.matches("success", "error")).toBe(true)
    expect(result.state.matches("idle", "loading")).toBe(false)
  })

  test("same-state transitions with actions", async () => {
    const actionSpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      states: {
        active: {
          on: {
            PING: {
              target: "active",
              actions: ["onPing"],
            },
          },
        },
      },
      implementations: {
        actions: {
          onPing: actionSpy,
        },
      },
    })

    const { result, send } = renderMachine(machine)

    expect(result.state.get()).toBe("active")

    await send({ type: "PING" })
    expect(result.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(1)

    await send({ type: "PING" })
    expect(result.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(2)
  })

  test("cleanup on unmount", async () => {
    const exitSpy = vi.fn()
    const effectCleanupSpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "mounted"
      },
      exit: ["onMachineExit"],
      states: {
        mounted: {
          exit: ["onStateExit"],
          effects: ["mountEffect"],
        },
      },
      implementations: {
        actions: {
          onMachineExit: exitSpy,
          onStateExit: exitSpy,
        },
        effects: {
          mountEffect() {
            return effectCleanupSpy
          },
        },
      },
    })

    const { cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(exitSpy).not.toHaveBeenCalled()
    expect(effectCleanupSpy).not.toHaveBeenCalled()

    cleanup()

    expect(exitSpy).toHaveBeenCalled()
    expect(effectCleanupSpy).toHaveBeenCalledOnce()
  })

  test("event previous/current tracking", async () => {
    let capturedPrevious: any = null
    let capturedCurrent: any = null

    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          on: {
            FIRST: {
              target: "second",
            },
            SECOND: {
              actions: ["captureEvents"],
            },
          },
        },
        second: {
          on: {
            THIRD: {
              actions: ["captureEvents"],
            },
          },
        },
      },
      implementations: {
        actions: {
          captureEvents({ event }) {
            capturedPrevious = event.previous()
            capturedCurrent = event.current()
          },
        },
      },
    })

    const { send } = renderMachine(machine)

    await send({ type: "FIRST", data: "first-data" })
    await send({ type: "THIRD", data: "third-data" })

    expect(capturedCurrent).toMatchObject({ type: "THIRD", data: "third-data" })
    expect(capturedPrevious).toMatchObject({ type: "FIRST", data: "first-data" })
  })
})

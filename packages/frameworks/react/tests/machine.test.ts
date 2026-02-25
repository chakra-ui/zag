import { act, renderHook } from "@testing-library/react"
import { createGuards, createMachine } from "@zag-js/core"
import { useMachine } from "../src"

function renderMachine(machine: any) {
  const render = renderHook(() => useMachine<any>(machine))
  const send = async (event: any) => {
    await act(async () => render.result.current.send(event))
  }
  const advanceTime = async (ms: number) => {
    await act(async () => vi.advanceTimersByTime(ms))
  }
  return { ...render, send, advanceTime }
}

describe("basic", () => {
  test("initial state", () => {
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

    expect(result.current.state.get()).toBe("foo")
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

  test("current state and context", () => {
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

    expect(result.current.state.get()).toEqual("test")
    expect(result.current.context.get("foo")).toEqual("bar")
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

    expect(result.current.state.hasTag("go")).toBeTruthy()

    await send({ type: "TIMER" })
    expect(result.current.state.get()).toBe("yellow")
    expect(result.current.state.hasTag("go")).toBeTruthy()

    await send({ type: "TIMER" })
    expect(result.current.state.get()).toBe("red")
    expect(result.current.state.hasTag("go")).toBeFalsy()
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

    expect(result.current.computed("length")).toEqual(3)

    await send({ type: "UPDATE" })
    expect(result.current.computed("length")).toEqual(5)
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
    expect(result.current.context.get("count")).toEqual(1)

    await send({ type: "INCREMENT" })
    expect(result.current.context.get("count")).toEqual(1)
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

    await send({ type: "INCREMENT" })
    expect(result.current.context.get("count")).toEqual(0)

    await send({ type: "COUNT.SET", value: 2 })
    expect(result.current.context.get("count")).toEqual(2)

    await send({ type: "INCREMENT" })
    expect(result.current.context.get("count")).toEqual(3)
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
    expect(result.current.context.get("value")).toEqual("foo")
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
    expect(result.current.state.get()).toEqual("test")

    await advanceTime(1000)
    expect(result.current.state.get()).toEqual("success")
    expect(cleanup).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })
})

describe("edge cases", () => {
  test("reactive props updates", async () => {
    const actionSpy = vi.fn()

    const machine = createMachine<any>({
      props({ props }) {
        return { max: props.max || 0 }
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

    const { result } = renderHook(() => useMachine(machine, { max: 5 }))

    // Increment count to 3
    await act(async () => result.current.send({ type: "INCREMENT" }))
    await act(async () => result.current.send({ type: "INCREMENT" }))
    await act(async () => result.current.send({ type: "INCREMENT" }))

    // max is 5, count is 3, should allow action
    await act(async () => result.current.send({ type: "CHECK" }))
    expect(actionSpy).toHaveBeenCalledTimes(1)
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

    expect(result.current.state.matches("idle")).toBe(true)
    expect(result.current.state.matches("idle", "loading")).toBe(true)
    expect(result.current.state.matches("loading", "success")).toBe(false)

    await send({ type: "START" })
    expect(result.current.state.matches("loading")).toBe(true)
    expect(result.current.state.matches("idle", "loading", "error")).toBe(true)

    await send({ type: "SUCCESS" })
    expect(result.current.state.matches("success", "error")).toBe(true)
    expect(result.current.state.matches("idle", "loading")).toBe(false)
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

    expect(result.current.state.get()).toBe("active")

    await send({ type: "PING" })
    expect(result.current.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(1)

    await send({ type: "PING" })
    expect(result.current.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(2)
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

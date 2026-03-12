import { act, renderHook } from "@testing-library/react"
import { createGuards, createMachine } from "@zag-js/core"
import { useMachine } from "../src"
import { renderMachine } from "./render"

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

  test("reenter transition", async () => {
    const entryAction = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      states: {
        active: {
          entry: ["onEntry"],
          on: {
            REENTER: {
              target: "active",
              reenter: true,
            },
          },
        },
      },
      implementations: {
        actions: {
          onEntry: entryAction,
        },
      },
    })

    const { send } = renderMachine(machine)
    await Promise.resolve()

    expect(entryAction).toHaveBeenCalledTimes(1)

    await send({ type: "REENTER" })
    await Promise.resolve()

    // Entry should be called again due to reenter
    expect(entryAction).toHaveBeenCalledTimes(2)
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

  test("effect dependencies", async () => {
    const effectSpy = vi.fn()
    const cleanupSpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      context({ bindable }) {
        return {
          count: bindable(() => ({ defaultValue: 0 })),
        }
      },
      states: {
        active: {
          effects: [{ key: "syncCount", deps: ({ context }) => [context.get("count")] }],
          on: {
            INC: { actions: ["inc"] },
          },
        },
      },
      implementations: {
        actions: {
          inc: ({ context }) => context.set("count", (value) => value + 1),
        },
        effects: {
          syncCount: ({ context }) => {
            effectSpy(context.get("count"))
            return () => cleanupSpy(context.get("count"))
          },
        },
      },
    })

    const { send } = renderMachine(machine)
    await Promise.resolve()

    expect(effectSpy).toHaveBeenCalledTimes(1)
    expect(effectSpy).toHaveBeenLastCalledWith(0)

    await send({ type: "INC" })
    await Promise.resolve()

    expect(cleanupSpy).toHaveBeenCalledTimes(1)
    expect(effectSpy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenLastCalledWith(1)
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
    const entrySpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      states: {
        active: {
          entry: ["onEntry"],
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
          onEntry: entrySpy,
          onPing: actionSpy,
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.current.state.get()).toBe("active")
    expect(entrySpy).toHaveBeenCalledTimes(1)

    await send({ type: "PING" })
    expect(result.current.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(1)
    expect(entrySpy).toHaveBeenCalledTimes(1)

    await send({ type: "PING" })
    expect(result.current.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(2)
    expect(entrySpy).toHaveBeenCalledTimes(1)
  })

  test("reenter transition action order", async () => {
    const order: string[] = []

    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      states: {
        active: {
          entry: ["onEntry"],
          exit: ["onExit"],
          on: {
            REENTER: {
              target: "active",
              reenter: true,
              actions: ["onTransition"],
            },
          },
        },
      },
      implementations: {
        actions: {
          onEntry: () => order.push("entry"),
          onExit: () => order.push("exit"),
          onTransition: () => order.push("transition"),
        },
      },
    })

    const { send } = renderMachine(machine)
    await Promise.resolve()
    order.length = 0

    await send({ type: "REENTER" })
    await Promise.resolve()

    expect(order).toEqual(["exit", "transition", "entry"])
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

describe("uniform coverage", () => {
  test("root lifecycle runs entry, exit and effect cleanup", async () => {
    const rootEntry = vi.fn()
    const rootExit = vi.fn()
    const rootCleanup = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      entry: ["rootEntry"],
      exit: ["rootExit"],
      effects: ["rootEffect"],
      states: {
        idle: {},
      },
      implementations: {
        actions: {
          rootEntry,
          rootExit,
        },
        effects: {
          rootEffect: () => rootCleanup,
        },
      },
    })

    const { unmount } = renderMachine(machine)
    await Promise.resolve()

    expect(rootEntry).toHaveBeenCalledOnce()
    expect(rootExit).not.toHaveBeenCalled()
    expect(rootCleanup).not.toHaveBeenCalled()

    await act(async () => unmount())
    await Promise.resolve()
    expect(rootExit).toHaveBeenCalledOnce()
    expect(rootCleanup).toHaveBeenCalledOnce()
  })

  test("internal transition without target runs actions without reentry", async () => {
    const onEntry = vi.fn()
    const onInternal = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      states: {
        active: {
          entry: ["onEntry"],
          on: {
            INTERNAL: {
              actions: ["onInternal"],
            },
          },
        },
      },
      implementations: {
        actions: {
          onEntry,
          onInternal,
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.current.state.get()).toBe("active")
    expect(onEntry).toHaveBeenCalledOnce()

    await send({ type: "INTERNAL" })

    expect(result.current.state.get()).toBe("active")
    expect(onInternal).toHaveBeenCalledOnce()
    expect(onEntry).toHaveBeenCalledOnce()
  })

  test("guard fallback selects the next passing transition", async () => {
    const blocked = vi.fn()
    const allowed = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            NEXT: [
              { guard: "allowBlocked", target: "blocked", actions: ["onBlocked"] },
              { target: "allowed", actions: ["onAllowed"] },
            ],
          },
        },
        blocked: {},
        allowed: {},
      },
      implementations: {
        guards: {
          allowBlocked: () => false,
        },
        actions: {
          onBlocked: blocked,
          onAllowed: allowed,
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await send({ type: "NEXT" })

    expect(result.current.state.get()).toBe("allowed")
    expect(allowed).toHaveBeenCalledOnce()
    expect(blocked).not.toHaveBeenCalled()
  })

  test("reenter transition works without explicit target", async () => {
    const order: string[] = []

    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      states: {
        active: {
          entry: ["onEntry"],
          exit: ["onExit"],
          on: {
            REENTER: {
              reenter: true,
              actions: ["onTransition"],
            },
          },
        },
      },
      implementations: {
        actions: {
          onEntry: () => order.push("entry"),
          onExit: () => order.push("exit"),
          onTransition: () => order.push("transition"),
        },
      },
    })

    const { send } = renderMachine(machine)
    await Promise.resolve()
    order.length = 0

    await send({ type: "REENTER" })
    expect(order).toEqual(["exit", "transition", "entry"])
  })

  test("unknown events are no-ops", async () => {
    const actionSpy = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            KNOWN: { target: "done", actions: ["onKnown"] },
          },
        },
        done: {},
      },
      implementations: {
        actions: {
          onKnown: actionSpy,
        },
      },
    })

    const { result, send } = renderMachine(machine)

    await send({ type: "UNKNOWN" })
    expect(result.current.state.get()).toBe("idle")
    expect(actionSpy).not.toHaveBeenCalled()

    await send({ type: "KNOWN" })
    expect(result.current.state.get()).toBe("done")
    expect(actionSpy).toHaveBeenCalledOnce()
  })

  test("effect setup and cleanup stay balanced during state churn", async () => {
    const setupSpy = vi.fn()
    const cleanupSpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "on"
      },
      states: {
        on: {
          effects: ["trackOn"],
          on: {
            TOGGLE: { target: "off" },
          },
        },
        off: {
          on: {
            TOGGLE: { target: "on" },
          },
        },
      },
      implementations: {
        effects: {
          trackOn() {
            setupSpy()
            return () => cleanupSpy()
          },
        },
      },
    })

    const { send, unmount } = renderMachine(machine)
    await Promise.resolve()

    for (let i = 0; i < 6; i++) {
      await send({ type: "TOGGLE" })
    }

    await act(async () => unmount())
    await Promise.resolve()

    expect(setupSpy.mock.calls.length).toBeGreaterThan(0)
    expect(cleanupSpy).toHaveBeenCalledTimes(setupSpy.mock.calls.length)
  })

  test("reenter restarts state effects exactly once per reenter", async () => {
    const setupSpy = vi.fn()
    const cleanupSpy = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "active"
      },
      states: {
        active: {
          effects: ["trackEffect"],
          on: {
            REENTER: {
              target: "active",
              reenter: true,
            },
          },
        },
      },
      implementations: {
        effects: {
          trackEffect() {
            setupSpy()
            return () => cleanupSpy()
          },
        },
      },
    })

    const { send, unmount } = renderMachine(machine)
    await Promise.resolve()

    expect(setupSpy).toHaveBeenCalledTimes(1)
    expect(cleanupSpy).not.toHaveBeenCalled()

    await send({ type: "REENTER" })
    expect(setupSpy).toHaveBeenCalledTimes(2)
    expect(cleanupSpy).toHaveBeenCalledTimes(1)

    await send({ type: "REENTER" })
    expect(setupSpy).toHaveBeenCalledTimes(3)
    expect(cleanupSpy).toHaveBeenCalledTimes(2)

    await act(async () => unmount())
    await Promise.resolve()
    expect(cleanupSpy).toHaveBeenCalledTimes(3)
  })

  test("event baseline before first send", async () => {
    let currentType = "unset"
    let previousEvent: any = "unset"

    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      entry: ["capture"],
      states: {
        idle: {},
      },
      implementations: {
        actions: {
          capture({ event }) {
            currentType = event.current().type
            previousEvent = event.previous()
          },
        },
      },
    })

    renderMachine(machine)
    await Promise.resolve()

    expect(currentType).toBe("")
    expect(previousEvent == null || previousEvent.type === "").toBe(true)
  })

  test("multi-action transition order is deterministic", async () => {
    const order: string[] = []

    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          exit: ["onExit"],
          on: {
            NEXT: { target: "done", actions: ["a1", "a2", "a3"] },
          },
        },
        done: {
          entry: ["onEntry"],
        },
      },
      implementations: {
        actions: {
          onExit: () => order.push("exit"),
          a1: () => order.push("a1"),
          a2: () => order.push("a2"),
          a3: () => order.push("a3"),
          onEntry: () => order.push("entry"),
        },
      },
    })

    const { send } = renderMachine(machine)
    await send({ type: "NEXT" })

    expect(order).toEqual(["exit", "a1", "a2", "a3", "entry"])
  })

  test("all guards false results in no transition and no actions", async () => {
    const actionSpy = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            NEXT: [
              { guard: "g1", target: "blocked1", actions: ["onAttempt"] },
              { guard: "g2", target: "blocked2", actions: ["onAttempt"] },
            ],
          },
        },
        blocked1: {},
        blocked2: {},
      },
      implementations: {
        guards: {
          g1: () => false,
          g2: () => false,
        },
        actions: {
          onAttempt: actionSpy,
        },
      },
    })

    const { result, send } = renderMachine(machine)
    await send({ type: "NEXT" })

    expect(result.current.state.get()).toBe("idle")
    expect(actionSpy).not.toHaveBeenCalled()
  })

  test("rapid sends in same tick are processed deterministically", async () => {
    const seen: string[] = []
    const machine = createMachine<any>({
      initialState() {
        return "a"
      },
      states: {
        a: {
          on: {
            GO_B: { target: "b", actions: ["record"] },
          },
        },
        b: {
          on: {
            GO_C: { target: "c", actions: ["record"] },
          },
        },
        c: {},
      },
      implementations: {
        actions: {
          record({ event }) {
            seen.push(event.type)
          },
        },
      },
    })

    const { result } = renderMachine(machine)
    await Promise.resolve()

    await act(async () => {
      result.current.send({ type: "GO_B" })
      result.current.send({ type: "GO_C" })
    })
    await Promise.resolve()
    await Promise.resolve()

    expect(result.current.state.get()).toBe("c")
    expect(seen).toEqual(["GO_B", "GO_C"])
  })
})

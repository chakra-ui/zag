import { createGuards, createMachine } from "@zag-js/core"
import { act } from "@testing-library/preact"
import { renderMachine } from "./render"

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

    const { result, cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(result.current.state.get()).toBe("foo")
    await cleanup()
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

    const { cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(fooEntry).toHaveBeenCalledOnce()
    expect(rootEntry).toHaveBeenCalledOnce()
    await cleanup()
  })

  test("state transition", async () => {
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

    const { result, send, cleanup } = renderMachine(machine)
    await send({ type: "NEXT" })
    expect(result.current.state.get()).toBe("bar")
    await cleanup()
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

    const { send, cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(entryAction).toHaveBeenCalledTimes(1)

    await send({ type: "REENTER" })
    await Promise.resolve()

    expect(entryAction).toHaveBeenCalledTimes(2)
    await cleanup()
  })

  test("guarded transition", async () => {
    const guards = createGuards<any>()
    const machine = createMachine<any>({
      context({ bindable }) {
        return {
          canGo: bindable(() => ({ defaultValue: false })),
        }
      },
      initialState() {
        return "foo"
      },
      states: {
        foo: {
          on: {
            NEXT: [{ guard: guards.and("canGo"), target: "bar" }, { target: "foo" }],
          },
        },
        bar: {},
      },
      implementations: {
        guards: {
          canGo: ({ context }) => context.get("canGo"),
        },
      },
    })

    const { result, send, cleanup } = renderMachine(machine)

    await send({ type: "NEXT" })
    expect(result.current.state.get()).toBe("foo")

    result.current.context.set("canGo", true)
    await send({ type: "NEXT" })
    expect(result.current.state.get()).toBe("bar")
    await cleanup()
  })
})

describe("edge cases", () => {
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

    const { result, send, cleanup } = renderMachine(machine)

    expect(result.current.state.matches("idle")).toBe(true)
    expect(result.current.state.matches("idle", "loading")).toBe(true)
    expect(result.current.state.matches("loading", "success")).toBe(false)

    await send({ type: "START" })
    expect(result.current.state.matches("loading")).toBe(true)

    await send({ type: "SUCCESS" })
    expect(result.current.state.matches("success", "error")).toBe(true)
    await cleanup()
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

    const { send, cleanup } = renderMachine(machine)
    await send({ type: "FIRST", data: "first-data" })
    await send({ type: "THIRD", data: "third-data" })

    expect(capturedCurrent).toMatchObject({ type: "THIRD", data: "third-data" })
    expect(capturedPrevious).toMatchObject({ type: "FIRST", data: "first-data" })
    await cleanup()
  })

  test("same-state transition does not reenter by default", async () => {
    const entryAction = vi.fn()
    const transitionAction = vi.fn()

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
              actions: ["onTransition"],
            },
          },
        },
      },
      implementations: {
        actions: {
          onEntry: entryAction,
          onTransition: transitionAction,
        },
      },
    })

    const { send, cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(entryAction).toHaveBeenCalledTimes(1)

    await send({ type: "PING" })

    expect(transitionAction).toHaveBeenCalledTimes(1)
    expect(entryAction).toHaveBeenCalledTimes(1)
    await cleanup()
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

    const { send, cleanup } = renderMachine(machine)
    await Promise.resolve()
    order.length = 0

    await send({ type: "REENTER" })

    expect(order).toEqual(["exit", "transition", "entry"])
    await cleanup()
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

    const { cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(rootEntry).toHaveBeenCalledOnce()
    expect(rootExit).not.toHaveBeenCalled()
    expect(rootCleanup).not.toHaveBeenCalled()

    await cleanup()
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

    const { result, send, cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(result.current.state.get()).toBe("active")
    expect(onEntry).toHaveBeenCalledOnce()

    await send({ type: "INTERNAL" })

    expect(result.current.state.get()).toBe("active")
    expect(onInternal).toHaveBeenCalledOnce()
    expect(onEntry).toHaveBeenCalledOnce()
    await cleanup()
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

    const { result, send, cleanup } = renderMachine(machine)
    await send({ type: "NEXT" })

    expect(result.current.state.get()).toBe("allowed")
    expect(allowed).toHaveBeenCalledOnce()
    expect(blocked).not.toHaveBeenCalled()
    await cleanup()
  })

  test("ignores events sent after cleanup", async () => {
    const actionSpy = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            NEXT: {
              target: "done",
              actions: ["onNext"],
            },
          },
        },
        done: {},
      },
      implementations: {
        actions: {
          onNext: actionSpy,
        },
      },
    })

    const { result, cleanup } = renderMachine(machine)
    const service = result.current
    await cleanup()

    service.send({ type: "NEXT" })
    await Promise.resolve()

    expect(service.state.get()).toBe("idle")
    expect(actionSpy).not.toHaveBeenCalled()
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

    const { send, cleanup } = renderMachine(machine)
    await Promise.resolve()
    order.length = 0

    await send({ type: "REENTER" })
    expect(order).toEqual(["exit", "transition", "entry"])
    await cleanup()
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

    const { result, send, cleanup } = renderMachine(machine)

    await send({ type: "UNKNOWN" })
    expect(result.current.state.get()).toBe("idle")
    expect(actionSpy).not.toHaveBeenCalled()

    await send({ type: "KNOWN" })
    expect(result.current.state.get()).toBe("done")
    expect(actionSpy).toHaveBeenCalledOnce()
    await cleanup()
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

    const { send, cleanup } = renderMachine(machine)
    await Promise.resolve()

    for (let i = 0; i < 6; i++) {
      await send({ type: "TOGGLE" })
    }
    await cleanup()

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

    const { send, cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(setupSpy).toHaveBeenCalledTimes(1)
    expect(cleanupSpy).not.toHaveBeenCalled()

    await send({ type: "REENTER" })
    expect(setupSpy).toHaveBeenCalledTimes(2)
    expect(cleanupSpy).toHaveBeenCalledTimes(1)

    await send({ type: "REENTER" })
    expect(setupSpy).toHaveBeenCalledTimes(3)
    expect(cleanupSpy).toHaveBeenCalledTimes(2)

    await cleanup()
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

    const { cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(currentType).toBe("")
    expect(previousEvent == null || previousEvent.type === "").toBe(true)
    await cleanup()
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

    const { send, cleanup } = renderMachine(machine)
    await send({ type: "NEXT" })

    expect(order).toEqual(["exit", "a1", "a2", "a3", "entry"])
    await cleanup()
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

    const { result, send, cleanup } = renderMachine(machine)
    await send({ type: "NEXT" })

    expect(result.current.state.get()).toBe("idle")
    expect(actionSpy).not.toHaveBeenCalled()
    await cleanup()
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

    const { result, cleanup } = renderMachine(machine)
    await Promise.resolve()

    await act(async () => {
      result.current.send({ type: "GO_B" })
      result.current.send({ type: "GO_C" })
    })
    await Promise.resolve()
    await Promise.resolve()

    expect(result.current.state.get()).toBe("c")
    expect(seen).toEqual(["GO_B", "GO_C"])
    await cleanup()
  })
})

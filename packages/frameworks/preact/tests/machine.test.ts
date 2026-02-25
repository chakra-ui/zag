import { createGuards, createMachine } from "@zag-js/core"
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
})

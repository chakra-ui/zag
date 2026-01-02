import { createGuards, createMachine } from "@zag-js/core"
import { VanillaMachine } from "../src"

async function tick() {
  await Promise.resolve()
  await Promise.resolve()
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

    const service = new VanillaMachine(machine)
    service.start()

    expect(service.state.get()).toBe("foo")

    service.stop()
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(fooEntry).toHaveBeenCalledOnce()
    expect(rootEntry).toHaveBeenCalledOnce()

    service.stop()
  })

  test("current state and context", () => {
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return {
          foo: bindable(() => ({ defaultValue: "bar" })),
        }
      },
      states: {
        test: {},
      },
    })

    const service = new VanillaMachine(machine)
    service.start()

    expect(service.state.get()).toEqual("test")
    expect(service.context.get("foo")).toEqual("bar")

    service.stop()
  })

  test("send event", async () => {
    const done = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return {
          foo: bindable(() => ({ defaultValue: "bar" })),
        }
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.send({ type: "CHANGE" })
    await tick()

    expect(done).toHaveBeenCalledOnce()

    service.stop()
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.service.state.hasTag("go")).toBeTruthy()

    service.send({ type: "TIMER" })
    await tick()

    expect(service.state.get()).toBe("yellow")
    expect(service.service.state.hasTag("go")).toBeTruthy()

    service.send({ type: "TIMER" })
    await tick()

    expect(service.state.get()).toBe("red")
    expect(service.service.state.hasTag("go")).toBeFalsy()

    service.stop()
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.send({ type: "NEXT" })
    await tick()

    expect([...order]).toEqual(["exit1", "transition", "entry2"])

    service.stop()
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.computed("length")).toEqual(3)

    service.send({ type: "UPDATE" })
    await tick()

    expect(service.computed("length")).toEqual(5)

    service.stop()
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.send({ type: "UPDATE" })
    await tick()

    service.send({ type: "UPDATE" })
    await tick()

    // notify should be called once since value doesn't change on second update
    expect(notify).toHaveBeenCalledOnce()

    service.stop()
  })
})

describe("lifecycle", () => {
  test("start and stop", async () => {
    const entry = vi.fn()
    const exit = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      entry: ["entry"],
      exit: ["exit"],
      states: {
        test: {},
      },
      implementations: {
        actions: {
          entry,
          exit,
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(entry).toHaveBeenCalledOnce()

    service.stop()

    expect(exit).toHaveBeenCalledOnce()
  })

  test("subscribe returns unsubscribe function", async () => {
    const subscriber = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          on: {
            NEXT: { target: "done" },
          },
        },
        done: {},
      },
    })

    const service = new VanillaMachine(machine)
    const unsubscribe = service.subscribe(subscriber)
    service.start()
    await tick()

    service.send({ type: "NEXT" })
    await tick()

    const callCount = subscriber.mock.calls.length
    expect(callCount).toBeGreaterThan(0)

    unsubscribe()

    service.send({ type: "NEXT" })
    await tick()

    // Call count should not increase after unsubscribe
    expect(subscriber.mock.calls.length).toBe(callCount)

    service.stop()
  })

  test("stop clears subscriptions", async () => {
    const subscriber = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: { START: { target: "running" } },
        },
        running: {
          on: { STOP: { target: "idle" } },
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.subscribe(subscriber)
    service.start()
    await tick()

    service.stop()

    const callCountAfterStop = subscriber.mock.calls.length

    // After stop, sending events should not trigger subscribers
    service.send({ type: "START" })
    await tick()

    expect(subscriber.mock.calls.length).toBe(callCountAfterStop)
  })
})

describe("guards", () => {
  test("basic guard", async () => {
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.send({ type: "INCREMENT" })
    await tick()
    expect(service.context.get("count")).toEqual(1)

    service.send({ type: "INCREMENT" })
    await tick()
    expect(service.context.get("count")).toEqual(1) // Guard blocks second increment

    service.stop()
  })

  test("guard composition", async () => {
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.send({ type: "INCREMENT" })
    await tick()
    expect(service.context.get("count")).toEqual(0) // Both guards must pass

    service.send({ type: "COUNT.SET", value: 2 })
    await tick()
    expect(service.context.get("count")).toEqual(2)

    service.send({ type: "INCREMENT" })
    await tick()
    expect(service.context.get("count")).toEqual(3)

    service.stop()
  })
})

describe("effects", () => {
  test("effect cleanup on state exit", async () => {
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.state.get()).toEqual("test")

    vi.advanceTimersByTime(1000)
    await tick()

    expect(service.state.get()).toEqual("success")
    expect(cleanup).toHaveBeenCalledOnce()

    service.stop()
    vi.useRealTimers()
  })

  test("root effects", async () => {
    const rootEffectCleanup = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      effects: ["rootEffect"],
      states: {
        test: {},
      },
      implementations: {
        effects: {
          rootEffect() {
            return rootEffectCleanup
          },
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.stop()

    expect(rootEffectCleanup).toHaveBeenCalledOnce()
  })
})

describe("edge cases", () => {
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.state.get()).toBe("active")

    service.send({ type: "PING" })
    await tick()
    expect(service.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(1)

    service.send({ type: "PING" })
    await tick()
    expect(service.state.get()).toBe("active")
    expect(actionSpy).toHaveBeenCalledTimes(2)

    service.stop()
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.send({ type: "FIRST", data: "first-data" })
    await tick()

    service.send({ type: "THIRD", data: "third-data" })
    await tick()

    expect(capturedCurrent).toMatchObject({ type: "THIRD", data: "third-data" })
    expect(capturedPrevious).toMatchObject({ type: "FIRST", data: "first-data" })

    service.stop()
  })

  test("state.matches helper", async () => {
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.service.state.matches("idle")).toBe(true)
    expect(service.service.state.matches("idle", "loading")).toBe(true)
    expect(service.service.state.matches("loading", "success")).toBe(false)

    service.send({ type: "START" })
    await tick()

    expect(service.service.state.matches("loading")).toBe(true)
    expect(service.service.state.matches("idle", "loading", "error")).toBe(true)

    service.send({ type: "SUCCESS" })
    await tick()

    expect(service.service.state.matches("success", "error")).toBe(true)
    expect(service.service.state.matches("idle", "loading")).toBe(false)

    service.stop()
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(entryAction).toHaveBeenCalledTimes(1)

    service.send({ type: "REENTER" })
    await tick()

    // Entry should be called again due to reenter
    expect(entryAction).toHaveBeenCalledTimes(2)

    service.stop()
  })

  test("context controlled mode", async () => {
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

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    service.send({ type: "VALUE.SET", value: "next" })
    await tick()

    // Since value is controlled, it should not change
    expect(service.context.get("value")).toEqual("foo")

    service.stop()
  })
})

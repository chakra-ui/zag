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

    const { result, cleanup } = renderMachine(machine)
    await Promise.resolve()

    expect(result.current.state.get()).toEqual("test")
    expect(result.current.context.get("foo")).toEqual("bar")
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

  test("transition action", async () => {
    const onNext = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      states: {
        foo: {
          on: {
            NEXT: { target: "bar", actions: ["onNext"] },
          },
        },
        bar: {},
      },
      implementations: {
        actions: {
          onNext,
        },
      },
    })

    const { send, cleanup } = renderMachine(machine)
    await send({ type: "NEXT" })
    expect(onNext).toHaveBeenCalledOnce()
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

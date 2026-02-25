import { createGuards, createMachine } from "@zag-js/core"
import { computed, nextTick, ref } from "vue"
import { renderMachine } from "./render"

describe("basic", () => {
  test("initial state", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      states: {
        foo: {
          on: { NEXT: { target: "bar" } },
        },
        bar: {},
      },
    })

    const { result, cleanup } = renderMachine(machine)
    await Promise.resolve()
    expect(result.current.state.get()).toBe("foo")
    cleanup()
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
    cleanup()
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
    expect(result.current.state.get()).toBe("test")
    expect(result.current.context.get("foo")).toBe("bar")
    cleanup()
  })

  test("state transition", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      states: {
        foo: {
          on: { NEXT: { target: "bar" } },
        },
        bar: {},
      },
    })

    const { result, send, cleanup } = renderMachine(machine)
    await send({ type: "NEXT" })
    expect(result.current.state.get()).toBe("bar")
    cleanup()
  })

  test("transition action", async () => {
    const onNext = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      states: {
        foo: {
          on: { NEXT: { target: "bar", actions: ["onNext"] } },
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
    cleanup()
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
    cleanup()
  })

  test("resolves reactive props", async () => {
    const max = ref(5)
    const machine = createMachine<any>({
      context({ bindable, prop }) {
        return {
          value: bindable(() => ({ defaultValue: 0 })),
          max: bindable(() => ({ defaultValue: prop("max") })),
        }
      },
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            INCREMENT: { actions: ["inc"] },
          },
        },
      },
      implementations: {
        actions: {
          inc({ context, prop }) {
            const cap = prop("max") ?? Number.POSITIVE_INFINITY
            const next = Math.min(context.get("value") + 1, cap)
            context.set("value", next)
          },
        },
      },
    })

    const props = computed(() => ({ max: max.value }))
    const { result, send, cleanup } = renderMachine(machine, props)

    await send({ type: "INCREMENT" })
    await send({ type: "INCREMENT" })
    expect(result.current.context.get("value")).toBe(2)

    max.value = 1
    await nextTick()
    await send({ type: "INCREMENT" })
    expect(result.current.context.get("value")).toBe(1)
    cleanup()
  })
})

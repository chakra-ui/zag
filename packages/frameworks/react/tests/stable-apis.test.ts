import { act, renderHook } from "@testing-library/react"
import { createMachine } from "@zag-js/core"
import { useEffect } from "react"
import { useMachine } from "../src"
import { renderMachine } from "./render"

describe("stable service APIs", () => {
  test("command APIs keep the same identity across rerenders", async () => {
    const machine = createMachine<any>({
      props({ props }) {
        return { step: 1, ...props }
      },
      initialState() {
        return "idle"
      },
      context({ bindable }) {
        return { count: bindable(() => ({ defaultValue: 0 })) }
      },
      computed: {
        next: ({ context, prop }) => context.get("count") + prop("step"),
      },
      refs() {
        return { last: null as string | null }
      },
      states: {
        idle: {
          on: {
            INC: { actions: ["inc"] },
          },
        },
      },
      implementations: {
        actions: {
          inc({ context, prop, refs }) {
            context.set("count", context.get("count") + prop("step"))
            refs.set("last", "inc")
          },
        },
      },
    })

    const { result, rerender, send } = renderMachine(machine, { step: 1 })
    await Promise.resolve()

    const first = result.current
    rerender()
    const second = result.current

    expect(second.send).toBe(first.send)
    expect(second.prop).toBe(first.prop)
    expect(second.context).toBe(first.context)
    expect(second.computed).toBe(first.computed)
    expect(second.refs).toBe(first.refs)
    expect(second.getStatus).toBe(first.getStatus)

    await send({ type: "INC" })
    expect(result.current.context.get("count")).toBe(1)
    expect(result.current.computed("next")).toBe(2)
    expect(result.current.refs.get("last")).toBe("inc")
  })

  test("stable send keeps working after prop-driven guard changes", async () => {
    const machine = createMachine<any>({
      props({ props }) {
        return { locked: false, ...props }
      },
      initialState() {
        return "off"
      },
      states: {
        off: {
          on: {
            TOGGLE: { target: "on", guard: "isUnlocked" },
          },
        },
        on: {
          on: {
            TOGGLE: { target: "off" },
          },
        },
      },
      implementations: {
        guards: {
          isUnlocked: ({ prop }) => !prop("locked"),
        },
      },
    })

    const { result, rerender } = renderHook(({ locked }: { locked: boolean }) => useMachine(machine, { locked }), {
      initialProps: { locked: false },
    })
    await Promise.resolve()

    const send = result.current.send
    await act(async () => send({ type: "TOGGLE" }))
    expect(result.current.state.get()).toBe("on")

    rerender({ locked: true })
    expect(result.current.send).toBe(send)

    await act(async () => send({ type: "TOGGLE" }))
    expect(result.current.state.get()).toBe("off")

    await act(async () => send({ type: "TOGGLE" }))
    expect(result.current.state.get()).toBe("off")
  })

  test("useEffect depending on send runs once across rerenders", async () => {
    const ping = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            PING: { actions: ["ping"] },
          },
        },
      },
      implementations: {
        actions: {
          ping,
        },
      },
    })

    const effectSpy = vi.fn()

    const { rerender } = renderHook(() => {
      const service = useMachine(machine)

      useEffect(() => {
        effectSpy()
        service.send({ type: "PING" })
      }, [service.send])

      return service
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(effectSpy).toHaveBeenCalledTimes(1)
    expect(ping).toHaveBeenCalledTimes(1)

    rerender()

    await act(async () => {
      await Promise.resolve()
    })

    expect(effectSpy).toHaveBeenCalledTimes(1)
    expect(ping).toHaveBeenCalledTimes(1)
  })
})

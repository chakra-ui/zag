import { act } from "@testing-library/react"
import { createMachine } from "@zag-js/core"
import { flush, renderMachine } from "./render"

describe("bindable", () => {
  test("reads see a value set earlier in the same task", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      context({ bindable }) {
        return { count: bindable(() => ({ defaultValue: 0 })) }
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
          inc({ context }) {
            context.set("count", context.get("count") + 1)
          },
        },
      },
    })

    const { result } = renderMachine(machine)
    await flush()

    // e.g. several `transitionend` events dispatched before a render
    await act(async () => {
      result.current.send({ type: "INC" })
      result.current.send({ type: "INC" })
      result.current.send({ type: "INC" })
    })

    expect(result.current.context.get("count")).toBe(3)
  })
})

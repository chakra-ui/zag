import { renderHook } from "@solidjs/testing-library"
import { createMachine } from "@zag-js/core"
import { createEffect } from "solid-js"
import { useMachine } from "../src/machine"
import { flush } from "./render"

describe("machine startup", () => {
  test("processes events queued immediately after mounting", async () => {
    const machine = createMachine<any>({
      initialState: () => "idle",
      states: { idle: { on: { NEXT: { target: "done" } } }, done: {} },
    })
    const { result } = renderHook(() => useMachine(machine))

    result.send({ type: "NEXT" })
    await flush()

    expect(result.state.get()).toBe("done")
  })

  test("entry actions can flush reactive updates", async () => {
    let rendered = 0
    let observed = 0
    const machine = createMachine<any>({
      initialState: () => "idle",
      context: ({ bindable }) => ({ value: bindable(() => ({ defaultValue: 0 })) }),
      entry: ["initialize"],
      states: { idle: {} },
      implementations: {
        actions: {
          initialize({ context, flush }) {
            flush(() => context.set("value", 1))
            observed = rendered
          },
        },
      },
    })

    renderHook(() => {
      const service = useMachine(machine)
      createEffect(
        () => service.context.get("value"),
        (value) => {
          rendered = value
        },
      )
    })
    await flush()

    expect(rendered).toBe(1)
    expect(observed).toBe(1)
  })

  test("disposal cancels queued startup", async () => {
    const initialize = vi.fn()
    const machine = createMachine<any>({
      initialState: () => "idle",
      entry: ["initialize"],
      states: { idle: {} },
      implementations: { actions: { initialize } },
    })
    const { cleanup } = renderHook(() => useMachine(machine))

    cleanup()
    await flush()

    expect(initialize).not.toHaveBeenCalled()
  })
})

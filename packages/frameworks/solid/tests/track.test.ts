import { renderHook } from "@solidjs/testing-library"
import { createMachine } from "@zag-js/core"
import { createEffect, createSignal } from "solid-js"
import { useMachine } from "../src"

function createWatchedMachine(onChange: VoidFunction) {
  return createMachine<any>({
    initialState() {
      return "idle"
    },
    states: { idle: {} },
    watch({ track, prop }) {
      track([() => prop("value")], onChange)
    },
  })
}

function renderFixture(machine: any, next: boolean) {
  return renderHook(() => {
    const [value, setValue] = createSignal(false)
    // An earlier sibling's effect writes the prop before the machine's watch first runs.
    createEffect(() => setValue(next))
    return useMachine<any>(machine, () => ({ value: value() }))
  })
}

describe("track", () => {
  test("notifies a prop change made before the watch's first run", async () => {
    const onChange = vi.fn()
    const { cleanup } = renderFixture(createWatchedMachine(onChange), true)
    await Promise.resolve()

    expect(onChange).toHaveBeenCalledOnce()
    cleanup()
  })

  test("does not notify when the prop is unchanged at the first run", async () => {
    const onChange = vi.fn()
    const { cleanup } = renderFixture(createWatchedMachine(onChange), false)
    await Promise.resolve()

    expect(onChange).not.toHaveBeenCalled()
    cleanup()
  })
})

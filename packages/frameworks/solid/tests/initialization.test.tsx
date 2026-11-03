import { render } from "@solidjs/testing-library"
import { createMachine } from "@zag-js/core"
import { useMachine } from "../src/machine"

test("captures initial props without untracked-read diagnostics", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const machine = createMachine<any>({
    initialState: ({ prop }) => (prop("enabled") ? "active" : "idle"),
    context({ prop, bindable }) {
      const initial = prop("defaultValue")
      return { value: bindable(() => ({ defaultValue: initial, value: prop("value") })) }
    },
    refs: ({ prop }) => ({ initialId: prop("id") }),
    states: { idle: {}, active: {} },
  })
  function Example() {
    const service = useMachine(machine, { id: "example", defaultValue: 1, enabled: true })
    return <button>{service.context.get("value")}</button>
  }

  let cleanup: (() => void) | undefined
  try {
    const view = render(() => <Example />)
    cleanup = view.unmount

    expect(view.getByRole("button").textContent).toBe("1")
    expect(warn).not.toHaveBeenCalled()
  } finally {
    cleanup?.()
    warn.mockRestore()
  }
})

import { render } from "@testing-library/react"
import { createMachine } from "@zag-js/core"
import { StrictMode } from "react"
import { useMachine } from "../src"
import { flush } from "./render"

function createTrackedMachine() {
  const setup = vi.fn()
  const cleanup = vi.fn()
  const machine = createMachine<any>({
    initialState() {
      return "open"
    },
    states: {
      open: { effects: ["lock"] },
    },
    implementations: {
      effects: {
        lock() {
          setup()
          return cleanup
        },
      },
    },
  })
  return { machine, setup, cleanup }
}

function Rig({ machine }: { machine: any }) {
  useMachine<any>(machine)
  return null
}

describe("unmount before start", () => {
  test("does not start a machine whose component unmounted before it started", async () => {
    const { machine, setup, cleanup } = createTrackedMachine()

    const { unmount } = render(<Rig machine={machine} />)
    unmount()
    await flush()

    expect(setup.mock.calls.length).toBe(cleanup.mock.calls.length)
  })

  test("does not start under strict mode either when unmounted before it started", async () => {
    const { machine, setup, cleanup } = createTrackedMachine()

    const { unmount } = render(
      <StrictMode>
        <Rig machine={machine} />
      </StrictMode>,
    )
    unmount()
    await flush()

    expect(setup.mock.calls.length).toBe(cleanup.mock.calls.length)
  })
})

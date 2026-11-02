import { render } from "@testing-library/react"
import { createMachine, type Machine } from "@zag-js/core"
import { Activity } from "react"
import { useMachine } from "../src"

const watchMachine = (notify: (open: boolean) => void) =>
  createMachine<any>({
    props({ props }) {
      return { open: false, ...props }
    },
    initialState() {
      return "idle"
    },
    states: {
      idle: {},
    },
    watch({ track, prop, action }) {
      track([() => prop("open")], () => {
        action(["notify"])
      })
    },
    implementations: {
      actions: {
        notify: ({ prop }) => notify(prop("open")),
      },
    },
  })

function TestRig({ machine, open }: { machine: Machine<any>; open: boolean }) {
  useMachine<any>(machine, { open })
  return null
}

function renderInActivity(machine: Machine<any>) {
  const utils = render(
    <Activity mode="visible">
      <TestRig machine={machine} open={false} />
    </Activity>,
  )
  const update = (mode: "visible" | "hidden", open: boolean) =>
    utils.rerender(
      <Activity mode={mode}>
        <TestRig machine={machine} open={open} />
      </Activity>,
    )
  return { ...utils, update }
}

describe("React Activity", () => {
  test("a prop changed while hidden is tracked once the Activity is visible again", () => {
    // Hiding an Activity disconnects effects; the first run after reconnecting must see the change
    const notify = vi.fn()
    const { update } = renderInActivity(watchMachine(notify))

    update("hidden", false)
    update("hidden", true)
    expect(notify).not.toHaveBeenCalled()

    update("visible", true)
    expect(notify).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledWith(true)
  })

  test("showing the Activity again without a prop change does not run track", () => {
    const notify = vi.fn()
    const { update } = renderInActivity(watchMachine(notify))

    update("hidden", false)
    update("visible", false)

    expect(notify).not.toHaveBeenCalled()
  })

  test("a prop changed while visible is tracked once", () => {
    const notify = vi.fn()
    const { update } = renderInActivity(watchMachine(notify))

    update("visible", true)
    update("visible", true)

    expect(notify).toHaveBeenCalledOnce()
  })
})

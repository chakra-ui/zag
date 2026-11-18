import { render } from "@testing-library/react"
import { createMachine, type MachineRecord, subscribeMachines } from "@zag-js/core"
import { StrictMode } from "react"
import { useMachine } from "../src"
import { flush } from "./render"

const machine = createMachine<any>({
  initialState() {
    return "idle"
  },
  states: {
    idle: { on: { GO: { target: "busy" } } },
    busy: {},
  },
})

function Rig() {
  useMachine<any>(machine, { id: "rig" })
  return null
}

function listen() {
  const live = new Set<MachineRecord>()
  const events: boolean[] = []
  const stop = subscribeMachines((record, mounted) => {
    events.push(mounted)
    if (mounted) live.add(record)
    else live.delete(record)
  })
  return { live, events, stop }
}

describe("reporting machines to listeners", () => {
  test("reports a machine once it starts, and again when it unmounts", async () => {
    const { live, events, stop } = listen()

    const { unmount } = render(<Rig />)
    expect(events).toEqual([])
    await flush()
    expect(live.size).toBe(1)
    const [record] = live
    expect(record.machine).toBe(machine)
    expect(record.service.scope.id).toBe("rig")

    unmount()
    expect(live.size).toBe(0)
    stop()
  })

  test("the record reads the latest service", async () => {
    const { live, stop } = listen()
    const { unmount } = render(<Rig />)
    await flush()

    const [record] = live
    record.service.send({ type: "GO" })
    await flush()
    expect(record.service.state.get()).toBe("busy")

    unmount()
    stop()
  })

  test("leaves one live record under strict mode", async () => {
    const { live, stop } = listen()
    const { unmount } = render(
      <StrictMode>
        <Rig />
      </StrictMode>,
    )
    await flush()
    expect(live.size).toBe(1)

    unmount()
    expect(live.size).toBe(0)
    stop()
  })

  test("reports nothing for a machine unmounted before it started", async () => {
    const { events, stop } = listen()
    const { unmount } = render(<Rig />)
    unmount()
    await flush()
    expect(events).toEqual([])
    stop()
  })
})

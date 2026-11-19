import { createMachine, type MachineRecord, subscribeMachines } from "@zag-js/core"
import { flush, renderMachine } from "./render"

const machine = createMachine<any>({
  initialState() {
    return "idle"
  },
  states: {
    idle: { on: { GO: { target: "busy" } } },
    busy: {},
  },
})

describe("reporting machines to listeners", () => {
  test("reports a machine once it starts and again when it unmounts, with a live service", async () => {
    const live = new Set<MachineRecord>()
    const stop = subscribeMachines((record, mounted) => {
      if (mounted) live.add(record)
      else live.delete(record)
    })

    const result = renderMachine(machine, { id: "rig" })
    await flush()
    expect(live.size).toBe(1)
    const [record] = live
    expect(record.machine).toBe(machine)
    expect(record.service.scope.id).toBe("rig")

    record.service.send({ type: "GO" })
    await flush()
    expect(record.service.state.get()).toBe("busy")

    result.cleanup()
    expect(live.size).toBe(0)
    stop()
  })
})

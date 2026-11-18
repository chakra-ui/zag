import { createMachine, type MachineRecord, subscribeMachines } from "@zag-js/core"
import { VanillaMachine } from "../src"

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
  test("reports a machine while it runs, with a live service", async () => {
    const live = new Set<MachineRecord>()
    const stop = subscribeMachines((record, mounted) => {
      if (mounted) live.add(record)
      else live.delete(record)
    })

    const instance = new VanillaMachine(machine, { id: "rig" })
    expect(live.size).toBe(0)
    instance.start()
    expect(live.size).toBe(1)
    const [record] = live
    expect(record.machine).toBe(machine)
    expect(record.service.scope.id).toBe("rig")

    record.service.send({ type: "GO" })
    await Promise.resolve()
    expect(record.service.state.get()).toBe("busy")

    instance.stop()
    expect(live.size).toBe(0)
    stop()
  })

  test("a machine stopped before it started reports nothing", () => {
    const heard: boolean[] = []
    const stop = subscribeMachines((_, mounted) => heard.push(mounted))
    new VanillaMachine(machine).stop()
    expect(heard).toEqual([])
    stop()
  })
})

import { describe, expect, test } from "vitest"
import { type MachineRecord, reportMachine, subscribeMachines } from "../src"

const record = { machine: {}, service: {} } as unknown as MachineRecord

describe("subscribeMachines", () => {
  test("hears machines that mount and unmount until it stops", () => {
    const heard: [MachineRecord, boolean][] = []
    const stop = subscribeMachines((machine, mounted) => heard.push([machine, mounted]))

    reportMachine(record, true)
    reportMachine(record, false)
    stop()
    reportMachine(record, true)

    expect(heard).toEqual([
      [record, true],
      [record, false],
    ])
  })

  test("tells every listener", () => {
    const first: boolean[] = []
    const second: boolean[] = []
    const stopFirst = subscribeMachines((_, mounted) => first.push(mounted))
    const stopSecond = subscribeMachines((_, mounted) => second.push(mounted))

    reportMachine(record, true)
    stopFirst()
    stopSecond()

    expect(first).toEqual([true])
    expect(second).toEqual([true])
  })

  test("reporting with no listener does nothing", () => {
    expect(() => reportMachine(record, true)).not.toThrow()
  })
})

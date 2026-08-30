import { createMachine } from "@zag-js/core"
import { VanillaMachine } from "../src"

function gatedMachine(log: string[]) {
  return createMachine<any>({
    props: ({ props }) => ({ enabled: true, other: 0, ...props }),
    initialState: () => "open",
    states: {
      open: { entry: ["onEnter"], effects: ["gated"], on: { CLOSE: { target: "closed" } } },
      closed: {},
    },
    implementations: {
      actions: { onEnter: () => log.push("entry") },
      effects: {
        gated: ({ prop, watchEffect }: any) => {
          log.push("body")
          return watchEffect([() => prop("enabled")], () => {
            if (!prop("enabled")) return
            log.push("setup")
            return () => log.push("cleanup")
          })
        },
      },
    },
  })
}

describe("vanilla: watchEffect", () => {
  test("restarts when a dep changes, without re-running entry or the body", () => {
    const log: string[] = []
    const machine = new VanillaMachine(gatedMachine(log), { enabled: true })
    machine.start()
    expect(log.filter((l) => l === "setup")).toHaveLength(1)

    machine.updateProps({ enabled: false })
    expect(log.filter((l) => l === "cleanup")).toHaveLength(1)
    expect(log.filter((l) => l === "setup")).toHaveLength(1)

    machine.updateProps({ enabled: true })
    expect(log.filter((l) => l === "setup")).toHaveLength(2)
    expect(log.filter((l) => l === "entry")).toHaveLength(1)
    expect(log.filter((l) => l === "body")).toHaveLength(1)

    machine.stop()
  })

  test("does not restart when an unrelated prop changes", () => {
    const log: string[] = []
    const machine = new VanillaMachine(gatedMachine(log), { enabled: true, other: 0 })
    machine.start()

    machine.updateProps({ enabled: true, other: 1 })
    machine.updateProps({ enabled: true, other: 2 })
    expect(log.filter((l) => l === "setup")).toHaveLength(1)

    machine.stop()
  })

  test("cleans up once on stop, after restarts", () => {
    const log: string[] = []
    const machine = new VanillaMachine(gatedMachine(log), { enabled: true })
    machine.start()
    machine.updateProps({ enabled: false })
    machine.updateProps({ enabled: true })

    const before = log.filter((l) => l === "cleanup").length
    machine.stop()
    expect(log.filter((l) => l === "cleanup")).toHaveLength(before + 1)
  })
})

describe("vanilla: teardown reason", () => {
  function reasonMachine(reasons: string[]) {
    return createMachine<any>({
      props: ({ props }) => ({ v: 0, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"], on: { CLOSE: { target: "closed" } } }, closed: {} },
      implementations: {
        effects: {
          gated: ({ prop, watchEffect }: any) =>
            watchEffect([() => prop("v")], () => (reason: string) => reasons.push(reason)),
        },
      },
    })
  }

  test("a dep change tears down with 'restart'", () => {
    const reasons: string[] = []
    const machine = new VanillaMachine(reasonMachine(reasons), { v: 0 })
    machine.start()

    machine.updateProps({ v: 1 })
    expect(reasons).toEqual(["restart"])

    machine.updateProps({ v: 2 })
    expect(reasons).toEqual(["restart", "restart"])
    machine.stop()
  })

  test("stop tears down with 'exit'", () => {
    const reasons: string[] = []
    const machine = new VanillaMachine(reasonMachine(reasons), { v: 0 })
    machine.start()
    machine.updateProps({ v: 1 })
    machine.stop()

    expect(reasons).toEqual(["restart", "exit"])
  })
})

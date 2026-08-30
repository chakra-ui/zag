import { act, render } from "@testing-library/react"
import { createMachine, type Machine } from "@zag-js/core"
import { StrictMode, useState } from "react"
import { flushSync } from "react-dom"
import { useMachine } from "../src"
import { flush } from "./render"

let ctl: { send: (e: any) => void; setProps: (p: any) => void } = null as any

function Rig({ machine, initial }: { machine: Machine<any>; initial: any }) {
  const [props, setProps] = useState(initial)
  const service = useMachine<any>(machine, props)
  ctl = { send: service.send, setProps }
  return null
}

function renderStrict(machine: Machine<any>, initial: any = {}) {
  const view = render(
    <StrictMode>
      <Rig machine={machine} initial={initial} />
    </StrictMode>,
  )
  return {
    ...view,
    async setProps(p: any) {
      await act(async () => ctl.setProps(p))
      await flush()
    },
    async send(e: any) {
      await act(async () => ctl.send(e))
      await flush()
    },
  }
}

function gated(log: string[], label: string) {
  return ({ prop, watchEffect }: any) =>
    watchEffect([() => prop("enabled")], () => {
      if (!prop("enabled")) return
      log.push(`${label}:setup`)
      return () => log.push(`${label}:cleanup`)
    })
}

describe("Strict Mode", () => {
  test("nested states: every level gets one record per mount pass, and all restart together", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: {
        open: {
          effects: ["outer"],
          initial: "inner",
          states: { inner: { effects: ["inner"] } },
          on: { CLOSE: { target: "closed" } },
        },
        closed: {},
      },
      implementations: {
        effects: { outer: gated(log, "outer"), inner: gated(log, "inner") },
      },
    })

    const view = renderStrict(machine, { enabled: true })
    await flush()

    expect(log.filter((l) => l === "outer:setup")).toHaveLength(2)
    expect(log.filter((l) => l === "inner:setup")).toHaveLength(2)
    expect(log.filter((l) => l.endsWith(":cleanup"))).toHaveLength(0)

    log.length = 0
    await view.setProps({ enabled: false })
    expect(log.filter((l) => l === "outer:cleanup")).toHaveLength(2)
    expect(log.filter((l) => l === "inner:cleanup")).toHaveLength(2)
    expect(log.filter((l) => l.endsWith(":setup"))).toHaveLength(0)

    log.length = 0
    await view.setProps({ enabled: true })
    expect(log.filter((l) => l === "outer:setup")).toHaveLength(2)
    expect(log.filter((l) => l === "inner:setup")).toHaveLength(2)

    log.length = 0
    await view.send({ type: "CLOSE" })
    expect(log.filter((l) => l === "outer:cleanup")).toHaveLength(2)
    expect(log.filter((l) => l === "inner:cleanup")).toHaveLength(2)
  })

  test("an effect gated off at mount still starts on both records when turned on", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: false, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"] } },
      implementations: { effects: { gated: gated(log, "g") } },
    })

    const view = renderStrict(machine, { enabled: false })
    await flush()
    expect(log).toEqual([])

    await view.setProps({ enabled: true })
    expect(log.filter((l) => l === "g:setup")).toHaveLength(2)

    await view.unmount()
    await flush()
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(2)
  })

  test("setup and cleanup stay balanced across repeated on/off cycles", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"] } },
      implementations: { effects: { gated: gated(log, "g") } },
    })

    const view = renderStrict(machine, { enabled: true })
    await flush()

    for (let i = 0; i < 5; i++) {
      await view.setProps({ enabled: false })
      await view.setProps({ enabled: true })
    }

    const setups = log.filter((l) => l === "g:setup").length
    const cleanups = log.filter((l) => l === "g:cleanup").length
    // 2 records × (1 initial + 5 restarts)
    expect(setups).toBe(12)
    expect(cleanups).toBe(10)

    await view.unmount()
    await flush()
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(12)
  })

  test("a transition after mount does not orphan the double-mounted records", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "a",
      states: {
        a: { effects: ["gated"], on: { GO: { target: "b" } } },
        b: { effects: ["gated"], on: { GO: { target: "a" } } },
      },
      implementations: { effects: { gated: gated(log, "g") } },
    })

    const view = renderStrict(machine, { enabled: true })
    await flush()
    expect(log.filter((l) => l === "g:setup")).toHaveLength(2)

    log.length = 0
    await view.send({ type: "GO" })
    // both `a` records clean up; `b` starts one (single mount pass now)
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(2)
    expect(log.filter((l) => l === "g:setup")).toHaveLength(1)

    log.length = 0
    await view.setProps({ enabled: false })
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(1)
  })

  test("unmounting while a restart is pending runs no orphan setup", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"] } },
      implementations: { effects: { gated: gated(log, "g") } },
    })

    const view = renderStrict(machine, { enabled: true })
    await flush()
    expect(log.filter((l) => l === "g:setup")).toHaveLength(2)

    await act(async () => {
      // queue a restart, then tear the tree down before it drains
      flushSync(() => ctl.setProps({ enabled: false }))
      view.unmount()
    })
    await flush()

    const setups = log.filter((l) => l === "g:setup").length
    const cleanups = log.filter((l) => l === "g:cleanup").length
    expect(setups).toBe(2)
    expect(cleanups).toBe(2) // balanced; the pending restart was dropped
  })

  test("machine.effects at the root behave the same under the double mount", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "idle",
      effects: ["gated"],
      states: { idle: {} },
      implementations: { effects: { gated: gated(log, "root") } },
    })

    const view = renderStrict(machine, { enabled: true })
    await flush()
    expect(log.filter((l) => l === "root:setup")).toHaveLength(2)

    await view.setProps({ enabled: false })
    expect(log.filter((l) => l === "root:cleanup")).toHaveLength(2)

    await view.setProps({ enabled: true })
    expect(log.filter((l) => l === "root:setup")).toHaveLength(4)

    await view.unmount()
    await flush()
    expect(log.filter((l) => l === "root:cleanup")).toHaveLength(4)
  })
})

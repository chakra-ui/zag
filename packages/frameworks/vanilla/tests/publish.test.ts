import { createMachine } from "@zag-js/core"
import { VanillaMachine } from "../src/machine"

const tick = () => new Promise((resolve) => setTimeout(resolve))

const machine = createMachine<any>({
  initialState: () => "idle",
  context: ({ bindable }: any) => ({
    a: bindable(() => ({ defaultValue: 0 })),
    b: bindable(() => ({ defaultValue: 0 })),
    c: bindable(() => ({ defaultValue: 0 })),
  }),
  states: {
    idle: {
      on: {
        BUMP: { actions: ["bump"] },
        NOOP: { actions: ["noop"] },
      },
    },
  },
  implementations: {
    actions: {
      bump: ({ context }: any) => {
        context.set("a", 1)
        context.set("b", 1)
        context.set("c", 1)
      },
      noop: ({ context }: any) => {
        context.set("a", context.get("a"))
      },
    },
  },
} as any)

describe("publish", () => {
  test("publishes once when one event changes several values", async () => {
    const service = new VanillaMachine(machine, { id: "test" })
    service.start()
    await tick()

    const listener = vi.fn()
    service.subscribe(listener)
    service.send({ type: "BUMP" })
    await tick()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(service.context.get("c")).toBe(1)
  })

  test("does not publish when a value is set to itself", async () => {
    const service = new VanillaMachine(machine, { id: "test" })
    service.start()
    await tick()

    const listener = vi.fn()
    service.subscribe(listener)
    service.send({ type: "NOOP" })
    await tick()

    expect(listener).not.toHaveBeenCalled()
  })

  test("does not publish after stop", async () => {
    const service = new VanillaMachine(machine, { id: "test" })
    service.start()
    await tick()

    const listener = vi.fn()
    service.subscribe(listener)
    service.context.set("a", 5)
    service.stop()
    await tick()

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("subclassing", () => {
  test("lifecycle methods can be overridden and call super", async () => {
    const calls: string[] = []
    class Tracked extends VanillaMachine<any> {
      start() {
        calls.push("start")
        super.start()
      }
      stop() {
        calls.push("stop")
        super.stop()
      }
      updateProps(props: any) {
        calls.push("updateProps")
        super.updateProps(props)
      }
    }

    const service = new Tracked(machine, { id: "test" })
    service.start()
    service.updateProps({ id: "test" })
    await tick()
    service.send({ type: "BUMP" })
    await tick()
    service.stop()

    expect(calls).toEqual(["start", "updateProps", "stop"])
    expect(service.context.get("a")).toBe(1)
  })
})

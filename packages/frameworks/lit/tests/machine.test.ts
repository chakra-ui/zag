// TODO: These tests were AI generated and need review
// - Fix TypeScript issues
// - Verify test correctness and expectations
// - Ensure tests match real Lit component lifecycle

import { createMachine } from "@zag-js/core"
import { MachineController } from "../src"

// Mock LitElement for testing
class MockLitElement {
  updateRequested = 0
  controllers: any[] = []

  requestUpdate() {
    this.updateRequested++
  }

  addController(controller: any) {
    this.controllers.push(controller)
  }

  removeController(controller: any) {
    const index = this.controllers.indexOf(controller)
    if (index >= 0) {
      this.controllers.splice(index, 1)
    }
  }
}

function renderMachine(machine: any, props: any = {}) {
  const host = new MockLitElement()
  const controller = new MachineController(host as any, machine, () => props)

  // Simulate hostConnected
  controller.hostConnected()

  const send = async (event: any) => {
    controller.service.send(event)
    await Promise.resolve()
  }

  const { service } = controller

  return { controller, host, send, service }
}

describe("LitMachine", () => {
  test("initial state", () => {
    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      states: {
        foo: {
          on: {
            NEXT: { target: "bar" },
          },
        },
        bar: {},
      },
    })

    const { service } = renderMachine(machine)

    expect(service.state.get()).toBe("foo")
  })

  test("initial entry action", async () => {
    const fooEntry = vi.fn()
    const rootEntry = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "foo"
      },
      entry: ["rootEntry"],
      states: {
        foo: {
          entry: ["fooEntry"],
        },
      },
      implementations: {
        actions: {
          fooEntry,
          rootEntry,
        },
      },
    })

    renderMachine(machine)
    await Promise.resolve()

    expect(fooEntry).toHaveBeenCalledOnce()
    expect(rootEntry).toHaveBeenCalledOnce()
  })

  test("current state and context", () => {
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return { foo: bindable(() => ({ defaultValue: "bar" })) }
      },
      states: {
        test: {},
      },
    })

    const { service } = renderMachine(machine)

    expect(service.state.get()).toEqual("test")
    expect(service.context.get("foo")).toEqual("bar")
  })

  test("send event", async () => {
    let done = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return { foo: bindable(() => ({ defaultValue: "bar" })) }
      },
      states: {
        test: {
          on: {
            CHANGE: { target: "success" },
          },
        },
        success: {
          entry: ["done"],
        },
      },
      implementations: {
        actions: {
          done,
        },
      },
    })

    const { send } = renderMachine(machine)
    await Promise.resolve()

    await send({ type: "CHANGE" })
    expect(done).toHaveBeenCalledOnce()
  })

  test("state tags", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "green"
      },
      states: {
        green: {
          tags: ["go"],
          on: {
            TIMER: {
              target: "yellow",
            },
          },
        },
        yellow: {
          tags: ["go"],
          on: {
            TIMER: {
              target: "red",
            },
          },
        },
        red: {
          tags: ["stop"],
        },
      },
    })

    const { service, send } = renderMachine(machine)
    await Promise.resolve()

    expect(service.state.hasTag("go")).toBeTruthy()

    await send({ type: "TIMER" })
    expect(service.state.get()).toBe("yellow")
    expect(service.state.hasTag("go")).toBeTruthy()

    await send({ type: "TIMER" })
    expect(service.state.get()).toBe("red")
    expect(service.state.hasTag("go")).toBeFalsy()
  })

  test("computed", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          on: {
            UPDATE: {
              actions: ["setValue"],
            },
          },
        },
      },
      context({ bindable }) {
        return { value: bindable(() => ({ defaultValue: "bar" })) }
      },
      computed: {
        length: ({ context }) => context.get("value").length,
      },
      implementations: {
        actions: {
          setValue: ({ context }) => context.set("value", "hello"),
        },
      },
    })

    const { service, send } = renderMachine(machine)
    await Promise.resolve()

    expect(service.computed("length")).toEqual(3)

    await send({ type: "UPDATE" })
    expect(service.computed("length")).toEqual(5)
  })

  test("watch", async () => {
    const notify = vi.fn()
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {
          on: {
            UPDATE: {
              actions: ["setValue"],
            },
          },
        },
      },
      context({ bindable }) {
        return { value: bindable(() => ({ defaultValue: "bar" })) }
      },
      watch({ track, context, action }) {
        track([() => context.get("value")], () => {
          action(["notify"])
        })
      },
      implementations: {
        actions: {
          setValue: ({ context }) => context.set("value", "hello"),
          notify,
        },
      },
    })

    const { send } = renderMachine(machine)

    // send update twice and expect notify to be called once (since the value is the same)
    await send({ type: "UPDATE" })
    await send({ type: "UPDATE" })
    expect(notify).toHaveBeenCalledOnce()
  })

  test("guard: basic", async () => {
    const machine = createMachine<any>({
      props() {
        return { max: 1 }
      },
      initialState() {
        return "test"
      },

      context({ bindable }) {
        return { count: bindable(() => ({ defaultValue: 0 })) }
      },

      states: {
        test: {
          on: {
            INCREMENT: {
              guard: "isBelowMax",
              actions: ["increment"],
            },
          },
        },
      },

      implementations: {
        guards: {
          isBelowMax: ({ prop, context }) => prop("max") > context.get("count"),
        },
        actions: {
          increment: ({ context }) => context.set("count", context.get("count") + 1),
        },
      },
    })

    const { service, send } = renderMachine(machine, { max: 1 })
    await Promise.resolve()

    await send({ type: "INCREMENT" })
    expect(service.context.get("count")).toEqual(1)

    await send({ type: "INCREMENT" })
    expect(service.context.get("count")).toEqual(1)
  })

  test("context: controlled", async () => {
    const machine = createMachine<any>({
      props() {
        return { value: "foo", defaultValue: "" }
      },
      initialState() {
        return "test"
      },

      context({ bindable, prop }) {
        return {
          value: bindable(() => ({
            defaultValue: prop("defaultValue"),
            value: prop("value"),
          })),
        }
      },

      states: {
        test: {
          on: {
            "VALUE.SET": {
              actions: ["setValue"],
            },
          },
        },
      },

      implementations: {
        actions: {
          setValue: ({ context, event }) => context.set("value", event.value),
        },
      },
    })

    const { service, send } = renderMachine(machine, { value: "foo", defaultValue: "" })

    await send({ type: "VALUE.SET", value: "next" })

    // since value is controlled, it should not change
    expect(service.context.get("value")).toEqual("foo")
  })
})

describe("MachineController", () => {
  test("triggers host.requestUpdate on state changes", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {
          on: {
            START: { target: "active" },
          },
        },
        active: {},
      },
    })

    const { host, send } = renderMachine(machine)

    // Initial update from machine start
    expect(host.updateRequested).toBeGreaterThan(0)
    const initialUpdates = host.updateRequested

    await send({ type: "START" })

    // Should have triggered additional update
    expect(host.updateRequested).toBeGreaterThan(initialUpdates)
  })

  test("provides service API", () => {
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      context({ bindable }) {
        return { value: bindable(() => ({ defaultValue: "initial" })) }
      },
      states: {
        test: {},
      },
    })

    const { service } = renderMachine(machine)

    // Check all service API properties are available
    expect(service.state).toBeDefined()
    expect(service.send).toBeDefined()
    expect(service.context).toBeDefined()
    expect(service.prop).toBeDefined()
    expect(service.scope).toBeDefined()
    expect(service.refs).toBeDefined()
    expect(service.computed).toBeDefined()
    expect(service.event).toBeDefined()
  })

  test("cleanup on hostDisconnected", () => {
    const machine = createMachine<any>({
      initialState() {
        return "test"
      },
      states: {
        test: {},
      },
    })

    const host = new MockLitElement()
    const controller = new MachineController(host as any, machine, () => ({}))

    controller.hostConnected()
    expect(controller.service).toBeDefined()

    controller.hostDisconnected()
    // Machine should be stopped and cleaned up
    expect(controller.service.getStatus()).toBe("Stopped")
  })
})

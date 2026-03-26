import { createMachine } from "@zag-js/core"
import { VanillaMachine } from "../src"

async function tick() {
  await Promise.resolve()
  await Promise.resolve()
}

describe("nested states", () => {
  test("basic nested transitions and actions", async () => {
    const order: string[] = []
    const record = (value: string) => () => order.push(value)

    const machine = createMachine<any>({
      initialState() {
        return "dialog"
      },
      states: {
        dialog: {
          tags: ["overlay"],
          initial: "closed",
          states: {
            closed: {
              entry: ["enterClosed"],
              exit: ["exitClosed"],
              on: {
                OPEN: { target: "dialog.open" },
              },
            },
            open: {
              entry: ["enterOpen"],
              exit: ["exitOpen"],
              on: {
                CLOSE: { target: "dialog.closed", actions: ["onClose"] },
              },
            },
          },
          on: {
            RESET: { target: "dialog.closed" },
          },
        },
      },
      implementations: {
        actions: {
          enterClosed: record("enter-closed"),
          exitClosed: record("exit-closed"),
          enterOpen: record("enter-open"),
          exitOpen: record("exit-open"),
          onClose: record("transition"),
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.state.get()).toBe("dialog.closed")
    expect(service.service.state.matches("dialog")).toBe(true)
    expect(service.service.state.hasTag("overlay")).toBe(true)

    service.send({ type: "OPEN" })
    await tick()

    expect(service.state.get()).toBe("dialog.open")
    expect(service.service.state.matches("dialog.open")).toBe(true)

    service.send({ type: "RESET" })
    await tick()

    expect(service.state.get()).toBe("dialog.closed")

    service.send({ type: "OPEN" })
    await tick()

    service.send({ type: "CLOSE" })
    await tick()

    expect(service.state.get()).toBe("dialog.closed")
    expect(order).toEqual([
      "enter-closed",
      "exit-closed",
      "enter-open",
      "exit-open",
      "enter-closed",
      "exit-closed",
      "enter-open",
      "exit-open",
      "transition",
      "enter-closed",
    ])

    service.stop()
  })

  test("effects run per nested state", async () => {
    const cleanup = vi.fn()
    const enter = vi.fn()
    const exit = vi.fn()

    const machine = createMachine<any>({
      initialState() {
        return "dialog"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            open: {
              effects: ["onEffect"],
              entry: ["onEnter"],
              exit: ["onExit"],
              on: {
                CLOSE: { target: "dialog.closed" },
              },
            },
            closed: {},
          },
        },
      },
      implementations: {
        actions: {
          onEnter: enter,
          onExit: exit,
        },
        effects: {
          onEffect() {
            return cleanup
          },
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(enter).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    service.send({ type: "CLOSE" })
    await tick()

    expect(exit).toHaveBeenCalledTimes(1)
    expect(cleanup).toHaveBeenCalledTimes(1)

    service.stop()
  })

  test("ancestor matches and parent transition fallback", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog"
      },
      states: {
        dialog: {
          initial: "open",
          on: { ESC: { target: "dialog.closed" } },
          states: {
            open: {},
            closed: {},
          },
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.service.state.matches("dialog")).toBe(true)
    expect(service.service.state.matches("dialog.open")).toBe(true)

    service.send({ type: "ESC" })
    await tick()

    expect(service.service.state.matches("dialog.closed")).toBe(true)
    expect(service.service.state.matches("dialog")).toBe(true)

    service.stop()
  })

  test("exit/enter order for deep sibling transition", async () => {
    const order: string[] = []
    const record = (val: string) => () => order.push(val)

    const machine = createMachine<any>({
      initialState() {
        return "root"
      },
      states: {
        root: {
          initial: "left",
          states: {
            left: {
              initial: "leaf1",
              states: {
                leaf1: {
                  entry: ["enter-leaf1"],
                  exit: ["exit-leaf1"],
                  on: { NEXT: { target: "root.right.leaf2" } },
                },
              },
              entry: ["enter-left"],
              exit: ["exit-left"],
            },
            right: {
              initial: "leaf2",
              states: {
                leaf2: {
                  entry: ["enter-leaf2"],
                },
              },
              entry: ["enter-right"],
            },
          },
        },
      },
      implementations: {
        actions: {
          "enter-leaf1": record("enter-leaf1"),
          "exit-leaf1": record("exit-leaf1"),
          "enter-left": record("enter-left"),
          "exit-left": record("exit-left"),
          "enter-right": record("enter-right"),
          "enter-leaf2": record("enter-leaf2"),
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()
    order.length = 0
    service.send({ type: "NEXT" })
    await tick()

    expect(order).toEqual(["exit-leaf1", "exit-left", "enter-right", "enter-leaf2"])

    service.stop()
  })

  test("supports relative nested targets from the transition source state", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog"
      },
      states: {
        dialog: {
          initial: "open",
          on: {
            RESET: { target: ".closed" },
          },
          states: {
            open: {
              initial: "viewing",
              on: {
                CLOSE: { target: "closed" },
                VIEW: { target: ".viewing" },
              },
              states: {
                viewing: {
                  on: {
                    EDIT: { target: "editing" },
                  },
                },
                editing: {
                  on: {},
                },
              },
            },
            closed: {
              on: {
                REOPEN: { target: "open" },
              },
            },
          },
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.state.get()).toBe("dialog.open.viewing")

    service.send({ type: "EDIT" })
    await tick()
    expect(service.state.get()).toBe("dialog.open.editing")

    service.send({ type: "VIEW" })
    await tick()
    expect(service.state.get()).toBe("dialog.open.viewing")

    service.send({ type: "CLOSE" })
    await tick()
    expect(service.state.get()).toBe("dialog.closed")

    service.send({ type: "REOPEN" })
    await tick()
    expect(service.state.get()).toBe("dialog.open.viewing")

    service.send({ type: "EDIT" })
    await tick()
    service.send({ type: "RESET" })
    await tick()
    expect(service.state.get()).toBe("dialog.closed")

    service.stop()
  })

  test("supports #id targets for explicit cross-level transitions", async () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            focused: {
              id: "dialogFocused",
              on: {
                REOPEN: { target: "open" },
              },
            },
            open: {
              initial: "idle",
              states: {
                idle: {
                  on: {
                    CLOSE: { target: "#dialogFocused" },
                  },
                },
                focused: {},
              },
            },
          },
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.state.get()).toBe("dialog.open.idle")

    service.send({ type: "CLOSE" })
    await tick()
    expect(service.state.get()).toBe("dialog.focused")

    service.send({ type: "REOPEN" })
    await tick()
    expect(service.state.get()).toBe("dialog.open.idle")

    service.stop()
  })

  test("deeply nested state smoke (3 levels)", async () => {
    const visited: string[] = []
    const record = (value: string) => () => visited.push(value)

    const machine = createMachine<any>({
      initialState() {
        return "root"
      },
      states: {
        root: {
          initial: "level1",
          states: {
            level1: {
              initial: "level2",
              states: {
                level2: {
                  initial: "level3",
                  states: {
                    level3: {
                      entry: ["enterLevel3"],
                      on: { NEXT: { target: "root.done" } },
                    },
                  },
                },
              },
            },
            done: {
              entry: ["enterDone"],
            },
          },
        },
      },
      implementations: {
        actions: {
          enterLevel3: record("level3"),
          enterDone: record("done"),
        },
      },
    })

    const service = new VanillaMachine(machine)
    service.start()
    await tick()

    expect(service.service.state.matches("root.level1.level2.level3")).toBe(true)

    service.send({ type: "NEXT" })
    await tick()

    expect(service.service.state.matches("root.done")).toBe(true)
    expect(visited).toEqual(["level3", "done"])

    service.stop()
  })
})

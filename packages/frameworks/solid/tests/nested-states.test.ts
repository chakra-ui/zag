import { renderHook } from "@solidjs/testing-library"
import { createMachine } from "@zag-js/core"
import { useMachine } from "../src"

function renderMachine(machine: any, props?: any) {
  const render = renderHook(() => useMachine<any>(machine, props))
  const send = async (event: any) => {
    render.result.send(event)
    await Promise.resolve()
  }
  return { ...render, send }
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

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.state.get()).toBe("dialog.closed")
    expect(result.state.matches("dialog")).toBe(true)
    expect(result.state.hasTag("overlay")).toBe(true)

    await send({ type: "OPEN" })
    expect(result.state.get()).toBe("dialog.open")

    await send({ type: "RESET" })
    expect(result.state.get()).toBe("dialog.closed")

    await send({ type: "OPEN" })
    await send({ type: "CLOSE" })

    expect(result.state.get()).toBe("dialog.closed")
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

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.state.matches("dialog.open")).toBe(true)
    expect(enter).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    await send({ type: "CLOSE" })

    expect(result.state.matches("dialog.closed")).toBe(true)
    expect(exit).toHaveBeenCalledTimes(1)
    expect(cleanup).toHaveBeenCalledTimes(1)
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

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.state.matches("dialog")).toBe(true)
    expect(result.state.matches("dialog.open")).toBe(true)

    await send({ type: "ESC" })

    expect(result.state.matches("dialog.closed")).toBe(true)
    expect(result.state.matches("dialog")).toBe(true)
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

    const { send } = renderMachine(machine)
    await Promise.resolve()
    order.length = 0
    await send({ type: "NEXT" })

    expect(order).toEqual(["exit-leaf1", "exit-left", "enter-right", "enter-leaf2"])
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

    const { result, send } = renderMachine(machine)
    await Promise.resolve()

    expect(result.state.matches("root.level1.level2.level3")).toBe(true)

    await send({ type: "NEXT" })

    expect(result.state.matches("root.done")).toBe(true)
    expect(visited).toEqual(["level3", "done"])
  })
})

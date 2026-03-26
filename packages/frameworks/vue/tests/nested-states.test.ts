import { createMachine } from "@zag-js/core"
import { renderMachine } from "./render"

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

    const { result, send, cleanup } = renderMachine(machine)

    expect(result.current.state.get()).toBe("dialog.closed")
    expect(result.current.state.matches("dialog")).toBe(true)
    expect(result.current.state.hasTag("overlay")).toBe(true)

    await send({ type: "OPEN" })
    expect(result.current.state.get()).toBe("dialog.open")

    await send({ type: "RESET" })
    expect(result.current.state.get()).toBe("dialog.closed")

    await send({ type: "OPEN" })
    await send({ type: "CLOSE" })

    expect(result.current.state.get()).toBe("dialog.closed")
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

    cleanup()
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

    const { result, send, cleanup } = renderMachine(machine)

    expect(result.current.state.get()).toBe("dialog.open.viewing")

    await send({ type: "EDIT" })
    expect(result.current.state.get()).toBe("dialog.open.editing")

    await send({ type: "VIEW" })
    expect(result.current.state.get()).toBe("dialog.open.viewing")

    await send({ type: "CLOSE" })
    expect(result.current.state.get()).toBe("dialog.closed")

    await send({ type: "REOPEN" })
    expect(result.current.state.get()).toBe("dialog.open.viewing")

    await send({ type: "EDIT" })
    await send({ type: "RESET" })
    expect(result.current.state.get()).toBe("dialog.closed")

    cleanup()
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

    const { result, send, cleanup } = renderMachine(machine)

    expect(result.current.state.get()).toBe("dialog.open.idle")

    await send({ type: "CLOSE" })
    expect(result.current.state.get()).toBe("dialog.focused")

    await send({ type: "REOPEN" })
    expect(result.current.state.get()).toBe("dialog.open.idle")

    cleanup()
  })
})

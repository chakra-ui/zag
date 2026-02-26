import { createMachine } from "../src/create-machine"
import {
  findTransition,
  getExitEnterStates,
  getStateChain,
  getStateDefinition,
  hasTag,
  matchesState,
  resolveStateValue,
} from "../src/state"

describe("state resolution", () => {
  test("resolves relative targets from transition source state", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.open.idle"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            focused: {
              id: "dialogFocused",
            },
            open: {
              initial: "idle",
              states: {
                idle: {},
                focused: {},
              },
            },
          },
        },
      },
    })

    expect(resolveStateValue(machine, "focused", "dialog.open.idle")).toBe("dialog.open.focused")
  })

  test("resolves # prefixed target by state id", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.open.idle"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            focused: {
              id: "dialogFocused",
            },
            open: {
              initial: "idle",
              states: {
                idle: {},
                focused: {},
              },
            },
          },
        },
      },
    })

    expect(resolveStateValue(machine, "#dialogFocused", "dialog.open.idle")).toBe("dialog.focused")
  })

  test("throws when # prefixed target id is unknown", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.open.idle"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            focused: {},
            open: {
              initial: "idle",
              states: {
                idle: {},
              },
            },
          },
        },
      },
    })

    expect(() => resolveStateValue(machine, "#missingStateId", "dialog.open.idle")).toThrowError(
      "Unknown state id: missingStateId",
    )
  })
})

describe("state utilities", () => {
  const machine = createMachine<any>({
    initialState() {
      return "dialog.open.idle"
    },
    on: {
      ROOT_CLOSE: { target: "dialog.closed" },
    },
    states: {
      dialog: {
        tags: ["overlay"],
        initial: "open",
        on: {
          RESET: { target: "dialog.closed" },
        },
        states: {
          closed: {
            tags: ["closed"],
          },
          focused: {
            id: "dialogFocused",
            tags: ["closed", "focused"],
            on: {
              REOPEN: { target: "open" },
            },
          },
          open: {
            tags: ["open"],
            initial: "idle",
            on: {
              CLOSE: { target: "dialog.closed" },
            },
            states: {
              idle: {
                on: {
                  PING: { target: "focused" },
                  CLOSE_TO_ID: { target: "#dialogFocused" },
                },
              },
              focused: {},
            },
          },
        },
      },
    },
  })

  test("getStateChain returns the full ancestry paths", () => {
    const chain = getStateChain(machine, "dialog.open.idle")
    expect(chain.map((item) => item.path)).toEqual(["dialog", "dialog.open", "dialog.open.idle"])
  })

  test("getStateDefinition returns the leaf state definition", () => {
    const definition = getStateDefinition(machine, "dialog.open")
    expect(definition?.tags).toEqual(["open"])
  })

  test("findTransition resolves from nearest state then bubbles to parent and root", () => {
    const local = findTransition(machine, "dialog.open.idle", "PING")
    expect(local.source).toBe("dialog.open.idle")
    expect(local.transitions).toMatchObject({ target: "focused" })

    const parent = findTransition(machine, "dialog.open.focused", "CLOSE")
    expect(parent.source).toBe("dialog.open")
    expect(parent.transitions).toMatchObject({ target: "dialog.closed" })

    const root = findTransition(machine, "dialog.open.focused", "ROOT_CLOSE")
    expect(root.source).toBeUndefined()
    expect(root.transitions).toMatchObject({ target: "dialog.closed" })
  })

  test("getExitEnterStates computes minimal exit/enter set for sibling transitions", () => {
    const result = getExitEnterStates(machine, "dialog.open.idle", "dialog.open.focused")
    expect(result.exiting.map((item) => item.path)).toEqual(["dialog.open.idle"])
    expect(result.entering.map((item) => item.path)).toEqual(["dialog.open.focused"])
  })

  test("getExitEnterStates reenters full chain when reenter=true on same leaf", () => {
    const result = getExitEnterStates(machine, "dialog.open.idle", "dialog.open.idle", true)
    expect(result.exiting.map((item) => item.path)).toEqual(["dialog.open.idle", "dialog.open", "dialog"])
    expect(result.entering.map((item) => item.path)).toEqual(["dialog", "dialog.open", "dialog.open.idle"])
  })

  test("matchesState checks exact and descendant state matches", () => {
    expect(matchesState("dialog.open.idle", "dialog.open.idle")).toBe(true)
    expect(matchesState("dialog.open.idle", "dialog.open")).toBe(true)
    expect(matchesState("dialog.open.idle", "dialog.closed")).toBe(false)
    expect(matchesState(undefined, "dialog")).toBe(false)
  })

  test("hasTag checks tags on leaf and ancestor states", () => {
    expect(hasTag(machine, "dialog.open.idle", "overlay")).toBe(true)
    expect(hasTag(machine, "dialog.focused", "focused")).toBe(true)
    expect(hasTag(machine, "dialog.open.idle", "closed")).toBe(false)
  })

  test("createMachine throws when state ids are duplicated", () => {
    expect(() =>
      createMachine<any>({
        initialState() {
          return "a.one"
        },
        states: {
          a: {
            initial: "one",
            states: {
              one: { id: "duplicate-id" },
            },
          },
          b: {
            initial: "two",
            states: {
              two: { id: "duplicate-id" },
            },
          },
        },
      }),
    ).toThrowError("Duplicate state id: duplicate-id")
  })

  test("resolveStateValue can transition by #id to a state with initial child", () => {
    const withInitialChild = createMachine<any>({
      initialState() {
        return "dialog.open.idle"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            closed: {
              id: "dialogClosed",
              initial: "done",
              states: {
                done: {},
              },
            },
            open: {
              initial: "idle",
              states: {
                idle: {},
              },
            },
          },
        },
      },
    })

    expect(resolveStateValue(withInitialChild, "#dialogClosed", "dialog.open.idle")).toBe("dialog.closed.done")
  })
})

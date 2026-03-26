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

  test("prefers sibling over child when both exist with same name", () => {
    // Reproduces: color picker `open` state has child `idle` AND sibling `idle` at root.
    // Transition `target: "idle"` on `open` must resolve to the sibling, not the child.
    const machine = createMachine<any>({
      initialState() {
        return "open.idle"
      },
      states: {
        idle: {},
        focused: {},
        open: {
          initial: "idle",
          on: {
            CLOSE_TO_IDLE: { target: "idle" },
            CLOSE_TO_FOCUSED: { target: "focused" },
          },
          states: {
            idle: {},
            dragging: {},
          },
        },
      },
    })

    // "idle" from source "open" should resolve to root "idle", not "open.idle"
    expect(resolveStateValue(machine, "idle", "open")).toBe("idle")
    // "focused" from source "open" should resolve to root "focused"
    expect(resolveStateValue(machine, "focused", "open")).toBe("focused")
  })

  test("dot-prefixed target resolves to child state", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.open.viewing"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            open: {
              initial: "viewing",
              states: {
                viewing: {},
                editing: {},
              },
            },
            closed: {},
          },
        },
      },
    })

    // ".viewing" explicitly targets child of "dialog.open"
    expect(resolveStateValue(machine, ".viewing", "dialog.open")).toBe("dialog.open.viewing")
    // ".editing" explicitly targets child of "dialog.open"
    expect(resolveStateValue(machine, ".editing", "dialog.open")).toBe("dialog.open.editing")
    // "closed" (bare) targets sibling of "open" within "dialog"
    expect(resolveStateValue(machine, "closed", "dialog.open")).toBe("dialog.closed")
  })

  test("dot-prefixed target drills down to initial child", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.closed"
      },
      states: {
        dialog: {
          initial: "closed",
          states: {
            closed: {},
            open: {
              initial: "viewing",
              states: {
                viewing: {},
                editing: {},
              },
            },
          },
        },
      },
    })

    // ".open" from "dialog" targets child "dialog.open", drills to "dialog.open.viewing"
    expect(resolveStateValue(machine, ".open", "dialog")).toBe("dialog.open.viewing")
  })

  test("bare name never resolves to child of source", () => {
    const machine = createMachine<any>({
      initialState() {
        return "a.b.c"
      },
      states: {
        a: {
          initial: "b",
          states: {
            b: {
              initial: "c",
              states: {
                c: {},
                d: {},
              },
            },
            x: {},
          },
        },
      },
    })

    // From source "a.b", bare "x" finds sibling "a.x"
    expect(resolveStateValue(machine, "x", "a.b")).toBe("a.x")
    // From source "a.b", bare "d" does NOT find child "a.b.d" — bare names are siblings only
    // "d" doesn't exist as a sibling at any ancestor level, falls through
    expect(resolveStateValue(machine, "d", "a.b")).toBe("d")
    // Use dot-prefix to explicitly target child
    expect(resolveStateValue(machine, ".d", "a.b")).toBe("a.b.d")
  })

  test("resolves absolute path targets without relative resolution", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.open.idle"
      },
      states: {
        dialog: {
          initial: "open",
          states: {
            open: {
              initial: "idle",
              states: {
                idle: {},
              },
            },
            closed: {},
          },
        },
      },
    })

    // Absolute path (contains ".") bypasses relative resolution regardless of source
    expect(resolveStateValue(machine, "dialog.closed", "dialog.open.idle")).toBe("dialog.closed")
    expect(resolveStateValue(machine, "dialog.open", "dialog.closed")).toBe("dialog.open.idle")
  })

  test("resolves with undefined source (root-level handler)", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.open.idle"
      },
      states: {
        idle: {},
        dialog: {
          initial: "open",
          states: {
            open: {
              initial: "idle",
              states: {
                idle: {},
              },
            },
            closed: {},
          },
        },
      },
    })

    // No source (root `on` handler) — absolute paths work
    expect(resolveStateValue(machine, "dialog.closed")).toBe("dialog.closed")
    // No source — simple name resolves at root level
    expect(resolveStateValue(machine, "idle")).toBe("idle")
  })

  test("drills down to initial child on relative resolution", () => {
    const machine = createMachine<any>({
      initialState() {
        return "dialog.closed"
      },
      states: {
        dialog: {
          initial: "closed",
          states: {
            closed: {},
            open: {
              initial: "idle",
              states: {
                idle: {},
                editing: {},
              },
            },
          },
        },
      },
    })

    // Relative target "open" from source "dialog.closed" should resolve to "dialog.open"
    // then drill down via `initial` to "dialog.open.idle"
    expect(resolveStateValue(machine, "open", "dialog.closed")).toBe("dialog.open.idle")
  })

  test("returns raw value for unknown target", () => {
    const machine = createMachine<any>({
      initialState() {
        return "idle"
      },
      states: {
        idle: {},
        open: {},
      },
    })

    // Typo/unknown state — resolveAbsoluteStateValue returns the raw string
    expect(resolveStateValue(machine, "nonexistent")).toBe("nonexistent")
    expect(resolveStateValue(machine, "nonexistent", "idle")).toBe("nonexistent")
  })

  test("self-targeting resolves to the same state", () => {
    const machine = createMachine<any>({
      initialState() {
        return "open.idle"
      },
      states: {
        open: {
          initial: "idle",
          on: {
            REFRESH: { target: "open" },
          },
          states: {
            idle: {},
          },
        },
        closed: {},
      },
    })

    // "open" from source "open" — root-level sibling "open" exists, resolves + drills to initial
    expect(resolveStateValue(machine, "open", "open")).toBe("open.idle")
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
      '[zag-js] Unknown state id: "missingStateId"',
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
    ).toThrowError('[zag-js] Duplicate state id: "duplicate-id"')
  })

  test("throws when compound state has children but no initial", () => {
    expect(() =>
      createMachine<any>({
        initialState() {
          return "open.idle"
        },
        states: {
          open: {
            states: {
              idle: {},
              active: {},
            },
          },
        },
      }),
    ).toThrowError('[zag-js] Compound state "open" has child states but no "initial" property')
  })

  test("throws when initial references a nonexistent child state", () => {
    expect(() =>
      createMachine<any>({
        initialState() {
          return "open.idle"
        },
        states: {
          open: {
            initial: "nonexistent",
            states: {
              idle: {},
              active: {},
            },
          },
        },
      }),
    ).toThrowError('[zag-js] Compound state "open" has initial "nonexistent" which is not a child state')
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

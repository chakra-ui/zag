import { createMachine } from "@zag-js/core"
import { renderWithProps } from "./render"

/** One watchEffect effect on `open`, gated on `prop("enabled")`. */
function gatedMachine(log: string[], label = "g") {
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
            log.push(`${label}:setup`)
            return () => log.push(`${label}:cleanup`)
          })
        },
      },
    },
  })
}

/**
 * open (L1)
 *   └─ content (L2)
 *        ├─ idle (L3)
 *        └─ busy
 */
function deepMachine(log: string[]) {
  const mk =
    (label: string) =>
    ({ prop, watchEffect }: any) =>
      watchEffect([() => prop("enabled")], () => {
        log.push(`${label}:setup:${prop("enabled")}`)
        return () => log.push(`${label}:cleanup`)
      })

  return createMachine<any>({
    props: ({ props }) => ({ enabled: true, ...props }),
    initialState: () => "open",
    states: {
      open: {
        effects: ["L1"],
        initial: "content",
        states: {
          content: {
            effects: ["L2"],
            initial: "idle",
            states: {
              idle: { effects: ["L3"], on: { BUSY: { target: "busy" } } },
              busy: {},
            },
            on: { LEAVE_CONTENT: { target: ".idle" } },
          },
        },
        on: { CLOSE: { target: "closed" }, PING_OPEN: { reenter: true } },
      },
      closed: { on: { OPEN: { target: "open" } } },
    },
    implementations: { effects: { L1: mk("L1"), L2: mk("L2"), L3: mk("L3") } },
  })
}

/** Logs `setup:<v>` / `cleanup:<v>` so churn can be checked for leaks. */
function churnMachine(log: string[]) {
  return createMachine<any>({
    props: ({ props }) => ({ v: 0, ...props }),
    initialState: () => "open",
    states: { open: { effects: ["gated"], on: { CLOSE: { target: "closed" } } }, closed: {} },
    implementations: {
      effects: {
        gated: ({ prop, watchEffect }: any) =>
          watchEffect([() => prop("v")], () => {
            const v = prop("v")
            log.push(`setup:${v}`)
            return () => log.push(`cleanup:${v}`)
          }),
      },
    },
  })
}

/** The controlled-`open` shape every zag overlay uses, with one gated effect. */
function controlledDialogMachine(log: string[]) {
  return createMachine<any>({
    props: ({ props }) => ({ trapFocus: true, ...props }),
    initialState: ({ prop }: any) => (prop("open") ? "open" : "closed"),
    watch({ track, action, prop }: any) {
      track([() => prop("open")], () => action(["toggleVisibility"]))
    },
    states: {
      open: { effects: ["trapFocus"], on: { "CONTROLLED.CLOSE": { target: "closed" } } },
      closed: { on: { "CONTROLLED.OPEN": { target: "open" } } },
    },
    implementations: {
      actions: {
        toggleVisibility: ({ prop, send }: any) =>
          send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE" }),
      },
      effects: {
        trapFocus: ({ prop, watchEffect }: any) =>
          watchEffect([() => prop("trapFocus")], () => {
            if (!prop("trapFocus")) return
            log.push("trap:on")
            return () => log.push("trap:off")
          }),
      },
    },
  })
}

/** Live effect count: one setup with no matching cleanup means exactly one is active. */
const live = (log: string[]) =>
  log.filter((l) => l.startsWith("setup:")).length - log.filter((l) => l.startsWith("cleanup:")).length

const ALL_LEVELS_RESTART = [
  "L1:cleanup",
  "L1:setup:false",
  "L2:cleanup",
  "L2:setup:false",
  "L3:cleanup",
  "L3:setup:false",
]

describe("vue: watchEffect basics", () => {
  test("restarts when a dep changes", async () => {
    const log: string[] = []
    const view = await renderWithProps(gatedMachine(log), { enabled: true })
    expect(log.filter((l) => l === "g:setup")).toHaveLength(1)

    await view.setProps({ enabled: false })
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(1)
    expect(log.filter((l) => l === "g:setup")).toHaveLength(1)

    await view.setProps({ enabled: true })
    expect(log.filter((l) => l === "g:setup")).toHaveLength(2)
  })

  test("starts an effect that was gated off at entry", async () => {
    const log: string[] = []
    const view = await renderWithProps(gatedMachine(log), { enabled: false })
    expect(log.filter((l) => l === "g:setup")).toHaveLength(0)

    await view.setProps({ enabled: true })
    expect(log.filter((l) => l === "g:setup")).toHaveLength(1)
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(0)
  })

  test("does not restart when an unrelated prop changes", async () => {
    const log: string[] = []
    const view = await renderWithProps(gatedMachine(log), { enabled: true, other: 0 })

    await view.setProps({ other: 1 })
    await view.setProps({ other: 2 })
    expect(log.filter((l) => l === "g:setup")).toHaveLength(1)
  })

  test("does not re-run entry actions or the effect body on restart", async () => {
    const log: string[] = []
    const view = await renderWithProps(gatedMachine(log), { enabled: true })

    await view.setProps({ enabled: false })
    await view.setProps({ enabled: true })

    expect(log.filter((l) => l === "entry")).toHaveLength(1)
    expect(log.filter((l) => l === "body")).toHaveLength(1)
    expect(log.filter((l) => l === "g:setup")).toHaveLength(2)
  })

  test("cleans up on state exit and does not resurrect", async () => {
    const log: string[] = []
    const view = await renderWithProps(gatedMachine(log), { enabled: true })

    await view.send({ type: "CLOSE" })
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(1)

    await view.setProps({ enabled: false })
    await view.setProps({ enabled: true })
    expect(log.filter((l) => l === "g:setup")).toHaveLength(1)
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(1)
  })

  test("cleans up on unmount", async () => {
    const log: string[] = []
    const view = await renderWithProps(gatedMachine(log), { enabled: true })
    await view.unmount()
    expect(log.filter((l) => l === "g:cleanup")).toHaveLength(1)
  })

  test("restarts only the effect whose deps changed", async () => {
    const a = { setup: vi.fn(), cleanup: vi.fn() }
    const b = { setup: vi.fn(), cleanup: vi.fn() }
    const plain = { setup: vi.fn(), cleanup: vi.fn() }

    const machine = createMachine<any>({
      props: ({ props }) => ({ a: true, b: true, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["effectA", "effectB", "plainEffect"] } },
      implementations: {
        effects: {
          effectA: ({ prop, watchEffect }: any) => watchEffect([() => prop("a")], () => (a.setup(), () => a.cleanup())),
          effectB: ({ prop, watchEffect }: any) => watchEffect([() => prop("b")], () => (b.setup(), () => b.cleanup())),
          plainEffect: () => (plain.setup(), () => plain.cleanup()),
        },
      },
    })

    const view = await renderWithProps(machine, { a: true, b: true })
    await view.setProps({ a: false })

    expect(a.setup).toHaveBeenCalledTimes(2)
    expect(a.cleanup).toHaveBeenCalledTimes(1)
    expect(b.setup).toHaveBeenCalledTimes(1)
    expect(b.cleanup).not.toHaveBeenCalled()
    expect(plain.setup).toHaveBeenCalledTimes(1)
    expect(plain.cleanup).not.toHaveBeenCalled()
  })

  test("any dep in the list triggers a restart", async () => {
    const setup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ x: 1, y: 1, z: 1, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["multi"] } },
      implementations: {
        effects: {
          multi: ({ prop, watchEffect }: any) =>
            watchEffect([() => prop("x"), () => prop("y")], () => void setup(prop("x"), prop("y"))),
        },
      },
    })

    const view = await renderWithProps(machine, { x: 1, y: 1, z: 1 })
    expect(setup).toHaveBeenCalledTimes(1)

    await view.setProps({ x: 2 })
    expect(setup).toHaveBeenLastCalledWith(2, 1)

    await view.setProps({ y: 2 })
    expect(setup).toHaveBeenLastCalledWith(2, 2)

    await view.setProps({ z: 9 })
    expect(setup).toHaveBeenCalledTimes(3)
  })

  test("survives re-entry via a reenter transition", async () => {
    const setup = vi.fn()
    const cleanup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"], on: { PING: { reenter: true } } } },
      implementations: {
        effects: {
          gated: ({ prop, watchEffect }: any) => watchEffect([() => prop("enabled")], () => (setup(), () => cleanup())),
        },
      },
    })

    const view = await renderWithProps(machine, { enabled: true })

    await view.send({ type: "PING" })
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(setup).toHaveBeenCalledTimes(2)

    await view.setProps({ enabled: false })
    expect(cleanup).toHaveBeenCalledTimes(2)
    expect(setup).toHaveBeenCalledTimes(3)
  })

  test("works for root-level machine.effects", async () => {
    const setup = vi.fn()
    const cleanup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "idle",
      effects: ["rootGated"],
      states: { idle: {} },
      implementations: {
        effects: {
          rootGated: ({ prop, watchEffect }: any) =>
            watchEffect([() => prop("enabled")], () => {
              if (!prop("enabled")) return
              setup()
              return () => cleanup()
            }),
        },
      },
    })

    const view = await renderWithProps(machine, { enabled: true })
    expect(setup).toHaveBeenCalledTimes(1)

    await view.setProps({ enabled: false })
    expect(cleanup).toHaveBeenCalledTimes(1)

    await view.setProps({ enabled: true })
    expect(setup).toHaveBeenCalledTimes(2)
  })
})

describe("vue: nested states", () => {
  test("effects at every level start when the initial chain resolves", async () => {
    const log: string[] = []
    await renderWithProps(deepMachine(log), { enabled: true })
    expect(log).toEqual(["L1:setup:true", "L2:setup:true", "L3:setup:true"])
  })

  test("a dep change restarts every level, outermost first", async () => {
    const log: string[] = []
    const view = await renderWithProps(deepMachine(log), { enabled: true })
    log.length = 0

    await view.setProps({ enabled: false })
    expect(log).toEqual(ALL_LEVELS_RESTART)
  })

  test("a sibling transition at the deepest level exits only that level", async () => {
    const log: string[] = []
    const view = await renderWithProps(deepMachine(log), { enabled: true })
    log.length = 0

    await view.send({ type: "BUSY" })
    expect(log).toEqual(["L3:cleanup"])

    log.length = 0
    await view.setProps({ enabled: false })
    expect(log).toEqual(["L1:cleanup", "L1:setup:false", "L2:cleanup", "L2:setup:false"])
  })

  test("exiting the whole chain cleans up deepest-first", async () => {
    const log: string[] = []
    const view = await renderWithProps(deepMachine(log), { enabled: true })
    log.length = 0

    await view.send({ type: "CLOSE" })
    expect(log).toEqual(["L3:cleanup", "L2:cleanup", "L1:cleanup"])

    log.length = 0
    await view.setProps({ enabled: false })
    expect(log).toEqual([])
  })

  test("re-entering the compound parent replaces every record in the chain", async () => {
    const log: string[] = []
    const view = await renderWithProps(deepMachine(log), { enabled: true })
    log.length = 0

    await view.send({ type: "PING_OPEN" })
    expect(log).toEqual(["L3:cleanup", "L2:cleanup", "L1:cleanup", "L1:setup:true", "L2:setup:true", "L3:setup:true"])

    log.length = 0
    await view.setProps({ enabled: false })
    expect(log).toEqual(ALL_LEVELS_RESTART)
  })

  test("a child-target transition restarts only the child", async () => {
    const log: string[] = []
    const view = await renderWithProps(deepMachine(log), { enabled: true })
    await view.send({ type: "BUSY" })
    log.length = 0

    await view.send({ type: "LEAVE_CONTENT" })
    expect(log).toEqual(["L3:setup:true"])
  })

  test("re-entering the chain after a full exit starts fresh records", async () => {
    const log: string[] = []
    const view = await renderWithProps(deepMachine(log), { enabled: true })
    await view.send({ type: "CLOSE" })
    log.length = 0

    await view.send({ type: "OPEN" })
    expect(log).toEqual(["L1:setup:true", "L2:setup:true", "L3:setup:true"])

    log.length = 0
    await view.setProps({ enabled: false })
    expect(log).toEqual(ALL_LEVELS_RESTART)
  })

  test("restarts inside a nested state leave nothing behind on exit", async () => {
    const log: string[] = []
    const view = await renderWithProps(deepMachine(log), { enabled: true })
    await view.setProps({ enabled: false })
    await view.setProps({ enabled: true })
    log.length = 0

    await view.send({ type: "CLOSE" })
    expect(log).toEqual(["L3:cleanup", "L2:cleanup", "L1:cleanup"])
  })

  test("state names that are string prefixes of one another do not cross-clean", async () => {
    const log: string[] = []
    const mk =
      (label: string) =>
      ({ prop, watchEffect }: any) =>
        watchEffect([() => prop("enabled")], () => () => log.push(`${label}:cleanup`))

    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: {
        open: {
          effects: ["parent"],
          initial: "item",
          states: {
            item: { effects: ["child"], on: { NEXT: { target: "item2" } } },
            item2: { effects: ["child2"] },
          },
        },
      },
      implementations: { effects: { parent: mk("parent"), child: mk("child"), child2: mk("child2") } },
    })

    const view = await renderWithProps(machine, { enabled: true })
    log.length = 0

    await view.send({ type: "NEXT" })
    expect(log).toEqual(["child:cleanup"])

    log.length = 0
    await view.setProps({ enabled: false })
    expect(log).toEqual(["parent:cleanup", "child2:cleanup"])
  })
})

describe("vue: effect declaration edges", () => {
  test("the same effect name listed twice yields two independent records", async () => {
    const setup = vi.fn()
    const cleanup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated", "gated"] } },
      implementations: {
        effects: {
          gated: ({ prop, watchEffect }: any) => watchEffect([() => prop("enabled")], () => (setup(), () => cleanup())),
        },
      },
    })

    const view = await renderWithProps(machine, { enabled: true })
    expect(setup).toHaveBeenCalledTimes(2)

    await view.setProps({ enabled: false })
    expect(cleanup).toHaveBeenCalledTimes(2)
    expect(setup).toHaveBeenCalledTimes(4)
  })

  test("the effect LIST is still resolved only on entry", async () => {
    const setup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, withExtra: false, ...props }),
      initialState: () => "open",
      states: { open: { effects: ({ prop }: any) => (prop("withExtra") ? ["gated", "extra"] : ["gated"]) } },
      implementations: {
        effects: {
          gated: ({ prop, watchEffect }: any) => watchEffect([() => prop("enabled")], () => void setup("gated")),
          extra: () => void setup("extra"),
        },
      },
    })

    const view = await renderWithProps(machine, { enabled: true, withExtra: false })
    expect(setup.mock.calls).toEqual([["gated"]])

    await view.setProps({ withExtra: true })
    expect(setup.mock.calls).toEqual([["gated"]])

    await view.setProps({ enabled: false })
    expect(setup.mock.calls).toEqual([["gated"], ["gated"]])
  })

  test("an empty deps array never restarts", async () => {
    const setup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ ...props }),
      initialState: () => "open",
      states: { open: { effects: ["never"] } },
      implementations: {
        effects: { never: ({ watchEffect }: any) => watchEffect([], () => void setup()) },
      },
    })

    const view = await renderWithProps(machine, { a: 1 })
    await view.setProps({ a: 2 })
    await view.setProps({ a: 3 })
    expect(setup).toHaveBeenCalledTimes(1)
  })

  test("a setup that never returns a cleanup restarts and exits without error", async () => {
    const setup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["noCleanup"], on: { CLOSE: { target: "closed" } } }, closed: {} },
      implementations: {
        effects: {
          noCleanup: ({ prop, watchEffect }: any) =>
            watchEffect([() => prop("enabled")], () => void setup(prop("enabled"))),
        },
      },
    })

    const view = await renderWithProps(machine, { enabled: true })
    await view.setProps({ enabled: false })
    await view.send({ type: "CLOSE" })
    expect(setup.mock.calls).toEqual([[true], [false]])
  })

  test("plain effects alongside watchEffect ones are never reconciled", async () => {
    const plain = vi.fn()
    const gated = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["plain", "gated"] } },
      implementations: {
        effects: {
          plain: () => void plain(),
          gated: ({ prop, watchEffect }: any) => watchEffect([() => prop("enabled")], () => void gated()),
        },
      },
    })

    const view = await renderWithProps(machine, { enabled: true })
    for (let i = 0; i < 5; i++) await view.setProps({ enabled: i % 2 === 0 })

    expect(plain).toHaveBeenCalledTimes(1)
    expect(gated).toHaveBeenCalledTimes(5)
  })

  test("deps may read context", async () => {
    // props, context and computed work everywhere; `refs` are deliberately not tracked
    const setup = vi.fn()
    const machine = createMachine<any>({
      initialState: () => "open",
      context: ({ bindable }) => ({ mode: bindable(() => ({ defaultValue: "full" })) }),
      states: { open: { effects: ["gated"], on: { "MODE.SET": { actions: ["setMode"] } } } },
      implementations: {
        actions: { setMode: ({ context, event }: any) => context.set("mode", event.value) },
        effects: {
          gated: ({ context, watchEffect }: any) =>
            watchEffect([() => context.get("mode")], () => void setup(context.get("mode"))),
        },
      },
    })

    const view = await renderWithProps(machine, {})
    expect(setup).toHaveBeenNthCalledWith(1, "full")

    await view.send({ type: "MODE.SET", value: "mini" })
    expect(setup).toHaveBeenNthCalledWith(2, "mini")

    await view.send({ type: "MODE.SET", value: "mini" })
    expect(setup).toHaveBeenCalledTimes(2)
  })
})

describe("vue: dep value semantics", () => {
  async function probe(values: any[]) {
    const setup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ v: undefined, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"] } },
      implementations: {
        effects: {
          gated: ({ prop, watchEffect }: any) => watchEffect([() => prop("v")], () => void setup(prop("v"))),
        },
      },
    })
    const view = await renderWithProps(machine, { v: values[0] })
    for (const v of values.slice(1)) await view.setProps({ v })
    return setup
  }

  test("NaN is stable and does not restart", async () => {
    expect(await probe([NaN, NaN, NaN])).toHaveBeenCalledTimes(1)
  })

  test("undefined and null are distinct", async () => {
    expect(await probe([undefined, null, undefined])).toHaveBeenCalledTimes(3)
  })

  test("arrays are compared structurally", async () => {
    expect(
      await probe([
        [1, 2],
        [1, 2],
        [1, 3],
      ]),
    ).toHaveBeenCalledTimes(2)
  })

  test("booleans toggling restart every time", async () => {
    expect(await probe([true, false, true, false])).toHaveBeenCalledTimes(4)
  })

  test("adding a key to an object dep restarts", async () => {
    expect(await probe([{ a: 1 }, { a: 1, b: 2 }])).toHaveBeenCalledTimes(2)
  })

  test("removing a key from an object dep restarts", async () => {
    expect(await probe([{ a: 1, b: 2 }, { a: 1 }])).toHaveBeenCalledTimes(2)
  })
})

describe("vue: scheduling and races", () => {
  test("several dep changes in one tick settle on the final value with one live effect", async () => {
    const log: string[] = []
    const view = await renderWithProps(churnMachine(log), { v: 0 })

    await view.tick(({ setProps }) => {
      setProps({ v: 1 })
      setProps({ v: 2 })
      setProps({ v: 3 })
    })

    expect(live(log)).toBe(1)
    expect(log.at(-1)).toBe("setup:3")
  })

  test("a dep that flips back within a tick never leaks", async () => {
    const log: string[] = []
    const view = await renderWithProps(churnMachine(log), { v: 0 })

    await view.tick(({ setProps }) => {
      setProps({ v: 1 })
      setProps({ v: 0 })
    })

    expect(live(log)).toBe(1)
    expect(log.at(-1)).toBe("setup:0")
  })

  test("many rapid changes never leak an effect", async () => {
    const log: string[] = []
    const view = await renderWithProps(churnMachine(log), { v: 0 })

    for (let i = 1; i <= 20; i++) await view.setProps({ v: i })

    expect(log.filter((l) => l.startsWith("setup:"))).toHaveLength(21)
    expect(live(log)).toBe(1)
    expect(log.at(-1)).toBe("setup:20")
  })

  test("a dep change racing a state exit does not resurrect the effect", async () => {
    const log: string[] = []
    const view = await renderWithProps(churnMachine(log), { v: 0 })

    await view.tick(({ setProps, send }) => {
      send({ type: "CLOSE" })
      setProps({ v: 1 })
    })

    expect(view.service.state.get()).toBe("closed")
    expect(live(log)).toBe(0)
  })

  test("a dep change racing a state change settles with one live effect", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ v: 0, ...props }),
      initialState: () => "a",
      states: { a: { effects: ["gated"], on: { GO: { target: "b" } } }, b: { effects: ["gated"] } },
      implementations: {
        effects: {
          gated: ({ prop, watchEffect }: any) =>
            watchEffect([() => prop("v")], () => {
              const v = prop("v")
              log.push(`setup:${v}`)
              return () => log.push(`cleanup:${v}`)
            }),
        },
      },
    })

    const view = await renderWithProps(machine, { v: 0 })

    await view.tick(({ setProps, send }) => {
      send({ type: "GO" })
      setProps({ v: 1 })
    })

    expect(view.service.state.get()).toBe("b")
    expect(live(log)).toBe(1)
    expect(log.at(-1)).toBe("setup:1")
  })

  test("send() from inside a restarted setup is delivered", async () => {
    const log: string[] = []
    const machine = createMachine<any>({
      props: ({ props }) => ({ v: 0, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"], on: { NOTIFY: { actions: ["record"] } } } },
      implementations: {
        actions: { record: () => log.push("notified") },
        effects: {
          gated: ({ prop, send, watchEffect }: any) =>
            watchEffect([() => prop("v")], () => {
              if (prop("v") > 0) send({ type: "NOTIFY" })
            }),
        },
      },
    })

    const view = await renderWithProps(machine, { v: 0 })
    expect(log).toEqual([])

    await view.setProps({ v: 1 })
    expect(log).toEqual(["notified"])
  })

  test("a context write inside setup is safe when the dep does not read it", async () => {
    // writing to a context this effect's own deps read loops, like `useEffect(() => setX(x+1), [x])`
    const setup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ v: 0, ...props }),
      initialState: () => "open",
      context: ({ bindable }) => ({ runs: bindable(() => ({ defaultValue: 0 })) }),
      states: { open: { effects: ["writesContext"] } },
      implementations: {
        effects: {
          writesContext: ({ context, prop, watchEffect }: any) =>
            watchEffect([() => prop("v")], () => {
              setup()
              context.set("runs", (n: number) => n + 1)
            }),
        },
      },
    })

    const view = await renderWithProps(machine, { v: 0 })
    expect(setup).toHaveBeenCalledTimes(1)

    await view.setProps({ v: 1 })
    expect(setup).toHaveBeenCalledTimes(2)
    expect(view.service.context.get("runs")).toBe(2)

    await view.setProps({ v: 1 })
    expect(setup).toHaveBeenCalledTimes(2)
  })

  test("a restart does not subscribe the reconciler to what setup() reads", async () => {
    // setup() runs off the tracked scope, so unrelated writes must not wake the reconciler
    let depReads = 0
    const machine = createMachine<any>({
      props: ({ props }) => ({ enabled: true, ...props }),
      initialState: () => "open",
      context: ({ bindable }) => ({ unrelated: bindable(() => ({ defaultValue: 0 })) }),
      states: { open: { effects: ["gated"], on: { BUMP: { actions: ["bump"] } } } },
      implementations: {
        actions: { bump: ({ context }: any) => context.set("unrelated", (n: number) => n + 1) },
        effects: {
          gated: ({ prop, context, watchEffect }: any) =>
            watchEffect(
              [
                () => {
                  depReads++
                  return prop("enabled")
                },
              ],
              () => void context.get("unrelated"),
            ),
        },
      },
    })

    const view = await renderWithProps(machine, { enabled: true })
    await view.setProps({ enabled: false })

    const baseline = depReads
    for (let i = 0; i < 5; i++) await view.send({ type: "BUMP" })
    expect(depReads - baseline).toBe(0)
  })
})

describe("vue: restart coalescing", () => {
  test("several changes in one tick cost exactly one restart", async () => {
    const log: string[] = []
    const view = await renderWithProps(churnMachine(log), { v: 0 })

    await view.tick(({ setProps }) => {
      setProps({ v: 1 })
      setProps({ v: 2 })
      setProps({ v: 3 })
    })

    // initial setup + one restart; without coalescing each change rebuilds
    expect(log.filter((l) => l.startsWith("setup:")).length).toBeLessThanOrEqual(2)
    expect(log.at(-1)).toBe("setup:3")
  })

  test("a setup that mutates its own dep source does not loop", async () => {
    // deps are snapshotted after setup, so a self-write is already accounted for
    const setup = vi.fn()
    let counter = 0
    const machine = createMachine<any>({
      props: ({ props }) => ({ ...props }),
      initialState: () => "open",
      states: { open: { effects: ["selfMutating"] } },
      implementations: {
        effects: {
          selfMutating: ({ watchEffect }: any) =>
            watchEffect([() => counter], () => {
              setup()
              counter++
            }),
        },
      },
    })

    const view = await renderWithProps(machine, {})
    await view.setProps({ tick: 1 })
    await view.setProps({ tick: 2 })
    expect(setup).toHaveBeenCalledTimes(1)
  })
})

describe("vue: controlled open prop (the dialog shape)", () => {
  test("watch/track and watchEffect effects coexist", async () => {
    const log: string[] = []
    const view = await renderWithProps(controlledDialogMachine(log), { open: false, trapFocus: true })
    expect(log).toEqual([])

    await view.setProps({ open: true })
    expect(view.service.state.get()).toBe("open")
    expect(log).toEqual(["trap:on"])

    await view.setProps({ trapFocus: false })
    expect(view.service.state.get()).toBe("open")
    expect(log).toEqual(["trap:on", "trap:off"])

    await view.setProps({ trapFocus: true })
    expect(log).toEqual(["trap:on", "trap:off", "trap:on"])

    await view.setProps({ open: false })
    expect(view.service.state.get()).toBe("closed")
    expect(log).toEqual(["trap:on", "trap:off", "trap:on", "trap:off"])
  })

  test("open and a gating prop flipping together settles balanced", async () => {
    const log: string[] = []
    const view = await renderWithProps(controlledDialogMachine(log), { open: true, trapFocus: true })
    expect(log).toEqual(["trap:on"])

    await view.setProps({ open: false, trapFocus: false })
    expect(view.service.state.get()).toBe("closed")
    expect(log.filter((l) => l === "trap:on").length - log.filter((l) => l === "trap:off").length).toBe(0)
  })
})

describe("vue: teardown reason", () => {
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

  test("a dep change tears down with 'restart'", async () => {
    const reasons: string[] = []
    const view = await renderWithProps(reasonMachine(reasons), { v: 0 })

    await view.setProps({ v: 1 })
    expect(reasons).toEqual(["restart"])

    await view.setProps({ v: 2 })
    expect(reasons).toEqual(["restart", "restart"])
  })

  test("a state exit tears down with 'exit'", async () => {
    const reasons: string[] = []
    const view = await renderWithProps(reasonMachine(reasons), { v: 0 })

    await view.setProps({ v: 1 })
    await view.send({ type: "CLOSE" })
    expect(reasons).toEqual(["restart", "exit"])
  })

  test("unmount tears down with 'exit'", async () => {
    const reasons: string[] = []
    const view = await renderWithProps(reasonMachine(reasons), { v: 0 })

    await view.unmount()
    await view.flush()
    expect(reasons).toEqual(["exit"])
  })

  test("a plain cleanup that ignores the reason still runs", async () => {
    const cleanup = vi.fn()
    const machine = createMachine<any>({
      props: ({ props }) => ({ v: 0, ...props }),
      initialState: () => "open",
      states: { open: { effects: ["gated"] } },
      implementations: {
        effects: {
          gated: ({ prop, watchEffect }: any) => watchEffect([() => prop("v")], () => () => cleanup()),
        },
      },
    })

    const view = await renderWithProps(machine, { v: 0 })
    await view.setProps({ v: 1 })
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})

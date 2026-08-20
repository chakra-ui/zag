// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"
import { createHotkeyStore } from "../src/store"

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

describe("HotkeyStore", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("default options", () => {
    it("applies store-level default options during registration", () => {
      const store = createHotkeyStore({
        defaultOptions: {
          capture: false,
          enableOnContentEditable: true,
        },
      })

      store.register({
        id: "save",
        hotkey: "Control+S",
        action: () => {},
      })

      const command = store.getState().commands.get("save")
      expect(command?.options.capture).toBe(false)
      expect(command?.options.enableOnContentEditable).toBe(true)
      expect(command?.options.preventDefault).toBe(true)
    })

    it("lets command-level options override store defaults", () => {
      const store = createHotkeyStore({
        defaultOptions: {
          capture: false,
          enableOnContentEditable: true,
        },
      })

      store.register({
        id: "save",
        hotkey: "Control+S",
        action: () => {},
        options: {
          capture: true,
          enableOnContentEditable: false,
        },
      })

      const command = store.getState().commands.get("save")
      expect(command?.options.capture).toBe(true)
      expect(command?.options.enableOnContentEditable).toBe(false)
    })

    it("re-applies defaults to commands registered before init", () => {
      const store = createHotkeyStore()

      store.register({
        id: "save",
        hotkey: "Control+S",
        action: () => {},
      })

      store.init({
        target: document,
        defaultOptions: {
          capture: false,
        },
      })

      const command = store.getState().commands.get("save")
      expect(command?.options.capture).toBe(false)
      store.destroy()
    })
  })

  describe("isPressed", () => {
    it("matches physical code when logical key differs (layout-independent letter)", async () => {
      const store = createHotkeyStore({ target: document })
      store.register({ id: "q", hotkey: "Q", action: () => {} })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyQ", bubbles: true, cancelable: true }))
      await flushMicrotasks()

      expect(store.isPressed("Q")).toBe(true)
      expect(store.getPressedCodes()).toContain("KeyQ")
      store.destroy()
    })

    it("returns false for key sequences (not a chord)", async () => {
      const store = createHotkeyStore({ target: document })
      store.register({ id: "seq", hotkey: "a>b", action: () => {} })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }))
      await flushMicrotasks()

      expect(store.isPressed("a>b")).toBe(false)
      store.destroy()
    })

    it("for symbol hotkeys, rejects extra Control (matches chord semantics)", async () => {
      const store = createHotkeyStore({ target: document })
      store.register({ id: "slash", hotkey: "/", action: () => {} })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", code: "ControlLeft", bubbles: true }))
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "/", code: "Slash", bubbles: true }))
      await flushMicrotasks()

      expect(store.isPressed("/")).toBe(false)
      store.destroy()
    })

    it("clears pressedCodes on blur", async () => {
      const store = createHotkeyStore({ target: document })
      store.register({ id: "x", hotkey: "x", action: () => {} })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "x", code: "KeyX", bubbles: true }))
      await flushMicrotasks()
      expect(store.getPressedCodes()).toContain("KeyX")

      window.dispatchEvent(new Event("blur"))
      await flushMicrotasks()
      expect(store.getPressedCodes()).toEqual([])
      store.destroy()
    })
  })

  describe("sequences", () => {
    it("accepts a symbol step typed with Option/Alt held when Alt is not in the binding", async () => {
      const action = vi.fn()
      const store = createHotkeyStore({ target: document })
      store.register({
        id: "seq-pipe",
        hotkey: "a>|",
        action,
      })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true, cancelable: true }))
      await flushMicrotasks()

      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "|",
          code: "Digit1",
          altKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
      await flushMicrotasks()

      expect(action).toHaveBeenCalledTimes(1)
      store.destroy()
    })

    it("does not complete when Alt is required for the symbol step but not pressed", async () => {
      const action = vi.fn()
      const store = createHotkeyStore({ target: document })
      store.register({
        id: "seq-alt-slash-fail",
        hotkey: "b>Alt+/",
        action,
      })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "b", code: "KeyB", bubbles: true, cancelable: true }))
      await flushMicrotasks()

      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "/",
          code: "Slash",
          altKey: false,
          bubbles: true,
          cancelable: true,
        }),
      )
      await flushMicrotasks()
      expect(action).not.toHaveBeenCalled()
      store.destroy()
    })

    it("does not complete Control+letter step when AltGraph is active", async () => {
      const action = vi.fn()
      const store = createHotkeyStore({ target: document })
      store.register({
        id: "seq-ctrl-x-altg",
        hotkey: "a>Control+x",
        action,
      })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }))
      await flushMicrotasks()

      const ev = new KeyboardEvent("keydown", {
        key: "x",
        code: "KeyX",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
      Object.defineProperty(ev, "getModifierState", {
        value: (modifier: string) => modifier === "AltGraph",
        configurable: true,
      })
      document.dispatchEvent(ev)
      await flushMicrotasks()

      expect(action).not.toHaveBeenCalled()
      store.destroy()
    })

    it("completes Control+letter step when Ctrl is held and AltGraph is not active", async () => {
      const action = vi.fn()
      const store = createHotkeyStore({ target: document })
      store.register({
        id: "seq-ctrl-x-ok",
        hotkey: "a>Control+x",
        action,
      })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }))
      await flushMicrotasks()

      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "x",
          code: "KeyX",
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
      await flushMicrotasks()

      expect(action).toHaveBeenCalledTimes(1)
      store.destroy()
    })

    it("completes Alt+symbol step when Alt is held", async () => {
      const action = vi.fn()
      const store = createHotkeyStore({ target: document })
      store.register({
        id: "seq-alt-slash-ok",
        hotkey: "b>Alt+/",
        action,
      })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "b", code: "KeyB", bubbles: true, cancelable: true }))
      await flushMicrotasks()

      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "/",
          code: "Slash",
          altKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
      await flushMicrotasks()
      expect(action).toHaveBeenCalledTimes(1)
      store.destroy()
    })
  })
})

describe("key state tracking", () => {
  it("should report a held modifier via isPressed", () => {
    const store = createHotkeyStore()
    store.init({ target: document })
    store.register({ id: "a", hotkey: "ctrl+k", action: () => {} })

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", code: "ShiftLeft", shiftKey: true }))

    expect(store.isPressed("shift")).toBe(true)
    expect(store.getCurrentlyPressed()).toContain("Shift")

    store.destroy()
  })

  it("should track pressed keys with no commands registered", () => {
    const store = createHotkeyStore()
    store.init({ target: document })

    const seen: string[][] = []
    store.subscribe(
      (state) => Array.from(state.pressedKeys).join("|"),
      () => seen.push([...store.getCurrentlyPressed()]),
    )

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", code: "ShiftLeft", shiftKey: true }))

    expect(seen.at(-1)).toEqual(["Shift"])

    store.destroy()
  })

  it("should fire a command enabled after being registered as disabled", () => {
    const store = createHotkeyStore()
    store.init({ target: document })

    const action = vi.fn()
    store.register({ id: "a", hotkey: "ctrl+k", action, enabled: false })

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true }))
    expect(action).not.toHaveBeenCalled()

    store.enable("a")
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", code: "ControlLeft", ctrlKey: true }))
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true }))

    expect(action).toHaveBeenCalledTimes(1)

    store.destroy()
  })

  it("should detach all listeners on destroy even with active subscribers", () => {
    const store = createHotkeyStore()
    store.init({ target: document })
    store.subscribe(
      (state) => state.pressedKeys.size,
      () => {},
    )

    store.destroy()

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", code: "ShiftLeft", shiftKey: true }))

    expect(store.getState().listening).toBe(false)
    expect(store.getCurrentlyPressed()).toEqual([])
  })

  it("should fire a bubble-phase command registered after a subscriber", () => {
    const store = createHotkeyStore()
    store.init({ target: document })

    // Subscriber attaches a capture-phase listener first
    store.subscribe(
      (state) => state.pressedKeys.size,
      () => {},
    )

    const action = vi.fn()
    store.register({ id: "a", hotkey: "ctrl+k", action, options: { capture: false } })

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true }))

    expect(action).toHaveBeenCalledTimes(1)

    store.destroy()
  })

  it("should fire targeted commands only when the event originates within the target", () => {
    const store = createHotkeyStore()
    store.init({ target: document })

    const grid = document.createElement("div")
    const cell = document.createElement("button")
    grid.appendChild(cell)
    const outside = document.createElement("button")
    document.body.append(grid, outside)

    const action = vi.fn()
    store.register({ id: "nav", hotkey: "ArrowDown", action, options: { target: grid } })

    outside.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    expect(action).not.toHaveBeenCalled()

    cell.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))
    expect(action).toHaveBeenCalledTimes(1)

    store.destroy()
    grid.remove()
    outside.remove()
  })

  it("should skip a command while its target resolves to null", () => {
    const store = createHotkeyStore()
    store.init({ target: document })

    const el = document.createElement("div")
    document.body.appendChild(el)

    let current: Element | null = null
    const action = vi.fn()
    store.register({ id: "a", hotkey: "ctrl+k", action, options: { target: () => current } })

    el.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true, bubbles: true }))
    expect(action).not.toHaveBeenCalled()

    current = el
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true, bubbles: true }))
    expect(action).toHaveBeenCalledTimes(1)

    store.destroy()
    el.remove()
  })

  it("should match containment across shadow boundaries", () => {
    const store = createHotkeyStore()
    store.init({ target: document })

    const host = document.createElement("div")
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: "open" })
    const inner = document.createElement("button")
    shadow.appendChild(inner)

    const action = vi.fn()
    store.register({ id: "a", hotkey: "ctrl+k", action, options: { target: host } })

    inner.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true, bubbles: true, composed: true }),
    )
    expect(action).toHaveBeenCalledTimes(1)

    store.destroy()
    host.remove()
  })

  it("should prefer a targeted command over a global one on the same hotkey", () => {
    const store = createHotkeyStore({ conflictBehavior: "allow" })
    store.init({ target: document })

    const panel = document.createElement("div")
    document.body.appendChild(panel)

    const globalAction = vi.fn()
    const scopedAction = vi.fn()
    store.register({ id: "global", hotkey: "ctrl+k", action: globalAction })
    store.register({ id: "scoped", hotkey: "ctrl+k", action: scopedAction, options: { target: panel } })

    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true, bubbles: true }))
    expect(scopedAction).toHaveBeenCalledTimes(1)
    expect(globalAction).not.toHaveBeenCalled()

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true, bubbles: true }))
    expect(globalAction).toHaveBeenCalledTimes(1)
    expect(scopedAction).toHaveBeenCalledTimes(1)

    store.destroy()
    panel.remove()
  })

  it("should not warn when the same hotkey is registered on different targets", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const store = createHotkeyStore()
    store.init({ target: document })

    const el = document.createElement("div")
    document.body.appendChild(el)

    store.register({ id: "global", hotkey: "ctrl+p", action: () => {} })
    store.register({ id: "scoped", hotkey: "ctrl+p", action: () => {}, options: { target: el } })
    expect(warn).not.toHaveBeenCalled()

    store.register({ id: "global2", hotkey: "ctrl+p", action: () => {} })
    expect(warn).toHaveBeenCalledTimes(1)

    store.destroy()
    el.remove()
    warn.mockRestore()
  })

  it("should reset in-progress sequences when scopes change", () => {
    const store = createHotkeyStore({ activeScopes: "a" })
    store.init({ target: document })

    const action = vi.fn()
    store.register({ id: "seq", hotkey: "g > h", action, scopes: "a" })

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "g", code: "KeyG" }))
    store.removeScope("a")
    store.addScope("a")
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "h", code: "KeyH" }))

    expect(action).not.toHaveBeenCalled()

    store.destroy()
  })
})

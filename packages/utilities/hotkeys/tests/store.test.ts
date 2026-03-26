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
        rootNode: document,
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
      const store = createHotkeyStore({ rootNode: document })
      store.register({ id: "q", hotkey: "Q", action: () => {} })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyQ", bubbles: true, cancelable: true }))
      await flushMicrotasks()

      expect(store.isPressed("Q")).toBe(true)
      expect(store.getPressedCodes()).toContain("KeyQ")
      store.destroy()
    })

    it("returns false for key sequences (not a chord)", async () => {
      const store = createHotkeyStore({ rootNode: document })
      store.register({ id: "seq", hotkey: "a>b", action: () => {} })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }))
      await flushMicrotasks()

      expect(store.isPressed("a>b")).toBe(false)
      store.destroy()
    })

    it("for symbol hotkeys, rejects extra Control (matches chord semantics)", async () => {
      const store = createHotkeyStore({ rootNode: document })
      store.register({ id: "slash", hotkey: "/", action: () => {} })

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", code: "ControlLeft", bubbles: true }))
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "/", code: "Slash", bubbles: true }))
      await flushMicrotasks()

      expect(store.isPressed("/")).toBe(false)
      store.destroy()
    })

    it("clears pressedCodes on blur", async () => {
      const store = createHotkeyStore({ rootNode: document })
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
      const store = createHotkeyStore({ rootNode: document })
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
      const store = createHotkeyStore({ rootNode: document })
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
      const store = createHotkeyStore({ rootNode: document })
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
      const store = createHotkeyStore({ rootNode: document })
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
      const store = createHotkeyStore({ rootNode: document })
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

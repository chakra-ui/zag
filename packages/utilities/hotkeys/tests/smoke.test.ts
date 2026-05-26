// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"
import { createHotkeyStore } from "../src/store"

async function flush(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function keydown(
  key: string,
  code: string,
  mods: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, code, bubbles: true, cancelable: true, ...mods }))
}

function keyup(key: string, code: string) {
  document.dispatchEvent(new KeyboardEvent("keyup", { key, code, bubbles: true, cancelable: true }))
}

/**
 * Smoke tests for common keyboard shortcuts found in popular apps
 * (Linear, Notion, VS Code, Slack, GitHub, Figma, etc.)
 */
describe("Smoke: common app shortcuts", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function setup(hotkeys: { id: string; hotkey: string }[]) {
    const actions = new Map<string, ReturnType<typeof vi.fn>>()
    const store = createHotkeyStore({ target: document })

    for (const { id, hotkey } of hotkeys) {
      const action = vi.fn()
      actions.set(id, action)
      store.register({ id, hotkey, action })
    }

    return { store, actions }
  }

  // ─── Basic modifier chords ───────────────────────────────────

  describe("standard modifier chords", () => {
    const chords: [string, string, string, Record<string, boolean>][] = [
      // [id, hotkey, code, modifiers]
      // Clipboard / editing (universal)
      ["copy", "Control+C", "KeyC", { ctrlKey: true }],
      ["cut", "Control+X", "KeyX", { ctrlKey: true }],
      ["paste", "Control+V", "KeyV", { ctrlKey: true }],
      ["undo", "Control+Z", "KeyZ", { ctrlKey: true }],
      ["redo", "Control+Shift+Z", "KeyZ", { ctrlKey: true, shiftKey: true }],
      ["select-all", "Control+A", "KeyA", { ctrlKey: true }],
      ["save", "Control+S", "KeyS", { ctrlKey: true }],

      // Text formatting (Notion, Slack, Google Docs)
      ["bold", "Control+B", "KeyB", { ctrlKey: true }],
      ["italic", "Control+I", "KeyI", { ctrlKey: true }],
      ["underline", "Control+U", "KeyU", { ctrlKey: true }],
      ["strikethrough", "Control+Shift+S", "KeyS", { ctrlKey: true, shiftKey: true }],

      // Navigation (VS Code, browsers)
      ["find", "Control+F", "KeyF", { ctrlKey: true }],
      ["replace", "Control+H", "KeyH", { ctrlKey: true }],
      ["new-tab", "Control+T", "KeyT", { ctrlKey: true }],
      ["close-tab", "Control+W", "KeyW", { ctrlKey: true }],
      ["go-to-line", "Control+G", "KeyG", { ctrlKey: true }],

      // VS Code specifics
      ["command-palette", "Control+Shift+P", "KeyP", { ctrlKey: true, shiftKey: true }],
      ["quick-open", "Control+P", "KeyP", { ctrlKey: true }],
      ["toggle-sidebar", "Control+B", "KeyB", { ctrlKey: true }],
      ["toggle-terminal", "Control+`", "Backquote", { ctrlKey: true }],
      ["go-to-definition", "Control+Shift+F", "KeyF", { ctrlKey: true, shiftKey: true }],

      // Linear / project tools
      ["new-issue", "Control+Shift+N", "KeyN", { ctrlKey: true, shiftKey: true }],

      // Alt-based shortcuts
      ["alt-up", "Alt+ArrowUp", "ArrowUp", { altKey: true }],
      ["alt-down", "Alt+ArrowDown", "ArrowDown", { altKey: true }],

      // Shift-only
      ["shift-enter", "Shift+Enter", "Enter", { shiftKey: true }],
    ]

    for (const [id, hotkey, code, mods] of chords) {
      it(`${id}: ${hotkey}`, async () => {
        const { store, actions } = setup([{ id, hotkey }])

        // Dispatch main key with modifier flags — the store matches on event
        // modifier properties (ctrlKey, shiftKey, etc.), not on separate
        // modifier keydown events.
        const mainKey = hotkey.split("+").pop()!
        keydown(mainKey, code, mods)
        await flush()

        expect(actions.get(id)).toHaveBeenCalledTimes(1)
        keyup(mainKey, code)

        store.destroy()
      })
    }
  })

  // ─── Single key shortcuts ───────────────────────────────────

  describe("single key shortcuts", () => {
    // [id, hotkey, code, eventMods?]
    // eventMods reflects what a real browser sends (e.g. ? requires Shift)
    const singles: [string, string, string, Record<string, boolean>?][] = [
      // Notion / Linear / GitHub navigation
      ["slash-search", "/", "Slash"],
      ["question-help", "?", "Slash", { shiftKey: true }],
      ["escape", "Escape", "Escape"],
      ["enter", "Enter", "Enter"],
      ["space", "Space", "Space"],

      // Vim-style / Linear single letter shortcuts
      ["j-down", "j", "KeyJ"],
      ["k-up", "k", "KeyK"],
      ["x-archive", "x", "KeyX"],
      ["c-create", "c", "KeyC"],
      ["i-inbox", "i", "KeyI"],

      // Number keys
      ["priority-1", "1", "Digit1"],
      ["priority-2", "2", "Digit2"],
      ["priority-3", "3", "Digit3"],

      // Tab
      ["tab", "Tab", "Tab"],
    ]

    for (const [id, hotkey, code, eventMods] of singles) {
      it(`${id}: ${hotkey}`, async () => {
        const { store, actions } = setup([{ id, hotkey }])

        // Browsers send " " as the key value for Space
        const eventKey = hotkey === "Space" ? " " : hotkey
        keydown(eventKey, code, eventMods)
        await flush()

        expect(actions.get(id)).toHaveBeenCalledTimes(1)
        keyup(eventKey, code)
        store.destroy()
      })
    }
  })

  // ─── Function keys ──────────────────────────────────────────

  describe("function keys", () => {
    const fkeys: [string, string, string, Record<string, boolean>][] = [
      ["rename", "F2", "F2", {}],
      ["find-next", "F3", "F3", {}],
      ["refresh", "F5", "F5", {}],
      ["fullscreen", "F11", "F11", {}],
      ["devtools", "F12", "F12", {}],
      ["debug-start", "Control+F5", "F5", { ctrlKey: true }],
      ["step-over", "Shift+F10", "F10", { shiftKey: true }],
    ]

    for (const [id, hotkey, code, mods] of fkeys) {
      it(`${id}: ${hotkey}`, async () => {
        const { store, actions } = setup([{ id, hotkey }])

        if (mods.ctrlKey) keydown("Control", "ControlLeft", mods)
        if (mods.shiftKey) keydown("Shift", "ShiftLeft", mods)

        const mainKey = hotkey.split("+").pop()!
        keydown(mainKey, code, mods)
        await flush()

        expect(actions.get(id)).toHaveBeenCalledTimes(1)
        keyup(mainKey, code)
        store.destroy()
      })
    }
  })

  // ─── Key sequences ──────────────────────────────────────────

  describe("key sequences", () => {
    it("VS Code: g>g (go to top - vim)", async () => {
      const { store, actions } = setup([{ id: "go-top", hotkey: "g>g" }])

      keydown("g", "KeyG")
      await flush()
      keyup("g", "KeyG")

      keydown("g", "KeyG")
      await flush()

      expect(actions.get("go-top")).toHaveBeenCalledTimes(1)
      store.destroy()
    })

    it("GitHub: g>i (go to issues)", async () => {
      const { store, actions } = setup([{ id: "go-issues", hotkey: "g>i" }])

      keydown("g", "KeyG")
      await flush()
      keyup("g", "KeyG")

      keydown("i", "KeyI")
      await flush()

      expect(actions.get("go-issues")).toHaveBeenCalledTimes(1)
      store.destroy()
    })

    it("GitHub: g>p (go to pull requests)", async () => {
      const { store, actions } = setup([{ id: "go-prs", hotkey: "g>p" }])

      keydown("g", "KeyG")
      await flush()
      keyup("g", "KeyG")

      keydown("p", "KeyP")
      await flush()

      expect(actions.get("go-prs")).toHaveBeenCalledTimes(1)
      store.destroy()
    })

    // NOTE: For modifier sequences (Ctrl+K > Ctrl+S), we only dispatch the main
    // key with ctrlKey in the event props — NOT a separate "Control" keydown.
    // A standalone modifier keydown would be processed as a sequence step, fail
    // to match the expected key, and reset the sequence state. This mirrors how
    // the store works: it matches on event.ctrlKey/shiftKey/etc., not on
    // separate modifier key events.

    it("VS Code-style: Control+k>Control+s (open keyboard shortcuts)", async () => {
      const { store, actions } = setup([{ id: "kb-shortcuts", hotkey: "Control+k>Control+s" }])

      keydown("k", "KeyK", { ctrlKey: true })
      await flush()
      keyup("k", "KeyK")

      keydown("s", "KeyS", { ctrlKey: true })
      await flush()

      expect(actions.get("kb-shortcuts")).toHaveBeenCalledTimes(1)
      store.destroy()
    })

    it("VS Code-style: Control+k>Control+c (add line comment)", async () => {
      const { store, actions } = setup([{ id: "line-comment", hotkey: "Control+k>Control+c" }])

      keydown("k", "KeyK", { ctrlKey: true })
      await flush()
      keyup("k", "KeyK")

      keydown("c", "KeyC", { ctrlKey: true })
      await flush()

      expect(actions.get("line-comment")).toHaveBeenCalledTimes(1)
      store.destroy()
    })
  })

  // ─── Multiple shortcuts coexisting ──────────────────────────

  describe("multiple shortcuts coexisting", () => {
    it("distinguishes Ctrl+S from Ctrl+Shift+S", async () => {
      const { store, actions } = setup([
        { id: "save", hotkey: "Control+S" },
        { id: "save-as", hotkey: "Control+Shift+S" },
      ])

      // Ctrl+S
      keydown("Control", "ControlLeft", { ctrlKey: true })
      keydown("s", "KeyS", { ctrlKey: true })
      await flush()
      expect(actions.get("save")).toHaveBeenCalledTimes(1)
      expect(actions.get("save-as")).not.toHaveBeenCalled()
      keyup("s", "KeyS")
      keyup("Control", "ControlLeft")

      // Ctrl+Shift+S
      keydown("Control", "ControlLeft", { ctrlKey: true, shiftKey: true })
      keydown("Shift", "ShiftLeft", { ctrlKey: true, shiftKey: true })
      keydown("S", "KeyS", { ctrlKey: true, shiftKey: true })
      await flush()
      expect(actions.get("save-as")).toHaveBeenCalledTimes(1)
      // save should still be 1 (not re-fired)
      expect(actions.get("save")).toHaveBeenCalledTimes(1)

      store.destroy()
    })

    it("distinguishes single key from modified version", async () => {
      const { store, actions } = setup([
        { id: "slash-search", hotkey: "/" },
        { id: "ctrl-slash-comment", hotkey: "Control+/" },
      ])

      // Just /
      keydown("/", "Slash")
      await flush()
      expect(actions.get("slash-search")).toHaveBeenCalledTimes(1)
      expect(actions.get("ctrl-slash-comment")).not.toHaveBeenCalled()
      keyup("/", "Slash")

      // Ctrl+/
      keydown("Control", "ControlLeft", { ctrlKey: true })
      keydown("/", "Slash", { ctrlKey: true })
      await flush()
      expect(actions.get("ctrl-slash-comment")).toHaveBeenCalledTimes(1)
      // slash-search should still be 1
      expect(actions.get("slash-search")).toHaveBeenCalledTimes(1)

      store.destroy()
    })
  })

  // ─── Arrow key combos ──────────────────────────────────────

  describe("arrow key combinations", () => {
    const arrowCombos: [string, string, string, Record<string, boolean>][] = [
      ["move-line-up", "Alt+ArrowUp", "ArrowUp", { altKey: true }],
      ["move-line-down", "Alt+ArrowDown", "ArrowDown", { altKey: true }],
      ["select-word-left", "Control+Shift+ArrowLeft", "ArrowLeft", { ctrlKey: true, shiftKey: true }],
      ["select-word-right", "Control+Shift+ArrowRight", "ArrowRight", { ctrlKey: true, shiftKey: true }],
      ["go-start", "Control+ArrowUp", "ArrowUp", { ctrlKey: true }],
      ["go-end", "Control+ArrowDown", "ArrowDown", { ctrlKey: true }],
    ]

    for (const [id, hotkey, code, mods] of arrowCombos) {
      it(`${id}: ${hotkey}`, async () => {
        const { store, actions } = setup([{ id, hotkey }])

        const mainKey = hotkey.split("+").pop()!
        keydown(mainKey, code, mods)
        await flush()

        expect(actions.get(id)).toHaveBeenCalledTimes(1)
        keyup(mainKey, code)
        store.destroy()
      })
    }
  })

  // ─── Special symbols / punctuation ─────────────────────────

  describe("symbol and punctuation shortcuts", () => {
    const symbols: [string, string, string, string, Record<string, boolean>][] = [
      // [id, hotkey, key, code, mods]
      ["zoom-in", "Control++", "+", "Equal", { ctrlKey: true }],
      ["zoom-out", "Control+-", "-", "Minus", { ctrlKey: true }],
      ["zoom-reset", "Control+0", "0", "Digit0", { ctrlKey: true }],
      ["toggle-comment", "Control+/", "/", "Slash", { ctrlKey: true }],
      ["bracket-left", "Control+[", "[", "BracketLeft", { ctrlKey: true }],
      ["bracket-right", "Control+]", "]", "BracketRight", { ctrlKey: true }],
      ["backtick", "Control+`", "`", "Backquote", { ctrlKey: true }],
    ]

    for (const [id, hotkey, key, code, mods] of symbols) {
      it(`${id}: ${hotkey}`, async () => {
        const { store, actions } = setup([{ id, hotkey }])

        keydown(key, code, mods)
        await flush()

        expect(actions.get(id)).toHaveBeenCalledTimes(1)
        keyup(key, code)
        store.destroy()
      })
    }
  })

  // ─── Negative cases (should NOT fire) ──────────────────────

  describe("should NOT fire", () => {
    it("Ctrl+S does not fire on plain S", async () => {
      const { store, actions } = setup([{ id: "save", hotkey: "Control+S" }])

      keydown("s", "KeyS")
      await flush()

      expect(actions.get("save")).not.toHaveBeenCalled()
      store.destroy()
    })

    it("plain letter does not fire when Ctrl is held", async () => {
      const { store, actions } = setup([{ id: "just-s", hotkey: "s" }])

      keydown("s", "KeyS", { ctrlKey: true })
      await flush()

      expect(actions.get("just-s")).not.toHaveBeenCalled()
      store.destroy()
    })

    it("Ctrl+Shift+P does not fire on Ctrl+P", async () => {
      const { store, actions } = setup([{ id: "cmd-palette", hotkey: "Control+Shift+P" }])

      keydown("p", "KeyP", { ctrlKey: true })
      await flush()

      expect(actions.get("cmd-palette")).not.toHaveBeenCalled()
      store.destroy()
    })

    it("sequence does not fire if wrong second key", async () => {
      const { store, actions } = setup([{ id: "g-i", hotkey: "g>i" }])

      keydown("g", "KeyG")
      await flush()
      keyup("g", "KeyG")

      keydown("p", "KeyP")
      await flush()

      expect(actions.get("g-i")).not.toHaveBeenCalled()
      store.destroy()
    })
  })
})

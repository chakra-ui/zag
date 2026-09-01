// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  getInteractionModality,
  isFocusVisible,
  setInteractionModality,
  trackFocusVisible,
  trackInteractionModality,
} from "../src"

function focusTarget(target: EventTarget) {
  target.dispatchEvent(new FocusEvent("focus", { bubbles: false }))
}

function pointerDown(target: EventTarget = document) {
  target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
}

function keyDown(key: string, init: KeyboardEventInit = {}) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }))
}

describe("focus-visible", () => {
  let button: HTMLButtonElement
  let cleanups: VoidFunction[]

  beforeEach(() => {
    button = document.createElement("button")
    button.type = "button"
    document.body.append(button)
    cleanups = [trackFocusVisible()]
  })

  afterEach(() => {
    cleanups.splice(0).forEach((fn) => fn())
    document.body.innerHTML = ""
  })

  describe("modality", () => {
    test("pointer down is not focus visible", () => {
      pointerDown(button)
      expect(getInteractionModality()).toBe("pointer")
      expect(isFocusVisible()).toBe(false)
    })

    test("a character key is keyboard focus visible", () => {
      keyDown("Tab")
      expect(getInteractionModality()).toBe("keyboard")
      expect(isFocusVisible()).toBe(true)
    })

    test("modifier-only keys do not switch to keyboard", () => {
      pointerDown(button)
      keyDown("Shift")
      keyDown("Control")
      keyDown("Meta")
      expect(getInteractionModality()).toBe("pointer")
      expect(isFocusVisible()).toBe(false)
    })

    test("ctrl/meta plus a key do not switch to keyboard", () => {
      pointerDown(button)
      keyDown("a", { metaKey: true })
      keyDown("a", { ctrlKey: true })
      expect(getInteractionModality()).toBe("pointer")
    })

    test("setInteractionModality updates getters and subscribers", () => {
      const onChange = vi.fn()
      cleanups.push(trackFocusVisible({ onChange }))
      onChange.mockClear()

      setInteractionModality("keyboard")
      expect(getInteractionModality()).toBe("keyboard")
      expect(isFocusVisible()).toBe(true)
      expect(onChange).toHaveBeenCalledWith({ isFocusVisible: true, modality: "keyboard" })

      setInteractionModality("pointer")
      expect(isFocusVisible()).toBe(false)
    })

    test("trackInteractionModality reports the current modality", () => {
      const onChange = vi.fn()
      pointerDown(button)
      cleanups.push(trackInteractionModality({ onChange }))
      expect(onChange).toHaveBeenCalledWith({ modality: "pointer" })

      onChange.mockClear()
      keyDown("Tab")
      expect(onChange).toHaveBeenLastCalledWith({ modality: "keyboard" })
    })
  })

  describe("trackFocusVisible", () => {
    test("notifies on pointer and keyboard changes", () => {
      const onChange = vi.fn()
      cleanups.push(trackFocusVisible({ onChange }))
      onChange.mockClear()

      pointerDown(button)
      expect(onChange).toHaveBeenCalledWith({ isFocusVisible: false, modality: "pointer" })

      onChange.mockClear()
      keyDown("Tab")
      expect(onChange).toHaveBeenCalledWith({ isFocusVisible: true, modality: "keyboard" })
    })

    test("stops notifying after cleanup", () => {
      const onChange = vi.fn()
      const stop = trackFocusVisible({ onChange })
      onChange.mockClear()
      stop()

      pointerDown(button)
      keyDown("Tab")
      expect(onChange).not.toHaveBeenCalled()
    })

    test("autoFocus reports visible on subscribe even when modality is pointer", () => {
      pointerDown(button)
      const onChange = vi.fn()
      cleanups.push(trackFocusVisible({ autoFocus: true, onChange }))
      expect(onChange).toHaveBeenCalledWith({ isFocusVisible: true, modality: "pointer" })
    })
  })

  describe("virtual focus", () => {
    test("programmatic element.focus does not flip pointer to virtual", () => {
      pointerDown(button)
      button.focus()
      expect(getInteractionModality()).toBe("pointer")
      expect(isFocusVisible()).toBe(false)
    })

    test("untrusted element focus does not become virtual", () => {
      pointerDown(button)
      focusTarget(button)
      focusTarget(button)
      expect(getInteractionModality()).toBe("pointer")
      expect(isFocusVisible()).toBe(false)
    })

    test("document focus does not become virtual", () => {
      pointerDown(button)
      focusTarget(document)
      expect(getInteractionModality()).toBe("pointer")
    })

    test("a virtual click sets virtual modality", () => {
      document.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }))
      expect(getInteractionModality()).toBe("virtual")
      expect(isFocusVisible()).toBe(true)
    })
  })

  describe("text input", () => {
    test("arrow keys in a text field do not notify a text-input subscriber", () => {
      const input = document.createElement("input")
      input.type = "text"
      document.body.append(input)
      input.focus()

      const onChange = vi.fn()
      cleanups.push(trackFocusVisible({ isTextInput: true, onChange }))
      onChange.mockClear()

      keyDown("ArrowLeft")
      expect(getInteractionModality()).toBe("keyboard")
      expect(onChange).not.toHaveBeenCalled()

      keyDown("Tab")
      expect(onChange).toHaveBeenCalledWith({ isFocusVisible: true, modality: "keyboard" })
    })

    test("arrow keys are ignored while a text field is focused", () => {
      const input = document.createElement("input")
      input.type = "text"
      document.body.append(input)
      input.focus()

      const onChange = vi.fn()
      cleanups.push(trackFocusVisible({ onChange }))
      onChange.mockClear()

      keyDown("ArrowDown")
      expect(onChange).not.toHaveBeenCalled()

      keyDown("Escape")
      expect(onChange).toHaveBeenCalledWith({ isFocusVisible: true, modality: "keyboard" })
    })

    test("arrow keys in a checkbox still notify", () => {
      const input = document.createElement("input")
      input.type = "checkbox"
      document.body.append(input)
      input.focus()

      const onChange = vi.fn()
      cleanups.push(trackFocusVisible({ onChange }))
      onChange.mockClear()

      keyDown("ArrowLeft")
      expect(onChange).toHaveBeenCalledWith({ isFocusVisible: true, modality: "keyboard" })
    })
  })

  describe("tab return", () => {
    test("window focus after a blur does not switch pointer to virtual", () => {
      pointerDown(button)
      window.dispatchEvent(new Event("blur"))
      focusTarget(window)

      expect(getInteractionModality()).toBe("pointer")
      expect(isFocusVisible()).toBe(false)
    })

    test("window focus after a blur keeps a keyboard focus ring", () => {
      keyDown("Tab")
      window.dispatchEvent(new Event("blur"))
      focusTarget(window)

      expect(getInteractionModality()).toBe("keyboard")
      expect(isFocusVisible()).toBe(true)
    })
  })
})

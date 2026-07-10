// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { autoresizeTextarea } from "../src"

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub)
  return () => vi.unstubAllGlobals()
})

const nativeValueDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!

/**
 * Mimics how React tracks controlled inputs (`inputValueTracking`): it wraps `value`
 * with an own property so programmatic writes update its last-known value, then
 * ignores `input` events whose value matches the last-known value.
 */
function trackValue(el: HTMLTextAreaElement) {
  let currentValue = el.value

  Object.defineProperty(el, "value", {
    configurable: true,
    enumerable: nativeValueDescriptor.enumerable,
    get() {
      return nativeValueDescriptor.get!.call(this)
    },
    set(value: string) {
      currentValue = String(value)
      nativeValueDescriptor.set!.call(this, value)
    },
  })

  return {
    getValue: () => currentValue,
    updateValueIfChanged() {
      const nextValue = nativeValueDescriptor.get!.call(el) as string
      if (nextValue === currentValue) return false
      currentValue = nextValue
      return true
    },
  }
}

/**
 * Simulates user typing: the browser updates the internal value directly
 * (bypassing any own `value` property) and fires a trusted `input` event.
 */
function typeIntoTextarea(el: HTMLTextAreaElement, text: string) {
  nativeValueDescriptor.set!.call(el, text)
  el.dispatchEvent(new InputEvent("input", { bubbles: true }))
}

function flushMicrotasks() {
  return new Promise<void>((resolve) => {
    queueMicrotask(() => queueMicrotask(resolve))
  })
}

let cleanup: VoidFunction | undefined

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  document.body.innerHTML = ""
})

test("programmatic value writes do not dispatch input events", async () => {
  const el = document.createElement("textarea")
  document.body.appendChild(el)

  cleanup = autoresizeTextarea(el)

  const onInput = vi.fn()
  el.addEventListener("input", onInput)

  el.value = "hello"
  await flushMicrotasks()

  expect(el.value).toBe("hello")
  expect(onInput).not.toHaveBeenCalled()
})

test("programmatic value writes keep the framework value tracker in sync", async () => {
  const el = document.createElement("textarea")
  document.body.appendChild(el)

  const tracker = trackValue(el)
  cleanup = autoresizeTextarea(el)

  el.value = "hello"
  await flushMicrotasks()

  expect(tracker.getValue()).toBe("hello")
})

test("controlled textarea that rejects input fires onChange once per keystroke", async () => {
  const el = document.createElement("textarea")
  document.body.appendChild(el)

  const tracker = trackValue(el)
  cleanup = autoresizeTextarea(el)

  let state = ""
  const onChange = vi.fn((value: string) => {
    // reject digits (canonical controlled-input pattern)
    if (!/\d/.test(value)) state = value
  })

  el.addEventListener("input", () => {
    if (!tracker.updateValueIfChanged()) return
    onChange(el.value)
    // controlled re-render: restore the DOM value when state rejects the input
    if (el.value !== state) el.value = state
  })

  typeIntoTextarea(el, "1")
  await flushMicrotasks()

  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange).toHaveBeenCalledWith("1")
  expect(el.value).toBe("")
})

test("clearing a controlled textarea programmatically keeps change detection working", async () => {
  const el = document.createElement("textarea")
  document.body.appendChild(el)

  const tracker = trackValue(el)
  cleanup = autoresizeTextarea(el)

  let state = ""
  const onChange = vi.fn((value: string) => {
    state = value
  })

  el.addEventListener("input", () => {
    if (!tracker.updateValueIfChanged()) return
    onChange(el.value)
    if (el.value !== state) el.value = state
  })

  typeIntoTextarea(el, "a")
  await flushMicrotasks()
  expect(onChange).toHaveBeenNthCalledWith(1, "a")

  // clear button: state resets and the framework writes the value back
  state = ""
  el.value = ""
  await flushMicrotasks()

  // typing the same character again must not be swallowed by the tracker
  typeIntoTextarea(el, "a")
  await flushMicrotasks()

  expect(onChange).toHaveBeenCalledTimes(2)
  expect(onChange).toHaveBeenNthCalledWith(2, "a")
  expect(state).toBe("a")
})

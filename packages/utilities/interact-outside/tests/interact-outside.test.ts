// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { trackInteractOutside } from "../src"

let frames: FrameRequestCallback[]
const cleanups: VoidFunction[] = []

function flushFrames() {
  frames.splice(0).forEach((fn) => fn(performance.now()))
}

function setup() {
  const node = document.createElement("div")
  node.id = "content"
  const outside = document.createElement("button")
  document.body.append(node, outside)
  return { node, outside }
}

function track(node: HTMLElement, defer: boolean) {
  const onPointerDownOutside = vi.fn()
  const onFocusOutside = vi.fn()
  cleanups.push(trackInteractOutside(node, { defer, onPointerDownOutside, onFocusOutside }))
  return { onPointerDownOutside, onFocusOutside }
}

function pointerdown(timeStamp?: number) {
  const event = new MouseEvent("pointerdown", { bubbles: true, composed: true })
  if (timeStamp !== undefined) Object.defineProperty(event, "timeStamp", { value: timeStamp })
  return event
}

describe("trackInteractOutside", () => {
  beforeEach(() => {
    frames = []
    vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => frames.push(fn))
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      frames[id - 1] = () => {}
    })
  })

  afterEach(() => {
    cleanups.splice(0).forEach((fn) => fn())
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  test("detects an outside press immediately after tracking starts", () => {
    const { node, outside } = setup()
    const { onPointerDownOutside } = track(node, false)
    outside.dispatchEvent(pointerdown())
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1)
  })

  test("keeps an outside press that arrives before the next frame", () => {
    const { node, outside } = setup()
    const { onPointerDownOutside } = track(node, true)
    outside.dispatchEvent(pointerdown())
    expect(onPointerDownOutside).not.toHaveBeenCalled()
    flushFrames()
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1)
  })

  test("ignores a press that started before tracking", () => {
    const { node, outside } = setup()
    const startedEarlier = performance.now() - 50
    const { onPointerDownOutside } = track(node, false)
    outside.dispatchEvent(pointerdown(startedEarlier))
    expect(onPointerDownOutside).not.toHaveBeenCalled()
  })

  test("defers focus tracking until the next frame", () => {
    const { node, outside } = setup()
    const { onFocusOutside } = track(node, true)
    outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
    flushFrames()
    expect(onFocusOutside).not.toHaveBeenCalled()
    outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
    flushFrames()
    expect(onFocusOutside).toHaveBeenCalledTimes(1)
  })

  test("resolves a node that mounts by the next frame", () => {
    const outside = document.createElement("button")
    document.body.append(outside)
    let node: HTMLElement | null = null
    const onPointerDownOutside = vi.fn()
    cleanups.push(trackInteractOutside(() => node, { defer: true, onPointerDownOutside }))
    node = document.createElement("div")
    document.body.append(node)
    flushFrames()
    outside.dispatchEvent(pointerdown())
    flushFrames()
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1)
  })

  test("stops tracking on cleanup, including a pending frame", () => {
    const { node, outside } = setup()
    const { onPointerDownOutside, onFocusOutside } = track(node, true)
    cleanups.pop()!()
    outside.dispatchEvent(pointerdown())
    outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }))
    flushFrames()
    expect(onPointerDownOutside).not.toHaveBeenCalled()
    expect(onFocusOutside).not.toHaveBeenCalled()
  })
})

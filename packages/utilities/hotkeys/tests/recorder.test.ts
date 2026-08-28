// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createHotkeyRecorder, type HotkeyRecorder } from "../src"

function press(key: string, init: KeyboardEventInit = {}) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key, ...init }))
}

describe("HotkeyRecorder", () => {
  let recorder: HotkeyRecorder

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    recorder?.destroy()
    vi.useRealTimers()
  })

  it("should record a chord and fire onRecord after the sequence timeout", () => {
    const onRecord = vi.fn()
    recorder = createHotkeyRecorder({ target: document, onRecord })

    recorder.start()
    press("g")
    vi.advanceTimersByTime(1000)

    expect(recorder.getState().recording).toBe(false)
    expect(recorder.getState().value?.value).toBe("G")
    expect(onRecord).toHaveBeenCalledTimes(1)
  })

  it("should keep the previous value when stopped without recording anything", () => {
    const onRecord = vi.fn()
    recorder = createHotkeyRecorder({ target: document, onRecord })

    recorder.start()
    press("k")
    vi.advanceTimersByTime(1000)
    expect(recorder.getState().value?.value).toBe("K")

    recorder.start()
    recorder.stop()

    expect(recorder.getState().value?.value).toBe("K")
    expect(onRecord).toHaveBeenCalledTimes(1)
  })

  it("should restore the pre-recording value on cancel after partial input", () => {
    const onCancel = vi.fn()
    recorder = createHotkeyRecorder({ target: document, onCancel })

    recorder.start()
    press("k")
    vi.advanceTimersByTime(1000)
    expect(recorder.getState().value?.value).toBe("K")

    recorder.start()
    press("g")
    expect(recorder.getState().value?.value).toBe("G")

    recorder.cancel()

    expect(recorder.getState().value?.value).toBe("K")
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("should cancel via Escape and restore the pre-recording value", () => {
    recorder = createHotkeyRecorder({ target: document })

    recorder.start()
    press("k")
    vi.advanceTimersByTime(1000)

    recorder.start()
    press("g")
    press("Escape")

    expect(recorder.getState().recording).toBe(false)
    expect(recorder.getState().value?.value).toBe("K")
  })

  it("should clear the value and not resurrect it on a later cancel", () => {
    const onClear = vi.fn()
    recorder = createHotkeyRecorder({ target: document, onClear })

    recorder.start()
    press("k")
    vi.advanceTimersByTime(1000)

    recorder.start()
    press("Backspace")
    expect(recorder.getState().value).toBeNull()
    expect(onClear).toHaveBeenCalledTimes(1)

    recorder.start()
    recorder.cancel()
    expect(recorder.getState().value).toBeNull()
  })
})

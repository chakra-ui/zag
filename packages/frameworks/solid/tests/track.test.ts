import { renderHook } from "@solidjs/testing-library"
import { createSignal, flush } from "solid-js"
import { createTrack } from "../src/track"

test("watch callbacks can read live values without untracked-read diagnostics", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const [value, setValue] = createSignal(0)
  let observed = 0
  const { cleanup } = renderHook(() => {
    createTrack([value], () => {
      observed = value()
    })
  })

  try {
    setValue(1)
    flush()

    expect(observed).toBe(1)
    expect(warn).not.toHaveBeenCalled()
  } finally {
    cleanup()
    warn.mockRestore()
  }
})

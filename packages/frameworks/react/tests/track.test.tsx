import { render } from "@testing-library/react"
import { Activity, StrictMode } from "react"
import { useTrack } from "../src/track"

function Tracker(props: { value: number; onChange: () => void }) {
  useTrack([() => props.value], props.onChange)
  return null
}

function renderTracker(onChange: () => void) {
  const view = render(
    <Activity mode="visible">
      <Tracker value={1} onChange={onChange} />
    </Activity>,
  )
  const rerender = (mode: "visible" | "hidden", value: number) =>
    view.rerender(
      <Activity mode={mode}>
        <Tracker value={value} onChange={onChange} />
      </Activity>,
    )
  return { rerender }
}

describe("useTrack", () => {
  test("does not run on mount, even in Strict Mode", () => {
    const onChange = vi.fn()
    render(
      <StrictMode>
        <Tracker value={1} onChange={onChange} />
      </StrictMode>,
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  test("runs once per change", () => {
    const onChange = vi.fn()
    const { rerender } = renderTracker(onChange)
    rerender("visible", 2)
    rerender("visible", 2)
    rerender("visible", 3)
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  test("runs on reveal for a change made inside a hidden Activity", () => {
    const onChange = vi.fn()
    const { rerender } = renderTracker(onChange)
    rerender("hidden", 1)
    rerender("hidden", 2)
    expect(onChange).not.toHaveBeenCalled()
    rerender("visible", 2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  test("does not run on reveal when nothing changed while hidden", () => {
    const onChange = vi.fn()
    const { rerender } = renderTracker(onChange)
    rerender("hidden", 1)
    rerender("visible", 1)
    expect(onChange).not.toHaveBeenCalled()
  })
})

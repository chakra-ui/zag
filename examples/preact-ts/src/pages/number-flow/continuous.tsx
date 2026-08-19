import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useEffect, useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/number-flow.css"

export default function Page() {
  const [value, setValue] = useState(0)
  const [continuous, setContinuous] = useState(true)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setValue((v) => v + Math.round(Math.random() * 45 + 5)), 900)
    return () => clearInterval(id)
  }, [playing])

  const service = useMachine(numberFlow.machine, {
    id: useId(),
    value,
    continuous,
    spinTiming: { duration: "800ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  })

  const api = numberFlow.connect(service, normalizeProps)

  return (
    <>
      <main className="number-flow">
        <div {...api.getRootProps()}>
          {api.segments.map((segment) =>
            segment.kind === "digit" ? (
              <span key={segment.key} {...api.getDigitProps({ segment })}>
                <span {...api.getDigitTrackProps({ segment })}>
                  {api.digitCells.map((cell) => (
                    <span key={cell.index} {...api.getDigitCellProps({ segment, cell })}>
                      {cell.glyph}
                    </span>
                  ))}
                </span>
              </span>
            ) : (
              <span key={segment.key} {...api.getSymbolProps({ segment })}>
                {segment.value}
              </span>
            ),
          )}
          <span {...api.getValueTextProps()}>{api.announcedValueText}</span>
        </div>

        <div className="number-flow__actions">
          <button onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</button>
          <button onClick={() => setValue(0)}>Reset</button>
          <label>
            <input type="checkbox" checked={continuous} onChange={(e) => setContinuous(e.target.checked)} />
            continuous (spin through intermediates)
          </label>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

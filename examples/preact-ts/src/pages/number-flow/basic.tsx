import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { numberFlowControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import "@styles/number-flow.css"

export default function Page() {
  const controls = useControls(numberFlowControls)
  const [animations, setAnimations] = useState({ started: 0, completed: 0 })

  const service = useMachine(numberFlow.machine, {
    id: useId(),
    defaultValue: 1234,
    onAnimationStart() {
      setAnimations((prev) => ({ ...prev, started: prev.started + 1 }))
    },
    onAnimationComplete() {
      setAnimations((prev) => ({ ...prev, completed: prev.completed + 1 }))
    },
    ...controls.context,
  })

  const api = numberFlow.connect(service, normalizeProps)

  const randomDelta = () => Math.round(Math.random() * 900 + 1)

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
          <button onClick={() => api.setValue(api.value - randomDelta())}>Decrement</button>
          <button onClick={() => api.setValue(api.value + randomDelta())}>Increment</button>
          <button onClick={() => api.setValue(Math.round(Math.random() * 99999))}>Randomize</button>
          <button onClick={() => api.setValue(0)}>Reset</button>
          <span className="number-flow__value" data-testid="value">
            value: {api.value} {api.animating ? "(rolling)" : ""}
          </span>
          <span className="number-flow__value" data-testid="animations">
            animations: {animations.started} started / {animations.completed} completed
          </span>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

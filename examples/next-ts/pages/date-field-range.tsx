import * as dateField from "@zag-js/date-field"
import { normalizeProps, useMachine } from "@zag-js/react"
import { dateFieldControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(dateFieldControls)
  const service = useMachine(dateField.machine, {
    id: useId(),
    selectionMode: "range",
    ...controls.context,
  })

  const api = dateField.connect(service, normalizeProps)

  return (
    <>
      <main className="date-field">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Date Range</label>

          <div {...api.getControlProps()}>
            <div {...api.getSegmentGroupProps({ index: 0 })}>
              {api.getSegments({ index: 0 }).map((segment, i) => (
                <span key={i} {...api.getSegmentProps({ segment, index: 0 })}>
                  {segment.text}
                </span>
              ))}
            </div>

            <span> &ndash; </span>

            <div {...api.getSegmentGroupProps({ index: 1 })}>
              {api.getSegments({ index: 1 }).map((segment, i) => (
                <span key={i} {...api.getSegmentProps({ segment, index: 1 })}>
                  {segment.text}
                </span>
              ))}
            </div>
          </div>

          <input {...api.getHiddenInputProps({ index: 0 })} />
          <input {...api.getHiddenInputProps({ index: 1 })} />
        </div>

        <output className="date-output">
          <div>Selected: {api.valueAsString.join(" - ") || "-"}</div>
        </output>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

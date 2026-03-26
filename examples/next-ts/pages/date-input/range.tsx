import styles from "../../../../shared/src/css/date-input.module.css"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { dateInputControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(dateInputControls)
  const service = useMachine(dateInput.machine, {
    id: useId(),
    selectionMode: "range",
    ...controls.context,
  })

  const api = dateInput.connect(service, normalizeProps)

  return (
    <>
      <main className="date-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Date Range</label>

          <div {...api.getControlProps()} className={styles.Control}>
            <div {...api.getSegmentGroupProps({ index: 0 })} className={styles.SegmentGroup}>
              {api.getSegments({ index: 0 }).map((segment, i) => (
                <span key={i} {...api.getSegmentProps({ segment, index: 0 })} className={styles.Segment}>
                  {segment.text}
                </span>
              ))}
            </div>

            <span> &ndash; </span>

            <div {...api.getSegmentGroupProps({ index: 1 })} className={styles.SegmentGroup}>
              {api.getSegments({ index: 1 }).map((segment, i) => (
                <span key={i} {...api.getSegmentProps({ segment, index: 1 })} className={styles.Segment}>
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
          <div>Placeholder: {api.placeholderValue.toString()}</div>
          {api.displayValues?.map((date, index) => (
            <div>
              Editing input {index + 1}: {date.toString() ?? "-"}
            </div>
          ))}
        </output>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

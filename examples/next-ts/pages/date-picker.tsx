import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { datePickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(datePickerControls)

  const [state, send] = useMachine(datePicker.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = datePicker.connect(state, send, normalizeProps)

  return (
    <>
      <main className="date-picker">
        <div {...api.rootProps}>
          <output className="date-output">
            <div>Selected: {api.valueAsString ?? "-"}</div>
            <div>Focused: {api.focusedValueAsString}</div>
          </output>
          <div data-scope="date-picker" data-part="control">
            <input {...api.fieldProps} />
            <button {...api.triggerProps}>🗓</button>
          </div>
          <div>
            <button {...api.prevTriggerProps}>Prev</button>
            <button {...api.nextTriggerProps}>Next</button>
          </div>
          <table {...api.gridProps}>
            <thead>
              <tr>
                {api.weekDays.map((day, i) => (
                  <th key={i}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {api.weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((date, i) => {
                    return (
                      <td key={i}>{date ? <span {...api.getCellTriggerProps({ date })}>{date.day}</span> : null}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>{" "}
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} omit={["weeks", "weekDays"]} />
      </Toolbar>
    </>
  )
}

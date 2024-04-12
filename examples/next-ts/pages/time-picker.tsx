import * as timePicker from "@zag-js/time-picker"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { timePickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(timePickerControls)

  const [state, send] = useMachine(timePicker.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = timePicker.connect(state, send, normalizeProps)

  return (
    <>
      <main className="time-picker">
        <div {...api.rootProps}>
          <div {...api.controlProps} style={{ display: "flex", gap: "10px" }}>
            <input {...api.inputProps} />
            <button {...api.triggerProps}>🗓</button>
            <button {...api.clearTriggerProps}>❌</button>
          </div>

          <Portal>
            <div {...api.positionerProps}>
              <div {...api.contentProps}>
                <div {...api.contentColumnProps}>
                  {api.getAvailableHours().map((hour) => (
                    <button key={hour} {...api.getHourCellProps({ hour })} />
                  ))}
                </div>
                <div {...api.contentColumnProps}>
                  {api.getAvailableMinutes().map((minute) => (
                    <button key={minute} {...api.getMinuteCellProps({ minute })} />
                  ))}
                </div>
                <div {...api.contentColumnProps}>
                  <button {...api.getPeriodTriggerProps({ period: "am" })}>AM</button>
                  <button {...api.getPeriodTriggerProps({ period: "pm" })}>PM</button>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

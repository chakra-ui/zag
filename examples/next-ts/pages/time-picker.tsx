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
          <div {...api.controlProps}>
            <input {...api.inputProps} />
            <button {...api.triggerProps}>🗓</button>
          </div>

          <Portal>
            <div {...api.positionerProps}>
              <div {...api.contentProps}>
                <div style={{ display: "flex", maxHeight: "200px" }}>
                  <div style={{ display: "flex", flexDirection: "column", overflow: "scroll" }}>
                    {api.getAvailableHours().map((hour) => (
                      <button key={hour} {...api.getHourCellProps(hour)}>
                        {hour}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", overflow: "scroll" }}>
                    {api.getAvailableMinutes().map((minute) => (
                      <button key={minute} {...api.getMinuteCellProps(minute)}>
                        {minute}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <button {...api.AMPeriodTriggerProps}>AM</button>
                    <button {...api.PMPeriodTriggerProps}>PM</button>
                  </div>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

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
                <div {...api.getContentColumnProps({ type: "hour" })}>
                  {api.getAvailableHours().map((hour) => (
                    <button key={hour} {...api.getHourCellProps({ hour })}>
                      {hour}
                    </button>
                  ))}
                </div>
                <div {...api.getContentColumnProps({ type: "minute" })}>
                  {api.getAvailableMinutes().map((minute) => (
                    <button key={minute} {...api.getMinuteCellProps({ minute })}>
                      {minute}
                    </button>
                  ))}
                </div>
                <div {...api.getContentColumnProps({ type: "second" })}>
                  {api.getAvailableSeconds().map((second) => (
                    <button key={second} {...api.getSecondCellProps({ second })}>
                      {second}
                    </button>
                  ))}
                </div>
                <div {...api.getContentColumnProps({ type: "period" })}>
                  <button {...api.getPeriodCellProps({ period: "am" })}>AM</button>
                  <button {...api.getPeriodCellProps({ period: "pm" })}>PM</button>
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

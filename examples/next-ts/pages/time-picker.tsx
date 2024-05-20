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
                <div {...api.getColumnProps({ unit: "hour" })}>
                  <div {...api.spacerProps} />
                  {api.getHours().map((item) => (
                    <button key={item.value} {...api.getHourCellProps({ value: item.value })}>
                      {item.label}
                    </button>
                  ))}
                  <div {...api.spacerProps} />
                </div>
                <div {...api.getColumnProps({ unit: "minute" })}>
                  <div {...api.spacerProps} />
                  {api.getMinutes().map((item) => (
                    <button key={item.value} {...api.getMinuteCellProps({ value: item.value })}>
                      {item.label}
                    </button>
                  ))}
                  <div {...api.spacerProps} />
                </div>
                <div {...api.getColumnProps({ unit: "second" })}>
                  <div {...api.spacerProps} />

                  {api.getSeconds().map((item) => (
                    <button key={item.value} {...api.getSecondCellProps({ value: item.value })}>
                      {item.label}
                    </button>
                  ))}
                  <div {...api.spacerProps} />
                </div>
                <div {...api.getColumnProps({ unit: "period" })}>
                  <button {...api.getPeriodCellProps({ value: "am" })}>AM</button>
                  <button {...api.getPeriodCellProps({ value: "pm" })}>PM</button>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

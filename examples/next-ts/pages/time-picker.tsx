import * as timePicker from "@zag-js/time-picker"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { timePickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(timePickerControls)

  const service = useMachine(timePicker.machine, { id: useId() })
  const api = timePicker.connect(service, normalizeProps)

  return (
    <>
      <main className="time-picker">
        <div {...api.getRootProps()}>
          <div {...api.getControlProps()} style={{ display: "flex", gap: "10px" }}>
            <input {...api.getInputProps()} />
            <button {...api.getTriggerProps()}>🗓</button>
            <button {...api.getClearTriggerProps()}>❌</button>
          </div>

          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                <div {...api.getColumnProps({ unit: "hour" })}>
                  <div {...api.getSpacerProps()} />
                  {api.getHours().map((item) => (
                    <button key={item.value} {...api.getHourCellProps({ value: item.value })}>
                      {item.label}
                    </button>
                  ))}
                  <div {...api.getSpacerProps()} />
                </div>
                <div {...api.getColumnProps({ unit: "minute" })}>
                  <div {...api.getSpacerProps()} />
                  {api.getMinutes().map((item) => (
                    <button key={item.value} {...api.getMinuteCellProps({ value: item.value })}>
                      {item.label}
                    </button>
                  ))}
                  <div {...api.getSpacerProps()} />
                </div>
                <div {...api.getColumnProps({ unit: "second" })}>
                  <div {...api.getSpacerProps()} />

                  {api.getSeconds().map((item) => (
                    <button key={item.value} {...api.getSecondCellProps({ value: item.value })}>
                      {item.label}
                    </button>
                  ))}
                  <div {...api.getSpacerProps()} />
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

import * as timePicker from "@zag-js/time-picker"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type TimePickerProps = {
  controls: {
    disabled: boolean
  }
}

export function TimePicker(props: TimePickerProps) {
  const [state, send] = useMachine(timePicker.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = timePicker.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <label {...api.labelProps}>Time picker</label>

      <div {...api.controlProps}>
        <input {...api.inputProps} />
        <button {...api.triggerProps}>🗓</button>
        <button {...api.clearTriggerProps}>❌</button>
      </div>

      <Portal>
        <div {...api.positionerProps}>
          <div {...api.contentProps}>
            <div {...api.getColumnProps({ unit: "hour" })}>
              {api.getHours().map((item) => (
                <button
                  key={item.value}
                  {...api.getHourCellProps({ value: item.value })}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div {...api.getColumnProps({ unit: "minute" })}>
              {api.getMinutes().map((item) => (
                <button
                  key={item.value}
                  {...api.getMinuteCellProps({ value: item.value })}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div {...api.getColumnProps({ unit: "second" })}>
              {api.getSeconds().map((item) => (
                <button
                  key={item.value}
                  {...api.getSecondCellProps({ value: item.value })}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div {...api.getColumnProps({ unit: "period" })}>
              <button {...api.getPeriodCellProps({ value: "am" })}>AM</button>
              <button {...api.getPeriodCellProps({ value: "pm" })}>PM</button>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}

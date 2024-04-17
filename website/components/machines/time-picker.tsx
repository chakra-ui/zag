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
  )
}

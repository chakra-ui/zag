import * as timePicker from "@zag-js/time-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, Teleport } from "vue"
import { timePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "TimePicker",
  setup() {
    const controls = useControls(timePickerControls)

    const [state, send] = useMachine(timePicker.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => timePicker.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="time-picker">
            <div {...api.rootProps}>
              <div {...api.controlProps} style={{ display: "flex", gap: "10px" }}>
                <input {...api.inputProps} />
                <button {...api.triggerProps}>🗓</button>
                <button {...api.clearTriggerProps}>❌</button>
              </div>

              <Teleport to="body">
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
              </Teleport>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})

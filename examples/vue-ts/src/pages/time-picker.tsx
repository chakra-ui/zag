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
            <div {...api.getRootProps()}>
              <div {...api.getControlProps()} style={{ display: "flex", gap: "10px" }}>
                <input {...api.getInputProps()} />
                <button {...api.getTriggerProps()}>🗓</button>
                <button {...api.getClearTriggerProps()}>❌</button>
              </div>

              <Teleport to="body">
                <div {...api.getPositionerProps()}>
                  <div {...api.getContentProps()}>
                    <div {...api.getColumnProps({ unit: "hour" })}>
                      {api.getHours().map((item) => (
                        <button key={item.value} {...api.getHourCellProps({ value: item.value })}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div {...api.getColumnProps({ unit: "minute" })}>
                      {api.getMinutes().map((item) => (
                        <button key={item.value} {...api.getMinuteCellProps({ value: item.value })}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div {...api.getColumnProps({ unit: "second" })}>
                      {api.getSeconds().map((item) => (
                        <button key={item.value} {...api.getSecondCellProps({ value: item.value })}>
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

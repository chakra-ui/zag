import * as combobox from "@zag-js/combobox"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, ref } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Combobox",
  setup() {
    const controls = useControls(comboboxControls)
    const options = ref(comboboxData)

    const [state, send] = useMachine(
      combobox.machine({
        id: "1",
        onOpen() {
          options.value = comboboxData
        },
        onInputChange({ value }) {
          const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
          options.value = filtered.length > 0 ? filtered : comboboxData
        },
      }),
      { context: controls.context },
    )

    const apiRef = computed(() => combobox.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="combobox">
            <div>
              <button onClick={() => api.setValue("Togo")}>Set to Togo</button>
              <button data-testid="clear-value-button" onClick={() => api.clearValue()}>
                Clear Value
              </button>

              <br />

              <div {...api.rootProps}>
                <label {...api.labelProps}>Select country</label>

                <div {...api.controlProps}>
                  <input data-testid="input" {...api.inputProps} />
                  <button data-testid="trigger" {...api.triggerProps}>
                    ▼
                  </button>
                </div>
              </div>

              <div {...api.positionerProps}>
                {options.value.length > 0 && (
                  <ul data-testid="combobox-content" {...api.contentProps}>
                    {options.value.map((item, index) => (
                      <li
                        key={`${item.code}:${index}`}
                        {...api.getOptionProps({ label: item.label, value: item.code, index, disabled: item.disabled })}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

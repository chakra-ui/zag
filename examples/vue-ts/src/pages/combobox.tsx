import { injectGlobal } from "@emotion/css"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, ref, h, Fragment } from "vue"
import { comboboxControls, comboboxData, comboboxStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

injectGlobal(comboboxStyle)

export default defineComponent({
  name: "Combobox",
  setup() {
    const controls = useControls(comboboxControls)
    const options = ref(comboboxData)

    const [state, send] = useMachine(
      combobox.machine({
        id: "combobox",
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
          <main>
            <div>
              <button onClick={() => api.setValue("Togo")}>Set to Togo</button>

              <br />

              <div {...api.rootProps}>
                <label {...api.labelProps}>Select country</label>

                <div {...api.controlProps}>
                  <input {...api.inputProps} />
                  <button {...api.toggleButtonProps}>▼</button>
                </div>
              </div>

              <div {...api.positionerProps}>
                {options.value.length > 0 && (
                  <ul {...api.listboxProps}>
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

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})

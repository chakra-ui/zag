import { injectGlobal } from "@emotion/css"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { computed, defineComponent, ref, h, Fragment } from "vue"
import { comboboxControls } from "../../../../shared/controls"
import { comboboxData } from "../../../../shared/data"
import { comboboxStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(comboboxStyle)

export default defineComponent({
  name: "Combobox",
  setup() {
    const controls = useControls(comboboxControls)
    const options = ref(comboboxData)

    const [state, send] = useMachine(
      combobox.machine.withContext({
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

    const nodeRef = useSetup({ send, id: "1" })
    const apiRef = computed(() => combobox.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <controls.ui />

          <div>
            <button onClick={() => api.setValue("Togo")}>Set to Togo</button>

            <br />

            <div ref={nodeRef} {...api.rootProps}>
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

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})

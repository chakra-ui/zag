import { injectGlobal } from "@emotion/css"
import * as Combobox from "@ui-machines/combobox"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
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
      Combobox.machine.withContext({
        onOpen() {
          options.value = comboboxData
        },
        onInputChange(value) {
          const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
          options.value = filtered.length > 0 ? filtered : comboboxData
        },
      }),
      { context: controls.context },
    )

    const nodeRef = useSetup({ send, id: "1" })
    const apiRef = computed(() => Combobox.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <controls.ui />

          <div class="root">
            <button onClick={() => api.setValue("Togo")}>Set to Togo</button>
            <br />

            <div ref={nodeRef} class="combobox" {...api.rootProps}>
              <label class="combobox__label" {...api.labelProps}>
                Select country
              </label>

              <div class="combobox__container" {...api.containerProps}>
                <input {...api.inputProps} />
                <button {...api.buttonProps}>▼</button>
              </div>
            </div>

            <div class="combobox__popover" {...api.positionerProps}>
              {options.value.length > 0 && (
                <ul class="combobox__listbox" {...api.listboxProps}>
                  {options.value.map((item, index) => (
                    <li
                      class="combobox__option"
                      key={`${item.code}:${index}`}
                      {...api.getOptionProps({ label: item.label, value: item.code, index })}
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

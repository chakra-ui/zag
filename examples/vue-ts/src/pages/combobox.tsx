import { injectGlobal } from "@emotion/css"
import * as Combobox from "@ui-machines/combobox"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment } from "vue"
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

    const [state, send] = useMachine(
      Combobox.machine.withContext({
        onSelect: console.log,
      }),
      { context: controls.context },
    )

    const ref = useSetup({ send, id: "1" })

    const combobox = computed(() => Combobox.connect<VuePropTypes>(state.value, send, normalizeProps))

    const filtered = computed(() => {
      return comboboxData.filter((item) => item.label.toLowerCase().startsWith(combobox.value.inputValue.toLowerCase()))
    })

    return () => {
      const { labelProps, containerProps, inputProps, buttonProps, listboxProps, getOptionProps } = combobox.value
      return (
        <>
          <div ref={ref}>
            <label {...labelProps}>Select country</label>
            <div {...containerProps}>
              <input {...inputProps} />
              <button {...buttonProps}>▼</button>
            </div>

            {filtered.value.length > 0 && (
              <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...listboxProps}>
                {filtered.value.map((item) => (
                  <li key={item.code} {...getOptionProps({ label: item.label, value: item.code })}>
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})

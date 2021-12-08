import { css } from "@emotion/css"
import * as Combobox from "@ui-machines/combobox"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h } from "vue"
import { comboboxData } from "../../../../shared/data"
import { comboboxStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

const styles = css(comboboxStyle)

export default defineComponent({
  name: "Combobox",
  setup() {
    const [state, send] = useMachine(
      Combobox.machine.withContext({
        uid: "123",
        onSelect: console.log,
      }),
    )

    const ref = useMount(send)

    const comboboxRef = computed(() => Combobox.connect<VuePropTypes>(state.value, send, normalizeProps))

    const filtered = computed(() => {
      return comboboxData.filter((d) => d.label.toLowerCase().startsWith(comboboxRef.value.inputValue.toLowerCase()))
    })

    return () => {
      const { labelProps, containerProps, inputProps, buttonProps, listboxProps, getOptionProps } = comboboxRef.value
      return (
        <div class={styles}>
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

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})

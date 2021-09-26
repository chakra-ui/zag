import { combobox } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { defineComponent, h, Fragment, computed } from "vue"
import { css } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { comboboxData } from "../../../../shared/data"
import { comboboxStyle } from "../../../../shared/style"

const styles = css(comboboxStyle)

export default defineComponent({
  name: "Combobox",
  setup() {
    const [state, send] = useMachine(
      combobox.machine.withContext({
        uid: "uid",
        onSelect: console.log,
        selectionMode: "autoselect",
        closeOnSelect: (opt) => opt.label !== "Angola",
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => {
      const { inputProps, inputValue, listboxProps, containerProps, buttonProps, getOptionProps, labelProps } =
        combobox.connect(state.value, send, normalizeProps)
      return {
        inputProps,
        inputValue,
        listboxProps,
        containerProps,
        buttonProps,
        getOptionProps,
        labelProps,
      }
    })

    const filtered = computed(() => {
      return comboboxData.filter((d) => d.label.toLowerCase().startsWith(machineState.value.inputValue.toLowerCase()))
    })

    return () => {
      return (
        <div className={styles}>
          <div ref={ref}>
            <label {...machineState.value.labelProps}>Select country</label>
            <div {...machineState.value.containerProps}>
              <input {...machineState.value.inputProps} />
              <button {...machineState.value.buttonProps}>▼</button>
            </div>

            {filtered.value.length > 0 && (
              <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...machineState.value.listboxProps}>
                {filtered.value.map((item) => (
                  <li key={item.code} {...machineState.value.getOptionProps({ label: item.label, value: item.code })}>
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

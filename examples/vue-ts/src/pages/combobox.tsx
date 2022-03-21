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

    const combobox = computed(() => Combobox.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const {
        labelProps,
        containerProps,
        inputProps,
        buttonProps,
        listboxProps,
        popoverProps,
        getOptionProps,
        setValue,
      } = combobox.value

      return (
        <>
          <controls.ui />

          <div class="root">
            <button onClick={() => setValue("Togo")}>Set to Togo</button>
            <br />

            <div class="combobox">
              <label class="combobox__label" {...labelProps}>
                Select country
              </label>

              <div class="combobox__container" ref={nodeRef} {...containerProps}>
                <input {...inputProps} />
                <button {...buttonProps}>▼</button>
              </div>

              <div class="combobox__popover" {...popoverProps}>
                {options.value.length > 0 && (
                  <ul class="combobox__listbox" {...listboxProps}>
                    {options.value.map((item, index) => (
                      <li
                        class="combobox__option"
                        key={`${item.code}:${index}`}
                        {...getOptionProps({ label: item.label, value: item.code, index })}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})

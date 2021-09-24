import { defineComponent, h, Fragment, computed } from "vue"
import { combobox } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { css } from "@emotion/css"

const data = [
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "American Samoa", code: "AS" },
  { label: "AndorrA", code: "AD" },
  { label: "Angola", code: "AO" },
  { label: "Anguilla", code: "AI" },
  { label: "Antarctica", code: "AQ" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Azerbaijan", code: "AZ" },
  { label: "Bahamas", code: "BS" },
  { label: "Bahrain", code: "BH" },
  { label: "Madagascar", code: "MG" },
  { label: "Malawi", code: "MW" },
  { label: "Malaysia", code: "MY" },
  { label: "Maldives", code: "MV" },
  { label: "Mali", code: "ML" },
  { label: "Malta", code: "MT" },
  { label: "Togo", code: "TG" },
  { label: "Tokelau", code: "TK" },
  { label: "Tonga", code: "TO" },
  { label: "Trinidad and Tobago", code: "TT" },
  { label: "Tunisia", code: "TN" },
]

const styles = css({
  '[role="listbox"]': {
    listStyleType: "none",
    padding: "0",
    margin: "0",
    border: "1px solid lightgray",
    maxWidth: "300px",
  },
  '[role="option"][aria-selected="true"]': {
    backgroundColor: "red",
    color: "white",
  },
})

export default defineComponent({
  name: "Combobox",
  setup() {
    const [state, send] = useMachine(
      combobox.machine.withContext({
        uid: "234",
        onSelect: console.log,
      }),
    )
    const _ref = useMount(send)

    const machineState = computed(() => {
      const { inputProps, inputValue, listboxProps, containerProps, buttonProps, getOptionProps } = combobox.connect(
        state.value,
        send,
        normalizeProps,
      )
      return {
        inputProps,
        inputValue,
        listboxProps,
        containerProps,
        buttonProps,
        getOptionProps,
      }
    })

    const filtered = computed(() => {
      return data.filter((d) => d.label.toLowerCase().startsWith(machineState.value.inputValue.toLowerCase()))
    })

    return () => {
      return (
        <div className={styles}>
          <div ref={_ref}>
            <div {...machineState.value.containerProps}>
              <input {...machineState.value.inputProps} />
              <button {...machineState.value.buttonProps}>▼</button>
            </div>

            {filtered.value.length > 0 && (
              <ul style={{ width: 300, maxHeight: 400, overflow: "auto" }} {...machineState.value.listboxProps}>
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

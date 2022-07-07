import { Global } from "@emotion/react"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxControls, comboboxData, comboboxStyle } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = useState(comboboxData)

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      onOpen() {
        setOptions(comboboxData)
      },
      onInputChange({ value }) {
        const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
    { context: controls.context },
  )

  const api = combobox.connect(state, send, normalizeProps)

  return (
    <>
      <Global styles={comboboxStyle} />

      <main>
        <div>
          <button onClick={() => api.setValue("TG")}>Set to Togo</button>
          <br />
          <div {...api.rootProps}>
            <label {...api.labelProps}>Select country</label>
            <div {...api.controlProps}>
              <input data-testid="input" {...api.inputProps} />
              <button data-testid="input-arrow" {...api.toggleButtonProps}>
                ▼
              </button>
            </div>
          </div>
          <div {...api.positionerProps}>
            {options.length > 0 && (
              <ul data-testid="combobox-listbox" {...api.listboxProps}>
                {options.map((item, index) => (
                  <li
                    data-testid={item.code}
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

import { Global } from "@emotion/react"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine, useSetup } from "@zag-js/react"
import { comboboxControls, comboboxData, comboboxStyle } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = useState(comboboxData)
  const [options2, setOptions2] = useState(comboboxData)

  const [state, send] = useMachine(
    combobox.machine({
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

  const ref = useSetup({ send, id: useId() })

  const api = combobox.connect(state, send, normalizeProps)

  const [state2, send2] = useMachine(
    combobox.machine({
      onOpen() {
        setOptions2(comboboxData)
      },
      onInputChange({ value }) {
        const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        setOptions2(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
    { context: controls.context },
  )

  const ref2 = useSetup({ send: send2, id: useId() })

  const api2 = combobox.connect(state2, send2, normalizeProps)

  return (
    <>
      <Global styles={comboboxStyle} />

      <main>
        <div>
          <button onClick={() => api.setValue("TG")}>Set to Togo</button>
          <br />
          <div ref={ref} {...api.rootProps}>
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

          <br />
          <div ref={ref2} {...api2.rootProps}>
            <label {...api2.labelProps}>Select country</label>
            <div {...api2.controlProps}>
              <input data-testid="input" {...api2.inputProps} />
              <button data-testid="input-arrow" {...api2.toggleButtonProps}>
                ▼
              </button>
            </div>
          </div>
          <div {...api2.positionerProps}>
            {options2.length > 0 && (
              <ul data-testid="combobox-listbox" {...api2.listboxProps}>
                {options2.map((item, index) => (
                  <li
                    data-testid={item.code}
                    key={`${item.code}:${index}`}
                    {...api2.getOptionProps({ label: item.label, value: item.code, index, disabled: item.disabled })}
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

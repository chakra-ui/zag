import { Global } from "@emotion/react"
import * as Combobox from "@ui-machines/combobox"
import { useMachine, useSetup } from "@ui-machines/react"
import { useState } from "react"
import { comboboxControls } from "../../../shared/controls"
import { comboboxData } from "../../../shared/data"
import { comboboxStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = useState(comboboxData)

  const [state, send] = useMachine(
    Combobox.machine.withContext({
      onOpen() {
        setOptions(comboboxData)
      },
      onInputChange(value) {
        const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
    { context: controls.context },
  )

  const ref = useSetup({ send, id: "1" })

  const api = Combobox.connect(state, send)

  return (
    <>
      <Global styles={comboboxStyle} />
      <controls.ui />

      <div>
        <button onClick={() => api.setValue("Togo")}>Set to Togo</button>

        <br />

        <div ref={ref} {...api.rootProps}>
          <label {...api.labelProps}>Select country</label>

          <div {...api.controlProps}>
            <input {...api.inputProps} />
            <button {...api.toggleButtonProps}>▼</button>
          </div>
        </div>

        <div {...api.positionerProps}>
          {options.length > 0 && (
            <ul {...api.listboxProps}>
              {options.map((item, index) => (
                <li
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

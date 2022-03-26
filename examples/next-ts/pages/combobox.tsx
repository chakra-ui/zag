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

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const api = Combobox.connect(state, send)

  return (
    <>
      <Global styles={comboboxStyle} />
      <controls.ui />

      <div className="root">
        <button onClick={() => api.setValue("Togo")}>Set to Togo</button>
        <br />

        <div className="combobox">
          <label className="combobox__label" {...api.labelProps}>
            Select country
          </label>

          <div className="combobox__container" ref={ref} {...api.containerProps}>
            <input {...api.inputProps} />
            <button {...api.buttonProps}>▼</button>
          </div>
        </div>

        <div className="combobox__popover" {...api.positionerProps}>
          {options.length > 0 && (
            <ul className="combobox__listbox" {...api.listboxProps}>
              {options.map((item, index) => (
                <li
                  className="combobox__option"
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
